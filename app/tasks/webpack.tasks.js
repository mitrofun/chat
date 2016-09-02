import gulp from 'gulp';
import plumber from 'gulp-plumber';
import webpackStream from 'webpack-stream';
import pkg from '../package.json';
import named from 'vinyl-named';
import notify from 'gulp-notify';

const webpack = webpackStream.webpack;
const dirs = pkg['app-configs'].directories;


gulp.task('webpack', function() {

  let options = {
    module:  {
      loaders: [
        {
          test:    /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader:  'babel?presets[]=es2015'
        },
        {
          test: /\.hbs/,
          exclude: /(node_modules|bower_components)/,
          loader: 'handlebars-loader'
        }
      ]
    },
    plugins: [
      new webpack.NoErrorsPlugin()
    ]
  };

  return gulp.src(`${dirs.src}/js/*.js`)
      .pipe(plumber({
        errorHandler: notify.onError(err => ({
          title:   'Webpack',
          message: err.message
        }))
      }))
      .pipe(named())
      .pipe(webpackStream(options))
      .pipe(gulp.dest(`${dirs.dist}/js`));

});
