angular.module('zentodone').factory('Task', function ($q, $filter, hoodie) {
  // Task types
  var ACTIVE = 1
  var ARCHIVE = 2

  var ONE_DAY = 24*60*60*1000
  var ONE_WEEK = 7*24*60*60*1000

  var debug = new window.$debug('zentodone:Task');

  function Task(title, description, data) {
    debug('new Task with title ' + title + ' and desc ' + description)
    if (angular.isObject(title)) {
      this.data = title
      return
    }

    this.data = data && angular.copy(data) || {};

    angular.extend(this.data, {
      id: Math.random().toString(36).substr(2, 9),
      date: Date.now(),
      dueDate: null,
      taskType: ACTIVE,
      done: false,
      deleted: false,
      title: title,
      description: description
    });
    debug('created new task ' + JSON.stringify(this.data, null, 4));
  }

  Task.ACTIVE = ACTIVE
  Task.ARCHIVE = ARCHIVE
  Task.ONE_DAY = ONE_DAY
  Task.ONE_WEEK = ONE_WEEK
  Task.types = [,'inbox','mit','br','archive']

  Task.isType = function(type) {
    return type === ACTIVE || type === ARCHIVE
  }

  Task.prototype.setDone = function() {
    var data = this.data
    var taskType = data.taskType

    // FIXME: this code was used to auto-archive tasks after some time */
    /*
    switch (this.data.taskType) {
    case MIT:
      if ($filter('unitsOff')(ONE_DAY, data.dueDate) > 0) {
        taskType = ARCHIVE
      }
      break;
    case BR:
      if ($filter('unitsOff')(ONE_WEEK, data.dueDate) > 0) {
        taskType = ARCHIVE
      }
      break;
    }
    */

    return $q.when(hoodie.store.update('task', this.data.id, {
      done: true,
      taskType: taskType
    }))
  }

  Task.prototype.setComplete = function() {
    debug('complete task with title ' + this.data.title);

    var complete, end;
    var start = this.data.start && new Date(this.data.start) || new Date();
    var due = this.data.due && new Date(this.data.due) || new Date();

    if (this.data.recurrence) {
      start = due;
      // interestingly, setSeconds handles wrapping
      due.setSeconds(due.getSeconds() + this.data.recurrence * 60 * 60);
      debug('handle recurrence ' + this.data.recurrence + ', start ' + start + ' due ' + due);
    } else {
      if (this.data.complete == 100) {
        complete = 0;
        end = undefined;
      } else {
        complete = 100;
        end = new Date();
      }
    }

    debug('setComplete: date ' + end);
    // FIXME; deal with recurrence
    return $q.when(hoodie.store.update('task', this.data.id, {
      complete: complete,
      start: start.toISOString(),
      due: due.toISOString(),
      end: end && end.toISOString() || '',
    }))
  }

  Task.prototype.setDeleted = function() {
    return $q.when(hoodie.store.update('task', this.data.id, {
      deleted: true,
      taskType: ARCHIVE
    }))
  }

  Task.prototype.convertTo = function(type) {
    if (type !== this.data.taskType && Task.isType(type)) {
      var changes = {taskType: type}
      if (type === MIT || type === BR) {
        changes.dueDate = Date.now()
      }
      return $q.when(hoodie.store.update('task', this.data.id, changes))
    }

    var deferred = $q.defer()
    deferred.reject(false)
    return deferred.promise
  }

  return Task
});
