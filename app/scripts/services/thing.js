// vi:si:et:sw=2:sts=2:ts=2
// FIXME: still not sure whether service + method is the way to doc this
/**
 * @ngdoc     service
 * @name      mushin.service:Thing
 *
 * @description <p>The Thing service creates objects that persist
 *                 changes to hoodie.</p>
 */
angular.module('mushin').factory('Thing',
  function($q, $filter, hoodie) {

    // Thing types
    var ACTIVE = 1;
    var ARCHIVE = 2;

    var ONE_DAY = 24 * 60 * 60 * 1000;
    var ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

    var debug = new window.$debug('mushin:Thing');

    /**
     * @ngdoc method
     * @methodOf mushin.service:Thing
     * @name  mushin.service:Thing#Thing
     * @param {string or Object} titleOrData title, or full data for object
     * @param {string}           description a longer description
     * @param {Object}           data        data, in case the first one was
     *                                       title
     *
     * @description
     *
     * Create a new Thing from the given arguments.
     *
     * If the first argument is a data Object, recreate the thing from
     * that data object without any additional processing.
     *
     * Otherwise, set title, description, and the additional data given,
     * then set/override some default values on specific attributes.
     * This mode is used for parsing new thing entries.
     */
    function Thing(titleOrData, description, data) {
      debug('new Thing object with title/data ' + JSON.stringify(titleOrData) +
          ' and desc ' + description)
      if (angular.isObject(titleOrData)) {
        this.data = titleOrData;
        return;
      }

      // defaults
      this.data = {
        due: null,
      }

      if (data) {
        angular.extend(this.data, data);
      }

      angular.extend(this.data, {
        id: Math.random().toString(36).substr(2, 9),
        date: Date.now(),
        state: ACTIVE,
        deleted: false,
        title: titleOrData,
        description: description
      });
      debug('created new thing ' + JSON.stringify(this.data, null, 4));
    }

    Thing.ACTIVE = ACTIVE;
    Thing.ARCHIVE = ARCHIVE;
    Thing.ONE_DAY = ONE_DAY;
    Thing.ONE_WEEK = ONE_WEEK;
    // FIXME: rename things to active or open here, but mind goToCorrectType
    // should match the types enum above
    Thing.types = [, 'things', 'archive']

    Thing.isType = function(type) {
      return type === ACTIVE || type === ARCHIVE;
    };

    /**
     * @ngdoc method
     * @methodOf mushin.service:Thing
     * @name  mushin.service:Thing#setDone
     *
     * @description
     *
     * Marks a thing as done in the data store.
     */
    Thing.prototype.setDone = function() {
      var data = this.data;
      var state = data.state;

      // FIXME: this code was used to auto-archive things after some time */
      /*
      switch (this.data.state) {
      case MIT:
        if ($filter('unitsOff')(ONE_DAY, data.dueDate) > 0) {
          state = ARCHIVE
        }
        break;
      case BR:
        if ($filter('unitsOff')(ONE_WEEK, data.dueDate) > 0) {
          state = ARCHIVE
        }
        break;
      }
      */

      return $q.when(hoodie.store.update('thing', this.data.id, {
        done: true,
        state: state
      }))
    };

    Thing.prototype.setComplete = function() {
      debug('complete thing with title ' + this.data.title);

      var complete;
      var end;
      var start = this.data.start && new Date(this.data.start) || new Date();
      var due = this.data.due && new Date(this.data.due) || new Date();

      if (this.data.recurrence) {
        start = due;
        // interestingly, setSeconds handles wrapping
        due.setSeconds(due.getSeconds() + this.data.recurrence);
        debug('handle recurrence ' + this.data.recurrence + ', start ' + start +
            ' due ' + due);
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
      return $q.when(hoodie.store.update('thing', this.data.id, {
        complete: complete,
        start: start.toISOString(),
        due: due.toISOString(),
        end: end && end.toISOString() || '',
      }))
    };

    Thing.prototype.setDeleted = function() {
      return $q.when(hoodie.store.update('thing', this.data.id, {
        deleted: true,
        state: ARCHIVE
      }))
    };

    Thing.prototype.convertTo = function(type) {
      debug('convertTo(): type ' + type);
      if (type !== this.data.state && Thing.isType(type)) {
        var changes = {state: type};
        /*
        if (type === MIT || type === BR) {
          changes.dueDate = Date.now()
        }
        */
        return $q.when(hoodie.store.update('thing', this.data.id, changes));
      }

      var deferred = $q.defer();
      deferred.reject(false);
      return deferred.promise;
    };

    return Thing;
  }
);
