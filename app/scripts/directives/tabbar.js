var debug = new window.$debug('zentodone:directives/tabbar');
angular.module('zentodone')
  .directive('tabBar', function () {

    return {
      // FIXME: as an E, it adds whitespace right above the tasklist;
      // as an A, it seems to sort-of-work, but I had to remove the
      // bp-tabbar
      restrict: 'EA',
      scope: {
          active: '@active',
      },
      templateUrl: 'templates/tabbar.html'
    }
  }
);
