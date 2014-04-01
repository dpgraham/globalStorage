[![Build Status](https://travis-ci.org/dpgraham/globalStorage.svg?branch=master)](https://travis-ci.org/dpgraham/globalStorage)

globalStorage
=============

Utilizes postMessage API and localStorage to allow storage across domains



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

globalStorage has three methods.

1) setItem(key, value)

2) getItem(key)

3) removeItem(key)

These methods work the same way as localStorage, expect that they are asynchronous

The three methods all return a 'deferred' object (similar to jQuery.deferred)


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

-'acceptableOrigin' needs to whitelist the domains that you will accept messages from (comma separated list)

**Warning** If you set 'acceptableOrigin' to '*' you will be making the data available to ANY DOMAIN. Do this at your own risk.


Once you've finished configuring these assets you need to host the iframe and then start using 'globalStorage.js' in your web pages