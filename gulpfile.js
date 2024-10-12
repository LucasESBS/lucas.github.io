var gulp        = require('gulp'),
	plumber     = require('gulp-plumber'),
	browserSync = require('browser-sync').create(),
	stylus      = require('gulp-stylus'),
	uglify      = require('gulp-uglify'),
	concat      = require('gulp-concat'),
	jeet        = require('jeet'),
	rupture     = require('rupture'),
	koutoSwiss  = require('kouto-swiss'),
	prefixer    = require('autoprefixer-stylus'),
	imagemin    = require('gulp-imagemin'),
	cp          = require('child_process');

var messages = {
	jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

var jekyllCommand = (/^win/.test(process.platform)) ? 'jekyll.bat' : 'jekyll';

/**
 * Build the Jekyll Site
 */
function jekyllBuild(done) {
	browserSync.notify(messages.jekyllBuild);
	return cp.spawn(jekyllCommand, ['build'], {stdio: 'inherit'})
		.on('close', done);
}

/**
 * Rebuild Jekyll & do page reload
 */
function jekyllRebuild(done) {
	gulp.series(jekyllBuild, function () {
		browserSync.reload();
		done();
	})();
}

/**
 * Wait for jekyll-build, then launch the Server
 */
function browserSyncServe(done) {
	browserSync.init({
		server: {
			baseDir: '_site'
		}
	});
	done();
}

/**
 * Stylus task
 */
function stylusTask() {
	return gulp.src('src/styl/main.styl')
		.pipe(plumber())
		.pipe(stylus({
			use:[koutoSwiss(), prefixer(), jeet(), rupture()],
			compress: true
		}))
		.pipe(gulp.dest('_site/assets/css/'))
		.pipe(browserSync.reload({stream:true}))
		.pipe(gulp.dest('assets/css'));
}

/**
 * Javascript Task
 */
function jsTask() {
	return gulp.src('src/js/**/*.js')
		.pipe(plumber())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest('assets/js/'))
		.pipe(browserSync.reload({stream:true}))
		.pipe(gulp.dest('_site/assets/js/'));
}

/**
 * Imagemin Task
 */
function imageminTask() {
	return gulp.src('src/img/**/*.{jpg,png,gif}')
		.pipe(plumber())
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(gulp.dest('assets/img/'));
}

/**
 * Watch stylus files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
function watchFiles() {
	gulp.watch('src/styl/**/*.styl', stylusTask);
	gulp.watch('src/js/**/*.js', jsTask);
	gulp.watch('src/img/**/*.{jpg,png,gif}', imageminTask);
	gulp.watch(['*.html', '_includes/*.html', '_layouts/*.html', '_posts/*'], gulp.series(jekyllBuild, jekyllRebuild));
}

/**
 * Default task, running just `gulp` will compile the stylus,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', gulp.series(
	jekyllBuild,
	gulp.parallel(jsTask, stylusTask, browserSyncServe, watchFiles)
));
