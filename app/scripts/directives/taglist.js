// vi:si:et:sw=2:sts=2:ts=2

/**
 * @ngdoc directive
 * @name  mushin.directive:tagList
 *
 * @description
 * A directive that displays a list of tags to select.
 */

var debug = new window.$debug('mushin:directives/taglist');
debug('directives/taglist.js: loading');

angular.module('mushin').directive(
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
