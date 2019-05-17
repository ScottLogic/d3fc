import { select, event } from 'd3-selection';
import { scaleIdentity } from 'd3-scale';
import { seriesSvgMulti, seriesCanvasMulti } from '@d3fc/d3fc-series';
import { axisBottom, axisRight, axisLeft, axisTop } from '@d3fc/d3fc-axis';
import { dataJoin } from '@d3fc/d3fc-data-join';
import { rebindAll, exclude, prefix } from '@d3fc/d3fc-rebind';
import store from './store';
import './css';

const functor = (v) =>
    typeof v === 'function' ? v : () => v;

export default (...args) => {
    const { xScale, yScale, xAxis, yAxis } = getArguments(...args);

    let xLabel = functor('');
    let yLabel = functor('');
    let xAxisHeight = (...args) => xAxisComponent && xAxisComponent.height ? xAxisComponent.height(...args) : null;
    let yAxisWidth = (...args) => yAxisComponent && yAxisComponent.width ? yAxisComponent.width(...args) : null;
    let yOrient = functor('right');
    let xOrient = functor('bottom');
    let canvasPlotArea = seriesCanvasMulti();
    let svgPlotArea = seriesSvgMulti();
    let xAxisStore = store('tickFormat', 'ticks', 'tickArguments', 'tickSize', 'tickSizeInner', 'tickSizeOuter', 'tickValues', 'tickPadding', 'tickCenterLabel');
    let xDecorate = () => { };
    let yAxisStore = store('tickFormat', 'ticks', 'tickArguments', 'tickSize', 'tickSizeInner', 'tickSizeOuter', 'tickValues', 'tickPadding', 'tickCenterLabel');
    let yDecorate = () => { };
    let decorate = () => { };

    let xAxisComponent = null;
    let yAxisComponent = null;

    const containerDataJoin = dataJoin('d3fc-group', 'cartesian-chart');
    const xAxisDataJoin = dataJoin('d3fc-svg', 'x-axis')
        .key(d => d);
    const yAxisDataJoin = dataJoin('d3fc-svg', 'y-axis')
        .key(d => d);
    const xLabelDataJoin = dataJoin('div', 'x-label')
        .key(d => d);
    const yLabelDataJoin = dataJoin('div', 'y-label')
        .key(d => d);

    const propagateTransition = maybeTransition => selection =>
        maybeTransition.selection ? selection.transition(maybeTransition) : selection;

    const cartesian = (selection) => {

        const transitionPropagator = propagateTransition(selection);

        selection.each((data, index, group) => {
            const container = containerDataJoin(select(group[index]), [data]);

            container.enter()
                .attr('auto-resize', '')
                .html(
                    '<d3fc-svg class="plot-area"></d3fc-svg>' +
                    '<d3fc-canvas class="plot-area"></d3fc-canvas>'
                );

            xLabelDataJoin(container, [xOrient(data)])
                .attr('class', d => `x-label ${d}-label`)
                .text(xLabel(data));

            yLabelDataJoin(container, [yOrient(data)])
                .attr('class', d => `y-label ${d}-label`)
                .text(yLabel(data));

            xAxisComponent = xAxisStore(xOrient(data) === 'top' ? xAxis.top(xScale) : xAxis.bottom(xScale));
            yAxisComponent = yAxisStore(yOrient(data) === 'left' ? yAxis.left(yScale) : yAxis.right(yScale));

            xAxisDataJoin(container, [xOrient(data)])
                .attr('class', d => `x-axis ${d}-axis`)
                .on('initialise', (d, i, nodes) => {
                    const { width } = event.detail;
                    if (xScale.range()[1] !== width) {
                        xScale.range([0, width]);

                        select(nodes[i]).style('height', xAxisHeight(select(nodes[i]).select('svg')));
                    }
                })
                .on('measure', (d, i, nodes) => {
                    const { width, height } = event.detail;
                    if (d === 'top') {
                        select(nodes[i])
                            .select('svg')
                            .attr('viewBox', `0 ${-height} ${width} ${height}`);
                    }
                    xScale.range([0, width]);
                })
                .on('draw', (d, i, nodes) => {
                    xAxisComponent.decorate(xDecorate);
                    transitionPropagator(select(nodes[i]))
                        .select('svg')
                            .call(xAxisComponent);
                });

            yAxisDataJoin(container, [yOrient(data)])
                .attr('class', d => `y-axis ${d}-axis`)
                .on('initialise', (d, i, nodes) => {
                    const { height } = event.detail;
                    if (yScale.range()[0] !== height) {
                        yScale.range([height, 0]);

                        select(nodes[i]).style('width', yAxisWidth(select(nodes[i]).select('svg')));
                    }
                })
                .on('measure', (d, i, nodes) => {
                    const { width, height } = event.detail;
                    if (d === 'left') {
                        select(nodes[i])
                            .select('svg')
                            .attr('viewBox', `${-width} 0 ${width} ${height}`);
                    }
                    yScale.range([height, 0]);
                })
                .on('draw', (d, i, nodes) => {
                    yAxisComponent.decorate(yDecorate);
                    transitionPropagator(select(nodes[i]))
                        .select('svg')
                            .call(yAxisComponent);
                });

            container.select('d3fc-canvas.plot-area')
                .on('draw', (d, i, nodes) => {
                    const canvas = select(nodes[i])
                        .select('canvas')
                        .node();
                    canvasPlotArea.context(canvas.getContext('2d'))
                        .xScale(xScale)
                        .yScale(yScale);
                    canvasPlotArea(d);
                });

            container.select('d3fc-svg.plot-area')
                .on('draw', (d, i, nodes) => {
                    svgPlotArea.xScale(xScale)
                        .yScale(yScale);
                    transitionPropagator(select(nodes[i]))
                        .select('svg')
                        .call(svgPlotArea);
                });

            container.each((d, i, nodes) => nodes[i].requestRedraw());

            decorate(container, data, index);
        });
    };

    const scaleExclusions = exclude(
        /range\w*/,   // the scale range is set via the component layout
        /tickFormat/  // use axis.tickFormat instead (only present on linear scales)
    );
    rebindAll(cartesian, xScale, scaleExclusions, prefix('x'));
    rebindAll(cartesian, yScale, scaleExclusions, prefix('y'));
    rebindAll(cartesian, xAxisStore, prefix('x'));
    rebindAll(cartesian, yAxisStore, prefix('y'));

    cartesian.xOrient = (...args) => {
        if (!args.length) {
            return xOrient;
        }
        xOrient = functor(args[0]);
        return cartesian;
    };
    cartesian.yOrient = (...args) => {
        if (!args.length) {
            return yOrient;
        }
        yOrient = functor(args[0]);
        return cartesian;
    };
    cartesian.xDecorate = (...args) => {
        if (!args.length) {
            return xDecorate;
        }
        xDecorate = args[0];
        return cartesian;
    };
    cartesian.yDecorate = (...args) => {
        if (!args.length) {
            return yDecorate;
        }
        yDecorate = args[0];
        return cartesian;
    };
    cartesian.xLabel = (...args) => {
        if (!args.length) {
            return xLabel;
        }
        xLabel = functor(args[0]);
        return cartesian;
    };
    cartesian.yLabel = (...args) => {
        if (!args.length) {
            return yLabel;
        }
        yLabel = functor(args[0]);
        return cartesian;
    };
    cartesian.xAxisHeight = (...args) => {
        if (!args.length) {
            return xAxisHeight;
        }
        xAxisHeight = functor(args[0]);
        return cartesian;
    };
    cartesian.yAxisWidth = (...args) => {
        if (!args.length) {
            return yAxisWidth;
        }
        yAxisWidth = functor(args[0]);
        return cartesian;
    };
    cartesian.canvasPlotArea = (...args) => {
        if (!args.length) {
            return canvasPlotArea;
        }
        canvasPlotArea = args[0];
        return cartesian;
    };
    cartesian.svgPlotArea = (...args) => {
        if (!args.length) {
            return svgPlotArea;
        }
        svgPlotArea = args[0];
        return cartesian;
    };
    cartesian.decorate = (...args) => {
        if (!args.length) {
            return decorate;
        }
        decorate = args[0];
        return cartesian;
    };

    return cartesian;

};

const getArguments = (...args) => {
    const defaultSettings = {
        xScale: scaleIdentity(),
        yScale: scaleIdentity(),
        xAxis: { bottom: axisBottom, top: axisTop },
        yAxis: { right: axisRight, left: axisLeft }
    };

    if (args.length === 1 && !args[0].domain && !args[0].range) {
        // Settings object
        return Object.assign(defaultSettings, args[0]);
    }

    // xScale/yScale parameters
    return Object.assign(defaultSettings, {
        xScale: args[0] || defaultSettings.xScale,
        yScale: args[1] || defaultSettings.yScale
    });
};
