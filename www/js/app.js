
angular.module('texas', ['ionic', 'wilddog', 'texas.controllers', 'texas.services', 'texas.constants', 'texas.filters'])



.run(function($ionicPlatform, $rootScope, AuthService, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
 
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {

    console.log(next, fromState);

    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login' && next.name !== 'register') {
        event.preventDefault();
        $state.go('login');
      }
    }
  });

})

.config(function($stateProvider, $urlRouterProvider) {

 
  $stateProvider

   .state('login', {
    url: '/login',
    controller: 'LoginCtrl',
    templateUrl: 'templates/login.html'
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.hall', {
    url: '/hall',
    views: {
      'tab-hall': {
        templateUrl: 'templates/tab-hall.html',
        controller: 'HallCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

   .state('game-texas', {
    url: '/texas',
    templateUrl: 'templates/game-texas.html',
    controller: 'TexasCtrl'   
  })
 

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/hall');

});
