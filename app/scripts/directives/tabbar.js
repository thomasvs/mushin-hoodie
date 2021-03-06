angular.module('mushin')
  .directive('tabBar', function () {

    return {
      // FIXME: as an E, it adds whitespace right above the thinglist;
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
