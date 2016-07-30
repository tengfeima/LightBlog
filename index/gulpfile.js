/**
 * Front Workflow for SPAs
 */
;(function (gulp, gulpLoadPlugins) {

    'use strict';

    var $ = gulpLoadPlugins({pattern: '*', camelize: true, lazy: true}),
        _ = {app: 'app', dist: 'dist'};

    var
        fs   = require('fs'),
        path = require('path');

    var packFiles = function (dir, exdir) {
        var fileName = [];
        var files = fs.readdirSync(dir);
        if ( exdir && exdir.replace(/(^[\.\/]{0,2})([^\/\\]*)(\/$)?/g, '$2') ) {
            files.splice(files.indexOf(exdir), 1);
        }
        files.forEach(function (file) {
            fileName.push(file.replace(/(\.js)$/g, ''));
        });
        return fileName;
    };

    var include = packFiles('./app/scripts/', 'lib');
    var exclude = packFiles('./app/scripts/lib/');



    /********************* verify workflow begin *********************/
    gulp.task('jshint', function () {
        return gulp.src([
            'gulpfile.js',
            _.app + '/scripts/**/*.js',
            '!' + _.app + '/scripts/lib/**/*.js'

        ])
            .pipe($.plumber())
            .pipe($.jshint('.jshintrc')).pipe($.jshint.reporter('default'));
    });

    gulp.task('jsonlint', function () {
        return gulp.src([
            'package.json',
            'bower.json',
            '.bowerrc',
            '.jshintrc'
        ])
            .pipe($.plumber())
            .pipe($.jsonlint())
            .pipe($.jsonlint.reporter());
    });
    /********************* verify workflow end *********************/






    /********************* build workflow begin *********************/
    gulp.task('clean', function () {
        return gulp.src([
            //_.dist + '/images',
            //_.dist + '/styles',
            //_.dist + '/scripts',
            _.dist
        ], {
            read: false
        })
            .pipe($.rimraf());
    });

    gulp.task('images', function () {
        return gulp.src([
                    _.app + '/images/**/*'
                ])
                .pipe($.plumber())
                .pipe($.cache($.imagemin({
                    optimizationLevel: 7,
                    progressive: true,
                    interlaced: true
                })))
                .pipe(gulp.dest(_.dist + '/images/'))
                .pipe($.size());
    });
    
    //gulp.task('styles:build:before', function () {
    //    $.del(_.dist + '/styles/**/*.css');
    //});

    gulp.task('styles:build', function () {
        return gulp.src(_.app + '/styles/main.css')
                .pipe($.csso())
                .pipe($.autoprefixer())
                .pipe($.rename('main.min.css'))
                //.pipe($.rev())
                .pipe(gulp.dest(_.dist + '/styles/'));
    });

    gulp.task('styles:build:after', function () {
        $.del(_.dist + '/styles/main.min.css');
    });

    //TODO package cjs
    gulp.task('requirejs', function () {
        require('requirejs').optimize({
            appDir: './' + _.app + '/scripts/',
            baseUrl: './',
            dir: './' + _.dist + '/scripts/',
            mainConfigFile: './' + _.app + '/scripts/config.js',
            modules: [{
                name: 'main',//SPAs应用
                include: include,
                exclude: exclude
            }],
            optimize: 'none',
            preserveLicenseComments: true,
            removeCombined: true,
            noBuildTxt: true
        });
    });

    //压缩js
    gulp.task('scripts:build', function () {
        return gulp.src(_.dist + '/scripts/main.js')
                .pipe($.uglify())
                .pipe($.rename('main.min.js'))
                .pipe($.rev())
                .pipe(gulp.dest(_.dist + '/scripts/'));
    });

    //去掉无用的文件
    gulp.task('scripts:build:after', function () {
        $.del([
            _.dist + '/scripts/build.txt',
            _.dist + '/scripts/main.js'
        ])
    });

    //压缩html中的脚本和样式
    gulp.task('html:build', function () {
        var jsFilter = $.filter('**/*.js', {restore: true});
        var cssFilter = $.filter('**/*.css', {restore: true});
        var assets = $.useref.assets();//here must write like this
        return gulp.src(_.app + '/**/*.{htm,html,shtml}')
                .pipe($.plumber())
                .pipe(assets)
                .pipe(jsFilter)
                .pipe($.uglify())
                .pipe(jsFilter.restore)
                .pipe(cssFilter)
                .pipe($.csso())
                .pipe($.autoprefixer())
                .pipe(cssFilter.restore)
                .pipe($.rev())
                .pipe(assets.restore())
                .pipe($.useref())
                .pipe($.revReplace())
                .pipe(gulp.dest(_.dist));
    });

    //替换html中requirejs的入口文件
    gulp.task('html:build:after', function () {
        var mainjs = packFiles('./dist/scripts/', 'lib');
        return gulp.src(_.dist + '/**/*.{htm,html,shtml}')
                .pipe($.htmlReplace({
                    requirejs: {
                        src: mainjs[0],
                        tpl: '<script data-main="./scripts/%s" src="./scripts/lib/require.js"></script>'
                    }
                }))
                .pipe(gulp.dest(_.dist));
    });
    /********************* build workflow end *********************/





    /********************* develop workflow begin *********************/
    gulp.task('open', function () {
        $.opn('http://localhost:9000/'/*, {app: ['google chrome']}*/);
    });

    gulp.task('connect', function () {
        $.connect.server({
            root: [_.app],
            port: 9000,
            livereload: true
        });
    });

    gulp.task('styles:dev', function () {
        return gulp.src(_.app + '/less/main.less')
            .pipe($.plumber())
            .pipe($.less())
            .pipe($.connect.reload())
            .pipe(gulp.dest(_.app + '/styles/'))
            .pipe($.size());
    });

    gulp.task('scripts:dev', ['jshint'], function () {
        return gulp.src([
                _.app + '/scripts/**/*.js',
                '!' + _.app + '/scripts/lib/**/*.js'
            ])
            .pipe($.plumber())
            .pipe($.connect.reload())
            .pipe($.size());
    });

    gulp.task('html:dev', function () {
        return gulp.src(_.app + '/**/*.{htm,html,shtml,txt}')
            .pipe($.plumber())
            .pipe($.connect.reload())
            .pipe($.size());
    });

    gulp.task('watch', function () {

        gulp.watch(_.app + '/less/*.less', ['styles:dev']);

        gulp.watch([_.app + '/scripts/*.js', '!' + _.app + '/scripts/lib/*.js'], ['scripts:dev']);

        gulp.watch(_.app + '/**/*.{htm,html,shtml,txt}', ['html:dev']);

        gulp.watch(_.app + '/**/*.json', ['jsonlint']);

    });
    /********************* develop workflow end *********************/





    /********************* expose begin *********************/
    //开发监听
    gulp.task('develop', ['open', 'connect', 'watch']);

    //TODO测试
    //gulp.task('test', function () {});

    //打包
    gulp.task('build', function () {
        $.runSequence('clean', ['images', 'styles:dev', 'requirejs'], 'scripts:build', 'scripts:build:after', 'html:build', 'html:build:after', 'styles:build:after');
    });

    //预览
    gulp.task('preview', ['open'], function () {
        $.connect.server({
            root: _.dist,
            port: 9000,
            livereload: true
        });
    });

    //上传
    gulp.task('upload', function () {

        var getFileName = function (path) {
            var name = '';
            var fileNames = fs.readdirSync(path);
                fileNames.forEach(function (filename) {
                    var stats = fs.statSync(path + filename);
                    if (!stats.isDirectory()) {
                        name = filename;
                        return false;
                    }
                });
            return name;
        };
        var getRemotepath = function () {
            var now = new Date();
            var format = function (num) {
                return num / 1 > 9 ? num / 1 : '0' + num / 1;
            };
            return '/' + now.getFullYear() + '/' + format(now.getMonth() + 1) + format(now.getDate());
        };

        //上传脚本和样式, html走cms
        ['./dist/scripts/', './dist/styles/'].forEach(function (path) {
            var FormData = $.formData;
            var form = new FormData();

                form.append('site', 'mat1');
                form.append('remotepath', getRemotepath() + path.substring(1));
                form.append('NEW_FILE', fs.createReadStream( path + getFileName(path) ));

                form.submit('http://wizard2.webdev.com/tcms/tools/uploadfileext.php', function (err, res) {
                    if (err) throw err;

                    $.util.log(res.statusCode + '\n');
                    $.util.log('msg: ' + 'http://mat1.gtimg.com/pingjs/ext2020' + getRemotepath() + path.substring(1) + getFileName(path));

                    res.resume();
                });
        });

    });

    //发布
    gulp.task('release', ['upload']);

    //默认开发使用
    gulp.task('default', ['develop']);
    /********************* expose end *********************/


}(require('gulp'), require('gulp-load-plugins')));