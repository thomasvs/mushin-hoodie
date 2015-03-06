// vi:si:et:sw=2:sts=2:ts=2
describe(
  'Service: things', function () {
    var things;
    var Thing;
    var hoodie;
    var hoodieStore;
    var $rootScope;
    var scope;
    var $q;

    var hoodieApi = (new Hoodie());
    var api = hoodieApi.store;

    var debug = new window.$debug('mushin:services/thing');
    debug('Service: things debug');

    beforeEach(module('mushin'));

    // this loads the template module generated by html2js in karma.conf.js
    beforeEach(module('template-module'));

    beforeEach(module('hoodie', function ($provide) {
      $provide.value('hoodie', hoodieApi);
      spyOn(hoodieApi.store, 'on');
      spyOn(hoodieApi.store, 'findAll').andReturn([
        { type: 'foo', value: '33' },
        { type: 'bar', value: '34' },
        { type: 'foo', value: '35' }
      ]);
    }));


    beforeEach(inject(function (_things_, _Thing_, _$rootScope_, _hoodieStore_, _hoodie_, _$q_) {
      things = _things_;
      Thing = _Thing_;
      $rootScope = _$rootScope_;
      hoodie = _hoodie_;
      hoodieStore = _hoodieStore_;
      $q = _$q_;

      $rootScope.$apply();

    }));

    it('should have a getAll function', function () {
        expect(angular.isFunction(things.getAll)).toBe(true);
    });
    it('should load projects, contexts, importance and urgency right',
      function () {
        things.loadedThingsData(Thing.active, [
          {
            urgency: 5,
            projects: [ 'mushin', ]
          },
        ]);

        expect(Object.keys($rootScope.projects)).toEqual(['mushin']);
        expect(Object.keys($rootScope.urgency)).toEqual(['5']);

      }
    );
  }
);
