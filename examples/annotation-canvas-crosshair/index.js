const data = [{ x: 450, y: 450 }];

const container = document.querySelector('d3fc-canvas');

const xScale = d3.scaleLinear().domain([0, 1]);

const yScale = d3.scaleLinear().domain([0, 1]);

const format = d3.format('.2f');

const crosshair = fc
    .annotationCanvasCrosshair()
    .xScale(xScale)
    .yScale(yScale)
    .xLabel(d => format(xScale.invert(d.x)))
    .yLabel(d => format(yScale.invert(d.y)))
    .xLineDecorate(context => {
        context.strokeStyle = 'rgba(204, 0, 0, 0.25)';
    })
    .yLineDecorate(context => {
        context.strokeStyle = 'rgba(204, 0, 0, 0.25)';
    })
    .decorate(context => {
        context.strokeStyle = 'rgba(204, 0, 0, 0.25)';
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.scale(95, 95);
    });

const canvas = container.querySelector('canvas');

d3.select(container)
    .on('draw', () => {
        crosshair(data);
    })
    .on('mousemove', event => {
        const { clientX, clientY } = event;
        data[0] = { x: clientX, y: clientY };
        container.requestRedraw();
    })
    .on('measure', event => {
        const { width, height } = event.detail;
        xScale.range([10, width - 30]);
        yScale.range([5, height - 20]);

        const ctx = canvas.getContext('2d');
        crosshair.context(ctx);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

container.requestRedraw();
