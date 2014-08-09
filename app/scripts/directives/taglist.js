// vi:si:et:sw=2:sts=2:ts=2

/**
 * @ngdoc directive
 * @name  zentodone.directive:tagList
 *
 * @description
 * A directive that displays a list of tags to select.
 */

var debug = new window.$debug('zentodone:directives/taglist');
debug('directives/taglist.js: loading');

angular.module('zentodone').directive(
  'tagList',
  function () {
    debug('tagList: creating');
    return {
      restrict: 'A',
      require: '^InboxCtrl',
      templateUrl: 'templates/taglist.html'
    }
  }
);
