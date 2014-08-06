angular.module('zentodone').controller('ListsListCtrl', function ($state, $scope, lists) {
  var state = $state.current
  var name = state.name

  $scope[name] = []
  //lists.extend($scope)

  function fetchLists() {
    lists.getAll()
      .then(function(all) {
        $scope[name] = all;
      })
  }

  fetchLists()

  $scope.$on('listChange', function() {
    fetchLists()
  })
})
