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


Getting Started
=============

To use this library requires some configuration.

At the top of 'build/globalStorage.js' there is a variable called 'config' that needs to be edited.

-'storageFrameURL' needs to point to the URL that you plan on hosting the storageFrame document. (In production, this should
be a fully qualified URL, otherwise it won't work across different domains in which case, you might as well just use localStorage)
-'storageFrameID' needs to point to an iframe element that has the storageFrame document

(You only need to set 1 of these 2 variables. If you set both, it will default to 'storageFrameID' but then fallback
to 'storageFrameURL' if the script can't find the element in the document)


At the top of