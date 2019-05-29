"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var del = require("del");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require('gulp-csso');
var rename = require("gulp-rename");
var server = require("browser-sync").create();
var imagemin = require("gulp-imagemin");
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;

// Очистка папки build
gulp.task("clean", function () {
  return del("build");
});

//Очистка папки build/js
gulp.task("cleanJs", function () {
  return del("build/js");
});

// Копирование файлов в папку build
gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

// Оптимизация изображений с сохранением оригиналов в img-source
gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(gulp.dest("source/img-source"))
    .pipe(imagemin([
      imagemin.optipng({optomozationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo({
        plugins: [
            {removeViewBox: false},
            {cleanupIDs: true}
        ]
      })
    ]))
    .pipe(gulp.dest("source/img"));
});

// Создание спрайта из svg с суффиксом "-sprite"
gulp.task("sprite", function () {
  return gulp.src("build/img/*-sprite.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest("build/img"))
});

// Создание webp версий изображений
gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

// Созадние css из sass c sourcemaps, normalize, префиксы, минификация, переименование в *.min.css
gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    // .pipe(rename("style.min.css"))
    .pipe(rename(function (path) {
      path.extname = ".min.css"
    }))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

//  Вставка в html вместо 'include scr="..."' содержимого файла, минификация
gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
});

// Минификация js
gulp.task("js", function () {
  return pipeline(
    gulp.src("source/js/**/*.js"),
    uglify(),
    gulp.dest("build/js")
  );
});

// Обновление страницы
gulp.task("refresh", function (done) {
  server.reload();
  done();
});

//Запуск папки build в Firefox
gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    browser: ["google chrome"]
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("source/js/**/*.js", gulp.series("cleanJs", "js", "refresh"));
  gulp.watch("source/img/*.svg", gulp.series("copy", "refresh"));
  gulp.watch("source/img/*-sprite.svg", gulp.series("copy", "sprite", "html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
});

gulp.task("build", gulp.series("clean", "copy", "css", "sprite", "html", "js"));
gulp.task("start", gulp.series("build", "server"));
