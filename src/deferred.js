/**
 * Deferred object that behaves similarly to jQuery deferred
 * @constructor
 */
var Deferred = function(){
    this._doneCallbacks = [];
    this._failCallbacks = [];
};

/**
 * Pushes a callback to the callback queue.
 * @param cb {Function} Callback
 */
Deferred.prototype.done = function(cb){
    this._doneCallbacks[this._doneCallbacks.length] = cb;
    return this;
};

/**
 * Trigger that the deferred is 'fulfilled' and execute all the callbacks in the queue
 * @param result
 */
Deferred.prototype.resolved = function(result){
    for(var i=0; i<this._doneCallbacks.length; i++){
        this._doneCallbacks[i](result);
    }

    this._doneCallbacks = [];
};

/**
 * Pushes a fail callback to the callback queue.
 * @param cb {Function} Callback
 */
Deferred.prototype.fail = function(cb){
    this._failCallbacks[this._failCallbacks.length] = cb;
    return this;
};

/**
 * Trigger that the deferred is 'failed' and execute all the fail callbacks in the queue
 * @param result
 */
Deferred.prototype.rejected = function(errorMsg){
    for(var i=0; i<this._failCallbacks.length; i++){
        this._failCallbacks[i](errorMsg);
    }

    this._failCallbacks = [];
};


