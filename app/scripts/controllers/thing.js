// vi:si:et:sw=2:sts=2:ts=2
//
/**
 * @ngdoc controller
 * @name  mushin.controller:ThingController
 *
 * @description
 * A controller to show and edit a single thing
 */

angular.module('mushin').controller(
  'ThingController',
  function (things, Thing, $scope, $state, hoodie, $rootScope) {
    var lastType;
    var params = $state.params;
    var current = $state.current;
    var debug = new window.$debug('mushin:controllers/ThingController');
    debug('new thing controller');

    $scope.thing = {};
    $scope.stateName = null;

    $scope.contexts = $rootScope.contexts;
    $scope.projects = $rootScope.projects;
    $scope.importance = $rootScope.importance;
    $scope.urgency = $rootScope.urgency;

    $scope.contextsActive = {};
    $scope.projectsActive = {};
    $scope.importanceActive = {};
    $scope.urgencyActive = {};

    /* when we receive a TAG_TOGGLED event, update the appropriate
     * TagList */
    $scope.$on('TAG_TOGGLED', function(event, type, name) {
      var taglist = $scope.thing[type + 's'];
      if (!taglist) {
        $scope.thing[type + 's'] = [];
        taglist = $scope.thing[type + 's'];
      }
      var i = taglist.indexOf(name);
      if (i > -1) {
        taglist.splice(i, 1);
      } else {
        taglist.push(name);
      }
      debug('running $scope.update');
      $scope.update();
      // FIXME: hack: toggling can change the count for each tag, so
      // force a recount
      things.getAll(Thing.ACTIVE);
    });

    /* when we receive a NUMBER_TOGGLED event, update the appropriate
     * NumberList */
    $scope.$on('NUMBER_TOGGLED', function(event, type, name) {
      var number = $scope.thing[type];
      debug('NUMBER TOGGLED for ' + name + ' when I have ' + number);
      /* name comes in as a string */
      if (number == parseInt(name)) {
        // remove
        $scope.thing[type] = undefined;
      } else {
        // set
        $scope.thing[type] = parseInt(name);
      }
      debug('running $scope.update for NUMBER_TOGGLED');
      $scope.update();
    });


    // FIXME: hack: if the page was reloaded, contexts and projects are
    //        not loaded.  force a load.
    //        only works with ECMA5
    if (Object.keys($scope.contexts).length === 0) {
      debug('controller/thing.js: getting all things');
      things.getAll(Thing.ACTIVE);
    }

    function loaded(data) {
      debug('controllers/thing.js: loaded ' + JSON.stringify(data));
      goToCorrectType(data);
      $scope.thing = data;
      $scope.unit = data.state === Thing.MIT ? Thing.ONE_DAY : Thing.ONE_WEEK;
      $scope.stateName = Thing.types[data.state];
      lastType = $scope.thing.state;
      $scope[Thing.types[lastType]] = true;

      if (data.due) {
        $scope.due = new Date(data.due);
        debug ('controllers/thing.js: due date: ' +
          data.due + ', as Date: ' + $scope.due);
      }

      /* we copy over title so it can be edited and re-parsed too */
      $scope.title = data.title;

      debug ('controllers/thing.js: contexts ' +
        JSON.stringify(data.contexts));
      if (data.contexts && data.contexts.length > 0) {
        angular.forEach(data.contexts, function(context) {
          $scope.contextsActive[context] = { active: true};
          debug('$scope.contextsActive now ' +
            JSON.stringify($scope.contextsActive));
        });
      }
      debug ('controllers/thing.js: projects ' +
        JSON.stringify(data.projects));
      if (data.projects && data.projects.length > 0) {
        angular.forEach(data.projects, function(project) {
          $scope.projectsActive[project] = { active: true};
          debug('$scope.projectsActive now ' +
            JSON.stringify($scope.projectsActive));
        });
      }

      if (data.importance) {
        $scope.importanceActive[data.importance] = { active: true};
        debug('$scope.importanceActive now ' +
          JSON.stringify($scope.importanceActive));
      }
      if (data.urgency) {
        $scope.urgencyActive[data.urgency] = { active: true};
        debug('$scope.urgencyActive now ' +
          JSON.stringify($scope.urgencyActive));
      }

    }

    /* load the thing and process it */
    things.get(params.id).then(loaded);


    things.extend($scope);

    function goToCollection() {
      var navbarController = angular.element('bp-navbar').controller('bpNavbar');
      $state.go(navbarController.getUpFromState(current).state);
    }

    function goToCorrectType(thing) {
      if (current.data.state !== thing.state) {
        $state.go(Thing.types[thing.state] + 'Thing', {id: thing.id});
      }
    }

    $scope.handle = function(promise) {
      promise.then(function(thing) {
        if (thing.state === Thing.ARCHIVE || thing.end) {
          return goToCollection();
        }
        goToCorrectType(thing);
      });
    }

    /* called immediately every time anything changes;
     * except for description, thanks to the new ng-model-options */
    $scope.update = function() {
      debug('updating thing in hoodie');
      debug('scope due date: ' + $scope.due);
      debug('thing due date: ' + $scope.thing.due);
      debug('importance: ' + $scope.thing.importance);
      debug('urgency: ' + $scope.thing.urgency);

      if ($scope.due) $scope.thing.due = $scope.due.toISOString();

      /* reparse title as we may use it to change some properties
       */
      var parser = new window.Parser();
      var parsed = parser.parse($scope.title);
      debug('parsed: ' + JSON.stringify(parsed));
      debug('scope.thing: ' + JSON.stringify($scope.thing));

      angular.extend($scope.thing, parsed);
      debug('new scope.thing: ' + JSON.stringify($scope.thing));

      /* FIXME: we tried to call the same function as on getting to
       * update contexts and projects and other things, but not
       * working.  Ideally this should be through a listener anyway */
      loaded($scope.thing);
      return hoodie.store.update('thing', $scope.thing.id, $scope.thing);
    }
  }
);
