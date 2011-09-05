var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	tmpl = require('./lib/tmpl.js'),
	css2html = require('./lib/css2html.js');

var options = {
	host: 'localhost',
	port: 8124,
	reset: '/css/normalize.css'
}

function listener(request, response){
	var pwd = path.resolve(),
		url = require('url').parse(request.url, true),
		pathname = pwd + unescape(url.pathname),
		returns;
	
	if (path.existsSync(pathname)){
		var stats = fs.statSync(pathname);
		
		if (stats.isFile()){
			if (/\.(gif|jpg|png)$/.test(url.pathname)){
				fs.createReadStream(pathname, { flags: 'r', mode: 0666, bufferSize: 4 * 1024})
					.addListener('data', function(chunk){
						response.write(chunk, 'binary');
					})
					.addListener('close',function(){
						response.end();
					});
				return;
			}
			
			returns = handleFile(url, pathname);
		}
		else {
			returns = handleListing(url, pathname);
		}
	}
	else
		returns = handleNotFound(url);
	
	response.writeHead(returns.code || 200);
	response.end(returns.file);
}

function getTemplate(templateName){
	var pwd = path.resolve(),
		pathToTemplate = path.existsSync(pwd + '/' + templateName) ? pwd + '/' + templateName
			: path.resolve(__dirname, './tmpl/' + templateName);
		
	return fs.readFileSync(pathToTemplate, 'utf8');
}

function handleFile(url, pathname){
	var file = fs.readFileSync(pathname, 'utf8');

	if (/\.css$/.test(url.pathname) && !url.query.raw){
		var template = getTemplate('stylesheet.tmpl');
			style = unescape(url.pathname).replace(/.*?([^\/]+)\.css$/, '$1');			
		file = tmpl(template, { html: css2html(file, { expand: options.expand, out: 'html', populate: true, tags: options.tags }), reset: options.reset, style: style, url: url.pathname });
	}
	
	return { file: file };
}

function handleListing(url, pathname){
	var template = getTemplate('index.tmpl');
		stats = fs.statSync(pathname),
		ls = fs.readdirSync(pathname),
		listing = [];

	for (var i in ls){
		var name = ls[i],
			stats = fs.statSync(path.normalize(pathname + '/' + name)),
			uri = url.pathname == '/' ? name : url.pathname + '/' + name;
		listing.push({ name: name, ctime: stats.ctime, size: stats.size, uri: uri });
	}

	return { file: tmpl(template, { listing: listing, url: url.pathname }) };
}

function handleNotFound(url){
	var code = 200, file;
	
	if (url.pathname == options.reset){
		var pathname = path.resolve(__dirname, '.' + url.pathname);
		if (path.existsSync(pathname))
			file = fs.readFileSync(pathname, 'utf8');
	}
	
	if (!file){
		code = 404;
		var template = getTemplate('404.tmpl');
		file = tmpl(template, { url: url.pathname });
	}
	
	return { code: code, file: file };
}

function setOptions(opts){
	for (var i in opts){
		options[i] = opts[i];
	}
}

module.exports = function(opts){
	setOptions(opts || {});
	
	var httpserver = http.createServer(listener);
	httpserver.listen(options.port, options.host);

	console.log('Server listening on http://' + options.host + ':' + options.port);
}