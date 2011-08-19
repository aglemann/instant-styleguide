var http = require('http');
var fs = require('fs');
var path = require('path');
var tmpl = require('./tmpl.js');
var css2html = require('./css2html.js');

var httpserver = http.createServer(listener);
httpserver.listen(8124, '127.0.0.1');

function listener(request, response){
	var pwd = path.resolve();		
	var url = require('url').parse(request.url, true);	
	var pathname = pwd + url.pathname;
	var code = 200;
	var file;
	
	if (path.existsSync(pathname)){
		var stats = fs.statSync(pathname);
		
		if (stats.isFile()){
			console.log(stats);
			
			file = fs.readFileSync(pathname, 'utf8');

			if (/\.css$/.test(url.pathname) && !url.query.raw){
				var template = fs.readFileSync('stylesheet.tmpl', 'utf8');
				var style = url.pathname.replace(/.*?([^\/]+)\.css$/, '$1');			
				file = tmpl(template, { html: css2html(file, { label: '.c2g-label', out: 'html', wrap: '.c2g-rule' }), style: style, url: request.url });
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
			var template = fs.readFileSync('index.tmpl', 'utf8');
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
		var template = fs.readFileSync('404.tmpl', 'utf8');
		file = tmpl(template, { url: url.pathname });
		code = 404;
	}
	
	response.writeHead(code);
	response.end(file);
}