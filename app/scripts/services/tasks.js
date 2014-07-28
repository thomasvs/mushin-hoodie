angular.module('zentodone').factory('tasks', function ($rootScope, hoodie, $q, Task) {

  var debug = new window.$debug('zentodone:services/task');
  var contexts = {}; // context name -> list of thing id's
  var projects = {};

  hoodie.store.on('change:task', function(name, task) {
    $rootScope.$broadcast('taskChange', {
      type: name,
      task: task
    })
  })

  // update the contexts/projects hash based on the task
  var trackHash = function(hash, type, task) {
    var plural = type + 's'

          if (task[plural]) {
            for (var j = 0; j < task[plural].length; ++j) {
              var name = task[plural][j];
              if (!(name in hash)) {
                hash[name] = []
              }
              hash[name].push(task.id)
            }
          }
  }

  /* FIXME: does this pollute some outside namespace, or is this tied
   *        to inbox ? */
  $rootScope.getContextsCount = function(context) {
    if (context) {
      return contexts[context].length;
    } else {
      return Object.keys(contexts).length;
    }
  }
  $rootScope.getProjectsCount = function(project) {
    if (project) {
      return projects[project].length;
    } else {
    return Object.keys(projects).length;
    }
  }
  $rootScope.getContexts = function() {
    return Object.keys(contexts);
  }
  $rootScope.getProjects = function() {
    return Object.keys(projects);
  }

  return {
    get: function(id) {
      return $q.when(hoodie.store.find('task', id))
    },
    getAll: function(type) {
      var promise = $q.when(hoodie.store.findAll('task'))
      if (!Task.isType(type)) {
        return promise
      }

      var deferred = $q.defer()
      promise.then(function(tasksData) {
        var tasksDataOfType = []

        // reset when we recount
        projects = {};
        contexts = {};

        for (var i = 0; i < tasksData.length; i++) {
          if (tasksData[i].taskType === type) {
            tasksDataOfType.push(tasksData[i])
          }
          trackHash(projects, 'project', tasksData[i]);
          trackHash(contexts, 'context', tasksData[i]);
        }
        debug('loaded ' + tasksDataOfType.length + ' tasks of type ' + type)
        debug('loaded ' + Object.keys(projects).length + ' projects')
        debug('loaded ' + Object.keys(contexts).length + ' contexts')
        deferred.resolve(tasksDataOfType)
      })
      return deferred.promise
    },
    add: function(title, description, data) {
      var newTask = new Task(title, description, data)
      return $q.when(hoodie.store.add('task', newTask.data))
    },
    extend: function(scope) {
      var methods = ['setDone', 'setDeleted']

      angular.forEach(methods, function(method) {
        scope[method] = function(data) {
          var task = new Task(data)
          return task[method]()
        }
      })

      var conversions = ['inbox', 'mit', 'br']

      angular.forEach(conversions, function(conversion) {
        var method = 'convertTo' + conversion[0].toUpperCase() + conversion.substring(1)
        var taskType = Task[conversion.toUpperCase()]
        scope[method] = function(data) {
          var task = new Task(data)
          return task.convertTo(taskType)
        }
      })
    }
  }
})
