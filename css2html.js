var options = {
	populate: true,
	out: 'nodes',
	wrap: false,
	label: false
}

function toArray(collection){
	return [].slice.call(collection);
}

function toNodes(selector, doc){
	var tag = selector.match(/^\w+/) || ['div'],
		node = doc.createElement(tag[0]),
		id = selector.match(/#(?![^\[]+[\]])([^.:\[]+)/);
	if (id)
		node.id = id[1];
		
	var className = selector.match(/\.(?![^\[]+[\]])[^.:#\[]+/g) || [];
	className = className.join('').replace(/\./g, ' ').trim();
	
	var attributes = selector.match(/\[[^\]]+\]|:(enabled|disabled|checked)/g) || [];
	attributes.forEach(function(attribute){
		attribute = attribute.replace(/^:|[\[\]'"]/g, ''); // strip colons, brackets and quotes
		var pairs = attribute.split(/[~|\^$*]?=/); // split into pairs
		if (pairs[0] == 'className'){
			if (pairs[1])
				className += (className ? ' ' : '') + pairs[1];
		}
		else if (pairs[0] == 'id'){
			if (pairs[1])
				node.id = pairs[1];
		}
		else
			node[pairs[0]] = pairs[1] || pairs[0];
	});
	
	if (className)
		node.className = className;
		
	var n = (selector.match(/:nth[^(]+\(([^)]+)\)/)); // test for child pseudo selectors
	n = n ? (parseInt(n[1], 10) || 1) + 1
		: (/:(first|last)-(of|child)/.test(selector)) ? 2
		: 1;
		
	var array = [];
	while (n--){
		var clone = node.cloneNode(false);
		if (selector.indexOf(options.wrap) != 0 && options.populate)
			populate(clone);
		array.push(clone);
	}
	return array;
}

function populate(node){
	var map = { 
			a: 'anchor', 
			dd: 'description', 
			del: 'deleted',
			dfn: 'definition',
			dl: 'definition list', 
			dt: 'term', 
			em: 'emphasized', 
			h: 'heading', 
			ins: 'inserted',			
			li: 'item', 
			ol: 'ordered list', 
			p: 'paragraph', 
			pre: 'preformatted',
			q: 'quotation', 
			sub: 'subscript',
			sup: 'superscript',
			td: 'data cell', 
			th: 'header cell', 
			ul: 'unordered list' 
		},
		tag = node.tagName.toLowerCase();
	
	if (/^(a|abbr|address|big|blockquote|button|caption|cite|code|dd|del|dfn|dt|em|h\d|ins|kbd|label|legend|li|mark|option|p|pre|q|small|span|strong|sub|sup|td|textarea|th|tt|var)$/.test(tag)){
		tag = tag.replace(/h\d/, 'h');
		tag = map[tag] ? map[tag] : tag;
 		node.innerHTML = tag.replace(/\b[a-z]/g, function(match){ return match.toUpperCase(); });
	}
}

function parse(css){
	// TODO intelligently combine selectors
	// how to have "select option" only render a single rule for example? (use > to combine selectors?)

	var doc = require('jsdom').jsdom('<html><body></body></html>', null, { features: { QuerySelector: true }}),
		fragment = doc.body,
		parsed = [];

	css = css.replace(/\s+/g, ' '); // remove line breaks
	css = css.replace(/\/\*(.|\n)*?\*\//g, ''); // strip comments
	css.split(/\{[^}]*\}/g).forEach(function(rule, i){
		rule = rule.replace(/\s*([,:>+](?![^\[]+[\]]))\s*/g, '$1'); // normalize whitespace
		rule = rule.trim();
		if (!rule)
			return;
		rule.split(/,(?![^\[]+[\]])/).forEach(function(selector){ // separate by commas
			// TODO figure out # of nodes here, strip all pseudo selectors and pass # to creator
			// also strip :: double colons
			
			selector = selector.replace(/:(link|visited|active|hover|focus|first-letter|first-line|before|after|empty|target)/, ''); // strip pseudo selectors
			if (parsed.indexOf(selector) != -1)
				return;
			parsed.push(selector);
			(options.wrap ? options.wrap + '#rule-' + i + ' ' + selector : selector).split(/[+~](?![^\(\[]+[\)\]])/).forEach(function(sibling){ // separate by plus or tilde
				var parentNodes = [fragment],
					len = 0; 
					
				// TODO fix nested sibling selector with wrap
				sibling.split(/[ >](?![^\[]+[\]])/).forEach(function(element){ // separate by space or angle bracket
					len += (len ? 1 : 0) + element.length;
					var nodes = [];
					try {
						nodes = fragment.querySelectorAll(sibling.substr(0, len));
					}
					catch(e){
						console.error(e);
					}
					if (!nodes.length){
						nodes = toNodes(element, doc);
						parentNodes.forEach(function(parentNode){
							nodes.forEach(function(node){
								if (element.indexOf(options.wrap) == 0 && options.label){
									var label = toNodes(options.label, doc)[0];							
									label.innerHTML = rule.replace(/>/g, '&gt;');
									node.appendChild(label);
								}
								
								parentNode.appendChild(node);
							});
						});
					}
					parentNodes = toArray(nodes);
				});
			});
		});
	});
	return fragment;
}

module.exports = function(css, opts){
	opts = opts || {};
	for (var i in opts)
		options[i] = opts[i];
	
	var fragment = parse(css);
	return options.out == 'html' ? fragment.innerHTML 
		: toArray(fragment.childNodes);
}