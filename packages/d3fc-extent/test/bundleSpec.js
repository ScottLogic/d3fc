import jsdom from 'jsdom';

describe('bundle', function() {
    it('should corectly wire-up all the dependencies via their UMD-exposed globals', function(done) {
        jsdom.env({
            html: '<html></html>',
            virtualConsole: jsdom.createVirtualConsole().sendTo({
                error: fail
            }),
            scripts: [
                require.resolve('d3/dist/d3.js'),
                './node_modules/@d3fc/d3fc-rebind/build/d3fc-rebind.js',
                './build/d3fc-extent.js'
            ],
            done: (_, win) => {
                const extent = win.fc.extentLinear()([1, 2, 3, 4]);
                expect(extent).not.toBeUndefined();
                done();
            }
        });
    });
});
