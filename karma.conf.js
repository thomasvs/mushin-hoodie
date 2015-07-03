// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  var configuration = {
    // base path, that will be used to resolve files and exclude
    basePath: '.',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    preprocessors: {
      'app/views/*.html': 'html2js',
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'app/scripts/**/*.js': ['coverage'],
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: "app/",
      moduleName: "template-module"
    },

    // list of files / patterns to load in the browser
    files: [
      // optional file that can be used to initialize debug logging
      'test/debug.js',
      'app/bower_components/jquery/dist/jquery.js',
//    This one fails grunt test with an undefined reference to Hoodie
//      'node_modules/hoodie-server/node_modules/hoodie/dist/hoodie.js',
//    This one works, but I had to bower install hoodie 1.0.3
      'app/bower_components/hoodie/dist/hoodie.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'node_modules/hoodie-plugin-angularjs/hoodie.angularjs.js',
      'app/bower_components/debug-browser/debug.js',
//      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-aria/angular-aria.js',
      'app/bower_components/angular-material/angular-material.js',
      'app/bower_components/angular-datepicker/app/scripts/datePicker.js',
      'app/bower_components/angular-duration-filter/src/duration.js',
      'app/bower_components/angular-elastic/elastic.js',
      'app/bower_components/angular-loading-bar/src/loading-bar.js',
      'app/bower_components/angular-touch/angular-touch.js',
      'app/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/add-to-homescreen/src/addtohomescreen.js',
//      'app/bower_components/bradypodion/dist/bradypodion.js',

      'app/scripts/*.js',
      'app/scripts/**/*.js',
//      'test/mock/**/*.js',
      'test/spec/**/*.js',
      'app/views/*.html',
    ],

    // See https://github.com/karma-runner/karma-coverage
    reporters: ['progress', 'coverage'],

    // optionally, configure the reporter
    coverageReporter: {
      reporters: [
        {
          type : 'html',
          dir : 'coverage/'
        },
        {
          type : 'text-summary'
        },
      ],
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],
    //browsers: ['PhantomJS'],

    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-ng-html2js-preprocessor',
    ],
    // See http://stackoverflow.com/questions/19255976/how-to-make-travis-execute-angular-tests-on-chrome-please-set-env-variable-chr
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  };

  if(process.env.TRAVIS){
    configuration.browsers = ['Chrome_travis_ci'];
  }
  config.set(configuration);
};
