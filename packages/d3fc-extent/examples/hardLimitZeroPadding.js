const data = [
    {
        date: '2012-05-01',
        close: 58.13
    },
    {
        date: '2012-04-19',
        close: 345.44
    },
    {
        date: '2012-04-11',
        close: 626.2
    },
    {
        date: '2012-03-26',
        close: 606.98
    }
];

// use d3fc-extent to compute the domain for each axis
let yExtentDefault = fc.extentLinear()
    .accessors([d => d.close])
    .pad([200, 200])
    .padUnit('domain');

let gridlines = fc.annotationSvgGridline();
let line = fc.seriesSvgLine()
    .crossValue(d => d.date)
    .mainValue(d => d.close);

let multi = fc.seriesSvgMulti()
    .series([gridlines, line]);

let chart = fc.chartSvgCartesian(d3.scaleBand(), d3.scaleLinear())
    .xLabel('date')
    .yLabel('Cap')
    .chartLabel('Market Data (See how the y axis overflows 0 into negative)')
    .yOrient('left')
    .yDomain(yExtentDefault(data))
    .xDomain(data.map(d => d.date))
    .plotArea(multi);

// use d3fc-extent to compute the domain for each axis
let yExtentZeroLimit = fc.extentLinear()
    .accessors([d => d.close])
    .paddingStrategy(fc.hardLimitZeroPadding()
        .pad([200, 200])
        .padUnit('domain')
    );

chart.decorate(selection => {
    selection
        .select('.chart-label')
        .style('margin-bottom', '2em');
});

// render
d3.select('#chartyMcChartFace_defaultPadding')
    .datum(data)
    .call(chart);

// Illustrate the difference using hardLimitZero padding Strategy

let zeroLimitChart = fc.chartSvgCartesian(d3.scaleBand(), d3.scaleLinear())
    .xLabel('date')
    .yLabel('Cap')
    .chartLabel('Market Data With Hard Limit Zero (Configured padding ignored where it would cause an overflow into negative)')
    .yOrient('left')
    .yDomain(yExtentZeroLimit(data))
    .xDomain(data.map(d => d.date))
    .plotArea(multi);

zeroLimitChart.decorate(selection => {
    selection
        .select('.chart-label')
        .style('margin-bottom', '2em');
});

// render
d3.select('#chartyMcChartFace_hardLimitZeroPadding')
    .datum(data)
    .call(zeroLimitChart);
