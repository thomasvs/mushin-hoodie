// vi:si:et:sw=2:sts=2:ts=2
angular.module('zentodone').controller(
  'TaskCtrl',
  function (tasks, Task, $scope, $state, hoodie, $rootScope) {
    var lastType;
    var params = $state.params;
    var current = $state.current;
    var debug = new window.$debug('zentodone:controllers/TaskCtrl');
    debug('new task controller');

    $scope.task = {};

    $scope.contexts = $rootScope.contexts;
    $scope.projects = $rootScope.projects;
    $scope.importance = $rootScope.importance;
    $scope.urgency = $rootScope.urgency;

    $scope.contextsActive = {};
    $scope.projectsActive = {};
    $scope.importanceActive = {};
    $scope.urgencyActive = {};

    $scope.$on('TAG_TOGGLED', function(event, type, name) {
      var taglist = $scope.task[type + 's'];
      if (!taglist) {
        $scope.task[type + 's'] = [];
        taglist = $scope.task[type + 's'];
      }
      var i = taglist.indexOf(name);
      if (i > -1) {
        taglist.splice(i, 1);
      } else {
        taglist.push(name);
      }
      debug('running $scope.update');
      $scope.update();
      // FIXME: hack: toggling can change the count for each tag, so
      // force a recount
      tasks.getAll(Task.INBOX);
    });

    // FIXME: hack: if the page was reloaded, contexts and projects are
    //        not loaded.  force a load.
    //        only works with ECMA5
    if (Object.keys($scope.contexts).length === 0) {
      debug('controller/task.js: getting all tasks');
      tasks.getAll(Task.INBOX);
    }
    tasks.get(params.id).then(function(data) {
      goToCorrectType(data);
      $scope.task = data;
      $scope.unit = data.taskType === Task.MIT ? Task.ONE_DAY : Task.ONE_WEEK;
      lastType = $scope.task.taskType;
      $scope[Task.types[lastType]] = true;

      if (data.due) $scope.due = new Date(data.due);

      debug ('controllers/task.js: contexts ' + JSON.stringify(data.contexts));
      if (data.contexts && data.contexts.length > 0) {
        angular.forEach(data.contexts, function(context) {
          $scope.contextsActive[context] = { active: true};
          debug('$scope.contextsActive now ' + JSON.stringify($scope.contextsActive));
        });
      }
      debug ('controllers/task.js: projects ' + JSON.stringify(data.projects));
      if (data.projects && data.projects.length > 0) {
        angular.forEach(data.projects, function(project) {
          $scope.projectsActive[project] = { active: true};
          debug('$scope.projectsActive now ' + JSON.stringify($scope.projectsActive));
        });
      }

      if (data.importance) {
        $scope.importanceActive[data.importance] = { active: true};
        debug('$scope.importanceActive now ' + JSON.stringify($scope.importanceActive));
      }
      if (data.urgency) {
        $scope.urgencyActive[data.urgency] = { active: true};
        debug('$scope.urgencyActive now ' + JSON.stringify($scope.urgencyActive));
      }

    });

    tasks.extend($scope);

    function goToCollection() {
      var navbarCtrl = angular.element('bp-navbar').controller('bpNavbar');
      $state.go(navbarCtrl.getUpFromState(current).state);
    }

    function goToCorrectType(task) {
      if (current.data.taskType !== task.taskType) {
        $state.go(Task.types[task.taskType] + 'Task', {id: task.id});
      }
    }

    $scope.handle = function(promise) {
      promise.then(function(task) {
        if (task.taskType === Task.ARCHIVE || task.done) {
          return goToCollection();
        }
        goToCorrectType(task);
      });
    }

    $scope.update = function() {
      debug('updating task in hoodie');
      debug('scope due date: ' + $scope.due);
      debug('task due date: ' + $scope.task.due);
      if ($scope.due) $scope.task.due = $scope.due.toISOString();
      return hoodie.store.update('task', $scope.task.id, $scope.task);
    }
  }
);
