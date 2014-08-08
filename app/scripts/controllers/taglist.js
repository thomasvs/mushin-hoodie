angular.module('zentodone').controller('TagListCtrl',
  function($scope, $attrs) {
    var debug = new window.$debug('zentodone:controllers/taglist');
    /* whether to show the All ... header */
    if (!$attrs.all) {
        throw new Error("No all attribute for TagListCtrl");
    } else {
        $scope.showAll = $attrs.all;
    }
    if (!$attrs.type) {
        throw new Error("No type attribute for TagListCtrl");
    }
    $scope.open = false;

    $scope.type = $attrs.type;
    debug('new TagListCtrl of type ' + $scope.type);

    $scope.tags = $scope[$scope.type + 's']

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

})
