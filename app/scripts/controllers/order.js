// vi:si:et:sw=2:sts=2:ts=2
/**
 * @ngdoc     controller
 * @name      mushin.controller:OrderCtrl
 * @requires  $scope
 *
 * @description <p>The order controller controls an order button and
 *              the indicator for the current order.</p>
 *            <p>The controller should be initialized with the following
 *               tags:
 *               <dl>
 *                 <dt>type</dt>
 *                 <dd>the thing's attribute to order by;
 *                     e.g. 'title' or 'due'</dd>
 *                 <dt>label</dt>
 *                 <dd>The label to show in the button</dd>
 *               </dl>
 *            </p>
 *
 * @author    Thomas Vander Stichele <thomas (at) apestaart (dot) org>
 */
angular.module('mushin').controller(
  'OrderCtrl',
  function($scope, $attrs) {

    var debug = new window.$debug('mushin:controllers/order');

    /* projects or contexts */
    if (!$attrs.type) {
      throw new Error("No type attribute for OrderCtrl");
    }
    $scope.type = $attrs.type;
    if (!$attrs.label) {
      throw new Error("No label attribute for OrderCtrl");
    }
    $scope.label = $attrs.label;
  }
);
