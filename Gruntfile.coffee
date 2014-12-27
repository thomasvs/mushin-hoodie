'use strict'
module.exports = (grunt) ->
  require('load-grunt-tasks') grunt
  require('time-grunt') grunt

  grunt.initConfig
    app:
      app: 'app'
      dist: 'www'

    hoodieCfg: {}

    hoodie: start: options: callback: (cfg) ->
      grunt.config.set 'hoodieCfg', cfg
      grunt.config.set 'connect.livereload.proxies', [
        context: '/_api'
        host: cfg.stack.www.host
        port: cfg.stack.www.port
      ]

    watch:
      options:
        livereload: '<%= connect.options.livereload %>'

      js:
        files: ['<%= app.app %>/scripts/**/*.js']
        tasks: ['jshint:watch']

      styles:
        files: ['.tmp/styles/main.css']

      view:
        files: ['<%= app.app %>/index.html', '<%= app.app %>/views/**/*.html']

      less:
        options:
          livereload: off
        files: ['<%= app.app %>/styles/**/*.less']
        tasks: ['less:styles']

      gruntfile:
        files: ['Gruntfile.{js,coffee}']

    connect:
      options:
        port: 8999
        hostname: '0.0.0.0'
        livereload: 35728
        middleware: (connect, options) ->
          unless Array.isArray options.base
            options.base = [options.base]

          middlewares = [require('grunt-connect-proxy/lib/utils').proxyRequest]
          options.base.forEach (base) -> middlewares.push connect.static base
          directory = options.directory or options.base[options.base.length - 1]
          middlewares.push connect.directory directory

          middlewares

      livereload:
        options:
          open: true
          base: [
            '.tmp'
            '<%= app.app %>'
          ]
        # proxies: set by hoodie

      test:
        options:
          port: 9001
          base: [
            '.tmp'
            '<%= app.app %>'
          ]


      dist:
        options:
          base: '<%= app.dist %>'

    jshint:
      options:
        jshintrc: '.jshintrc'
      watch: [ '<%= app.app %>/scripts/**/*.js' ]

    uglify: options:
     preserveComments: 'some'

    clean:
      dist:
        files: [
          dot: true
          src: [
            '.tmp'
            '<%= app.dist %>/*'
            '!<%= app.dist %>/.git*'
          ]
        ]

      server: '.tmp'

    useminPrepare:
      html: '<%= app.app %>/index.html'
      options:
        dest: '<%= app.dist %>'

    rev:
      dist:
        files:
          src: [
            '<%= app.dist %>/scripts/**/*.js'
            '<%= app.dist %>/styles/**/*.css'
          ]

    usemin:
      html: ['<%= app.dist %>/**/*.html']
      css: ['.tmp/styles/**/*.css']
      options:
        assetsDirs: ['<%= app.dist %>']

    manifest:
      generate:
        options:
          basePath: '<%= app.dist %>'
          preferOnline: yes
          verbose: no
          cache: ['/_api/_files/hoodie.js']
        src: [
          'package.json'
          'scripts/*.js'
          'styles/*.css'
          'fonts/*'
        ]
        dest: '<%= app.dist %>/manifest.appcache'

    ngtemplates:
      mushin:
        cwd: '<%= app.app %>'
        src: [
            'views/*.html'
            'bower_components/**/templates/*.html'
        ]
        dest: '.tmp/templates.js'
        options:
          htmlmin:
	    # THOMAS: this removes multiple=false if on
            # collapseBooleanAttributes: on
            collapseBooleanAttributes: off
            collapseWhitespace: off
            removeAttributeQuotes: on
            removeComments: on
            removeEmptyAttributes: on
            removeRedundantAttributes: on
            removeScriptTypeAttributes: on
            removeStyleLinkTypeAttributes: on
          usemin: '<%= app.dist %>/scripts/app.js'

    ngmin:
      dist:
        files: [
          expand: true
          cwd: '<%=app.app%>/scripts'
          src: '**/*.js'
          dest: '.tmp/scripts'
        ]

    less:
      styles:
        src: ['<%=app.app%>/styles/main.less']
        dest: '.tmp/styles/main.css'
        options:
          # see http://lesscss.org/usage/#command-line-usage-source-map-rootpath
          sourceMap: true
          sourceMapFilename: '.tmp/styles/main.css.map'
          sourceMapURL: '/styles/main.css.map'
          # a path which should be prepended to each of the less file paths
          sourceMapRootpath: '/'
          # a path which should be removed from the output paths
          sourceMapBasepath: 'app'

    copy:
      dist:
        files: [
          expand: true
          dot: true
          cwd: '<%= app.app %>'
          dest: '<%= app.dist %>'
          src: [
            'fonts/*'
            'templates/*'
            '../package.json'
            '*.{png,ico,xml}'
            'index.html'
            '.htaccess'
          ]
        ,
          '<%= app.dist %>/package.json': 'package.json'
        ,
          expand: true
          dot: true
          flatten: true
          cwd: '<%= app.app %>'
          dest: '<%= app.dist %>/fonts'
          src: [
            'bower_components/bootstrap-css/fonts/glyphicons-halflings-regular.*'
          ]
        ]

    concurrent:
      dist: ['less:styles', 'ngmin']

    bump: options:
      commitMessage: 'chore(release): v%VERSION%'
      files: ['package.json', 'bower.json']
      commitFiles: ['package.json', 'bower.json', 'CHANGELOG.md']
      pushTo: 'origin master'

    jsdoc:
        dist:
            src: ['<%= app.app %>/scripts/**/*.js', 'README.md']
            options:
                destination: 'doc'

    ngdocs:
        all: ['<%= app.app %>/scripts/**/*.js', 'app/scripts/controllers/taglist.js']
        options:
            dest: 'app/docs'

# See http://blog.revolunet.com/blog/2013/12/05/unit-testing-angularjs-directive/
    karma:
      unit:
        configFile: 'karma.conf.js'
#        background: false
#        browsers: [ 'Chrome', 'Firefox' ]
        singleRun: false


  grunt.registerTask 'release', ->
    @args.unshift 'bump-only'
    grunt.task.run [
      @args.join ':'
      'changelog'
      'bump-commit'
    ]

  grunt.registerTask 'serve', [
    'clean:server'
    'hoodie'
    'less:styles'
    'connect:livereload'
    'configureProxies:livereload'
    'watch'
  ]

  # TODO: remove "continueOn" hack to work around https://github.com/yeoman/grunt-usemin/issues/291
  grunt.registerTask 'build', [
    'clean'
    'concurrent'
    'useminPrepare'
    'ngtemplates'
    'copy'
    'concat'
# FIXME: uglify seems to fail
    'uglify'
    'cssmin'
    'rev'
    'usemin'
    'manifest'
    'ngdocs'
  ]

  grunt.registerTask 'test', ['connect:test', 'karma']
  grunt.registerTask 'default', ['build']
  grunt.loadNpmTasks 'grunt-jsdoc'
  grunt.loadNpmTasks 'grunt-ngdocs'
  grunt.loadNpmTasks 'grunt-karma'

