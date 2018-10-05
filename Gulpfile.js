const path = require('path')

const gulp = require('gulp')
const surge = require('gulp-surge')
const sass = require('gulp-sass')
const clean = require('gulp-clean')
const cleanCSS = require('gulp-clean-css')
const inject = require('gulp-inject')
const rev = require('gulp-rev')
const sourcemaps = require('gulp-sourcemaps')

const browserSync = require('browser-sync').create()

const BUILD_DIR = './public'
const SOURCE_DIR = './src'

const HTML_FILES = path.join(SOURCE_DIR, '**/*.html')
const SCSS_FILES = path.join(SOURCE_DIR, '**/*.scss')
const CSS_FILES = path.join(BUILD_DIR, '**/*.css')
const IMG_FILES = path.join(SOURCE_DIR, '**/*.{png,gif,jpg,ico}')
const FONT_FILES = path.join(SOURCE_DIR, '**/*.{otf,ttf}')

gulp.task('serve', ['build'], function () {
  browserSync.init({
    server: BUILD_DIR
  })

  gulp.watch(SCSS_FILES, ['build'])
  gulp.watch(HTML_FILES, ['build'])
})

gulp.task('clean', function () {
  return gulp.src(path.join(BUILD_DIR, '**/*'), {read: false, force: false})
    .pipe(clean())
})

gulp.task('sass', ['clean'], function () {
  return gulp.src(SCSS_FILES)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(rev())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(BUILD_DIR))
})

gulp.task('build', ['clean', 'sass', 'copy:static'], function () {
  gulp.src(HTML_FILES)
    .pipe(inject(gulp.src([CSS_FILES], {read: false}), {ignorePath: '/public'}))
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(browserSync.stream())
})

gulp.task('copy:static', ['clean'], function () {
  gulp.src([IMG_FILES, FONT_FILES])
    .pipe(gulp.dest(BUILD_DIR))
})

gulp.task('deploy', ['build'], function () {
  return surge({
    project: BUILD_DIR,         // Path to your static build directory
    domain: 'sorokin.io'  // Your domain or Surge subdomain
  })
})
