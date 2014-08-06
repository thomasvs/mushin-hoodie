angular.module('zentodone').controller('ListsListCtrl', function ($state, $scope, lists) {
  var debug = new window.$debug('zentodone:controllers/listslist');

  var state = $state.current
  var name = state.name

  debug ('state ' + state + ' name ' + name);
  $scope.lists = []
  //lists.extend($scope)

  function fetchLists() {
    lists.getAll()
      .then(function(all) {
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
