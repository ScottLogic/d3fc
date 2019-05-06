import { defaultPadding } from './default';
import { rebindAll } from '@d3fc/d3fc-rebind';

export const hardLimitZeroPadding = () => {
    const _defaultPadding = defaultPadding();

    const padding = extent => {
        let pad = _defaultPadding.pad();
        let padUnit = _defaultPadding.padUnit();

        let delta = 1;
        switch (padUnit) {
        case 'domain': {
            break;
        }
        case 'percent': {
            delta = extent[1] - extent[0];
            break;
        }
        default:
            throw new Error('Unknown padUnit: ' + padUnit);
        }

        let paddedLowerExtent = extent[0] - pad[0] * delta;
        let paddedUpperExtent = extent[1] + pad[1] * delta;

        // If datapoints are exclusively negative or exclusively positive hard limit extent to 0.
        extent[0] = extent[0] >= 0 && paddedLowerExtent < 0 ? 0 : paddedLowerExtent;
        extent[1] = extent[1] <= 0 && paddedUpperExtent > 0 ? 0 : paddedUpperExtent;
        return extent;
    };

    rebindAll(padding, _defaultPadding);

    return padding;
};
