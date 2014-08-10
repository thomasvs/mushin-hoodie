angular.module('zentodone').controller('InboxCtrl', function ($scope, $rootScope, $filter, $location, tasks, Task, lists) {

  var debug = new window.$debug('mushin:task');
  var search = $location.search();
  debug('controllers/inbox.js: search params ' + JSON.stringify(search));

  $scope.saveListActive = false;


  $scope.inbox = [];

  /* this adds proxy functions to Task class functions */
  tasks.extend($scope);

  // http://cubiq.org/add-to-home-screen
  addToHomescreen({
    maxDisplayCount: 3
  })

  function fetchTasks() {
    tasks.getAll(Task.INBOX)
      .then(function(tasks) {
        // at this time, the rootScope contexts/projects are set and thus
        // available through $scope too

        $scope.inbox = $filter('filter')(tasks, function(task) {
          // FIXME: I'm filtering on complete/end in a filter func
          if (!task.done && !task.deleted) return true
        })

        // parse query params now
        if (search.query) {
            var parser = new window.Parser();
            var parsed = parser.parse(search.query);
            debug('controllers/inbox: parsed query ' + JSON.stringify(parsed));
            angular.forEach(parsed.contexts, function (context) {
                $scope.contexts[context].active = true;
            });
            angular.forEach(parsed.projects, function (project) {
                $scope.projects[project].active = true;
            });
        }


      })
  }

  fetchTasks()

  $scope.$on('taskChange', function() {
    debug('taskChange');
    fetchTasks()
  })

  $scope.newTask = function() {

    var title = ($scope.taskTitle || '').trim()
    var parser = new window.Parser();
    var parsed = parser.parse(title);

    title = parsed.title;
    debug('parsed new thing ' + JSON.stringify(parsed, null, 4));

    if (!title) return

    // see app/scripts/services/tasks.js
    tasks.add(title, '', parsed)

    $scope.taskTitle = ''
    $scope.taskInput.$setPristine()
  }

  // filter tasks by context/project
  // FIXME: this now loops over all contexts/projects for each thing;
  // would be faster to precalculate the selection once into an array on
  // each click event in a taglist, then compare here
    $scope.filterByTag = function(thing) {

      var keep;
      var selectedAll;

      // either taglist may reject a thing
      // don't convert to angular.forEach as that does not allow breaks
      var types = [ 'context', 'project' ];
      var type;
      var tags;

      for (var i = 0; i < types.length; ++i) {
        type = types[i];
        tags = $scope[type + 's'];

//        debug('filter: looking at type ' + type);
        keep = false;
        selectedAll = true; // guilty until proven innocent

        for (var name in tags) {
          var tag = tags[name];

//          debug('filter: looking at tag ' + tag.name);
          if (tag.active) {
//            debug('filter: tag.name active ' + tag.name);
            selectedAll = false;
//            debug('thing tags: ' + JSON.stringify(thing));
            if (thing[type + 's'] && thing[type + 's'].indexOf(tag.name) > -1) {
              debug('filter: keeping ' + thing.title);
              keep = true;
            }
          }
        }
        /* also keep if no tag is selected, which means all are */
        if (selectedAll) keep = true;

        if (!keep) {
          return false;
      }

      return true;
    }
    }

    // filter tasks by importance/urgency
    $scope.filterByNumber = function(thing) {

      var keep;
      var selectedAll;

      // either numberlist may reject a thing
      // don't convert to angular.forEach as that does not allow breaks
      var types = [ 'importance', 'urgency' ];
      var type;
      var tags;

      for (var i = 0; i < types.length; ++i) {
        type = types[i];
        tags = $scope[type];

//        debug('filter: looking at type ' + type);
        keep = false;
        selectedAll = true; // guilty until proven innocent

        for (var number in tags) {
          var tag = tags[number];

//          debug('filter: looking at tag ' + tag.name);
          if (tag.active) {
//            debug('filter: tag.name active ' + tag.name);
            selectedAll = false;
//            debug('thing tags: ' + JSON.stringify(thing));
            if (thing[type] && thing[type] == number) {
              debug('filter: keeping ' + thing.title);
              keep = true;
            }
          }
        }
        /* also keep if no tag is selected, which means all are */
        if (selectedAll) keep = true;

        if (!keep) {
          return false;
        }
      }

      return true;
    }

    $scope.notRecentlyCompleted = function(thing) {
      if (thing.complete != 100) {
//        debug(thing.title + ' not complete, keeping');
        return true;
      }
      if (!thing.end) {
//        debug(thing.title + ' no complete date, dropping');
        return false;
      }

      var now = new Date();
      var then = new Date(thing.end);
      var diff = Math.abs(now - then);
      if (diff >= 1000 * 60) {
//        debug(thing.title + ' done too long, dropping, ms ' + diff);
        return false;
      }

//      debug(thing.title + ' done just now, keeping, ms' + diff);
      return true;
    }

   // save the current state of the list of things as a saved list
   $scope.saveList = function(name) {
       debug('saveList ' + name);
       $scope.saveListActive = false;

       // construct query from state of filtering
       var parts = [];
       angular.forEach($scope.contexts, function (context) {
         if (context.active) {
           parts.push('@' + context.name);
         }
       });
       angular.forEach($scope.projects, function (project) {
         if (project.active) {
           parts.push('p:' + project.name);
         }
       });
       var query = parts.join(' ');

       debug('saveList: query ' + query);
       lists.add(name, query);
   }
})
