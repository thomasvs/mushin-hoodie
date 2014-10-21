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

    /* state is inbox, lists, ... - the section for which instructions can
     * be seen */

      /**
       * @ngdoc    method
       * @name     mushin.controller:ProgressCtrl#sawInstructions
       * @methodOf mushin.controller:ProgressCtrl
       * @param    {string} state the name of the section instructions have been
       *                          seen for
       *
       * @description
       *
       * Mark the instructions for the given section as seen.
       */
    $scope.sawInstructions = function(state) {
      var progress;

      $q.when(hoodie.store.find('progress', state))
        .then(function(data) {
          $scope.instructions = data.count > 1 ? false : true;
          progress = data;
        }, function() {
          $scope.instructions = true
          progress = {
            id: state,
            count: 0
          };
        })
        .then(function() {
          if (++progress.count <= 2) {
            hoodie.store.add('progress', progress);
          }
        })
    }
})
