// vi:si:et:sw=2:sts=2:ts=2
//
// tested in test/spec/services/things.js
//
angular.module('mushin').factory('things',
  function($rootScope, $filter, hoodie, $q, Thing) {

    var debug = new window.$debug('mushin:services/thing');

    $rootScope.contexts = {}; // context name -> obj with things, active, ...
    $rootScope.projects = {};
    $rootScope.importance = {}; // importance level -> obj with things, active, ...
    $rootScope.urgency = {};
    $rootScope.things = [];

    var service = {};

    /* public API */

    service.loadedThingsData = function(type, thingsData) {

      var thingsDataOfType = [];

      // reset when we recount
      resetHash($rootScope.projects);
      resetHash($rootScope.contexts);
      resetHash($rootScope.importance);
      resetHash($rootScope.urgency);

      for (var i = 0; i < thingsData.length; i++) {
        // FIXME: not sure if it's better to deal with thingData here or
        //        full thing objects
        var thing = thingsData[i];
        if ((thing.state === type) ||
            (type == Thing.ACTIVE && !thing.state)) {
          thingsDataOfType.push(thing);
          trackHash($rootScope.projects, 'project', thing);
          trackHash($rootScope.contexts, 'context', thing);
          trackNumberHash($rootScope.importance, 'importance', thing);
          trackNumberHash($rootScope.urgency, 'urgency', thing);
        }
      }
      debug('loaded ' + Object.keys($rootScope.projects).length +
          ' projects');
      debug('loaded ' + Object.keys($rootScope.contexts).length +
          ' contexts');
      debug('loaded ' + Object.keys($rootScope.importance).length +
          ' importance levels');
      debug('loaded ' + Object.keys($rootScope.urgency).length +
          ' urgency levels');
      return thingsDataOfType;
    };

    service.get = function(id) {
      return $q.when(hoodie.store.find('thing', id));
    };

    /* called by ThingsController to load all things */
    service.getAll = function(type) {
      var start = new Date();

      var promise = $q.when(hoodie.store.findAll('thing'));
      if (!Thing.isType(type)) {
        return promise;
      }

      var deferred = $q.defer();

      promise.then(function(thingsData) {
        debug('loaded ' + thingsData.length + ' hoodie things in ' +
            (new Date().getTime() - start.getTime()) + ' ms');

        var thingsDataOfType = service.loadedThingsData(type, thingsData);

        // now that we've loaded, make sure we start broadcasting
        // changes
        hoodie.store.on('change:thing', function(name, thing) {
          debug('change:thing handler, name ' + name + ', thing ' + thing);
          $rootScope.$broadcast('thingChange', {
            type: name,
            thing: thing
          })
        });
        debug('loaded ' + thingsDataOfType.length +
            ' hoodie things of type ' + type + ' in ' +
            (new Date().getTime() - start.getTime()) + ' ms');

        $rootScope.things = $filter('filter')(thingsDataOfType,
          function(thing) {
            // FIXME: I'm filtering on complete/end in a filter func
            if (!thing.done && !thing.deleted) { return true; }
          }
        );

        deferred.resolve(thingsDataOfType);
      });
      return deferred.promise;
    };

    service.add = function(title, description, data) {
      var newThing = new Thing(title, description, data)
      return $q.when(hoodie.store.add('thing', newThing.data))
    };

    service.extend = function(scope) {
      /* service adds proxies for some functions on the Thing class,
       * instantiating them on the fly so they can be changed.
       */
      var methods = ['setDone', 'setDeleted', 'setComplete']

      angular.forEach(methods, function(method) {
        scope[method] = function(data) {
          var thing = new Thing(data)
          return thing[method]()
        }
      });

      /* generate all conversion functions, named convertTo... */
      /* service should match the Thing types in services/thing.js */
      var conversions = ['active', 'archive'];

      angular.forEach(conversions, function(conversion) {
        var methodName = 'convertTo' + conversion[0].toUpperCase() +
            conversion.substring(1);
        var state = Thing[conversion.toUpperCase()];

        scope[methodName] = function(data) {
          debug(methodName + '(): ' + JSON.stringify(data));
          var thing = new Thing(data);
          return thing.convertTo(state);
        };

      });
    };

    /* private API */

    // update the contexts/projects hash based on the thing
    var trackHash = function(hash, type, thing) {
      var plural = type + 's'

      if (thing[plural]) {
        for (var j = 0; j < thing[plural].length; ++j) {
          // for now, ignore completed things
          if (thing.complete == 100) { return; }

          var name = thing[plural][j];
          if (!(name in hash)) {
            hash[name] = {
              'name': name,
              'active': false,
              'things': [],
            }
          }

          hash[name].things.push(thing);
        }
      }
    }
    // update the importance/urgency hash based on the thing
    var trackNumberHash = function(hash, type, thing) {
      var number = thing[type];

      if (number) {
        if (!(number in hash)) {
          hash[number] = {
            'name': number,
            'active': false,
            'things': [],
          };
        }
        // for now, ignore completed things
        if (thing.complete == 100) { return; }

        hash[number].things.push(thing);
      }
    }

    var resetHash = function(hash) {
      for (var key in hash) {
        hash[key].things = [];
      }
    }

    return service;
  }
);
