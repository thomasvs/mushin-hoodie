angular.module('mushin').service('sortThings', function ($filter, Thing, hoodie) {
  return function(collection, unit) {
    var sortedThings = []
    var rescheduledThings = []
    var today = new Date()

    function reschedule(thing) {
      delete thing.due
      rescheduledThings.push(thing)
    }

    collection = $filter('orderBy')(collection, function(thing) {
      return thing.due
    })

    // Fill up units w/things
    for (var i = 0; i < collection.length; i++) {
      var currentThing = collection[i]

      // Things w/o due have lowest priority and are therefore rescheduled
      if (!currentThing.due) {
        reschedule(currentThing)
        continue
      }

      var unitOffset = $filter('unitsOff')(unit, currentThing.due)

      // Overdue things are inherited for this unit with highest priority
      if (unitOffset < 0) {

        // Archive done things
        if (currentThing.done) {
          (new Thing(currentThing)).convertTo(Thing.ARCHIVE)
          continue
        }

        var overdue = Math.abs(unitOffset)
        currentThing.due += (overdue * unit)

        if (!angular.isNumber(currentThing.overdue)) {
          currentThing.overdue = 0
        }

        currentThing.overdue += overdue
        unitOffset = 0

        hoodie.store.update('thing', currentThing.id, currentThing)
      }

      var currentUnit = sortedThings[unitOffset]

      if (!angular.isArray(currentUnit)) {
        currentUnit = sortedThings[unitOffset] = []
      }

      currentUnit.offset = unitOffset

      // Its not allowed to have more than 3 Things per unit
      if (currentUnit.length > 2) {
        reschedule(currentThing)
        continue
      }

      currentUnit.push(currentThing)
    }

    // Rescheduled Things are reordered, so that the oldest Things have to be done first
    rescheduledThings = $filter('orderBy')(rescheduledThings, function(thing) {
      return thing.date
    })

    // Fill up units w/rescheduled thingss
    for (var j = 0; j < rescheduledThings.length; j++) {
      var unitIndex = sortedThings.length-1
      var unitToFill = sortedThings[unitIndex]

      // Either there's space remaining in an existing unit or a new unit is initialized
      if (angular.isUndefined(unitToFill) || unitToFill.length > 2) {
        unitToFill = []
        unitIndex = sortedThings.push(unitToFill) - 1
      }

      var thingToAssign = rescheduledThings[j]
      thingToAssign.due = today.getTime() + (unitIndex * unit)
      unitToFill.offset = unitIndex
      unitToFill.push(thingToAssign)

      hoodie.store.update('thing', thingToAssign.id, thingToAssign)
    }

    return sortedThings
  }
});
