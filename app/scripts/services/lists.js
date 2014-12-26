angular.module('mushin').factory('lists',
  function ($rootScope, $filter, hoodie, $q) {

  var debug = new window.$debug('mushin:services/list');

  var lists = {};

  hoodie.store.on('change:list', function(name, list) {
    $rootScope.$broadcast('listChange', {
      type: name,
      list: list
    })
  });

  var getAll = function() {
      var promise = $q.when(hoodie.store.findAll('list'));

      var deferred = $q.defer();
      promise.then(function(listsData) {
        debug('loaded ' + listsData.length + ' lists');
        lists = listsData;
        deferred.resolve(listsData);
      });
      return deferred.promise;
  };

  return {
    get: function(id) {
      return $q.when(hoodie.store.find('list', id));
    },
    getAll: getAll,
    /* add: if the title is the same, update if already exists */
    add: function(title, query) {
      getAll()
        .then(function(lists) {

          var existing = $filter('filter')(lists, function(list) {
            return list.title == title;
          });
          var listData = {
              title: title,
              query: query
          };

          if (existing.length > 0) {
            var list = existing[0];

            /* make sure we only keep one with this title */
            if (existing.length > 1) {
              for (var i = 1; i < existing.length; ++i) {
                debug('removing duplicate list with id ' + existing[i].id);
                hoodie.store.remove('list', existing[i].id);
              }
            }

            debug('updating existing list with title ' + list.title);

            return $q.when(hoodie.store.update('list', list.id, listData));
          } else {
            debug('saving new list with title ' + title);

            return $q.when(hoodie.store.add('list', listData));
          }
      });
    },
  }
});
