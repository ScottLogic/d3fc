
import { scaleIdentity } from 'd3-scale';
import { include, prefix, rebind, rebindAll } from '@d3fc/d3fc-rebind';
import annotationLine from './line';
import { seriesCanvasMulti, seriesCanvasPoint } from '@d3fc/d3fc-series';

export default () => {

    let x = (d) => d.x;
    let y = (d) => d.y;
    let xScale = scaleIdentity();
    let yScale = scaleIdentity();

    const point = seriesCanvasPoint();

    const horizontalLine = annotationLine();

    const verticalLine = annotationLine()
        .orient('vertical');

    // The line annotations and point series used to render the crosshair are positioned using
    // screen coordinates. This function constructs an identity scale for these components.
    const xIdentity = scaleIdentity();
    const yIdentity = scaleIdentity();

    const multi = seriesCanvasMulti()
        .series([horizontalLine, verticalLine, point])
        .xScale(xIdentity)
        .yScale(yIdentity)
        .mapping((data) => [data]);

    const instance = (data) => {

        data.forEach(d => {
            // Assign the identity scales an accurate range to allow the line annotations to cover
            // the full width/height of the chart.
            xIdentity.range(xScale.range());
            yIdentity.range(yScale.range());

            point.crossValue(x)
                .mainValue(y);

            horizontalLine.value(y);

            verticalLine.value(x);

            multi(d);
        });
    };

    // Don't use the xValue/yValue convention to indicate that these values are in screen
    // not domain co-ordinates and are therefore not scaled.
    instance.x = (...args) => {
        if (!args.length) {
            return x;
        }
        x = args[0];
        return instance;
    };
    instance.y = (...args) => {
        if (!args.length) {
            return y;
        }
        y = args[0];
        return instance;
    };
    instance.xScale = (...args) => {
        if (!args.length) {
            return xScale;
        }
        xScale = args[0];
        return instance;
    };
    instance.yScale = (...args) => {
        if (!args.length) {
            return yScale;
        }
        yScale = args[0];
        return instance;
    };

    const lineIncludes = include('label', 'lineDecorate', 'labelDecorate');
    rebindAll(instance, horizontalLine, lineIncludes, prefix('y'));
    rebindAll(instance, verticalLine, lineIncludes, prefix('x'));
    rebind(instance, point, 'decorate');
    rebind(instance, multi, 'context');

    return instance;
};
