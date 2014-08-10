// vi:si:et:sw=4:sts=4:ts=4
var debug = new window.$debug('mushin:filters/things');
 debug('loading filters/things.js')

angular.module('mushin').filter('tag', function () {
     debug('creating filter tag')

    return function(things, scope) {
        debug ('filtering scope ' + scope);
        var all = scope.selectedAll;
        var tags = scope.tags;
        debug('filtering ' + things.length + ' things')

        if (all) {
            debug('filtered ' + things.length + ' things')
            return things;
        }

        debug('filtering against ' + tags.length + ' tags')

        var key;
        var ret = [];
        var matched;

        for (var i = 0; i < things.length; ++i) {
            matched = false;

            for (key in tags) {
                if (tags[key].active && things[i].tags.indexOf(key) > -1) {
                    matched = true;
                }
            }
            if (matched) {
                ret.push(things[i]);
            }
        }

        debug('filtered ' + ret.length + ' things')
        return ret;
    }
})

