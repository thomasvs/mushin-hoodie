// vi:si:et:sw=2:sts=2:ts=2
/**
 * @ngdoc     controller
 * @name      mushin.controller:TagListCtrl
 * @requires  $scope
 *
 * @description <p>The tag list controller controls the tag list directive,
 *            allowing the user to choose any (or all) tags.</p>
 *
 *            <p>The controller should be initialized with the following
 *               tags:
 *               <dl>
 *                 <dt>type</dt><dd>'project' or 'context'</dd>
 *                 <dt>all</dt>
 *                 <dd>true or false;
 *                     whether to allow selecting all tags</dd>
 *                 <dt>data</dt><dd>the parent scope's variable that contains the hash of tags</dd>
 *                 <dt>active</dt><dd>the parent scope's variable that contains the hash of tag selection; the controller will manipulate .active</dd>
 *               </dl>
 *            </p>
 *
 *            <p>A parent scope should provide the following members:
 *               <dl>
 *                 <dt>'projects' or 'contexts'</dt>
 *                 <dd>depending on the type</dd>
 *               </dl>
 *            </p>
 *
 * @author    Thomas Vander Stichele <thomas (at) apestaart (dot) org>
 */
angular.module('mushin').controller(
  'TagListCtrl',
  function($scope, $attrs) {

    var debug = new window.$debug('mushin:controllers/taglist');

    /* projects or contexts */
    if (!$attrs.type) {
      throw new Error("No type attribute for TagListCtrl");
    }
    $scope.type = $attrs.type;

    /* whether to show the All ... header */
    if (!$attrs.all) {
      throw new Error("No all attribute for TagListCtrl");
    } else {
      /* convert string to boolean */
      $scope.showAll = ($attrs.all == 'true');
    }

    if (!$attrs.data) {
      throw new Error("No data attribute for TagListCtrl");
    }
    $scope.tags = $scope[$attrs.data];

    if (!$attrs.active) {
      throw new Error("No active attribute for TagListCtrl");
    }
    $scope.active = $scope[$attrs.active];

    $scope.open = false;

    debug('new TagListCtrl of type ' + $scope.type);

    $scope.selectedAll = true;

    $scope.isType = function(type) {
      return type == $scope.type;
    }

    /**
     * @ngdoc    method
     * @name     mushin.controller:TagListCtrl#toggle
     * @methodOf mushin.controller:TagListCtrl
     * @param    {string} name the name of the tag to toggle.
     *
     * @description
     *
     * Toggle the selection state of a tag.
     */
    $scope.toggle = function(name) {
      var all = true;

      if (!(name in $scope.active)) {
          $scope.active[name] = {
              'active': false
          };
      }
      $scope.active[name].active = !$scope.active[name].active;
      $scope.$emit('TAG_TOGGLED', $scope.type, name);

      for (var key in $scope.active) {
        if ($scope.active[key].active) { all = false; }
      }
      if ($scope.selectedAll != all) {
        $scope.selectedAll = all;
      }
    }

    /**
     * @ngdoc    method
     * @name     mushin.controller:TagListCtrl#clear
     * @methodOf mushin.controller:TagListCtrl
     *
     * @description
     *
     * Clear the selection state of all tags, and set selectedAll.
     */
    $scope.clear = function() {
      for (var key in $scope.active) {
        $scope.active[key].active = false;
      }
      $scope.selectedAll = true;
    }

    /**
     * @ngdoc    method
     * @name     mushin.controller:TagListCtrl#getActiveCount
     * @methodOf mushin.controller:TagListCtrl
     *
     * @description
     *
     * Get the total number of active/selected things for the given tag.
     */
    $scope.getActiveCount = function() {
      if ($scope.selectedAll) {
        return $scope.getTotalCount();
      }

      var count = 0;

      for (var key in $scope.active) {
        if ($scope.active[key].active) { count++; }
      }
      return count;
    }


    /**
     * @ngdoc    method
     * @name     mushin.controller:TagListCtrl#getTotalCount
     * @methodOf mushin.controller:TagListCtrl
     *
     * @description
     *
     * Get the total number of things for the given tag.
     *
     * @param    {string} tag the name of the tag to get a count for;
     *                    leave undefined to get the total count of tags
     */
    $scope.getTotalCount = function(tag) {
      if (tag) {
        return $scope.tags[tag].things.length;
      } else {
        return Object.keys($scope.tags).length;
      }
    }

    /**
     * @ngdoc    method
     * @name     mushin.controller:TagListCtrl#filterByTag
     * @methodOf mushin.controller:TagListCtrl
     *
     * @description
     *
     * Filter the given thing by the current selection state.
     *
     * @param {object} thing the thing to filter
     */
    $scope.filterByTag = function(thing) {
      debug('filterByTag ' + thing);

      if ($scope.selectedAll) {
        return true;
      }

      for (var key in $scope.tags) {
        if ($scope.active[key].active && thing.tags.indexOf(key) > -1) {
          return true;
        }
      }

      return false;
    }

  }
);
