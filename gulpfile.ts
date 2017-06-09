/**
 * remove import gulp, because @types/gulp is wrong :(
 */
let gulp = require('gulp')
import * as ts from 'gulp-typescript'
let clean = require( 'gulp-clean' )
let coveralls = require( 'gulp-coveralls' )
import * as tslint from 'gulp-tslint'
import * as sourcemaps from 'gulp-sourcemaps'
import * as mocha from 'gulp-mocha'
/**
 * job variables
 */
let serverPath = 'lib'
let istanbul = require( 'gulp-istanbul' )
let remapIstanbul = require( 'remap-istanbul/lib/gulpRemapIstanbul' )
let compiledPath = `${serverPath}/**/**.js`
let testPath = `${serverPath}/**/*.spec.js`
let tsProject = ts.createProject( 'tsconfig.json' )
let serverTS = `${serverPath}/**/**.ts`
let files2Clean = [ '**/*.js', '**/*.js.map', '**/*.d.ts' ].map( el => serverPath + el )

let runTest = () => gulp.src( [ testPath ] ) // take our transpiled test source
  .pipe( mocha( { timeout: 64000 } ) ) // runs tests

let runCoverage = () => gulp.src( './coverage/coverage-final.json' )
  .pipe( remapIstanbul( {
    basePath: serverPath,
    reports: {
      'html': './coverage',
      'text-summary': null,
      'lcovonly': './coverage/lcov.info'
    }
  } ) )

let tsCompile = () => gulp
  .src( serverTS )
  .pipe( sourcemaps.init( { loadMaps: true } ) )
  .pipe( tsProject() )
  .pipe( sourcemaps.write( '.', { includeContent: false } ) )
  .pipe( gulp.dest( serverPath ) )

gulp.task( 'default', [ 'ts' ], function () {
  return gulp.watch( serverTS, [ 'ts-inc' ] )
} )

gulp.task( 'ts-inc', function () {
  return tsCompile()
} )

gulp.task( 'tslint', () =>
  gulp.src( serverTS )
    .pipe( tslint.default( {
      configuration: 'tslint.json'
    } ) )
    .pipe( tslint.default.report() )
)

gulp.task( 'ts', [ 'clean' ], function () {
  return tsCompile()
} )

gulp.task( 'clean', function () {
  return gulp
    .src( files2Clean, { read: false } )
    .pipe( clean() )
} )

gulp.task( 'pre-test', [ 'ts', 'tslint' ], () =>
  gulp.src( [ compiledPath, `!${testPath}` ] )
    .pipe( istanbul() )
    .pipe( istanbul.hookRequire() ) // Force `require` to return covered files
)

gulp.task( 'test', [ 'pre-test' ], () => runTest()
  .once( 'error', ( error: Error ) => {
    console.error( error.message )
    process.exit( -1 )
  } )
  .once( 'end', () => process.exit() )
)

gulp.task( 'test-coverage', [ 'pre-test' ], function () {
  return runTest()
    .once( 'error', ( error: Error ) => {
      console.error( error.message )
      process.exit( -1 )
    } )
    .pipe( istanbul.writeReports( {
      reporters: [ 'json' ]
    } ) )
} )

gulp.task( 'coverage', [ 'test-coverage' ], () =>
  runCoverage()
    .once( 'end', () => process.exit() )
)

gulp.task( 'coverage-coveralls', [ 'test-coverage' ], () =>
  runCoverage()
)

gulp.task( 'coveralls', [ 'coverage-coveralls' ], () =>
  gulp.src( './coverage/lcov.info' )
    .pipe( coveralls() )
    .once( 'end', () => process.exit() )
)
