angular.module('mushin').factory('things', function ($rootScope, hoodie, $q, Thing) {

  var debug = new window.$debug('mushin:services/thing');
  $rootScope.contexts = {}; // context name -> obj with things, active, ...
  $rootScope.projects = {};
  $rootScope.importance = {}; // importance level -> obj with things, active, ...
  $rootScope.urgency = {};

  hoodie.store.on('change:thing', function(name, thing) {
    $rootScope.$broadcast('thingChange', {
      type: name,
      thing: thing
    })
  })

  // update the contexts/projects hash based on the thing
  var trackHash = function(hash, type, thing) {
    var plural = type + 's'

    if (thing[plural]) {
      for (var j = 0; j < thing[plural].length; ++j) {
        var name = thing[plural][j];
        if (!(name in hash)) {
          hash[name] = {
            'name': name,
            'active': false,
            'things': [],
          }
        }
        // for now, ignore completed things
        if (thing.complete == 100) { return; }

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

  return {
    get: function(id) {
      return $q.when(hoodie.store.find('thing', id))
    },
    getAll: function(type) {
      var promise = $q.when(hoodie.store.findAll('thing'))
      if (!Thing.isType(type)) {
        return promise
      }

      var deferred = $q.defer()
      promise.then(function(thingsData) {
        var thingsDataOfType = []

        // reset when we recount
        resetHash($rootScope.projects);
        resetHash($rootScope.contexts);
        resetHash($rootScope.importance);
        resetHash($rootScope.urgency);

        for (var i = 0; i < thingsData.length; i++) {
          // FIXME: not sure if it's better to deal with thingData here or
          //        full thing objects
          var thing = thingsData[i];
          debug('loaded thing ' + thing.title);
          if ((thing.state === type) ||
              (type == Thing.ACTIVE && !thing.state)) {
            thingsDataOfType.push(thing);
            trackHash($rootScope.projects, 'project', thing);
            trackHash($rootScope.contexts, 'context', thing);
            trackNumberHash($rootScope.importance, 'importance', thing);
            trackNumberHash($rootScope.urgency, 'urgency', thing);
          }
        }
        debug('loaded ' + thingsDataOfType.length + ' things of type ' + type);
        debug('loaded ' + Object.keys($rootScope.projects).length + ' projects');
        debug('loaded ' + Object.keys($rootScope.contexts).length + ' contexts');
        debug('loaded ' + Object.keys($rootScope.importance).length +
            ' importance levels');
        debug('loaded ' + Object.keys($rootScope.urgency).length +
            ' urgency levels');
        deferred.resolve(thingsDataOfType);
      });
      return deferred.promise
    },
    add: function(title, description, data) {
      var newThing = new Thing(title, description, data)
      return $q.when(hoodie.store.add('thing', newThing.data))
    },
    extend: function(scope) {
      /* this adds proxies for some functions on the Thing class,
       * instantiating them on the fly so they can be changed.
       */
      var methods = ['setDone', 'setDeleted', 'setComplete']

      angular.forEach(methods, function(method) {
        scope[method] = function(data) {
          var thing = new Thing(data)
          return thing[method]()
        }
      })

      var conversions = ['inbox', 'mit', 'br']

      angular.forEach(conversions, function(conversion) {
        var method = 'convertTo' + conversion[0].toUpperCase() + conversion.substring(1)
        var state = Thing[conversion.toUpperCase()]
        scope[method] = function(data) {
          var thing = new Thing(data)
          return thing.convertTo(state)
        }
      })
    }
  }
})
