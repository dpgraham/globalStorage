/**
 * Config object. Whitelist the acceptable domains.
 * @type {{domain: string}}
 */
var config = {
    acceptableOrigin: "__DOMAINS__"
}

/**
 * StorageFrame.js
 *
 * This is the Javascript that is inlined into a script tag in 'assets/storageFrame.html'
 */

// Throw an exception if no targetOrigin was provided
if(!config.acceptableOrigin){
    throw "You must provide a targetOrigin in the storageFrame";
}

// Send a generic ping message to the parent announcing that the iframe is ready
window.parent.postMessage("ping", "*");

var acceptableOrigins = config.acceptableOrigin.split(",");

/**
 * Is the origin in our approved list?
 */
function isAcceptableOrigin(origin){
    if(acceptableOrigins[0]=="*"){
        return true;
    }

    var domain = origin.replace(/^https?:\/\/|:\d{1,4}$/g, "").toLowerCase();

    for(var i=0; i<acceptableOrigins.length; i++){
        if(domain===acceptableOrigins[i]){
            return true;
        }
    }
    return false;
}

// Bind to the onMessage calllback
window.onmessage = function(e){

    if(!isAcceptableOrigin(e.origin)){
        window.parent.postMessage("ACCESS_DENIED", e.origin);
        return;
    }

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
            window.parent.postMessage(JSON.stringify(res), e.origin);

        } else if(data.type==="SET"){

            // Set request. Set the value and send back a message.
            localStorage.setItem(data.key, data.value);
            res.value = data.value;
            window.parent.postMessage(JSON.stringify(res), e.origin);

        } else if(data.type==="REMOVE"){

            // Remove request
            localStorage.removeItem(data.key);
            window.parent.postMessage(JSON.stringify(res), e.origin);
        }
    }
}
