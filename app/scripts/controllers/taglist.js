// vi:si:et:sw=2:sts=2:ts=2
/**
 * @file      The tag list controller controls the tag list directive,
 *            allowing the user to choose any (or all) tags.
 *
 *            The controller should be initialized with the following tags:
 *             - type: 'project' or 'context'
 *             - all:  true or false; whether to allow selecting all tags
 *
 *            A parent scope should provide the following members:
 *             - 'projects' or 'contexts', depending on the type.
 *
 * @author    Thomas Vander Stichele <thomas (at) apestaart (dot) org>
 * @namespace TagListCtrl
 */
angular.module('zentodone').controller(
  'TagListCtrl',
  function($scope, $attrs) {

    var debug = new window.$debug('zentodone:controllers/taglist');

    /* projects or contexts */
    if (!$attrs.type) {
      throw new Error("No type attribute for TagListCtrl");
    }
    $scope.type = $attrs.type;

    /* whether to show the All ... header */
    if (!$attrs.all) {
      throw new Error("No all attribute for TagListCtrl");
    } else {
    $scope.showAll = $attrs.all;
    }

    $scope.open = false;

    debug('new TagListCtrl of type ' + $scope.type);

    $scope.tags = $scope[$scope.type + 's'];

    $scope.selectedAll = true;

    $scope.isType = function(type) {
      return type == $scope.type;
    }

    /**
     * Toggle the selection state of a tag.
     *
     * @memberof TagListCtrl
     * @method   toggle
     * @param    {string} name the name of the tag to toggle.
     */
    $scope.toggle = function(name) {
      var all = true;

      $scope.tags[name].active = !$scope.tags[name].active;

      for (var key in $scope.tags) {
        if ($scope.tags[key].active) { all = false; }
      }
      if ($scope.selectedAll != all) {
        $scope.selectedAll = all;
      }
    }

    /**
     * Clear the selection state of all tags, and set selectedAll.
     *
     * @memberof TagListCtrl
     * @method   clear
     */
    $scope.clear = function() {
      for (var key in $scope.tags) {
        $scope.tags[key].active = false;
      }
      $scope.selectedAll = true;
    }

    /**
     * Get the number of things for the given tag.
     *
     * @memberof TagListCtrl
     * @method   getCount
     * @param    {string} tag the name of the tag to get a count for;
     *                        leave undefined to get the total count of tags
     */
    $scope.getCount = function(tag) {
      if (tag) {
        return $scope.tags[tag].things.length;
      } else {
        return Object.keys($scope.tags).length;
      }
    }

    /**
     * Filter the given thing by the current selection state.
     *
     * @memberof TagListCtrl
     * @method   filterByTag
     * @param {object} thing the name of the tag to get a count for;
     *                 leave undefined to get the total count of tags
     */
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
);
