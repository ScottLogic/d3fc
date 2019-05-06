const dataNeg = [
    {
        date: '2012-05-01',
        close: -58.13
    },
    {
        date: '2012-04-19',
        close: -345.44
    },
    {
        date: '2012-04-11',
        close: -626.2
    },
    {
        date: '2012-03-26',
        close: -606.98
    }
];

// use d3fc-extent to compute the domain for each axis
let yExtentDefaultNeg = fc.extentLinear()
    .accessors([d => d.close])
    .pad([200, 200])
    .padUnit('domain');

let gridlinesNeg = fc.annotationSvgGridline();
let lineNeg = fc.seriesSvgLine()
    .crossValue(d => d.date)
    .mainValue(d => d.close);

let multiNeg = fc.seriesSvgMulti()
    .series([gridlinesNeg, lineNeg]);

let chartNeg = fc.chartSvgCartesian(d3.scaleBand(), d3.scaleLinear())
    .xLabel('date')
    .yLabel('Cap')
    .chartLabel('Market Data (See how the y axis overflows 0 into positive)')
    .yOrient('left')
    .yDomain(yExtentDefaultNeg(dataNeg))
    .xDomain(dataNeg.map(d => d.date))
    .plotArea(multiNeg);

// use d3fc-extent to compute the domain for each axis
let yExtentZeroLimitNeg = fc.extentLinear()
    .accessors([d => d.close])
    .paddingStrategy(fc.hardLimitZeroPadding()
        .pad([200, 200])
        .padUnit('domain')
    );

chartNeg.decorate(selection => {
    selection
        .select('.chart-label')
        .style('margin-bottom', '2em');
});

// render
d3.select('#chartyMcChartFace_defaultPadding_negative')
    .datum(dataNeg)
    .call(chartNeg);

// Illustrate the difference using hardLimitZero padding Strategy

let zeroLimitChartNeg = fc.chartSvgCartesian(d3.scaleBand(), d3.scaleLinear())
    .xLabel('date')
    .yLabel('Cap')
    .chartLabel('Market Data With Hard Limit Zero (Configured padding ignored where it would cause an overflow into positive)')
    .yOrient('left')
    .yDomain(yExtentZeroLimitNeg(dataNeg))
    .xDomain(dataNeg.map(d => d.date))
    .plotArea(multiNeg);

zeroLimitChartNeg.decorate(selection => {
    selection
        .select('.chart-label')
        .style('margin-bottom', '2em');
});

// render
d3.select('#chartyMcChartFace_hardLimitZeroPadding_negative')
    .datum(dataNeg)
    .call(zeroLimitChartNeg);
