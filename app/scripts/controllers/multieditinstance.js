// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('mushin').controller('MultiEditInstanceController', function ($scope, $modalInstance, items) {

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.archive = function () {
    console.log('archiving ' + JSON.stringify($scope.selected) + ' things');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
