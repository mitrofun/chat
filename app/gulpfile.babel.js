// Dependencies
import gulp from 'gulp';
import requireDir from 'require-dir';
import runSequence from 'run-sequence';
import del from 'del';
import pkg from './package.json';
const dirs = pkg['app-configs'].directories;
const path = require("path");

// Include tasks/ folder
requireDir('./tasks', {recurse: true});

// Tasks
gulp.task('build', () => {
	runSequence("jade", "sass", "webpack", "misc", "watch", "img");
});

gulp.task('dev', () => {
	runSequence("jade", "sass", "webpack", "misc", "img");
});

// Watcher
gulp.task('watch', () => {
    gulp.watch(`${dirs.src}/sass/**/*.scss`, ["sass"]);
    gulp.watch(`${dirs.src}/**/*.jade`, ["jade"]);
    gulp.watch(`${dirs.src}/js/**/*.js`, ["webpack"]);
    gulp.watch(`${dirs.src}/hbs/**/*.hbs`, ["hbs", "webpack"]);
    gulp.watch(`${__dirname}/tasks/helpers/**/*.js`, ["webpack"]);
});

gulp.task('clean', function() {
  return del(`${dirs.dist}`);
});

gulp.task('default', ['build', 'watch', 'connect']);
