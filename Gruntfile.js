module.exports = function(grunt){
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
                    'src/test/deferred.test.js',
                    'src/test/globalStorage.test.js',
                    'src/outro'
                ],
                dest: 'tests/globalStorage.test.js',
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
                    {
                        cwd: 'assets',
                        expand: true,
                        src: "storageFrame.html",
                        dest: "build"
                    }
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
                    {
                        cwd: 'assets',
                        expand: true,
                        src: "storageFrame.html",
                        dest: "tests"
                    }
                ],

                options: {
                    process: function(content, srcpath){
                        var storageFrameJS = grunt.file.read('src/storageFrame/storageFrame.js');
                        content = content.replace("__STORAGEFRAMEJS__", storageFrameJS);
                        return content.replace("__DOMAINS__", "*");
                    }
                }
            }
        }
    })

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['copy', 'concat']);
}
