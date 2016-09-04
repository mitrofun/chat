import gulp from 'gulp';
import pkg from '../package.json';
const dirs = pkg['app-configs'].directories;

gulp.task('hbs', () => {
    gulp.src([`${dirs.src}/hbs/**/*`]).pipe(gulp.dest(dirs.dist + '/hbs'))
});
