import gulp from 'gulp';
import browserSync from 'browser-sync';
import pkg from '../package.json';
const dirs = pkg['app-configs'].directories;

gulp.task('connect', function () {
    browserSync.init({
        server: `${dirs.dist}`
    });
    browserSync.watch(`${dirs.src}/css/*.css`, function (event, file) {
         if (event === 'change') {
             browserSync.reload('*.css;');
         }
    });
    browserSync.watch(`${dirs.src}/*.html`).on('change', browserSync.reload);
    browserSync.watch(`${dirs.src}/jade/**/*.jade`).on('change', browserSync.reload);
    browserSync.watch(`${dirs.src}/css/*.css`).on('change', browserSync.reload);
    browserSync.watch(`${dirs.src}/js/**/*.js`).on('change', browserSync.reload);
});