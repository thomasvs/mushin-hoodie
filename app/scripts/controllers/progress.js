// vi:si:et:sw=2:sts=2:ts=2
/**
 * @ngdoc     controller
 * @name      mushin.controller:ProgressCtrl
 * @requires  $scope
 * @requires  $q
 * @requires  hoodie
 *
 * @description <p>The progress controller
 *                 keeps track of whether a user has seen the
 *                 instructions for a particular view.
 *              </p>
 *
 * @author    Thomas Vander Stichele <thomas (at) apestaart (dot) org>
 */
angular.module('mushin').controller(
  'ProgressCtrl',
  function ($scope, $q, hoodie) {

    $scope.instructions = true;

      /**
       * @ngdoc    method
       * @name     mushin.controller:ProgressCtrl#sawInstructions
       * @methodOf mushin.controller:ProgressCtrl
       * @param    {string} state the name of the section instructions have been
       *                          seen for (inbox, lists, ...)
       *
       * @description
       *
       * Mark the instructions for the given section as seen.
       */
    $scope.sawInstructions = function(state) {

      var debug = new window.$debug('mushin:controllers/progress');
      var progress;

      /* progress is stored in progress/(state) documents with id/count */
      $q.when(hoodie.store.find('progress', state))
        .then(function(data) {
          debug('ProgressCtrl for state ' + state +
            ' is ' + JSON.stringify(data));
          $scope.instructions = data.count > 1 ? false : true;
          progress = data;
        }, function() {
          debug('No progress for state ' + state + ' in database');
          $scope.instructions = true;
          progress = {
            id: state,
            count: 0
          };
        })
        .then(function() {
          /* FIXME: for some reason zentodone decided to show the
           *        instructions exactly twice
           *        It gets created in-memory with 0, then incremented
           *        to 1 and saved to database, then incremented to 2 next
           *        time, from which point it no longer shows.
           */
          if (++progress.count <= 2) {
            debug('Adding progress for state ' + state + ' to database');
            hoodie.store.add('progress', progress);
          }
        })
    }
})
