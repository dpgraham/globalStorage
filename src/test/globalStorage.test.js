suite('iframe storage testing', function(){
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


});
