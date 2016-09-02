import gulp from 'gulp';
import compass from 'gulp-compass';
import pkg from '../package.json';
const dirs = pkg['app-configs'].directories;


gulp.task('sass', () => {
  return gulp.src(`${dirs.src}/sass/**/*.scss`)
    .pipe(compass({
        config_file: 'config.rb',
        css: `${dirs.src}/css`,
        sass: `${dirs.src}/sass`
      }))
    .pipe(gulp.dest(`${dirs.dist}/css`))
});