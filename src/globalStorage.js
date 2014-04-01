/**
 * Constructor for globalStorage object
 * @param params
 * @constructor
 */
GlobalStorage = function(params){

    this._storageFrameID = params.storageFrameID; // Reference to ID of storageFrame
    this._storageFrameURL = params.storageFrameURL; // Reference to URL of storage frame
    this._transactionID = 0; // Each transaction needs an ID
    this._transactions = {}; // Caches all transactions
    this._bindStorageFrameMessage(); // Bind the HTML5 iframe onmessage event
    this._bindDocumentReady(); // Bind the documentReady event
};

/**
 * Bind the document ready event. This was mostly lifted from JQuery
 * @private
 */
GlobalStorage.prototype._bindDocumentReady = function(){

    // If the document was already loaded, fire the document ready function
    if(document.readyState=="complete"){
        this._onDocumentReady();
        return;
    }

    // Mozilla, Opera, Webkit, Modern IE browsers. Bind to 'DOMContentLoaded' event.
    if ( document.addEventListener ) {

        // Use the handy event callback
        document.addEventListener( "DOMContentLoaded", function(ctx){
            return function(){
                document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
                ctx._onDocumentReady();
            };
        }(this), false );

    } else if ( document.attachEvent ) {

        // Bind to onreadyStateChange event for IE
        document.attachEvent("onreadystatechange", function(ctx){
            return function(){
                if ( document.readyState === "complete" ) {
                    document.detachEvent( "onreadystatechange", arguments.callee );
                    ctx._onDocumentReady();
                }
            };
        }(this));

        // If IE and not an iframe continually check to see if the document is ready
        if ( document.documentElement.doScroll && window == window.top ) (function(ctx){
            return function(){
                if ( ctx._documentReady ) return;

                try {
                    // If IE is used, use the trick by Diego Perini
                    // http://javascript.nwbox.com/IEContentLoaded/
                    document.documentElement.doScroll("left");
                } catch( error ) {
                    setTimeout( arguments.callee, 0 );
                    return;
                }

                // and execute any waiting functions
                ctx._onDocumentReady();
            };
        })();
    }

    // Fallback to window.onload, which will always work
    window.onload = function(ctx){
        return function(){
            ctx._onDocumentReady();
        };
    }(this);
};

/**
 * Bind to the onmessage event
 * @private
 */
GlobalStorage.prototype._bindStorageFrameMessage = function(){

    // Bind the 'onmessage' callback
    if (window.addEventListener) {

        // Modern browsers
        window.addEventListener('message', function(ctx){
            return function(e) {
                if(e.source==ctx.iframeRef.contentWindow){
                    ctx._onStorageFrameMessage(e.data);
                }
            };
        }(this));

    } else {

        // IE8
        window.attachEvent('onmessage', function(ctx){
            return function(e) {
                if(e.source==ctx.iframeRef.contentWindow){
                    ctx._onStorageFrameMessage(e.data);
                }
            };
        }(this));
    }

    // If the iframeRef is there and has a contentWindow, send it a beacon
    if(this.iframeRef && this.iframeRef.contentWindow){
        this.iframeRef.contentWindow.postMessage("ping", this._targetOrigin);
    }
};

/**
 * Callback when document is ready
 * @private
 */
GlobalStorage.prototype._onDocumentReady = function(){

    // Don't call this twice
    if(this._documentReady){
        return;
    }
    this._documentReady = true;

    // Get a reference to the iframe element
    if(this._storageFrameID){
        this.iframeRef = document.getElementById(this._storageFrameID);
    }

    // If the iframeID was not provided or is invalid, build our own iframe
    if(!this.iframeRef){

        // If no storageFrameURL was provided, throw an exception
        if(!this._storageFrameURL){
            throw "You must provide a valid url for the storage frame or an id pointing to an iframe with the storage frame";
        }

        // Create the iframe and append it to the body
        this.iframeRef = document.createElement("iframe");
        this.iframeRef.src = this._storageFrameURL;
        this.iframeRef.style.display = "none";
        document.body.appendChild(this.iframeRef);
    }

    // Callback that gets fired if the storageFrame fails to load in time
    var onFail = function(ctx){
        return function(){

            // Don't call this more than once.
            if(ctx.ready || ctx._onFailCalled){
                return;
            }
            ctx._onFailCalled = true;

            // Fire the error callbacks for any pending transactions
            for(var transaction in ctx._transactions){
                transaction = ctx._transactions[transaction];
                transaction.deferred.rejected("Timed out waiting for storageFrame to load");
            }

            // Flag that globalStorage is unusable
            ctx._fail = true;
        };
    }(this);

    window.onbeforeunload = onFail;
};

/**
 * Handler for receiving a message from storage frame
 * @param data
 * @private
 */
GlobalStorage.prototype._onStorageFrameMessage = function(data){

    // We received a message from the iframe (doesn't matter the content of the message). Call storageFrameReady()
    this._onStorageFrameReady();

    // Don't do anything if it's a ping.
    if(data.indexOf("ping")===0){
        return;
    } else {
        try {

            // Parse the data
            var res = JSON.parse(data);

            // Get the corresponding transaction
            var transaction = this._transactions[res.id];

            // Fulfil the deferred that was made on the transaction
            if(res.type==="GET"){
                transaction.deferred.resolved(res.value);
            } else if(res.type==="SET" || res.type==="REMOVE"){
                transaction.deferred.resolved(res.value);
            }

            // Null out the transaction
            this._transactions[id] = null;

        } catch(e){

        }
    }
};

/**
 * Callback when the storageFrame is ready
 * @param data
 * @private
 */
GlobalStorage.prototype._onStorageFrameReady = function(data){
    // Don't call this twice
    if(this._storageFrameReady)
        return;

    this._storageFrameReady = true;

    // Call checkReady to see if the storageFrame and document are both ready
    this._checkReady();
};

/**
 * Checks if the document is ready and the storageFrame is ready before firing the ready event
 * @private
 */
GlobalStorage.prototype._checkReady = function(){

    // Are the storageFrame and the document ready? Then proceed.
    if(this._storageFrameReady && this._documentReady){
        this._onReady();
    }
};

/**
 * Fired when the storageFrame is ready and the document is ready.
 * @private
 */
GlobalStorage.prototype._onReady = function(){

    // Flag that we're ready to communicate with the iframe
    this.ready = true;

    // Get the target origin (using the 'anchor tag' hack)
    var iframeAsAnchor = document.createElement("a");
    iframeAsAnchor.href = this.iframeRef.src;
    this._targetOrigin = iframeAsAnchor.protocol + "//" + iframeAsAnchor.host;


    // Fire off any pending transactions
    var doneCallback = function(deferred){
        return function(result){
            deferred.resolved(result);
        };
    };

    for(var transaction in this._transactions){
        transaction = this._transactions[transaction];

        if(transaction.type==="SET"){
            this.setItem(transaction.key, transaction.value).done(doneCallback(transaction.deferred));

        } else if(transaction.type==="GET"){
            this.getItem(transaction.key).done(doneCallback(transaction.deferred));

        } else if(transaction.type==="REMOVE"){
            this.removeItem(transaction.key).done(doneCallback(transaction.deferred));
        }

        this._transactions[transaction] = null;
    }
};

/**
 * Similar to localStorage 'setItem'
 * @param key
 * @param value
 * @returns {Deferred}
 */
GlobalStorage.prototype.setItem = function(key, value){
    var ret = new Deferred();

    // Add this to the transaction queue
    this._transactions[++this._transactionID] = {
        type: "SET",
        key: key,
        value: value,
        deferred: ret
    };

    // If the storageFrame is ready, post the message now, otherwise
    // this will be fired later
    if(this.ready){
        this.iframeRef.contentWindow.postMessage(JSON.stringify({
            type: "SET",
            key: key,
            value: value,
            id: this._transactionID
        }), this._targetOrigin);
    }

    return ret;
};

/**
 * Similar to localStorage getItem
 * @param key
 * @returns {Deferred}
 */
GlobalStorage.prototype.getItem = function(key){
    var ret = new Deferred();

    // Add this to the transaction queue
    this._transactions[++this._transactionID] = {
        type: "GET",
        key: key,
        deferred: ret
    };

    // If the storageFrame is ready, post the message now, otherwise
    // this will be fired later
    if(this.ready){
        this.iframeRef.contentWindow.postMessage(JSON.stringify({
            type: "GET",
            key: key,
            id: this._transactionID
        }), this._targetOrigin);
    }

    return ret;
};

/**
 * Similar to localStorage removeItem
 * @param key
 * @returns {Deferred}
 */
GlobalStorage.prototype.removeItem = function(key){
    var ret = new Deferred();

    // Add this to the transaction queue
    this._transactions[++this._transactionID] = {
        type: "REMOVE",
        key: key,
        deferred: ret
    };

    // If the storageFrame is ready, post the message now, otherwise
    // this will be fired later
    if(this.ready){
        this.iframeRef.contentWindow.postMessage(JSON.stringify({
            type: "REMOVE",
            key: key,
            id: this._transactionID
        }), this._targetOrigin);
    }

    return ret;
};

// Does this browesr support localStorage and postMessage
GlobalStorage.isSupported = !!window.localStorage && !!window.postMessage;


// Export a globalStorage singleton to window only if it's supported in this browser
if(GlobalStorage.isSupported){
    window.globalStorage = new GlobalStorage(config);
}
