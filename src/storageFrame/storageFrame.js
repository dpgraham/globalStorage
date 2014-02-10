/**
 * Config object. Whitelist the acceptable domains.
 * @type {{domain: string}}
 */
var config = {
    targetOrigin: "__DOMAINS__"
}

/**
 * StorageFrame.js
 *
 * This is the Javascript that is inlined into a script tag in 'assets/storageFrame.html'
 */

// Throw an exception if no targetOrigin was provided
if(!config.targetOrigin){
    throw "You must provide a targetOrigin in the storageFrame"
}

// Send a generic ping message to the parent announcing that the iframe is ready
window.parent.postMessage("ping", config.targetOrigin);

// Bind to the onMessage calllback
window.onmessage = function(e){

    // If it's a ping message, just send a ping message back to it
    if(e.data.indexOf("ping")===0){

        window.parent.postMessage("ping", config.targetOrigin);

    } else{

        // Otherwise, parse the data (it's expected to be in JSON form)
        var data = JSON.parse(e.data);

        // Create the result object that is sent back
        var res = {};
        res.id = data.id;
        res.type = data.type;

        if(data.type==="GET"){

            // Get request. Get the result from localStorage and send it back.
            res.value = localStorage.getItem(data.key);
            window.parent.postMessage(JSON.stringify(res), config.targetOrigin);

        } else if(data.type==="SET"){

            // Set request. Set the value and send back a message.
            localStorage.setItem(data.key, data.value);
            window.parent.postMessage(JSON.stringify(res), config.targetOrigin);
        } else if(data.type==="REMOVE"){

            // Remove request
            localStorage.removeItem(data.key);
            window.parent.postMessage(JSON.stringify(res), config.targetOrigin);
        }
    }
}
