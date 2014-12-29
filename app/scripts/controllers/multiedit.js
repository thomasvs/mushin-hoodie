angular.module('mushin').controller('MultiEditController', function ($scope, $modal, $log) {

  $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: 'views/multiedit.html',
      controller: 'MultiEditInstanceController',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
});
