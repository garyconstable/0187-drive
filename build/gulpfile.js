
/*******************************************************************************
Dependencies
*******************************************************************************/
var gulp 				= require('gulp'),
		chalk				= require('chalk'),
		gulpif      = require('gulp-if'),
		replace	  	= require('gulp-replace'),
		sass 				= require('gulp-sass'),
		notify      = require('gulp-notify'),
		plumber     = require('gulp-plumber'),
		util       	= require('gulp-util'),
		uglify      = require('gulp-uglify'),
		file_concat = require('gulp-concat'),
		sourcemaps  = require('gulp-sourcemaps'),
		svgSprite   = require('gulp-svg-sprite'),
		stripDebug  = require('gulp-strip-debug'),
		browserSync = require('browser-sync').create(),
		config 			= require('./config.json'),
		fs 					= require('fs'),
		runSequence = require('run-sequence'),
		rev 				= require('gulp-rev'),
		concat 			= require('gulp-concat'),
		handlebars 	= require('gulp-compile-handlebars'),
		rename 			= require('gulp-rename'),
		streamqueue = require('streamqueue'),
		cleanCSS 		= require('gulp-clean-css'),
		del 				= require('del'),
		htmlmin 		= require('gulp-htmlmin');


/*******************************************************************************
Handlers / Config
*******************************************************************************/
var handlers = {
	onError: function() {
		return notify.onError({
			'icon': "https://i.imgur.com/VsfiLjV.png",
			'title': config.projectName,
			'message': '<%= error.message %>'
		});
	},
	onSuccess: function(message) {
		return notify({
			'icon': "https://i.imgur.com/G6fTWAs.png",
			'title': config.projectName,
			'message': message || 'Successful',
			'onLast': true
		});
	},
};

var handlebarOpts = {
	helpers: {
		assetPath: function (path, context) {
			return ['/assets/build', context.data.root[path]].join('/');
		}
	}
};

// First do the dynamic paths within the paths object
//
pathsConfig = JSON.stringify(config.paths);
for(var path in config.paths) {
	pathsConfig = pathsConfig.replace(new RegExp('{'+ path +'}', 'g'), config.paths[path]);
}
config.paths = JSON.parse(pathsConfig);

// Then do the dynamic paths elsewhere
//
tmpConfig = JSON.stringify(config);
for(var path in config.paths) {
	tmpConfig = tmpConfig.replace(new RegExp('{'+ path +'}', 'g'), config.paths[path]);
}
config = JSON.parse(tmpConfig);

/*******************************************************************************
Browser Sync
*******************************************************************************/
gulp.task('serve', ['sass', 'js', 'build-index' ], function() {

	browserSync.init({
		watchTask: true,
		open: 'external',
	  proxy: config.browserSync.host,
	  host: config.browserSync.host,
	  notify: false
	});

	for(var watch in config.watch) {
		console.log('watching pattern', config.watch[watch].pattern);
		gulp.watch(config.watch[watch].pattern, config.watch[watch].tasks);
	}
	for(var path in config.browserSync.watch) {
		console.log('watching path', config.browserSync.watch[path]);
		gulp.watch(config.browserSync.watch[path]).on('change', function(){
			gulp.start('index-reload');
		});
	}
});

/*******************************************************************************
SASS
*******************************************************************************/
gulp.task('sass', function() {
	return streamqueue({ objectMode: true },
		gulp.src('../build/node_modules/font-awesome/css/font-awesome.css'),
		gulp.src('../build/node_modules/wallop/css/wallop.css'),
		gulp.src('../build/node_modules/wallop/css/wallop--fade.css'),
    gulp.src('sass/global.scss')
  )
	.pipe( plumber({ errorHandler: handlers.onError() }) )
	.pipe( gulpif(config.sourceMaps, sourcemaps.init()) )
	.pipe( sass(config.sassOptions) )
	.pipe( gulpif(config.sourceMaps, sourcemaps.write()) )
	.pipe( file_concat('global.css') )
	.pipe( gulp.dest('tmp') )
	.pipe( browserSync.stream() )
	.pipe( handlers.onSuccess("SASS COMPILED SUCCESSFULLY"));
});

/*******************************************************************************
JS
*******************************************************************************/
gulp.task('js', function(){
	return streamqueue({ objectMode: true },
		gulp.src('../build/node_modules/jquery/dist/jquery.js'),
		gulp.src('../build/node_modules/wallop/js/Wallop.js'),
		gulp.src('../build/node_modules/scrollreveal/dist/scrollreveal.js'),
	  gulp.src('js/global.js')
  )
	.pipe( plumber({ errorHandler: handlers.onError() }) )
	.pipe( file_concat('global.js') )
	//.pipe( gulpif(config.stripDebug, stripDebug() ))
	.pipe( uglify(config.uglifyOptions) )
	.pipe( gulp.dest('tmp') )
	.pipe( browserSync.stream() )
	.pipe( handlers.onSuccess("APP JS COMPILED SUCCESSFULLY") );
});

/*******************************************************************************
Default
*******************************************************************************/
gulp.task('default', ['sass', 'js'], function(){
	return util.log(chalk.green("All gulp tasks completed"));
});

/*******************************************************************************
Create Manifest
*******************************************************************************/
gulp.task('manifest', function () {
	return gulp.src([
		'tmp/global.css',
		'tmp/global.js'
	])
  .pipe(rev())
  .pipe(gulp.dest('../public/assets/build'))  // write rev'd assets to build dir
  .pipe(rev.manifest())
  .pipe(gulp.dest('tmp')); // write manifest to build dir
});

/*******************************************************************************
Build Index page
*******************************************************************************/
gulp.task('build-index', ['manifest'], function () {
	var manifest = JSON.parse(fs.readFileSync('tmp/rev-manifest.json', 'utf8'));
	return gulp.src('index.hbs')
		.pipe(handlebars(manifest, handlebarOpts))
		.pipe(rename('index.html'))
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('../public'));
});
gulp.task('index-reload', ['build-index'], function () {
	browserSync.reload();
});

/*******************************************************************************
Rebuild
*******************************************************************************/
gulp.task('removeCss',[], function () {
  return del([
    '../public/assets/build/*.css',
		'tmp/global.css',
  ], {force: true});
});
gulp.task('removeJs',[], function () {
  return del([
    '../public/assets/build/*.js',
		'tmp/global.js',
  ], {force: true});
});
gulp.task('rebuild-css', ['removeCss', 'sass'], function () {
	gulp.start('index-reload');
});
gulp.task('rebuild-js', ['removeJs', 'js'], function () {
	setTimeout(function(){
		gulp.start('index-reload');
	}, 2000);
});
