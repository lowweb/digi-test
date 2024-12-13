import gulp from "gulp";
import babel from "gulp-babel";
import postcss from "gulp-postcss";
import replace from "gulp-replace";
import htmlmin from "gulp-htmlmin";
import terser from "gulp-terser";
import pimport from "postcss-import";
import minmax from "postcss-media-minmax";
import autoprefixer from "autoprefixer";
import csso from "postcss-csso";
import sync from "browser-sync";
import include from "gulp-file-include";
import dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);
import sassGlob from "gulp-sass-glob";
import plumber from "gulp-plumber";
import sourcemaps from "gulp-sourcemaps";
import flatten from "gulp-flatten";
import { deleteAsync } from "del";
import concat from "gulp-concat";

//PATH
const path = {
  html: {
    src: ["./src/html/*.html", "./src/html/pages/*.html"],
    dist: "./dist",
    watch: ["./src/components/**/*.html", "./src/html/**/*.html"],
  },
  styles: {
    src: "./src/styles/main.{scss,sass}",
    dist: "./dist/styles/",
    watch: [
      "./src/components/**/*.{scss,sass}",
      "./src/styles/**/*.{scss,sass}",
    ],
  },
  clean: {
    dist: "./dist/*",
  },
  scripts: {
    src: ["./src/scripts/**/*.js", "./src/components/*.js"],
    dist: "./dist/scripts/",
    watch: ["./src/components/**/*.js", "./src/scripts/**/*.js"],
  },
  images: {
    src: [
      "./src/images/**/*.{jpg,jpeg,png,gif,tiff,svg}",
      "./src/components/**/*.{jpg,jpeg,png,gif,tiff,svg}",
      "!./src/images/favicon/*.{jpg,jpeg,png,gif,tiff}",
    ],
    dist: "./dist/images/",
    watch: [
      "./src/images/**/*.{jpg,jpeg,png,gif,svg,tiff}",
      "./src/components/**/*.{jpg,jpeg,png,gif,tiff,svg}",
    ],
  },
  fonts: {
    src: "./src/fonts/**/*.{woff,woff2}",
    dist: "./dist/fonts/",
    watch: "./src/fonts/**/*.{woff,woff2}",
  },
};

// HTML

export const html = () => {
  return (
    gulp
      .src(path.html.src)
      .pipe(
        include({
          prefix: "@@",
          basepath: "@file",
        })
      )
      // .pipe(htmlmin({
      //     removeComments: true,
      //     collapseWhitespace: true,
      // }))
      .pipe(gulp.dest(path.html.dist))
      .pipe(sync.stream())
  );
};

// Styles

export const styles = () => {
  return (
    gulp
      .src(path.styles.src)
      .pipe(sourcemaps.init())
      .pipe(plumber())
      .pipe(sassGlob())
      .pipe(sass())
      // .pipe(postcss([pimport, minmax, autoprefixer, csso]))
      .pipe(postcss([pimport, autoprefixer, csso]))
      .pipe(plumber.stop())
      .pipe(sourcemaps.write())
      .pipe(replace(/\.\.\//g, ""))
      .pipe(gulp.dest(path.styles.dist))
      .pipe(sync.stream())
  );
};

// Scripts

export const scripts = () => {
  return (
    gulp
      .src(path.scripts.src)
      .pipe(
        babel({
          presets: ["@babel/preset-env"],
        })
      )
      // .pipe(terser())
      .pipe(concat("main.js"))
      .pipe(gulp.dest(path.scripts.dist))
      .pipe(sync.stream())
  );
};

//Images
export const images = () => {
  return gulp
    .src(path.images.src)
    .pipe(flatten())
    .pipe(gulp.dest(path.images.dist))
    .pipe(sync.stream({ once: true }));
};

//Fonts
export const fonts = () => {
  return gulp
    .src(path.fonts.src)
    .pipe(gulp.dest(path.fonts.dist))
    .pipe(sync.stream({ once: true }));
};

// Paths

export const paths = () => {
  return gulp
    .src("dist/*.html")
    .pipe(
      replace(/(<link rel="stylesheet" href=")styles\/(index.css">)/, "$1$2")
    )
    .pipe(replace(/(<script src=")scripts\/(index.js">)/, "$1$2"))
    .pipe(gulp.dest("dist"));
};

// Server

export const server = () => {
  sync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: "dist",
    },
  });
};

//Clean
export const clean = () => {
  return deleteAsync([path.clean.dist]);
};

// Watch

export const watch = () => {
  gulp.watch(path.html.watch, gulp.series(html, paths));
  gulp.watch(path.styles.watch, gulp.series(styles));
  gulp.watch(path.scripts.watch, gulp.series(scripts));
  gulp.watch(path.images.watch, gulp.series("images"));
  gulp.watch(path.fonts.watch, gulp.series("fonts"));
};

// Default

export default gulp.series(
  clean,
  gulp.parallel(html, styles, scripts, images, fonts),
  paths,
  gulp.parallel(watch, server)
);
