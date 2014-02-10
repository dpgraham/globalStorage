describe("done and fail called when resolved or rejected", function(){
    it("done should get called when resolved", function(done){
        var def1 = new Deferred();
        def1.done(done);
        def1.resolved();
    })

    it("fail should get called when resolved", function(done){
        var def1 = new Deferred();
        def1.fail(done);
        def1.rejected();
    })

    it("done callbacks should be called in order", function(done){
        var def = new Deferred();
        window.testValueOne = 0;
        var cb1 = function(){
            assert.equal(window.testValueOne++, 0);
        }
        var cb2 = function(){
            assert.equal(window.testValueOne++, 0);
        }
        def.done(cb1).done(cb2);
        setTimeout(function(def){
            var val = 0;
            return function(){
                def.resolved();
                done();
            }
        }(def), 100);
    })
})