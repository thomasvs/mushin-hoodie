// vi:si:et:sw=2:sts=2:ts=2
/**
 * @ngdoc     controller
 * @name      mushin.controller:NumberListCtrl
 * @requires  $scope
 *
 * @description <p>The number list controller controls the number list
 *              directive for importance and urgency,
 *            allowing the user to choose any (or all) numbers.</p>
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
  'NumberListCtrl',
  function($scope, $attrs) {

    var debug = new window.$debug('mushin:controllers/numberlist');

    /* projects or contexts */
    if (!$attrs.type) {
      throw new Error("No type attribute for NumberListCtrl");
    }
    $scope.type = $attrs.type;
    $scope.typeletter = $scope.type.toUpperCase().charAt(0);

    /* whether to show the All ... header */
    if (!$attrs.all) {
      throw new Error("No all attribute for NumberListCtrl");
    } else {
      /* convert string to boolean */
      $scope.showAll = ($attrs.all == 'true');
    }

    if (!$attrs.data) {
      throw new Error("No data attribute for NumberListCtrl");
    }
    $scope.tags = $scope[$attrs.data];

    if (!$attrs.active) {
      throw new Error("No active attribute for NumberListCtrl");
    }
    $scope.active = $scope[$attrs.active];

    if (!$attrs.multiple) {
      throw new Error("No multiple attribute for NumberListCtrl");
    }
    $scope.multiple = ($attrs.multiple == 'true');

    $scope.open = false;

    debug('new NumberListCtrl of type ' + $scope.type);

    $scope.selectedAll = true;

    $scope.isType = function(type) {
      return type == $scope.type;
    }

    /**
     * @ngdoc    method
     * @name     mushin.controller:NumberListCtrl#toggle
     * @methodOf mushin.controller:NumberListCtrl
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
      // activating one resets the others if not multiple
      if (!$scope.multiple && !$scope.active[name].active) {
        $scope.clear();
      }
      $scope.active[name].active = !$scope.active[name].active;
      $scope.$emit('NUMBER_TOGGLED', $scope.type, name);

      for (var key in $scope.active) {
        if ($scope.active[key].active) { all = false; }
      }
      if ($scope.selectedAll != all) {
        $scope.selectedAll = all;
      }
      debug('active: ' + JSON.stringify($scope.active));
    }

    /**
     * @ngdoc    method
     * @name     mushin.controller:NumberListCtrl#clear
     * @methodOf mushin.controller:NumberListCtrl
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
     * @name     mushin.controller:NumberListCtrl#getCount
     * @methodOf mushin.controller:NumberListCtrl
     *
     * @description
     *
     * Get the number of things for the given tag.
     *
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
     * @ngdoc    method
     * @name     mushin.controller:NumberListCtrl#filterByTag
     * @methodOf mushin.controller:NumberListCtrl
     *
     * @description
     *
     * Filter the given thing by the current selection state.
     *
     * @param {object} thing the thing to filter
     */
    $scope.filterByNumber = function(thing) {
      debug('filterByNumber ' + thing);

      if ($scope.selectedAll) {
        return true;
      }

      for (var key in $scope.tags) {
        if ($scope.active[key].active) {
          return true;
        }
      }

      return false;
    }

  }
);
