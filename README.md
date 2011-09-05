Instant Styleguide
===

Drop into the docroot of your CSS, run with [node.js](http://nodejs.org/) and browse your CSS stylesheets as an HTML styleguide.

### Setup

Install with Node Package Manager ([npm](http://npmjs.org/)):

    $ npm install instant-styleguide

Create a javascript in the docroot of your CSS with the following:

    var instaguide = require('instant-styleguide');
	instaguide();

Run with node.js:

    $ node name_of_above_file.js

A message should appear:

	Server listening on http://localhost:8124

If you open that URL in your browser you should now be able to browser your CSS.

### Options