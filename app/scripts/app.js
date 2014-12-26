/*!
 * mushin
 * https://github.com/thomasvs/mushin-hoodie
 *
 * Copyright 2014 Thomas Vander Stichele
 */

angular.module(
  'mushin', [
    'bp',
    'angular-loading-bar',
    'hoodie',
    'monospaced.elastic',
    'datePicker',
    'filter.duration'
  ]
)
  .config(function(
    $urlRouterProvider, $stateProvider, bpAppProvider,
    cfpLoadingBarProvider) {

    bpAppProvider.setConfig({
      platform: 'ios'
    });

    cfpLoadingBarProvider.includeSpinner = false;

    $urlRouterProvider.otherwise('/things');

    $stateProvider
      .state('things', {
        url: '/things?query',
        templateUrl: 'views/things.html',
        controller: 'ThingsController',
        data: {
          title: 'Things'
        }
      })
      .state('account', {
        url: '/things/account',
        templateUrl: 'views/account.html',
        controller: 'AccountController',
        data: {
          modal: true
        }
      })
      .state('lists', {
        url: '/lists',
        templateUrl: 'views/lists.html',
        controller: 'ListController',
        data: {
          title: 'Lists',
        }
      })
      .state('br', {
        url: '/br',
        templateUrl: 'views/br.html',
        controller: 'ListController',
        data: {
          title: 'Archive',
          state: 2,
        }
      })
      .state('thingsThing', {
        url: '/things/:id',
        templateUrl: 'views/thing.html',
        controller: 'ThingController',
        data: {
          title: 'Edit Thing',
        }
      })
/*
      .state('mitThing', {
        url: '/mit/:id',
        templateUrl: 'views/thing.html',
        controller: 'ThingController',
        data: {
          state: 2
        }
      })
      .state('brThing', {
        url: '/br/:id',
        templateUrl: 'views/thing.html',
        controller: 'ThingController',
        data: {
          state: 3
        }
      })
*/
  })
  .run(function($rootScope, $state, $q, $window) {
    var defer = $q.defer()
    var cache = $window.applicationCache
    cache.addEventListener('updateready', defer.resolve)

    if (cache.status === cache.UPDATEREADY) {
      defer.resolve()
    }

    defer.promise.then(function() {
      $window.location.reload()
    })
  })
