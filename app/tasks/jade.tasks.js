import gulp from 'gulp';
import jade from 'gulp-jade';
import debug from 'gulp-debug';
import pkg from '../package.json';
const dirs = pkg['app-configs'].directories;

gulp.task('jade', () => {
    return gulp.src([`${dirs.src}/jade/**/*.jade`,`!${dirs.src}/jade/**/_*.jade`])
        .pipe(debug({title: `${dirs.src}`}))
        .pipe(jade({pretty: true}))
        .pipe(debug({title: 'jade'}))
        .pipe(gulp.dest(`${dirs.dist}`))
});
