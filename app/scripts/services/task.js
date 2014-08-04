angular.module('zentodone').factory('Task', function ($q, $filter, hoodie) {
  // Task types
  var INBOX = 1
  var MIT = 2
  var BR = 3
  var ARCHIVE = 4
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
      taskType: INBOX,
      done: false,
      deleted: false,
      title: title,
      description: description
    });
    debug('created new task ' + JSON.stringify(this.data, null, 4));
  }

  Task.INBOX = INBOX
  Task.MIT = MIT
  Task.BR = BR
  Task.ARCHIVE = ARCHIVE
  Task.ONE_DAY = ONE_DAY
  Task.ONE_WEEK = ONE_WEEK
  Task.types = [,'inbox','mit','br','archive']

  Task.isType = function(type) {
    return type === INBOX || type === MIT || type ===  BR || type === ARCHIVE
  }

  Task.prototype.setDone = function() {
    var data = this.data
    var taskType = data.taskType

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

    return $q.when(hoodie.store.update('task', this.data.id, {
      done: true,
      taskType: taskType
    }))
  }

  Task.prototype.setComplete = function() {
    debug('complete task with title ' + this.data.title);

    var complete, completeDate;

    if (this.data.recurrence) {
      debug('handle recurrence');
    } else {
      if (this.data.complete == 100) {
        complete = 0;
        completeDate = undefined;
      } else {
        complete = 100;
        completeDate = new Date().toISOString();
      }
    }

    debug('setComplete: date ' + completeDate);
    // FIXME; deal with recurrence
    return $q.when(hoodie.store.update('task', this.data.id, {
      complete: complete,
      completeDate: completeDate,
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
