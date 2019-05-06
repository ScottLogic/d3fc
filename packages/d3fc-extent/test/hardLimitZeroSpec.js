import linearExtent from '../src/linear';
import { hardLimitZeroPadding } from '../src/padding/hardLimitZero';

describe('linear', () => {
    const obj = (val) => ({ high: val + 0, low: val - 5 });

    it('should support increasing the range with domain padding', function() {
        var data = [obj(5), obj(15)];
        var extents = linearExtent()
            .accessors([d => d.high])
            .paddingStrategy(
                hardLimitZeroPadding()
                    .padUnit('domain')
                    .pad([5, 10])
            )(data);
        expect(extents).toEqual([0, 25]);
    });

    it('should support decreasing the range with domain padding', function() {
        var data = [obj(5), obj(15)];
        var extents = linearExtent()
            .accessors([d => d.high])
            .paddingStrategy(
                hardLimitZeroPadding()
                    .padUnit('domain')
                    .pad([-5, -2])
            )(data);
        expect(extents).toEqual([10, 13]);
    });

    it('should support increasing the range with domain padding but not cross zero to do so', function() {
        var data = [obj(1), obj(10)];
        var extents = linearExtent()
            .accessors([d => d.high])
            .paddingStrategy(
                hardLimitZeroPadding()
                    .padUnit('domain')
                    .pad([5, 10])
            )(data);
        expect(extents).toEqual([0, 20]);
    });

    it('should support increasing the range with domain padding normally if extent spans positive to negative values', function() {
        var data = [obj(-5), obj(5)];
        var extents = linearExtent()
            .accessors([d => d.high])
            .paddingStrategy(
                hardLimitZeroPadding()
                    .padUnit('domain')
                    .pad([5, 5])
            )(data);
        expect(extents).toEqual([-10, 10]);
    });
});
