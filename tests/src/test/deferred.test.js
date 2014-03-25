asyncTest("done and fail called when resolved or rejected", function(){
    expect(0);
    done = start;
    var def1 = new Deferred();
    def1.done(done);
    def1.resolved();
});

asyncTest("", function(){

    expect(0);
    done = start;
    var def1 = new Deferred();
    def1.fail(done);
    def1.rejected();

});

asyncTest("", function(){

    expect(2);
    var def = new Deferred();
    window.testValueOne = 0;
    var cb1 = function(){
        equal(window.testValueOne++, 0, "first callback it should equal 0");
    }
    var cb2 = function(){
        equal(window.testValueOne++, 1, "first callback it should equal 1");
    }
    def.done(cb1).done(cb2);
    setTimeout(function(def, done){
        var val = 0;
        return function(){
            def.resolved();
            start();
        }
    }(def, done), 100);
});