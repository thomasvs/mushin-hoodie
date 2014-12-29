// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('mushin').controller('MultiEditInstanceController',
  function ($scope, $rootScope, $modalInstance, items) {

  var debug = new window.$debug('mushin:controllers/MultiEditInstance');

  $scope.importanceEdit = {};
  $scope.urgencyEdit = {};

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.archive = function () {
    console.log('archiving ' + JSON.stringify($scope.selected) + ' things');
    $rootScope.$broadcast("multiEditAction", {
      action: 'archive',
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  /* listen to numberlist changes */
  $scope.$on('NUMBER_TOGGLED', function(event, type, name) {
    debug('NUMBER_TOGGLED for type ' + type + ' to ' + name);
    $rootScope.$broadcast("multiEditAction", {
      action: type,
      number: name,
    });
  });

});
