var debug = new window.$debug('zentodone:directives/taglist');
debug('tagList: loading');

angular.module('zentodone')
  .directive('tagList', function () {


    debug('tagList: creating');
    return {
      restrict: 'A',
      require: '^InboxCtrl',
      templateUrl: 'templates/taglist.html'
    }
  }
);
