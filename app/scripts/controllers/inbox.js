angular.module('zentodone').controller('InboxCtrl', function ($scope, $filter, $location, tasks, Task) {

  var debug = new window.$debug('mushin:task');
  var search = $location.search();
  debug('controllers/inbox.js: search params ' + JSON.stringify(search));

  // managed as a list here so we can use it in the filter; needs to be
  // kept up-to-date with toggletTag by the click handlers
  // in the taglist directive
  var taglist = {
    'context': [], // list of selected contexts
    'project': []
  }

  $scope.inbox = []
  tasks.extend($scope)

  // http://cubiq.org/add-to-home-screen
  addToHomescreen({
    maxDisplayCount: 3
  })

  function fetchTasks() {
    tasks.getAll(Task.INBOX)
      .then(function(tasks) {
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
                $scope.addTag('context', context);
                $scope.contexts[context].active = true;
            });
            angular.forEach(parsed.projects, function (project) {
                $scope.addTag('project', project);
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

  // add/remove selected contexts/projects
  $scope.addTag = function(type, name) {
    var i = taglist[type].indexOf(name);
    if (i == -1) {
      taglist[type].push(name);
    }
  }
  $scope.removeTag = function(type, name) {
    var i = taglist[type].indexOf(name);
    if (i > -1) {
      taglist[type].splice(i, 1);
    }
  }
  $scope.toggleTag = function(type, name) {
    var i = taglist[type].indexOf(name);
    if (i > -1) {
      $scope.removeTag(type, name);
    } else {
      $scope.addTag(type, name);
    }
  }
  $scope.clearTags = function(type) {
    taglist[type].splice(0, Number.MAX_VALUE);
  }


  // filter tasks by context/project
    $scope.filterByTag = function(thing) {
//      debug('filterByTag ' + JSON.stringify(thing));

      var keep;

      for (var type in taglist) {
        // either taglist may reject a thing
        keep = false;

        if (taglist[type].length > 0) {
          for (var i = 0; i < taglist[type].length; ++i) {
            if (thing[type + 's'] && thing[type + 's'].indexOf(taglist[type][i]) > -1) {
              keep = true;
            }
          }
          if (!keep) {
            return false;
          }
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

})
