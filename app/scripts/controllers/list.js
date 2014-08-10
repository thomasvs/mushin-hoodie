angular.module('mushin').controller('ListCtrl', function ($state, $scope, things, Thing, sortThings) {
  var state = $state.current
  var name = state.name
  var type = state.data.thingType
  var unit = type === Thing.MIT ? Thing.ONE_DAY : Thing.ONE_WEEK

  $scope[name] = []
  things.extend($scope)

  function fetchThings() {
    things.getAll(type)
      .then(function(all) {
        $scope[name] = sortThings(all, unit);
      })
  }

  fetchThings()

  $scope.$on('thingChange', function() {
    fetchThings()
  })
})
