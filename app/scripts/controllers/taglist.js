/*
 * This controller expects a parent scope to have the matching tag list;
 * i.e. $scope.projects if type == project
 */
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
    $scope.clear = function() {
      for (var key in $scope.tags) {
        $scope.tags[key].active = false;
      }
      $scope.selectedAll = !$scope.selectedAll;
    }

    $scope.getCount = function(tag) {
      if (tag) {
        return $scope.tags[tag].things.length;
      } else {
        return Object.keys($scope.tags).length;
      }
    }

    $scope.filterByTag = function(thing) {
      debug('filterByTag ' + thing);

      if ($scope.selectedAll) {
        return true;
      }

      for (var key in $scope.tags) {
        if ($scope.tags[key].active && thing.tags.indexOf(key) > -1) {
          return true;
        }
      }

      return false;
    }

  }
}
angular.module('zentodone').controller('ContextListCtrl',
  ['$scope', new TagListCtrl('context')]);
angular.module('zentodone').controller('ProjectListCtrl',
  ['$scope', new TagListCtrl('project')]);
