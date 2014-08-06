var debug = new window.$debug('zentodone:directives/tabbar');
angular.module('zentodone')
  .directive('tabBar', function () {

    return {
      restrict: 'E',
      scope: {
          active: '@active',
      },
      templateUrl: 'templates/tabbar.html'
    }
  }
);
