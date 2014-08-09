angular.module('zentodone')
  .controller('TaskCtrl', function (tasks, Task, $scope, $state, hoodie, $rootScope) {
    var lastType
    var params = $state.params
    var current = $state.current
    var debug = new window.$debug('zentodone:controllers/TaskCtrl');

    $scope.task = {}

    $scope.contexts = $rootScope.contexts;
    $scope.projects = $rootScope.projects;

    $scope.contextsActive = {};
    $scope.projectsActive = {};

    tasks.get(params.id)
      .then(function(data) {
        goToCorrectType(data)
        $scope.task = data
        $scope.unit = data.taskType === Task.MIT ? Task.ONE_DAY : Task.ONE_WEEK
        lastType = $scope.task.taskType
        $scope[Task.types[lastType]] = true

        debug ('controllers/task.js: contexts ' + JSON.stringify(data.contexts));
        if (data.contexts.length > 0) {
            angular.forEach(data.contexts, function(context) {
                $scope.contextsActive[context] = { active: true};
                debug('$scope.contextsActive now ' + JSON.stringify($scope.contextsActive));
            });
        }
      })

    tasks.extend($scope)

    function goToCollection() {
      var navbarCtrl = angular.element('bp-navbar').controller('bpNavbar')
      $state.go(navbarCtrl.getUpFromState(current).state)
    }

    function goToCorrectType(task) {
      if (current.data.taskType !== task.taskType) {
        $state.go(Task.types[task.taskType] + 'Task', {id: task.id})
      }
    }

    $scope.handle = function(promise) {
      promise.then(function(task) {
        if (task.taskType === Task.ARCHIVE || task.done) {
          return goToCollection()
        }
        goToCorrectType(task)
      })
    }

    $scope.update = function() {
      return hoodie.store.update('task', $scope.task.id, $scope.task)
    }
  })
