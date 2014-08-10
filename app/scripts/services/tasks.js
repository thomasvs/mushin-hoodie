angular.module('mushin').factory('tasks', function ($rootScope, hoodie, $q, Task) {

  var debug = new window.$debug('mushin:services/task');
  $rootScope.contexts = {}; // context name -> obj with tasks, active, ...
  $rootScope.projects = {};
  $rootScope.importance = {}; // importance level -> obj with tasks, active, ...
  $rootScope.urgency = {};

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
        // for now, ignore completed tasks
        if (task.complete == 100) { return; }

        hash[name].things.push(task);
      }
    }
  }
  // update the importance/urgency hash based on the task
  var trackNumberHash = function(hash, type, task) {
    var number = task[type];

    if (number) {
      if (!(number in hash)) {
        hash[number] = {
          'name': number,
          'active': false,
          'things': [],
        };
      }
      // for now, ignore completed tasks
      if (task.complete == 100) { return; }

      hash[number].things.push(task);
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
        resetHash($rootScope.importance);
        resetHash($rootScope.urgency);

        for (var i = 0; i < tasksData.length; i++) {
          // FIXME: not sure if it's better to deal with taskData here or
          //        full task objects
          var task = tasksData[i];
          if (task.taskType === type) {
            tasksDataOfType.push(task)
          }
          trackHash($rootScope.projects, 'project', task);
          trackHash($rootScope.contexts, 'context', task);
          trackNumberHash($rootScope.importance, 'importance', task);
          trackNumberHash($rootScope.urgency, 'urgency', task);
        }
        debug('loaded ' + tasksDataOfType.length + ' tasks of type ' + type)
        debug('loaded ' + Object.keys($rootScope.projects).length + ' projects')
        debug('loaded ' + Object.keys($rootScope.contexts).length + ' contexts')
        debug('loaded ' + Object.keys($rootScope.importance).length + ' importance levels')
        debug('loaded ' + Object.keys($rootScope.urgency).length + ' urgency levels')
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
