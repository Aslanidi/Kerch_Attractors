function queryOSM(coords) {
	// Составляем запрос Overpass QL
	var query = `
	[out:json][timeout:25];
	wr(around:3, ${coords.lat}, ${coords.lng})["building"];
	out geom;
	`;
	// console.log(query);
	// console.log(encodeURIComponent(query));

	// Send the Overpass query using the Fetch API
	fetch("https://overpass-api.de/api/interpreter", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: "data=" + encodeURIComponent(query),
	})
		.then((response) => response.json()) // Parse the response as JSON
		.then((data) => {
			// The data variable now contains the GeoJSON data for the area you queried
			console.log(data);
			for (let i = 0; i < data.elements.length; i++) {
				let el = data.elements[i];
				console.log(el);
				if (el.type === "way") {
					parseWay(el);
				} else if (el.type === "relation") {
					for (let e = 0; e < el.members.length; e++) {
						let w = el.members[e];
						if(w.type === "way") {
							parseWay(w);
						}
					}
				}
			}
		});
}

function parseWay(el) {
	// console.log(el.geometry);
	let vts = [];
	for (let v = 0; v < el.geometry.length - 1; v++) {
		let vert = el.geometry[v];
		vts.push([vert.lat, vert.lon]);
		// let pt = myMap.latLngToPixel(vert);
		balls.push(new Ball(settingsObject.radius, new p5.Vector(vert.lat, vert.lon), new p5.Vector(0, 0), new p5.Vector(settingsObject.forces_x, settingsObject.forces_y), myMap));
	}
	polys.push(vts);
}