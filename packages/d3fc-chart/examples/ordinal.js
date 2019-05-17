var data = [
    {
        'month': 'January',
        'sales': 1
    },
    {
        'month': 'February',
        'sales': 1.5332793661950717
    },
    {
        'month': 'March',
        'sales': 2.0486834288742597
    },
    {
        'month': 'April',
        'sales': 2.556310832331535
    },
    {
        'month': 'May',
        'sales': 3.029535759511747
    },
    {
        'month': 'June',
        'sales': 3.507418002703505
    },
    {
        'month': 'July',
        'sales': 4.02130992651795
    },
    {
        'month': 'August',
        'sales': 4.482485234741706
    },
    {
        'month': 'September',
        'sales': 4.957935275183866
    },
    {
        'month': 'October',
        'sales': 5.427273488256043
    },
    {
        'month': 'November',
        'sales': 5.943007604008045
    },
    {
        'month': 'December',
        'sales': 6.454464059891373
    }
];

const customAxis = (scale) => {
    const base = fc.axisOrdinalBottom(scale);
    let rotate = 0;
    let labelHeight = 10;
    let decorate = () => {};

    function axis(selection) {
        base.decorate(function(s) {
            s.select('text')
                .style('text-anchor', rotate ? 'end' : 'middle')
                .attr('transform', rotate ? `translate(0, 3) rotate(-${Math.floor(90 * rotate)} 3 ${Math.floor(labelHeight / 2)})` : 'translate(0, 8)');
            decorate(s);
        });
        base(selection);
    }

    axis.height = selection => {
        const labels = scale.domain();
        const width = scale.range()[1];

        // Use a test element to measure the text in the axis SVG container
        const tester = selection
            .attr('font-size', 10).attr('font-family', 'sans-serif')
            .append('text');
        labelHeight = tester.text('Ty').node().getBBox().height;
        const maxWidth = Math.max(...labels.map(l => tester.text(l).node().getBBox().width));
        tester.remove();

        // The more the overlap, the more we rotate
        const allowedSize = labels.length * maxWidth;
        rotate = width < allowedSize ? Math.min(1, (allowedSize / width - 0.8) / 2) : 0;
        return rotate ? `${Math.floor(maxWidth * rotate + labelHeight) + 10}px` : null;
    };

    axis.decorate = (...args) => {
        if (!args.length) {
            return decorate;
        }
        decorate = args[0];
        return axis;
    };

    fc.rebindAll(axis, base, fc.exclude('decorate'));
    return axis;
};

var yExtent = fc.extentLinear()
    .accessors([d => d.sales])
    .include([0]);

var bar = fc.seriesSvgBar()
    .crossValue(d => d.month)
    .mainValue(d => d.sales);

var chart = fc.chartCartesian({
    xScale: d3.scalePoint().padding(0.5),
    yScale: d3.scaleLinear(),
    xAxis: {
        bottom: customAxis
    }
})
    .xLabel('Value')
    .yLabel('Sine / Cosine')
    .yOrient('left')
    .yDomain(yExtent(data))
    .xDomain(data.map(d => d.month))
    .svgPlotArea(bar);

d3.select('#ordinal')
    .datum(data)
    .call(chart);
