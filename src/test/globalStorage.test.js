suite('iframe testing', function(){

    test("set 'hello' to 'world'", function(done){
        globalStorage.setItem("hello", "world").done(function(res){
            chai.assert.equal(res, "world");
            done();
        });
    });

    test("get 'hello'", function(done){
        globalStorage.getItem("hello").done(function(res){
            chai.assert.equal(res, "world");
            done();
        });
    });

    test("remove 'hello'", function(done){
        globalStorage.removeItem("hello").done(function(res){
            chai.assert.equal(!res, true);
            done();
        });
    });

    test("get 'hello' is empty", function(done){
        globalStorage.getItem("hello").done(function(res){
            chai.assert.equal(!res, true);
            done();
        });
    });

    test("set 'hello' again", function(done){
        globalStorage.setItem("hello", "whirl").done(function(res){
            chai.assert.equal(res, "whirl");
            done();
        });
    });

});

suite('iframe storage testing on different iframes', function(){
    var getLocalStorage = function(frameRef, key, callback){
        var msg = '{"key": "' + key + '"}';
        var cb = function(e){
            var dataObj = JSON.parse(e.originalEvent.data);
            if(dataObj.value){
                $(window).unbind("message", cb);
                callback(dataObj.value);
            }
        };
        $(window).bind("message", cb);
        $(frameRef)[0].contentWindow.postMessage(msg, "*");

    };

    var setLocalStorage = function(frameRef, key, value, callback){
        var msg = '{"key": "' + key + '", "value": "' + value + '"}';
        var cb = function(e){
            var dataObj = JSON.parse(e.originalEvent.data);
            if(dataObj.value){
                $(window).unbind("message", cb);
                callback(dataObj.value);
            }
        };
        $(window).bind("message", cb);
        $(frameRef)[0].contentWindow.postMessage(msg, "*");
    };

    test('should instantiate an iframe', function(done){
        this.timeout(10000);
        window.ifr1 = $("<iframe>").attr({
            src: (testConfig.domainOne) + "/tests/src/test/frame_content.html"
        });
        $("body").append(ifr1);
        $(window).bind("message", function(e){
            if((!window.ifr1Ready && e.originalEvent.data)=="ready"){
                done();
                window.ifr1Ready = true;
            }
        });
    });

    test('should instantiate a second iframe', function(done){
        this.timeout(10000);
        window.ifr2 = $("<iframe>").attr({
            src: (testConfig.domainTwo) + "/tests/src/test/frame_content.html"
        });
        $("body").append(ifr2);
        $(window).bind("message", function(e){
            if((e.originalEvent.data)=="ready"){ done() }
        });
    });

    test('should set a value to global storage', function(done){
        this.timeout(10000);
        globalStorage.setItem("hello", "world").done(function(){
            getLocalStorage(window.ifr1, 'hello', function(data){
                chai.assert.equal(data, "world");
                done();
            });
        });
    });

    test('test setting a value', function(done){
        this.timeout(10000);
        setLocalStorage(window.ifr2, 'hello', 'whirl', function(data){
            console.log("Finished setting 'hello' to 'whirl'");

            // Wait a bit to avoid race conditions
            setTimeout(done, 100);
        });
    });

    test('test getting the value back', function(done){
        this.timeout(10000);
        getLocalStorage(window.ifr1, 'hello', function(data){
            console.log("Retrieving 'hello' to 'whirl'");
            chai.assert.equal(data, "whirl");
            done();
        });
    });

    test('remove "hello"', function(done){
        this.timeout(10000);
        globalStorage.removeItem("hello").done(done);
    });

    test('check that hello was un-set', function(done){
        this.timeout(10000);
        getLocalStorage(window.ifr2, 'hello', function(data){
            console.log("UNSET VALUE: " + data);
            chai.assert.equal(JSON.parse(data), null);
            done();
        });
    });

});
