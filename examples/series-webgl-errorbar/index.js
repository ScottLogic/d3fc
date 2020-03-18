const dataGenerator = fc.randomGeometricBrownianMotion().steps(1e4);
const data = dataGenerator(1).map((datum, index) => {
    const result = {
        value: index
    };
    result.high = datum + Math.random();
    result.low = datum - Math.random();
    return result;
});

const extent = fc.extentLinear();

const xScale = d3.scaleLinear().domain(extent.accessors([d => d.value])(data));

const yScale = d3
    .scaleLinear()
    .domain(extent.accessors([d => d.high, d => d.low])(data));

const container = document.querySelector('d3fc-canvas');

const gl = d3
    .select(container)
    .select('canvas')
    .node()
    .getContext('webgl');

const series = fc
    .seriesWebglErrorBar()
    .xScale(xScale)
    .yScale(yScale)
    .context(gl)
    .crossValue(d => d.value)
    .highValue(d => d.high)
    .lowValue(d => d.low)
    .defined(() => true)
    .equals(d => d.length);

let pixels = null;
let frame = 0;

d3.select(container)
    .on('click', () => {
        const domain = xScale.domain();
        const max = Math.round(domain[1] / 2);
        xScale.domain([0, max]);
        series.bandwidth(series.bandwidth()() * 2);
        container.requestRedraw();
    })
    .on('measure', () => {
        const { width, height } = event.detail;
        xScale.range([0, width]);
        yScale.range([height, 0]);
    })
    .on('draw', () => {
        if (pixels == null) {
            pixels = new Uint8Array(
                gl.drawingBufferWidth * gl.drawingBufferHeight * 4
            );
        }
        performance.mark(`draw-start-${frame}`);
        series(data);
        // Force GPU to complete rendering to allow accurate performance measurements to be taken
        gl.readPixels(
            0,
            0,
            gl.drawingBufferWidth,
            gl.drawingBufferHeight,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels
        );
        performance.measure(`draw-duration-${frame}`, `draw-start-${frame}`);
        frame++;
    });

container.requestRedraw();
