var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	tmpl = require('./lib/tmpl.js'),
	css2html = require('./lib/css2html.js');

var options = {
	host: 'localhost',
	port: 8124,
	reset: '/css/normalize.css'
};

var contentTypes = {
	'aiff': 'audio/x-aiff',
	'arj': 'application/x-arj-compressed',
	'asf': 'video/x-ms-asf',
	'asx': 'video/x-ms-asx',
	'au': 'audio/ulaw',
	'avi': 'video/x-msvideo',
	'bcpio': 'application/x-bcpio',
	'ccad': 'application/clariscad',
	'cod': 'application/vnd.rim.cod',
	'com': 'application/x-msdos-program',
	'cpio': 'application/x-cpio',
	'cpt': 'application/mac-compactpro',
	'csh': 'application/x-csh',
	'css': 'text/css',
	'deb': 'application/x-debian-package',
	'dl': 'video/dl',
	'doc': 'application/msword',
	'drw': 'application/drafting',
	'dvi': 'application/x-dvi',
	'dwg': 'application/acad',
	'dxf': 'application/dxf',
	'dxr': 'application/x-director',
	'eot': 'application/vnd.ms-fontobject',
	'etx': 'text/x-setext',
	'ez': 'application/andrew-inset',
	'fli': 'video/x-fli',
	'flv': 'video/x-flv',
	'gif': 'image/gif',
	'gl': 'video/gl',
	'gtar': 'application/x-gtar',
	'gz': 'application/x-gzip',
	'hdf': 'application/x-hdf',
	'hqx': 'application/mac-binhex40',
	'htc': 'text/x-component',
	'html': 'text/html',
	'ice': 'x-conference/x-cooltalk',
	'ief': 'image/ief',
	'igs': 'model/iges',
	'ips': 'application/x-ipscript',
	'ipx': 'application/x-ipix',
	'jad': 'text/vnd.sun.j2me.app-descriptor',
	'jar': 'application/java-archive',
	'jpeg': 'image/jpeg',
	'jpg': 'image/jpeg',
	'js': 'text/javascript',
	'json': 'application/json',
	'latex': 'application/x-latex',
	'lsp': 'application/x-lisp',
	'lzh': 'application/octet-stream',
	'm': 'text/plain',
	'm3u': 'audio/x-mpegurl',
	'man': 'application/x-troff-man',
	'me': 'application/x-troff-me',
	'midi': 'audio/midi',
	'mif': 'application/x-mif',
	'mime': 'www/mime',
	'movie': 'video/x-sgi-movie',
	'mp4': 'video/mp4',
	'mpg': 'video/mpeg',
	'mpga': 'audio/mpeg',
	'ms': 'application/x-troff-ms',
	'nc': 'application/x-netcdf',
	'oda': 'application/oda',
	'ogm': 'application/ogg',
	'pbm': 'image/x-portable-bitmap',
	'pdf': 'application/pdf',
	'pgm': 'image/x-portable-graymap',
	'pgn': 'application/x-chess-pgn',
	'pgp': 'application/pgp',
	'pm': 'application/x-perl',
	'png': 'image/png',
	'pnm': 'image/x-portable-anymap',
	'ppm': 'image/x-portable-pixmap',
	'ppz': 'application/vnd.ms-powerpoint',
	'pre': 'application/x-freelance',
	'prt': 'application/pro_eng',
	'ps': 'application/postscript',
	'qt': 'video/quicktime',
	'ra': 'audio/x-realaudio',
	'rar': 'application/x-rar-compressed',
	'ras': 'image/x-cmu-raster',
	'rgb': 'image/x-rgb',
	'rm': 'audio/x-pn-realaudio',
	'rpm': 'audio/x-pn-realaudio-plugin',
	'rtf': 'text/rtf',
	'rtx': 'text/richtext',
	'scm': 'application/x-lotusscreencam',
	'set': 'application/set',
	'sgml': 'text/sgml',
	'sh': 'application/x-sh',
	'shar': 'application/x-shar',
	'silo': 'model/mesh',
	'sit': 'application/x-stuffit',
	'skt': 'application/x-koan',
	'smil': 'application/smil',
	'snd': 'audio/basic',
	'sol': 'application/solids',
	'spl': 'application/x-futuresplash',
	'src': 'application/x-wais-source',
	'stl': 'application/SLA',
	'stp': 'application/STEP',
	'sv4cpio': 'application/x-sv4cpio',
	'sv4crc': 'application/x-sv4crc',
	'swf': 'application/x-shockwave-flash',
	'tar': 'application/x-tar',
	'tcl': 'application/x-tcl',
	'tex': 'application/x-tex',
	'texinfo': 'application/x-texinfo',
	'tgz': 'application/x-tar-gz',
	'tiff': 'image/tiff',
	'tr': 'application/x-troff',
	'tsi': 'audio/TSP-audio',
	'tsp': 'application/dsptype',
	'tsv': 'text/tab-separated-values',
	'txt': 'text/plain',
	'unv': 'application/i-deas',
	'ustar': 'application/x-ustar',
	'vcd': 'application/x-cdlink',
	'vda': 'application/vda',
	'vivo': 'video/vnd.vivo',
	'vrm': 'x-world/x-vrml',
	'wav': 'audio/x-wav',
	'wax': 'audio/x-ms-wax',
	'wma': 'audio/x-ms-wma',
	'woff': 'application/x-font-woff',
	'wmv': 'video/x-ms-wmv',
	'wmx': 'video/x-ms-wmx',
	'wrl': 'model/vrml',
	'wvx': 'video/x-ms-wvx',
	'xbm': 'image/x-xbitmap',
	'xlw': 'application/vnd.ms-excel',
	'xml': 'text/xml',
	'xpm': 'image/x-xpixmap',
	'xwd': 'image/x-xwindowdump',
	'xyz': 'chemical/x-pdb',
	'zip': 'application/zip'
};

function listener(request, response){
	var pwd = path.resolve(),
		url = require('url').parse(request.url, true),
		pathname = url.pathname == options.reset ? path.resolve(__dirname, '.' + url.pathname)
			: pwd + unescape(url.pathname),
		returns;

	if (path.existsSync(pathname)){
		var stats = fs.statSync(pathname);
		if (stats.isFile()){
			var ext = url.pathname.replace(/.*?\.(\w+)$/, '$1');

			if (ext == 'css' && !url.query.raw)
				returns = handleStyleSheet(url, pathname);
			else {
				response.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
				response.writeHead(200);
				fs.createReadStream(pathname, { flags: 'r', mode: 0666, bufferSize: 4 * 1024})
					.addListener('data', function(chunk){
						response.write(chunk, 'binary');
					})
					.addListener('close',function(){
						response.end();
					});
				return;
			}
		}
		else
			returns = handleListing(url, pathname);
	}
	else
		returns = handleNotFound(url);
	
	response.setHeader('Content-Type', 'text/html');
	response.writeHead(returns.code || 200);
	response.end(returns.file);
}

function getTemplate(templateName){
	var pwd = path.resolve(),
		pathToTemplate = path.existsSync(pwd + '/' + templateName) ? pwd + '/' + templateName
			: path.resolve(__dirname, './tmpl/' + templateName);
		
	return fs.readFileSync(pathToTemplate, 'utf8');
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

function handleStyleSheet(url, pathname){
	var css = fs.readFileSync(pathname, 'utf8'),
		template = getTemplate('stylesheet.tmpl');
		style = unescape(url.pathname).replace(/.*?([^\/]+)\.css$/, '$1'),
		opts = { expand: options.expand, out: 'html', populate: true, tags: options.tags };
	
	file = tmpl(template, { html: css2html(css, opts), reset: options.reset, style: style, url: url.pathname });
	
	return { file: file };
}

function handleNotFound(url){
	var template = getTemplate('404.tmpl'),	
		file = tmpl(template, { url: url.pathname });
	
	return { code: 404, file: file };
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