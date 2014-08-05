angular.module('zentodone').factory('tasks', function ($rootScope, hoodie, $q, Task) {

  var debug = new window.$debug('zentodone:services/task');
  $rootScope.contexts = {}; // context name -> obj with tasks, active, ...
  $rootScope.projects = {};

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
          hash[name] = {
            'name': name,
            'active': false,
            'things': [],
          }
        }
        hash[name].things.push(task)
      }
    }
  }
  var resetHash = function(hash) {
    for (var key in hash) {
      hash[key].things = [];
    }
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
        resetHash($rootScope.projects);
        resetHash($rootScope.contexts);

        for (var i = 0; i < tasksData.length; i++) {
          // FIXME: not sure if it's better to deal with taskData here or
          //        full task objects
          var task = tasksData[i];
          if (task.taskType === type) {
            tasksDataOfType.push(task)
          }
          trackHash($rootScope.projects, 'project', task);
          trackHash($rootScope.contexts, 'context', task);
        }
        debug('loaded ' + tasksDataOfType.length + ' tasks of type ' + type)
        debug('loaded ' + Object.keys($rootScope.projects).length + ' projects')
        debug('loaded ' + Object.keys($rootScope.contexts).length + ' contexts')
        deferred.resolve(tasksDataOfType)
      })
      return deferred.promise
    },
    add: function(title, description, data) {
      var newTask = new Task(title, description, data)
      return $q.when(hoodie.store.add('task', newTask.data))
    },
    extend: function(scope) {
      /* this adds proxies for some functions on the Task class,
       * instantiating them on the fly so they can be changed.
       */
      var methods = ['setDone', 'setDeleted', 'setComplete']

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
