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

  return {
    get: function(id) {
      return $q.when(hoodie.store.find('list', id));
    },
    getAll: function() {
      var promise = $q.when(hoodie.store.findAll('list'));

      var deferred = $q.defer();
      promise.then(function(listsData) {
        debug('loaded ' + listsData.length + ' lists');
        lists = listsData;
        deferred.resolve(listsData);
      });
      return deferred.promise;
    },
    /* add: if the title is the same, update if already exists */
    add: function(title, query) {
      var existing = $filter('filter')(lists, function(list) {
        return list.title == title;
      });
      var listData = {
          title: title,
          query: query
      };

      if (existing) {
        var list = existing[0];

        debug('updating existing list with title ' + list.title);
      } else {
        debug('saving new list with title ' + title);
        return $q.when(hoodie.store.add('list', listData));
      }
    },
  }
});
