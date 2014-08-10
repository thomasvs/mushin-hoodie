// vi:si:et:sw=2:sts=2:ts=2

/**
 * @ngdoc directive
 * @name  mushin.directive:numberList
 *
 * @description
 * A directive that displays a list of numbers to select.
 */

var debug = new window.$debug('mushin:directives/numberlist');
debug('directives/numberlist.js: loading');

angular.module('mushin').directive(
  'numberList',
  function () {
    debug('numberList: creating');
    return {
      restrict: 'A',
      templateUrl: 'templates/numberlist.html'
    }
  }
);
