// vi:si:et:sw=2:sts=2:ts=2
angular.module('zentodone').controller(
  'TaskCtrl',
  function (tasks, Task, $scope, $state, hoodie, $rootScope) {
    var lastType;
    var params = $state.params;
    var current = $state.current;
    var debug = new window.$debug('zentodone:controllers/TaskCtrl');

    $scope.task = {};

    $scope.contexts = $rootScope.contexts;
    $scope.projects = $rootScope.projects;

    $scope.contextsActive = {};
    $scope.projectsActive = {};

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
      return hoodie.store.update('task', $scope.task.id, $scope.task);
    }
  }
);
