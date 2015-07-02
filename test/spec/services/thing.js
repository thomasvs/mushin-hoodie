// vi:si:et:sw=2:sts=2:ts=2

/**
 * @fileoverview tests for scripts/services/things.js
 */

describe(
  'Service: Thing', function () {
    var Thing;

    var debug = new window.$debug('mushin:Thing');
    debug('TEST: Service: Thing debug');

    // load our app so injecting works
    beforeEach(module('mushin'));

    // we're only testing Thing, so no need to inject more
    beforeEach(inject(function (_Thing_) {
      Thing = _Thing_;
    }));

    // tests

    it('should instantiate new things',
      function () {
        thing = new Thing('my thing', 'is good', {
        });

        expect(thing.data.title).toEqual('my thing');
        expect(thing.data.description).toEqual('is good');
        expect(thing.data.state).toEqual(Thing.ACTIVE);
        expect(thing.data.deleted).toEqual(false);
        expect(thing.data.id).not.toBeUndefined();
      }
    );
  }
);
