angular.module('mushin').factory('lists', function ($rootScope, hoodie, $q) {

  var debug = new window.$debug('mushin:services/list');

  hoodie.store.on('change:list', function(name, list) {
    $rootScope.$broadcast('listChange', {
      type: name,
      list: list
    })
  })

  return {
    get: function(id) {
      return $q.when(hoodie.store.find('list', id))
    },
    getAll: function() {
      var promise = $q.when(hoodie.store.findAll('list'))

      var deferred = $q.defer()
      promise.then(function(listsData) {
        debug('loaded ' + listsData.length + ' lists');
        deferred.resolve(listsData)
      })
      return deferred.promise
    },
    add: function(title, query) {
      var listData = {
          title: title,
          query: query
      };
      return $q.when(hoodie.store.add('list', listData))
    },
  }
})
