var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	tmpl = require('./lib/tmpl.js'),
	css2html = require('./lib/css2html.js');

var options = {
	host: 'localhost',
	port: 8124,
	reset: ''
}

function listener(request, response){
	var pwd = path.resolve();		
	var url = require('url').parse(request.url, true);	
	var pathname = pwd + unescape(url.pathname);
	var code = 200;
	var file;
	
	console.log(pathname);
	
	if (path.existsSync(pathname)){
		var stats = fs.statSync(pathname);
		
		if (stats.isFile()){
			file = fs.readFileSync(pathname, 'utf8');

			if (/\.css$/.test(url.pathname) && !url.query.raw){
				var template = fs.readFileSync(path.resolve(__dirname, './tmpl/stylesheet.tmpl'), 'utf8');
				var style = unescape(url.pathname).replace(/.*?([^\/]+)\.css$/, '$1');			
				file = tmpl(template, { html: css2html(file, { expand: options.expand, out: 'html', populate: true, tags: options.tags }), reset: options.reset, style: style, url: request.url });
				response.setHeader('Content-Type', 'text/html');
			}
			
			if (/\.(gif|jpg|png)$/.test(url.pathname)){
				fs.createReadStream(pathname, { flags: 'r', mode: 0666, bufferSize: 4 * 1024})
					.addListener('data', function(chunk){
						response.write(chunk, 'binary');
					})
					.addListener('close',function() {
						response.end();
					});
				return;
			}
			
		}
		else {
			var template = fs.readFileSync(path.resolve(__dirname, './tmpl/index.tmpl'), 'utf8');
			var ls = fs.readdirSync(pathname);					
			var listing = [];

			for (var i in ls){
				var name = ls[i];
				var stats = fs.statSync(path.normalize(pathname + '/' + name));
				var uri = url.pathname == '/' ? name : url.pathname + '/' + name;
				listing.push({ name: name, ctime: stats.ctime, size: stats.size, uri: uri });
			}

			file = tmpl(template, { listing: listing, url: url.pathname });
		}		
	}
	else {
		var template = fs.readFileSync(path.resolve(__dirname, './tmpl/404.tmpl'), 'utf8');
		file = tmpl(template, { url: url.pathname });
		code = 404;
	}
	
	response.writeHead(code);
	response.end(file);
}

module.exports = function(opts){
	opts = opts || {};
	for (var i in opts)
		if (opts[i])
			options[i] = opts[i];
	
	var httpserver = http.createServer(listener);
	httpserver.listen(options.port, options.host);

	console.log('Server listening on http://' + options.host + ':' + options.port);
}