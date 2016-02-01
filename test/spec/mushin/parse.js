// vi:si:et:sw=2:sts=2:ts=2

/**
 * @fileoverview tests for scripts/mushin/parse.js
 */

describe(
  'Parse', function () {
    var Parse;

    var debug = new window.$debug('Parse');
    debug('TEST: Parse debug');

    // tests

    it('should instantiate a new thing from a line',
      function () {
        parser = new Parser();
        data = parser.parse('my thing r:4W p:mushin !nextaction U:5 D:2016-12-31');

        expect(data.title).toEqual('my thing');
        expect(data.recurrence).toEqual(4 * 7 * 24 * 60 * 60);
      }
    );
  }
);
