var gulp = require('gulp'),
    browsersync = require('browser-sync'),
    gulp_jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    jshint = require('jshint');

var path = {
    build : {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/'
    },
    src : {
        html: 'pages/**/*.html',
        js: 'js/**/*.js',
        css: 'css/**/*.css',
        img: 'img/**/*.*'
    },
    clean : './build'
};

gulp.task('default', [
    'html:build',
    'js:build',
    'img:build',
    'css:build'
]);

gulp.task('html:build', function () {
   gulp.src(path.src.html)
       .pipe(gulp.dest(path.build.html))
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(gulp.dest(path.build.js))
});

gulp.task('img:build', function () {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img))
});

gulp.task('css:build', function () {
    gulp.src(path.src.css)
        .pipe(gulp.dest(path.build.css))
});
