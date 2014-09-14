// vi:si:et:sw=2:sts=2:ts=2

/**
 * @ngdoc directive
 * @name  mushin.directive:order
 *
 * @description
 * A directive that displays an order button with order indicator.
 */

var debug = new window.$debug('mushin:directives/order');
debug('directives/order.js: loading');

angular.module('mushin').directive(
  'order',
  function () {
    return {
      restrict: 'A',
      templateUrl: 'templates/order.html'
    }
  }
);
