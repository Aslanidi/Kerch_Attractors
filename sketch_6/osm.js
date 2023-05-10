function makeQueryFromArea(areaName) {
	var query = `
	[out:json][timeout:25];
	area[name="${areaName}"]->.a;
	nwr(area.a)["historic"];
	out geom;
	`
	return query;
}

function makeQueryFromCoords(coords, tag='building') {
	var query = `
	[out:json][timeout:25];
	nwr(around:3, ${coords.lat}, ${coords.lng})[${tag}];
	out geom;
	`;
	return query;
}

function queryOSM(query) {
	fetch("https://overpass-api.de/api/interpreter", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: "data=" + encodeURIComponent(query),
	})
		.then((response) => response.json()) // Parse the response as JSON
		.then((data) => {
			console.log(data);
			for (let i = 0; i < data.elements.length; i++) {
				let el = data.elements[i];
				console.log(el);
				routeParser(el);
			}
		});
}

function routeParser(el) {
	console.log('Router');
	if(el.type === "node") {
		parseNode(el);
	} else if (el.type === "way") {
		parseWay(el);
	} else if (el.type === "relation") {
		parseRelation(el);
	}
}

function parseRelation(rel) {
	console.log('Relation');
	for (let i = 0; i < rel.members.length; i++) {
		let w = rel.members[i];
		routeParser(w)
	}
}

function parseWay(way) {
	console.log('Way');
	let vts = [];
	for (let i = 0; i < way.geometry.length; i++) {
		let vert = way.geometry[i];
		vts.push([vert.lat, vert.lon]);
	}
	polys.push(vts);
}

function parseNode(node) {
	console.log('Node');
	nodes.push([node.lon, node.lat]);
}