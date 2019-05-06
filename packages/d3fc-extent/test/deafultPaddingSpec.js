import linearExtent from '../src/linear';
import { defaultPadding } from '../src/padding/default';

describe('linear', () => {
    const obj = (val) => ({ high: val + 5, low: val - 5 });

    it('should support increasing the range with domain padding', function() {
        var data = [obj(5), obj(15)];

        var extents = linearExtent()
            .accessors([d => d.high])
            .paddingStrategy(
                defaultPadding()
                    .padUnit('domain')
                    .pad([5, 10])
            )(data);
        expect(extents).toEqual([5, 30]);
    });

    it('should support decreasing the range with domain padding', function() {
        var data = [obj(5), obj(15)];

        var extents = linearExtent()
            .accessors([d => d.high])
            .paddingStrategy(
                defaultPadding()
                    .padUnit('domain')
                    .pad([-5, -2])
            )(data);
        expect(extents).toEqual([15, 18]);
    });

});
