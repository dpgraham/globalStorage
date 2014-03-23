module.exports = function(grunt){

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-qunit');

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
                        content = content.replace("__iframeUrl__", "/tests/assets/storageFrame.html");
                        return content;
                    }
                }
            },

            test_phantom: {
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
                        content = content.replace("__iframeUrl__", "storageFrame.html");
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

                        return content;
                    }
                }
            },

            test_phantom: {
                files: [
                    {src: "assets/**/*.*", dest: "tests/"},
                    {expand: false, src: "src/test/*.*", dest: "tests/"}
                ],

                options: {
                    process: function(content, srcpath){
                        var storageFrameJS = grunt.file.read('src/storageFrame/storageFrame.js');
                        content = content.replace("__STORAGEFRAMEJS__", storageFrameJS);

                        content = content.replace("__DOMAINS__", "*");
                        content = content.replace("__DOMAIN_ZERO__", "http://localhost:9000/");
                        content = content.replace("__DOMAIN_ONE__", "http://localhost:9001/");
                        content = content.replace("__DOMAIN_TWO__", "http://localhost:9002/");
                        return content;
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
                    base: './'
                }
            },
            site2: {
                options: {
                    port: 9002,
                    base: './'
                }
            }
        },

        qunit: {
            all: ["./tests/test.html"]
        },

        watch: {
            test_build: {
                files: ["src/**/*.js", "src/**/*.html"],
                tasks: ['test_build']
            }
        }
    });

    grunt.registerTask('default', ['copy', 'concat']);
    grunt.registerTask('test_phantom', ['connect', 'copy:test_phantom', 'concat:test_phantom', 'qunit']);
    grunt.registerTask('test_build', ['copy:test', 'concat:test']);
    grunt.registerTask('test_server', ['connect:site0']);
    grunt.registerTask('watchTest', []);

}
