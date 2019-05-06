import { min, max } from 'd3-array';
import { defaultPadding } from './padding/default';

export default function() {

    let accessors = [ d => d ];
    let paddingStrategy = defaultPadding();
    let symmetricalAbout = null;
    let include = [];

    const instance = (data) => {
        const values = new Array(data.length);
        for (const accessor of accessors) {
            for (let i = 0; i < data.length; i++) {
                const value = accessor(data[i], i);
                if (Array.isArray(value)) {
                    values.push(...value);
                } else {
                    values.push(value);
                }
            }
        }

        const extent = [ min(values), max(values) ];

        extent[0] = extent[0] == null ? min(include) : min([extent[0], ...include]);
        extent[1] = extent[1] == null ? max(include) : max([extent[1], ...include]);

        if (symmetricalAbout != null) {
            const halfRange = Math.max(
                Math.abs(extent[1] - symmetricalAbout),
                Math.abs(extent[0] - symmetricalAbout)
            );
            extent[0] = symmetricalAbout - halfRange;
            extent[1] = symmetricalAbout + halfRange;
        }

        return paddingStrategy(extent);
    };

    instance.accessors = (...args) => {
        if (!args.length) {
            return accessors;
        }
        accessors = args[0];
        return instance;
    };

    instance.pad = function() {
        if (!arguments.length) {
            return paddingStrategy.pad;
        }
        paddingStrategy.pad(arguments.length <= 0 ? undefined : arguments[0]);
        return instance;
    };

    instance.padUnit = function() {
        if (!arguments.length) {
            return paddingStrategy.padUnit;
        }
        paddingStrategy.padUnit(arguments.length <= 0 ? undefined : arguments[0]);
        return instance;
    };

    instance.paddingStrategy = function() {
        if (!arguments.length) {
            return paddingStrategy;
        }
        paddingStrategy = arguments.length <= 0 ? undefined : arguments[0];
        return instance;
    };

    instance.include = (...args) => {
        if (!args.length) {
            return include;
        }
        include = args[0];
        return instance;
    };

    instance.symmetricalAbout = (...args) => {
        if (!args.length) {
            return symmetricalAbout;
        }
        symmetricalAbout = args[0];
        return instance;
    };

    return instance;
}
