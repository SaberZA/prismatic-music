var gulp = require ('gulp'),
run = require('gulp-run'),
livereload = require('gulp-livereload');

var cssSources = [
  'styles/index.css'
];

gulp.task('watch', function(){
  livereload.listen();
  gulp.watch(cssSources)
});

gulp.task('run', function() {
  return run('npm start').exec();
});

//http://www.browsersync.io/docs/options/
gulp.task('browser-sync', () =>
  browserSync.init({
    proxy: "localhost:3000",
    files: [
      'appmodules/**/*.*'
    ],
    port: 3020,
    open: false, // Stop the browser from automatically opening
    notify: false,
    //reloadDelay: 3000,
    //reloadDebounce: 3000,
    /****
     * online: false makes it load MUCH faster
     * http://www.browsersync.io/docs/options/#option-online
     * note: This is needed for some features, so disable this if anything breaks
     */
    online: false,  //
    ghostMode: false  //dont want to mirror clicks, scrolls, forms on all devices
  })
)

gulp.task('default', ['watch', 'run']);