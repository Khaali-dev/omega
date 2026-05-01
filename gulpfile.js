// Less configuration
var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', function(cb) {
  gulp
    .src('style/omega.less')
    .pipe(less())
    .pipe(
      gulp.dest("./css")
    );
  cb();
});

gulp.task(
  'default',
  gulp.series('less', function(cb) {
    gulp.watch('style/*.less', gulp.series('less'));
    cb();
  })
);