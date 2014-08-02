function TagListCtrl(type) {

  var debug = new window.$debug('zentodone:controllers/taglist');

  return function($scope) {
    debug('new TagListCtrl of type ' + type);
    $scope.type = type;

    $scope.tags = $scope[type + 's']

    $scope.selectedAll = true;

    $scope.isType = function(type) {
      return type == $scope.type;
    }
    $scope.toggle = function(name) {
      var all = true;

      $scope.tags[name].active = !$scope.tags[name].active

      for (var key in $scope.tags) {
        if ($scope.tags[key].active) { all = false; }
      }
      if ($scope.selectedAll != all) {
        $scope.selectedAll = all;
      }
    }
    $scope.getCount = function(tag) {
      if (tag) {
        return $scope.tags[tag].things.length;
      } else {
        return Object.keys($scope.tags).length;
      }
    }

  }
}
angular.module('zentodone').controller('ContextListCtrl',
  ['$scope', new TagListCtrl('context')]);
angular.module('zentodone').controller('ProjectListCtrl',
  ['$scope', new TagListCtrl('project')]);
