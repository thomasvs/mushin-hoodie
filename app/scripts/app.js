/*!
 * Zen To Done
 * https://git.io/mushin
 *
 * Copyright 2014 Stephan Boennemann
 *
 * Released under the MIT license.
 */

angular.module('mushin', ['bp', 'angular-loading-bar', 'hoodie', 'monospaced.elastic', 'datePicker'])
  .config(function($urlRouterProvider, $stateProvider, bpAppProvider, cfpLoadingBarProvider) {

    bpAppProvider.setConfig({
      platform: 'ios'
    })

    cfpLoadingBarProvider.includeSpinner = false;

    $urlRouterProvider.otherwise('/inbox');

    $stateProvider
      .state('inbox', {
        url: '/inbox?query',
        templateUrl: 'views/inbox.html',
        controller: 'InboxCtrl',
        data: {
          title: 'Things'
        }
      })
      .state('account', {
        url: '/inbox/account',
        templateUrl: 'views/account.html',
        controller: 'AccountCtrl',
        data: {
          modal: true
        }
      })
      .state('mit', {
        url: '/mit',
        templateUrl: 'views/mit.html',
        controller: 'ListCtrl',
        data: {
          title: 'Lists',
        }
      })
      .state('br', {
        url: '/br',
        templateUrl: 'views/br.html',
        controller: 'ListCtrl',
        data: {
          title: 'Archive',
          thingType: 2,
        }
      })
      .state('inboxThing', {
        url: '/inbox/:id',
        templateUrl: 'views/thing.html',
        controller: 'ThingCtrl',
        data: {
          title: 'Edit Thing',
        }
      })
/*
      .state('mitThing', {
        url: '/mit/:id',
        templateUrl: 'views/thing.html',
        controller: 'ThingCtrl',
        data: {
          thingType: 2
        }
      })
      .state('brThing', {
        url: '/br/:id',
        templateUrl: 'views/thing.html',
        controller: 'ThingCtrl',
        data: {
          thingType: 3
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
