globalStorage
=============

Utilizes postMessage API and localStorage to allow storage across domains

Still in development. Not currently ready for production.


About
=============

This project provides a workaround for localStorage's same domain restriction by making use of HTML 5's postMessage API.

There are two files in build/ that accomplish this "globalStorage.js" and "storageFrame.html". globalStorage is a javascript
file that exports a variable to the window namespace called 'globalStorage'. You can call 'setItem' and 'getItem' (just
like localStorage) but instead of setting values inside the current domain, it communicates with 'storageFrame.html' and
sets it in that iframe's domain's localStorage.

What this means is that if you deploy these assets across multiple domains, they will all be able to access the same data.


Usage
=============

globalStorage has two methods.

1) setItem(key, value)

2) getItem(key)

These methods work the same way as localStorage, but with one important difference. localStorage is synchronous, globalStorage
is asynchronous (a synchronous solution is impossible)

'setItem' and 'getItem' both return a 'deferred' object (similar to jQuery.deferred, but pared down)

The deferred object has 4 methods that can be called on it.

1) done(callback): This adds a callback to a queue of callbacks that are executed as soon as the method has been resolved.
2) fail(callback): This adds a callback to a queue of callbacks that are executed as soon as the method has been rejected.
3) resolved(): This announces that the method has been resolved and fires all of the callbacks. You typically shouldn't be calling this method, it's meant to be used internally.
3) rejected(): This announces that the method has been rejected and fires all of the callbacks. You typically shouldn't be calling this method, it's meant to be used internally.


Sample Code:

setItem("hello", "world")
getItem("hello").done(function(value){ console.log(value) })

The console output will be: world




Getting Started
=============

Using this library requires some configuration.

At the top of 'build/globalStorage.js' there is a variable called 'config' that needs to be edited.

-'storageFrameURL' needs to point to the URL that you plan on hosting the storageFrame document. (In production, this should
be a fully qualified URL, otherwise it won't work across different domains)
-'storageFrameID' needs to point to an iframe element that uses the storageFrame document.

(You only need to set 1 of these 2 variables. If you set both, it will default to 'storageFrameID' but then fallback
to 'storageFrameURL' if the script can't find the element in the document)


At the top of 'build/storage.HTML' there is also a 'config' that needs to be edited.

-'targetOrigin' needs to whitelist the domains that you will accept messages from (see https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage
for explanation of how targetOrigin works)

**Warning** If you set 'targetOrigin' to '*' you will be making the data available to ANY DOMAIN. Do this at your own risk.


Now that you've finished configuring these assets you just need to host the iframe (wherever you specified the storageFrameURL) and then tag your webpages
with the globalStorage.js and optionally add an iframe tag