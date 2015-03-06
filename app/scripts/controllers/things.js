angular.module('mushin').controller(
  'ThingsController',
  function($scope, $rootScope, $filter, $location, $q, things, Thing,
    lists, hoodie) {

    /* lists is app/scripts/services/lists.js */

    /* module functions */
    $scope.newThing = function() {

      var title = ($scope.thingTitle || '').trim()
      var parser = new window.Parser();
      var parsed = parser.parse(title);

      title = parsed.title;
      debug('parsed new thing ' + JSON.stringify(parsed, null, 4));

      if (!title) return;

      // see app/scripts/services/things.js
      things.add(title, '', parsed);

      $scope.thingTitle = '';
      $scope.thingInput.$setPristine();
    };

    // filter things by context/project
    // FIXME: this now loops over all contexts/projects for each thing;
    // would be faster to precalculate the selection once into an array on
    // each click event in a taglist, then compare here
    $scope.filterByTag = function(thing) {

      var keep;
      var selectedAll;

      // either taglist may reject a thing
      // don't convert to angular.forEach as that does not allow breaks
      var types = [ 'context', 'project' ];
      var type;
      var tags;

      for (var i = 0; i < types.length; ++i) {
        type = types[i];
        tags = $scope[type + 's'];

//        debug('filter: looking at type ' + type);
        keep = false;
        selectedAll = true; // guilty until proven innocent

        for (var name in tags) {
          var tag = tags[name];

//          debug('filter: looking at tag ' + tag.name);
          if (tag.active) {
//            debug('filter: tag.name active ' + tag.name);
            selectedAll = false;
//            debug('thing tags: ' + JSON.stringify(thing));
            if (thing[type + 's'] && thing[type + 's'].indexOf(tag.name) > -1) {
//              debug('filter: keeping ' + thing.title);
              keep = true;
            }
          }
        }
        /* also keep if no tag is selected, which means all are */
        if (selectedAll) keep = true;

        if (!keep) {
          return false;
        }

      }
      return true;
    };

    // filter things by importance/urgency
    $scope.filterByNumber = function(thing) {

      var keep;
      var selectedAll;

      // either numberlist may reject a thing
      // don't convert to angular.forEach as that does not allow breaks
      var types = [ 'importance', 'urgency' ];
      var type;
      var tags;

      for (var i = 0; i < types.length; ++i) {
        type = types[i];
        tags = $scope[type];

//        debug('filter: looking at type ' + type);
        keep = false;
        selectedAll = true; // guilty until proven innocent

        for (var number in tags) {
          var tag = tags[number];

//          debug('filter: looking at tag ' + tag.name);
          if (tag.active) {
//            debug('filter: tag.name active ' + tag.name);
            selectedAll = false;
//            debug('thing tags: ' + JSON.stringify(thing));
            if (thing[type] && thing[type] == number) {
//              debug('filter: keeping ' + thing.title);
              keep = true;
            }
          }
        }
        /* also keep if no tag is selected, which means all are */
        if (selectedAll) keep = true;

        if (!keep) {
          return false;
        }
      }

      return true;
    };

    // filter things based on due date
    $scope.filterByDueSelector = function(thing) {

      var now = new Date();
      var due = new Date(thing.due);

      var dayStart = new Date(now.valueOf());
      dayStart.setHours(0);
      dayStart.setMinutes(0);
      dayStart.setSeconds(0);
      dayStart.setMilliseconds(0);

      var dayEnd = new Date(dayStart.valueOf());
      dayEnd.setDate(dayStart.getDate() + 1);

      var ret = false;

      switch ($scope.dueSelect) {
        case 'all':
          ret = true;
          break;
        case 'overdue':
          if (now > due)
            ret = true;
          break;
        case 'today':
          if (dayStart <= due && due < dayEnd)
            ret = true;
            break;
        case 'due':
          if (now < due)
            ret = true;
            break;
        case 'no':
          if (!thing.due)
            ret = true;
            break;
      }

      return ret;
    };

    $scope.notRecentlyCompleted = function(thing) {
      if (thing.complete != 100) {
//        debug(thing.title + ' not complete, keeping');
        return true;
      }
      if (!thing.end) {
//        debug(thing.title + ' no complete date, dropping');
        return false;
      }

      var now = new Date();
      var then = new Date(thing.end);
      var diff = Math.abs(now - then);
      if (diff >= 1000 * 60) {
//        debug(thing.title + ' done too long, dropping, ms ' + diff);
        return false;
      }

//      debug(thing.title + ' done just now, keeping, ms' + diff);
      return true;
    };

    // save the current state of the list of things as a saved list
    $scope.saveList = function(name) {
      debug('saveList ' + name);
      $scope.saveListActive = false;

      // construct query from state of filtering
      var parts = [];

      angular.forEach($scope.contexts, function (context) {
        if (context.active) {
          parts.push('@' + context.name);
        }
      });
      angular.forEach($scope.projects, function (project) {
        if (project.active) {
          parts.push('p:' + project.name);
        }
      });
      /* collect importance and urgency lists as a single word so
       * that the normal parse, which only allows one value for them,
       * still works
       */
      var numbers;

      numbers = [];
      angular.forEach($scope.importance, function (importance) {
        if (importance.active) {
          numbers.push(importance.name);
        }
      });
      if (numbers.length > 0) {
        parts.push('I:' + numbers.join(''));
      }
      numbers = [];
      angular.forEach($scope.urgency, function (urgency) {
        if (urgency.active) {
          numbers.push(urgency.name);
        }
      });
      if (numbers.length > 0) {
        parts.push('U:' + numbers.join(''));
      }

      var query = parts.join(' ');

      debug('saveList: query ' + query);
      lists.add(name, query);
    };

    $scope.toggleOrder = function(type) {
      debug('toggleOrder: ' + type);
      if ($scope.predicate == type) {
        $scope.predicate = '-' + type;
      } else {
        $scope.predicate = type;
      }
    };

    $scope.isSelected = function(thing) {
      //debug('isSelected: ' + thing.id + ' ' + $scope.selected[thing]);
      return $scope.selected[thing.id] !== undefined;
    };


    $scope.toggleSelected = function(thing) {
      debug('toggleSelected: ' + thing.id + ' ' + $scope.selected[thing.id]);
      if ($scope.isSelected(thing)) {
        delete $scope.selected[thing.id];
      } else {
        $scope.selected[thing.id] = thing;
      }
    };

    $scope.selectAll = function() {
      $scope.selectedAll = !$scope.selectedAll;
      debug('selectAll: now ' + $scope.selectedAll);
      debug('selectAll: looping over ' + $scope.thingsFound.length + ' things');

      angular.forEach($scope.thingsFound, function (thing) {
        if ($scope.selectedAll) {
          $scope.selected[thing.id] = thing;
        } else {
          if ($scope.isSelected(thing)) {
            delete $scope.selected[thing.id];
          }
        }
      });
    };

    /* private functions */
    function fetchThings() {

      var start = new Date();
      var deferred = $q.defer();

      debug('fetchThings: calling getAll');
      things.getAll(Thing.ACTIVE)
        .then(function(things) {
          debug('fetchThings: called getAll in ' +
              (new Date().getTime() - start.getTime()) +
              ' ms');
          // at this time, the rootScope contexts/projects are set and thus
          // available through $scope too

          $scope.things = $filter('filter')(things, function(thing) {
            // FIXME: I'm filtering on complete/end in a filter func
            if (!thing.done && !thing.deleted) return true;
          });

          // parse query params from search entry now
          if (search.query) {
            var parser = new window.Parser();
            var parsed = parser.parse(search.query);
            debug('controllers/things.js: parsed query ' + JSON.stringify(parsed));


            /* FIXME: reset old filter state; roll into helper */
            angular.forEach($scope.contexts, function(value, key) {
              $scope.contexts[key].active = false;
            });
            angular.forEach($scope.projects, function(value, key) {
              $scope.projects[key].active = false;
            });
            angular.forEach($scope.importance, function(value, key) {
              $scope.importance[key].active = false;
            });
            angular.forEach($scope.urgency, function(value, key) {
              $scope.urgency[key].active = false;
            });

            /* now set state based on query */
            angular.forEach(parsed.contexts, function (context) {
              // it's possible we're asking for a non-existing context
              // FIXME: maybe extract to a contexts initter ?
              if ($scope.contexts[context] === undefined ) {
                $scope.contexts[context] = {
                  'name': context,
                  'things': [],
                };
              }
              $scope.contexts[context].active = true;
            });

            angular.forEach(parsed.projects, function (project) {
              if ($scope.projects[project] === undefined ) {
                $scope.projects[project] = {
                  'name': project,
                  'things': [],
                };
              }
              $scope.projects[project].active = true;
            });

              var i;

            if (parsed.importance) {
              /* it was parsed as an int, convert to str */
              var importance = '' + parsed.importance;
              for (i = 0; i < importance.length; ++i) {
                debug('filtering for importance ' + importance.charAt(i));
                $scope.importance[importance.charAt(i)].active = true;
              }
            }

            if (parsed.urgency) {
              /* it was parsed as an int, convert to str */
              var urgency = '' + parsed.urgency;
              for (i = 0; i < urgency.length; ++i) {
                debug('filtering for urgency ' + urgency.charAt(i));
                $scope.urgency[urgency.charAt(i)].active = true;
              }
            }
          }

          debug('fetchThings: finished');
          deferred.resolve(undefined);
        });
      debug('fetchThings: returning');
      return deferred.promise;
    }

    /* module code */

    var debug = new window.$debug('mushin:ThingsController');
    var search = $location.search();

    // declare it here so that ng-repeat of thing in thingsFound exposes
    // this to controller
//    $scope.thingsFound = [];

    // whether a thing is selected in the things view
    // mapping of thing.id -> thing
    $scope.selected = {};
    $scope.selectedAll = false;

    $scope.title = "Things"; /* set from search query */
    if (search.title) {
      $scope.title = "Things: " + search.title;
      debug('controllers/things.js: parsed title ' + search.title);
    }

    // order of the things listed
    $scope.predicate = 'title';

    // state of the by due date filter
    $scope.dueSelect = 'all';


    debug('controllers/things.js: search params ' + JSON.stringify(search));

    $scope.saveListActive = false;


    $scope.inbox = [];

    /* this adds proxy functions to Thing class functions */
    things.extend($scope);

    // http://cubiq.org/add-to-home-screen
    addToHomescreen({
      maxDisplayCount: 3
    });

    /* listen for events from multi edit dialog */
    $scope.$on("multiEditAction", function(event, args) {
      debug('action: ' + args.action + ' ' +
        Object.keys($scope.selected).length + ' things');

      if (args.action == 'importance' || args.action == 'urgency') {
        var number = args.number;
        var promises = [];

        angular.forEach($scope.selected, function (value) {
          value[args.action] = number;

          var res = hoodie.store.update('thing', value.id, value);

          promises.push(res);

          debug('update: ' + JSON.stringify(res));
        });

        return $q.all(promises);
      }
    });

    debug('controllers/things.js: calling fetchThings');
    fetchThings()
      .then(function() {
        $scope.$on('thingChange', function(event, change) {
          debug('thingChange: type ' + change.type);
          debug('thingChange: thing ' + change.thing);
          debug('thingChange: thing ' + JSON.stringify(change.thing));
          // FIXME: this is too expensive to redo every time;
          // figure out which thing chnaged instead
          //fetchThings();
          debug('thingChange, called fetchThings');
        });

    });
    debug('controllers/things.js: called fetchThings');

  }
);
