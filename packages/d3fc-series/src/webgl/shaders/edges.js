import initShaders from '../helper/initShaders';
import buffer from '../helper/buffer';

// Shader program to use position and edge arrays to draw triangles that
// have a border line in a different color

// Vertex shader program
const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexEdge;

  uniform vec4 uEdgeColor;
  uniform vec4 uSeriesColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vEdge;
  varying lowp vec4 vColor;
  varying lowp vec4 vColorEdge;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = uSeriesColor;
    vColorEdge = uEdgeColor;
    vEdge = aVertexEdge;
  }
`;

const fsSource = `
  varying lowp vec4 vEdge;
  varying lowp vec4 vColor;
  varying lowp vec4 vColorEdge;

  void main() {
    lowp float r = clamp((vEdge[1] - vEdge[0]) / 2.0, 0.0, 1.0);
    gl_FragColor = r * vColor + (1.0 - r) * vColorEdge;
  }
`;

export default (gl, projectionMatrix) => {
    const positionBuffer = buffer(gl);
    const edgeBuffer = buffer(gl);
    const buffers = {
        position: positionBuffer.addr(),
        edges: edgeBuffer.addr()
    };

    let lastColor = [-1, -1, -1, -1];
    let lastStrokeColor = [-1, -1, -1, -1];
    const draw = (positions, edges, color, strokeColor = null) => {
        positionBuffer(positions);
        edgeBuffer(edges);

        const sColor = strokeColor || color;
        if (color.some((c, i) => c !== lastColor[i]) || sColor.some((c, i) => c !== lastStrokeColor[i])) {
            setColor(color, sColor);
            lastColor = color;
            lastStrokeColor = sColor;
        }

        drawBuffers(positions.length / 2);
    };

    draw.activate = () => {
        setupProgram(buffers);
        lastColor = [-1, -1, -1, -1];
    };

    draw.setModelView = modelViewMatrix => {
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);
    };

    const shaderProgram = initShaders(gl, vsSource, fsSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexEdge: gl.getAttribLocation(shaderProgram, 'aVertexEdge')
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            seriesColor: gl.getUniformLocation(shaderProgram, 'uSeriesColor'),
            edgeColor: gl.getUniformLocation(shaderProgram, 'uEdgeColor')
        }
    };

    function setupProgram(buffers) {
        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);

        // Set the shader uniforms
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        {
            const numComponents = 2;  // pull out 2 values per iteration
            const type = gl.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
            // 0 = use type and numComponents above
            const offset = 0;         // how many bytes inside the buffer to start from
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }

        // Tell WebGL how to pull out the edges from the buffer
        {
            const numComponents = 2;  // pull out 2 values per iteration
            const type = gl.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
            // 0 = use type and numComponents above
            const offset = 0;         // how many bytes inside the buffer to start from
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.edges);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexEdge,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexEdge);
        }
    }

    function setColor(color, strokeColor) {
        gl.uniform4fv(
            programInfo.uniformLocations.seriesColor,
            color);
        gl.uniform4fv(
            programInfo.uniformLocations.edgeColor,
            strokeColor);
    }

    function drawBuffers(vertexCount) {
        {
            const offset = 0;
            gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
        }
    }

    return draw;
};