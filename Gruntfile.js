module.exports = function(grunt){

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');

    grunt.initConfig({
        concat: {
            dist: {
                src: [
                    'src/intro',
                    'src/config.js',
                    'src/deferred.js',
                    'src/globalStorage.js',
                    'src/outro'
                ],
                dest: 'build/globalStorage.js',
                options: {
                    process: function(content, srcpath){
                        content = content.replace("__iframeUrl__", grunt.option("storageFrameURL") || "");
                        content = content.replace("__iframeID__", grunt.option("storageFrameID") || "");

                        return content;
                    }
                }
            },

            test: {
                src: [
                    'src/intro',
                    'src/config.js',
                    'src/deferred.js',
                    'src/globalStorage.js',
                    'src/outro'
                ],
                dest: 'tests/globalStorage.js',
                options: {
                    process: function(content, srcpath){
                        content = content.replace("__iframeUrl__", "http://localhost:9001/tests/assets/storageFrame.html");
                        return content;
                    }
                }
            }
        },

        copy: {
            dev: {
                files: [
                    { cwd: 'assets', expand: true, src: "storageFrame.html", dest: "build" }
                ],

                options: {
                    process: function(content, srcpath){
                        var storageFrameJS = grunt.file.read('src/storageFrame/storageFrame.js');
                        content = content.replace("__STORAGEFRAMEJS__", storageFrameJS);
                        return content.replace("__DOMAINS__", grunt.option("acceptableOrigins") || "");
                    }
                }
            },

            test: {
                files: [
                    {src: "assets/**/*.*", dest: "tests/"},
                    {src: "src/test/**/*.*", dest: "tests/"}
                ],

                options: {
                    process: function(content, srcpath){

                        // Add the storageFrame javascript into the storageFrame asset
                        var storageFrameJS = grunt.file.read('src/storageFrame/storageFrame.js');
                        content = content.replace("__STORAGEFRAMEJS__", storageFrameJS);

                        // Replace the tokens
                        content = content.replace("__DOMAINS__", "*");
                        content = content.replace(/__DOMAIN_ZERO__/g, "/");
                        content = content.replace(/__DOMAIN_ONE__/g, "/");
                        content = content.replace(/__DOMAIN_TWO__/g, "/");
                        content = content.replace(/__PHANTOM__/g, false);
                        content = content.replace("__FRAME_DOMAIN__", "/");
                        return content;
                    }
                }
            },

            test_phantom: {
                files: [
                    {src: "src/test/test_config.js", dest: "tests/"},
                    {src: "src/test/frame_content.html", dest: "tests/"}
                ],
                options: {
                    process: function(content){
                        content = content.replace(/__PHANTOM__/g, true);
                        content = content.replace(/__FRAME_DOMAIN__/g, "http://localhost:9001/");
                        return content;
                    }
                }
            },

            test_forbidden_frame: {
                files: [
                    { cwd: 'assets', expand: true, src: "storageFrame.html", dest: "tests/assets/forbidden_frame/" }
                ],

                options: {
                    process: function(content, srcpath){
                        var storageFrameJS = grunt.file.read('src/storageFrame/storageFrame.js');
                        content = content.replace("__STORAGEFRAMEJS__", storageFrameJS);
                        return content.replace("__DOMAINS__", "http://www.domain.com");
                    }
                }
            }
        },

        connect: {
            site0: {
                options: {
                    port: 9000,
                    base: './',
                    keepalive: grunt.option("keepalive") || false
                }
            },
            site1: {
                options: {
                    port: 9001,
                    base: './',
                    keepalive: grunt.option("keepalive") || false
                }
            },
            site2: {
                options: {
                    port: 9002,
                    base: './',
                    keepalive: grunt.option("keepalive") || false
                }
            },
            site3: {
                options: {
                    port: 9003,
                    base: './',
                    keepalive: grunt.option("keepalive") || false
                }
            }
        },

        mocha_phantomjs: {
            all: {
                options: {
                    urls: [
                        'http://localhost:9003/tests/src/test/test.html'
                    ]
                }
            }
        },

        watch: {
            test_build: {
                files: ["src/**/*.js", "src/**/*.html"],
                tasks: ['test_build']
            },

            test_phantom: {
                files: ["src/**/*.js", "src/**/*.html"],
                tasks: ['test_phantom']
            }
        },

        jshint: {
            files: "src/*.js"
        }
    });

    grunt.registerTask('default', ['copy', 'concat']);
    grunt.registerTask('test_build', ['jshint', 'copy:test', 'concat:test', 'copy:test_forbidden_frame']);
    grunt.registerTask('test_build_phantom', ['jshint', 'copy:test', 'concat:test', 'copy:test_forbidden_frame', 'copy:test_phantom']);
    grunt.registerTask('test_phantom', ['jshint', 'connect:site1', 'connect:site2', 'connect:site3', 'test_build_phantom', 'mocha_phantomjs']);
    grunt.registerTask('test_server', ['connect:site0']);
    grunt.registerTask('travis', ['test_phantom']);

}
