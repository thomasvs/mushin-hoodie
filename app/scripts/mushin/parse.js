// vi:si:et:sw=4:sts=4:ts=4
// Converted from parse.js in kanso-spine-mushin
// Generated by CoffeeScript 1.6.3
/*jshint -W061 */
(function(window) {
  var Parser;

  Parser = (function() {
    var COMPLETE_CHAR, COMPLETE_REGEXP, CONTEXT_CHAR, CONTEXT_REGEXP,
        CONVERSION, DATE_MATCH, DIGIT_MATCH, DUE_CHAR, DUE_REGEXP,
        END_CHAR, END_REGEXP, IMPORTANCE_CHAR, IMPORTANCE_REGEXP,
        NUMBER_MATCH, PROJECT_CHAR, PROJECT_REGEXP, RECURRENCE_CHAR,
        RECURRENCE_REGEXP, REFERENCE_CHAR, REFERENCE_REGEXP,
        START_CHAR, START_REGEXP, STATUS_CHAR, STATUS_REGEXP,
        TIMEDELTA_MATCH, TIMEDELTA_REGEXP,
        TIME_CHAR, TIME_REGEXP,
        URGENCY_CHAR, URGENCY_REGEXP,
        WORD_MATCH;

    function Parser() {}

    CONTEXT_CHAR = "@";

    PROJECT_CHAR = "p:";

    REFERENCE_CHAR = "ref:";

    STATUS_CHAR = "!";

    COMPLETE_CHAR = "C:";

    IMPORTANCE_CHAR = "I:";

    URGENCY_CHAR = "U:";

    RECURRENCE_CHAR = "R:";

    TIME_CHAR = "T:";

    DUE_CHAR = "D:";

    END_CHAR = "E:";

    START_CHAR = "S:";

    WORD_MATCH = "([_\\w-]+)";

    DIGIT_MATCH = "([1-5])";

    NUMBER_MATCH = "(\\d+)";

    TIMEDELTA_MATCH = "(\\d+)([WDHM])";

    DATE_MATCH = "(\\d\\d\\d\\d-\\d\\d-\\d\\d)";

    CONTEXT_REGEXP = new RegExp(CONTEXT_CHAR + WORD_MATCH, "ig");

    PROJECT_REGEXP = new RegExp(PROJECT_CHAR + WORD_MATCH, "ig");

    REFERENCE_REGEXP = new RegExp(REFERENCE_CHAR + WORD_MATCH, "ig");

    STATUS_REGEXP = new RegExp(STATUS_CHAR + WORD_MATCH, "ig");

    COMPLETE_REGEXP = new RegExp(COMPLETE_CHAR + NUMBER_MATCH, "ig");

    IMPORTANCE_REGEXP = new RegExp(IMPORTANCE_CHAR + DIGIT_MATCH, "ig");

    URGENCY_REGEXP = new RegExp(URGENCY_CHAR + DIGIT_MATCH, "ig");

    RECURRENCE_REGEXP = new RegExp(RECURRENCE_CHAR + TIMEDELTA_MATCH, "ig");

    TIME_REGEXP = new RegExp(TIME_CHAR + TIMEDELTA_MATCH, "ig");

    DUE_REGEXP = new RegExp(DUE_CHAR + DATE_MATCH, "ig");

    END_REGEXP = new RegExp(END_CHAR + DATE_MATCH, "ig");

    START_REGEXP = new RegExp(START_CHAR + DATE_MATCH, "ig");

    TIMEDELTA_REGEXP = new RegExp(TIMEDELTA_MATCH, "ig");

    CONVERSION = {
      WORK: {
        WEEK_IN_HOURS: 5 * 8,
        DAY_IN_HOURS: 8
      },
      NATURAL: {
        WEEK_IN_HOURS: 7 * 24,
        DAY_IN_HOURS: 24
      }
    };

    Parser.prototype.pluralize = function(word) {
      if (word[-1] === 's') {
        return word + 'es';
      }
      return word + 's';
    };

    Parser.prototype.parse = function(line) {
      var attr, key, m, r, ret, title, type, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
      ret = {};
      title = line;
      _ref = ['CONTEXT', 'PROJECT', 'REFERENCE', 'STATUS'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        title = title.replace(eval(attr + '_REGEXP'), '');
        r = eval(attr + '_REGEXP');
        m = r.exec(line);
        while (m) {
          key = this.pluralize(attr.toLowerCase());
          if (!(key in ret)) {
            ret[key] = [];
          }
          ret[key].push(m[1]);
          m = r.exec(line);
        }
      }
      _ref1 = ['COMPLETE', 'IMPORTANCE', 'URGENCY'];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        attr = _ref1[_j];
        title = title.replace(eval(attr + '_REGEXP'), '');
        r = eval(attr + '_REGEXP');
        m = r.exec(line);
        while (m) {
          key = attr.toLowerCase();
          ret[key] = parseInt(m[1]);
          m = r.exec(line);
        }
      }
      _ref2 = ['RECURRENCE', 'TIME'];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        attr = _ref2[_k];
        title = title.replace(eval(attr + '_REGEXP'), '');
        if (attr === 'TIME') {
          type = 'WORK';
        }
        if (attr === 'RECURRENCE') {
          type = 'NATURAL';
        }
        r = eval(attr + '_REGEXP');
        m = r.exec(line);
        while (m) {
          key = attr.toLowerCase();
          ret[key] = this.parseTimedelta(m, type);
          m = r.exec(line);
        }
      }
      _ref3 = ['DUE', 'END', 'START'];
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        attr = _ref3[_l];
        title = title.replace(eval(attr + '_REGEXP'), '');
        r = eval(attr + '_REGEXP');
        m = r.exec(line);
        while (m) {
          key = attr.toLowerCase();
          ret[key] = this.parseDate(m[1]);
          m = r.exec(line);
        }
      }
      ret.title = title.replace(/^\s+|\s+$/g, '');
      return ret;
    };

    Parser.prototype.parseTimedelta = function(match, type) {
      var HOURS, hours, minutes, symbol, value;
      hours = minutes = 0;
      HOURS = CONVERSION[type];
      value = match[1];
      symbol = match[2];
      if (symbol === 'W') {
        hours = value * HOURS.WEEK_IN_HOURS;
      } else if (symbol === 'D') {
        hours = value * HOURS.DAY_IN_HOURS;
      } else if (symbol === 'H') {
        hours = value;
      } else if (symbol === 'M') {
        minutes = value;
      }
      return (hours * 60 + minutes) * 60;
    };

    Parser.prototype.parseDate = function(text) {
      var d, ret;
      d = new Date(text + 'T00:00:00Z');
      ret = d.toISOString();
      return ret.substr(0, ret.length - 5) + 'Z';
    };

    Parser.prototype.unparse = function(thing) {
      var attr, key, ret, type, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4;
      ret = [];
      ret.push(thing.title);
      _ref = ['CONTEXT', 'PROJECT', 'REFERENCE', 'STATUS'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        key = this.pluralize(attr.toLowerCase());
        if (key in thing && thing[key]) {
          _ref1 = thing[key];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            v = _ref1[_j];
            ret.push(eval(attr + '_CHAR') + v);
          }
        }
      }
      _ref2 = ['COMPLETE', 'IMPORTANCE', 'URGENCY'];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        attr = _ref2[_k];
        key = attr.toLowerCase();
        if (key in thing) {
          ret.push(eval(attr + '_CHAR') + thing[key]);
        }
      }
      _ref3 = ['RECURRENCE', 'TIME'];
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        attr = _ref3[_l];
        key = attr.toLowerCase();
        if (key in thing) {
          if (attr === 'TIME') {
            type = 'WORK';
          }
          if (attr === 'RECURRENCE') {
            type = 'NATURAL';
          }
          ret.push(eval(attr + '_CHAR') + this.unparseTimedelta(thing[key], type));
        }
      }
      _ref4 = ['DUE', 'END', 'START'];
      for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
        attr = _ref4[_m];
        key = attr.toLowerCase();
        if (key in thing) {
          ret.push(eval(attr + '_CHAR') + this.unparseDate(thing[key]));
        }
      }
      return ret.join(' ');
    };

    Parser.prototype.unparseTimedelta = function(seconds, type) {
      var HOURS, ret;
      HOURS = CONVERSION[type];
      if (seconds % (60 * 60 * HOURS.WEEK_IN_HOURS) === 0) {
        ret = seconds / (60 * 60 * HOURS.WEEK_IN_HOURS) + 'W';
      } else if (seconds % (60 * 60 * HOURS.DAY_IN_HOURS) === 0) {
        ret = seconds / (60 * 60 * HOURS.DAY_IN_HOURS) + 'D';
      } else if (seconds % (60 * 60) === 0) {
        ret = seconds / (60 * 60) + 'H';
      } else {
        ret = (seconds / 60) + 'M';
      }
      return ret;
    };

    Parser.prototype.unparseDate = function(isodate) {
      var date, epochMs;
      epochMs = Date.parse(isodate);
      date = new Date();
      date.setTime(epochMs);
      return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).substr(-2, 2) + '-' + ('0' + date.getDate()).substr(-2, 2);
    };

    return Parser;

  })();


  // browser export
  window.Parser = Parser;

})(window);