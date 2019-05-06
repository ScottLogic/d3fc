import { default as linearExtent } from './linear';
import { defaultPadding } from './padding/default';

export default function() {

    let accessors = [];
    let paddingStrategy = defaultPadding();
    let symmetricalAbout = null;
    let include = [];

    const extent = linearExtent();

    const valueOf = date => date != null ? date.valueOf() : null;

    const instance = (data) => {
        const adaptedAccessors = accessors.map(accessor => (...args) => {
            const value = accessor(...args);
            return Array.isArray(value) ? value.map(valueOf) : valueOf(value);
        });

        extent.accessors(adaptedAccessors)
          .pad(paddingStrategy.pad)
          .padUnit(paddingStrategy.padUnit)
          .paddingStrategy(paddingStrategy)
          .symmetricalAbout(symmetricalAbout != null ? symmetricalAbout.valueOf() : null)
          .include(include.map(date => date.valueOf()));

        return extent(data)
          .map(value => new Date(value));
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
