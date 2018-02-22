var gulp = require('gulp');
var nunjucks = require('gulp-nunjucks');
var concat = require('gulp-concat');
//var cssmin = require('gulp-cssmin');        //TODO it's gonna be for production build only, so I don't need it at the moment
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var render = require('gulp-nunjucks-render');
//var prettify = require('gulp-html-prettify');
//var uglify = require('gulp-uglify');        //TODO for production purposes only

var path = {
    css:  'src/styles/*.css',
    less: 'src/styles/*.less',
    font: 'src/font/*.*',
    html: 'src/templates/*.html',
    nunjucks: 'src/templates/*.*',
    vendor: {
      css: 'src/vendor/css/*.css'
    },
    img: 'src/images/*.*',
    mock: 'src/mockapi/*.json',
    js: 'src/scripts/*.js',
    partials: 'src/templates/partials/*.html',
    dist: {
      img: 'dist/images/',
      css:  'dist/styles/',
      font: 'dist/font/',
      vendor: 'dist/vendor/css',
      mock: 'dist/mockapi/',
      partials: 'dist/partials/',
      js: 'dist/scripts/',
      html: 'dist/',
      nunjucks: 'dist/'
    }
};

gulp.task('default', ['build', 'serve', 'watch']);

gulp.task('css', function () {
  return gulp.src(path.css)
    .pipe(autoprefixer({
        browsers: ['last 4 versions']
    }))
    .pipe(concat('style.css'))
    .pipe(gulp.dest(path.dist.css));
});

gulp.task('less', function() {
    return gulp.src('path.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'bower_components') ]
        }))
        .pipe(autoprefixer({
            browsers: ['last 4 versions'],
            cascade: false
        }))
        .pipe(concat('style.css'))
        .pipe(gulp.dest(path.dist.css))
});

/*gulp.task('css-min', function () {
  return gulp.src(path.css)
    .pipe(autoprefixer({
        browsers: ['last 4 versions']
    }))
    .pipe(concat('style.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(path.dist.css));
});*/

gulp.task('html', function () {
  return gulp.src(path.html)
    .pipe(nunjucks.compile())
    .pipe(gulp.dest(path.dist.html));
});

gulp.task('nunjucks', function() {
  return gulp.src(path.nunjucks)
  .pipe(render({
      path: ['src/templates']
    }))
  .pipe(gulp.dest(path.dist.nunjucks))
});

gulp.task('img', function () {
  return gulp.src(path.img)
    .pipe(gulp.dest(path.dist.img));
});

gulp.task('font', function () {
  return gulp.src(path.font)
    .pipe(gulp.dest(path.dist.font));
});

gulp.task('vendor-css', function () {
  return gulp.src(path.vendor.css)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(path.dist.vendor));
});

/*gulp.task('vendor-css-min', function () {
  return gulp.src(path.vendor.css)
    .pipe(concat('vendor.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(path.dist.vendor));
});*/

gulp.task('mock', function () {
  return gulp.src(path.mock)
    .pipe(gulp.dest(path.dist.mock));
});

gulp.task('partials', function () {
  return gulp.src(path.partials)
    .pipe(gulp.dest(path.dist.partials));
});

gulp.task('js', function () {
  return gulp.src(path.js)
    .pipe(concat('script.js'))
    .pipe(gulp.dest(path.dist.js));
});

/*gulp.task('js-min', function () {
  return gulp.src(path.js)
    .pipe(concat('script.js'))
    .pipe(uglify())
    .pipe(gulp.dest(path.dist.js));
});*/

gulp.task('build', ['html', 'css', 'nunjucks', 'font', 'vendor-css', 'img', 'mock', 'partials', 'js']);
//gulp.task('prod', ['html', 'css-min', 'font', 'vendor-css-min', 'img', 'mock', 'partials', 'js-min']);

gulp.task('watch', function () {
  gulp.watch(path.css, ['css']);
  gulp.watch(path.less, ['less']);
  gulp.watch(path.html, ['html']);
  gulp.watch(path.nunjucks, ['nunjucks']);
  gulp.watch(path.vendor.css, ['vendor-css']);
  gulp.watch(path.img, ['img']);
  gulp.watch(path.font, ['font']);
  gulp.watch(path.mock, ['mock']);
  gulp.watch(path.partials, ['partials']);
  gulp.watch(path.js, ['js']);
});

gulp.task('serve', ['watch'], function() {
  browserSync.init({
    server: {
      baseDir: path.dist.html
    }
  });
  gulp.watch('dist/**').on('change', browserSync.reload);
});
