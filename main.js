(function() {
    var http = require('http'),
    	fs = require('fs'),
    	path = require('path'),
    	tmpl = require('./lib/tmpl.js'),
    	css2html = require('./lib/css2html.js'),
    	contentTypes = require('./lib/contentTypes.js');

	var defaults = {
	    debug: true,
    	host: 'localhost',
    	port: 8124
	}
    
	module.exports = function(options) {
	    options || (options = {});
		for (var prop in options) {
            if (options[prop] !== void 0) defaults[prop] = options[prop];
        }
    	var httpserver = http.createServer(listener);
    	httpserver.listen(defaults.port, defaults.host);
    	console.log('Server listening on http://' + defaults.host + ':' + defaults.port);
	}
	
    // listener
    // --------------
    // The engine for our little webserver. Returns one of: directory listing, 404 or generated styleguide.
	function listener(request, response) {
    	var pwd = path.resolve(),
    		url = require('url').parse(request.url, true),
    		isResource = /^\/resources/.test(url.pathname),
    		pathname = isResource ? path.resolve(__dirname, '.' + url.pathname)
                : pwd + unescape(url.pathname),
    		returns;
    	if (path.existsSync(pathname)) {
    		var stats = fs.statSync(pathname);
    		if (stats.isFile()) {
    			var ext = path.extname(url.pathname).substr(1);
    			if (ext === 'css' && !url.query.raw && !isResource) {
    				returns = handleStyleSheet(url, pathname);
    			}
    			else {
    				response.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    				response.writeHead(200);
    				fs.createReadStream(pathname, { flags: 'r', mode: 0666, bufferSize: 4 * 1024})
    					.addListener('data', function(chunk) {
    						response.write(chunk, 'binary');
    					})
    					.addListener('close',function() {
    						response.end();
    					});
    				return;
    			}
    		}
    		else {
    			returns = handleListing(url, pathname);
    		}
    	}
    	else {
    		returns = handleNotFound(url);
    	}
    	response.setHeader('Content-Type', 'text/html');
    	response.writeHead(returns.code || 200);
    	response.end(returns.file);
    }
    
    // getTemplate
    // --------------
    // Looks for a Javascript template (.jst) first in the current directory where instaguide is executing,
    // or in the resources folder of the instaguide node module.
    function getTemplate(templateName) {
    	var pwd = path.resolve(),
    		pathToTemplate = path.existsSync(pwd + '/' + templateName) ? pwd + '/' + templateName
    			: path.resolve(__dirname, './resources/' + templateName);
    	return fs.readFileSync(pathToTemplate, 'utf8');
    }

    // handleListing
    // --------------
    // Returns the template for an index.html directory listing.
    function handleListing(url, pathname) {
    	var template = getTemplate('index.jst');
    		ls = fs.readdirSync(pathname),
    		listing = [];
        ls.forEach(function(name) {
    		var stats = fs.statSync(path.normalize(pathname + '/' + name)),
    			uri = url.pathname == '/' ? name : url.pathname + '/' + name;
    		listing.push({ name: name, ctime: stats.ctime, size: stats.size, uri: uri });
        });
    	return { file: tmpl(template, { listing: listing, url: url.pathname }) };
    }

    // handleStyleSheet
    // --------------
    // This does all the magic. Reads in the stylesheet, uses css2html to convert the rules to nodes, 
    // renders to a new template with the stylesheet applied to the generated HTML.
    function handleStyleSheet(url, pathname) {
    	var css = fs.readFileSync(pathname, 'utf8'),
    		template = getTemplate('stylesheet.jst');
    		style = unescape(path.basename(url.pathname, '.css')),
    		options = { dataAttr: true, debug: defaults.debug, out: 'html', populate: true };
    	file = tmpl(template, { html: css2html(css, options), style: style, url: url.pathname });
    	return { file: file };
    }

    // handleNotFound
    // --------------
    // Returns the template for a 404.
    function handleNotFound(url) {
    	var template = getTemplate('404.jst'),	
    		file = tmpl(template, { url: url.pathname });
    	return { code: 404, file: file };
    }
}).call(this);