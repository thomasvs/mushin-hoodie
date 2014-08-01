var debug = new window.$debug('zentodone:directives/taglist');
debug('tagList: loading');

angular.module('zentodone')
  .directive('tagList', function () {


    debug('tagList: creating');
    return {
      restrict: 'A',
      templateUrl: 'templates/taglist.html'
    }
  }
);
