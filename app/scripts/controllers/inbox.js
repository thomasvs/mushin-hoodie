angular.module('zentodone').controller('InboxCtrl', function ($scope, $filter, tasks, Task) {

  var debug = new window.$debug('mushin:task');

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
          if (!task.done && !task.deleted) return true
        })
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

    tasks.add(title)

    $scope.taskTitle = ''
    $scope.taskInput.$setPristine()
  }
})
