angular.module('mushin').controller('ListsListController', function ($state, $scope, lists) {
  var debug = new window.$debug('mushin:controllers/listslist');

  var state = $state.current
  var name = state.name

  debug ('state ' + state + ' name ' + name);
  $scope.lists = []
  //lists.extend($scope)

  function fetchLists() {
    debug('fetchLists started');
    lists.getAll()
      .then(function(all) {
        debug('getAll: result has ' + all.length + ' items');
        // this splice empties the list
        $scope.lists.splice(0, Number.MAX_VALUE);
        angular.forEach(all, function(item) {
            $scope.lists.push(item);
        });
        debug($scope.lists.length + ' lists in scope');
      })
  }

  fetchLists()

  $scope.$on('listChange', function() {
    fetchLists()
  })
})
