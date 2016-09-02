import gulp from 'gulp';
import pkg from '../package.json';
const dirs = pkg['app-configs'].directories;

gulp.task('misc', ['copy:license'], () => {
    gulp.src([
        // Copy all files
            `${dirs.src}/**/*`,

            // Exclude the following files
            // (other tasks will handle the copying of these files)
            `!${dirs.src}/css/**/*`,
            `!${dirs.src}/jade/**/*`,
            `!${dirs.src}/sass/**/*`,
            `!${dirs.src}/js/**/*`,
            `!${dirs.src}/img/**/*`,
            `!${dirs.src}/**/*.html`
        ],{

        // Include hidden files by default
        dot: true

    })
    .pipe(gulp.dest(dirs.dist))
});


gulp.task('copy:license', () =>
    gulp.src('LICENSE')
        .pipe(gulp.dest(dirs.dist))
);