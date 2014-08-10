/*!
 * Zen To Done
 * https://git.io/zentodone
 *
 * Copyright 2014 Stephan Boennemann
 *
 * Released under the MIT license.
 */

angular.module('zentodone', ['bp', 'angular-loading-bar', 'hoodie', 'monospaced.elastic', 'datePicker'])
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
          title: 'Big Rocks',
          taskType: 3
        }
      })
      .state('inboxTask', {
        url: '/inbox/:id',
        templateUrl: 'views/task.html',
        controller: 'TaskCtrl',
        data: {
          taskType: 1
        }
      })
/*
      .state('mitTask', {
        url: '/mit/:id',
        templateUrl: 'views/task.html',
        controller: 'TaskCtrl',
        data: {
          taskType: 2
        }
      })
      .state('brTask', {
        url: '/br/:id',
        templateUrl: 'views/task.html',
        controller: 'TaskCtrl',
        data: {
          taskType: 3
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
