// Объект карты
let myMap;
// Холст p5js
let canvas;
// Объект mappa
const mappa = new Mappa('Leaflet');
let serverList = {
	'osm' : 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
};
// Дополнительные настройки карты (координаты центра, масштаб, сервер)
const options = {
	lat: 45.356219,
	lng: 36.467378,
	zoom: 15,
	style: serverList['osm'],
};

let objs = [];
let polys = [];
let nodes = [];

let balls = [];
let attractor;
var gui;
let settingsObject = {
	radius : 10,
	forces_x : 0.1,
	forces_y : 0.1,
	useGlobal : false,
	cleanBackground : true,
	backAlpha : 50,
	playSim : false,
	effectField: 300,
	collide: true,
	offset: {
		x: 0,
		y: 0
	},
	zOffset: {
		x: 0,
		y: 0
	},
	zoom: 12,
};

// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup() {
	canvas = createCanvas(windowWidth, windowHeight);

	myMap = mappa.tileMap(options);

	myMap.overlay(canvas);
	myMap.onChange(onChangedMap);

	queryOSM(makeQueryFromArea("Керчь"));

	attractor = new p5.Vector(width / 2, height / 2);

	gui = new dat.GUI();
	let ballsController = gui.addFolder('Balls');
	ballsController.add(settingsObject, "radius", 5, 50);
	ballsController.add(settingsObject, "forces_x", -2, 2);
	ballsController.add(settingsObject, "forces_y", -2, 2);
	ballsController.add(settingsObject, "useGlobal").listen();
	ballsController.add(settingsObject, "backAlpha", 0, 255);
	ballsController.add(settingsObject, "cleanBackground");
	ballsController.add(settingsObject, "playSim").listen();
	ballsController.add(settingsObject, "effectField", 0, 600).listen();
	ballsController.add(settingsObject, "collide").listen();

	select(".dg").elt.style.zIndex = 1000;
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	// background(100);
	clear();

	polys.forEach(poly => {
		stroke(150);
		fill(0, 0, 255);
		beginShape();
		poly.forEach(vert => {
			let pt = myMap.latLngToPixel(vert);
			// circle(pt.x, pt.y, 5);
			vertex(pt.x, pt.y);
		});
		endShape(CLOSE);
	});

	nodes.forEach(node => {
		noStroke();
		fill(255, 0, 0);
		let cen = myMap.latLngToPixel(node[1], node[0]);
		circle(cen.x, cen.y, 6);
	})
	for (let i = 0; i < balls.length; i++) {
		if (settingsObject.playSim) {
			balls[i].update();
		}
		balls[i].draw();
	}
	
	noFill();
	drawingContext.setLineDash([5, 5]);
	stroke(120);
	circle(mouseX, mouseY, settingsObject.effectField*2);
	drawingContext.setLineDash([]);
	fill(255);
	ellipse(mouseX, mouseY, 21, 21);

	fill(100);
	noStroke();
	textSize(24);
	text(settingsObject.zoom + '\n' + 
			settingsObject.offset.x + ' ' + settingsObject.offset.y + '\n' + 
			settingsObject.zOffset.x + ' ' + settingsObject.zOffset.y, 60, 40);

	fill(255);
	noStroke();
	circle(mouseX, mouseY, 6);
}



// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	canvas = resizeCanvas(windowWidth, windowHeight);
	myMap.mappaDiv.style.width = windowWidth + 'px';
	myMap.mappaDiv.style.height = windowHeight + 'px';
}

function mouseClicked() {
	// console.log(mouseX, mouseY);
	// console.log(myMap.pixelToLatLng(mouseX, mouseY));
	let coords = myMap.pixelToLatLng(mouseX, mouseY);
	if (keyIsPressed === true && keyCode === CONTROL) {
		objs.push(myMap.pixelToLatLng(mouseX, mouseY));
	} else {
		queryOSM(coords);
	}
}

function keyPressed() {
	console.log(key);
	if (key == 'p') {
		settingsObject.playSim = !settingsObject.playSim;
	} else if(key == 'c') {
		settingsObject.collide = !settingsObject.collide;
	} else if(key == 'g') {
		settingsObject.useGlobal = !settingsObject.useGlobal;
	}
}

function mouseMoved() {
	attractor.x = mouseX;
	attractor.y = mouseY;
}

function onChangedMap() {
	console.log('changed');
	analyzeLeaflet();
	balls.forEach(ball => {
		ball.syncToPixel();
		// ball.update();
		console.log(ball);
	});
	redraw();
}

function analyzeLeaflet() {
	const regex = /translate\(([-\d]+)px,\s+([-.\d]+)px\)/;
	const regex3d = /translate3d\(([-\d]+)px,\s+([-.\d]+)px,\s+([-.\d]+)px\)/;

	let zooms = selectAll('.leaflet-zoom-animated').length;
	let curZoom = 0;
	for (let i = 0; i < zooms; i++) {
		curZoom = selectAll('.leaflet-zoom-animated')[i].elt.childElementCount > 0 ? i : curZoom;
	}

	let imgs = document.getElementsByTagName("img");

	let src = imgs[0].src;
	// let src = selectAll('.leaflet-zoom-animated')[curZoom].elt.src;
	const zoomRegex = /\/(\d+)\/\d+\/\d+\.png$/;
	let zoomMatch;
	if(src)
		zoomMatch = src.match(zoomRegex);
		console.log(zoomMatch);
	if(zoomMatch)
		settingsObject.zoom = zoomMatch[1];
		console.log(settingsObject.zoom);



	let zt = selectAll('.leaflet-zoom-animated')[curZoom].elt.style.transform;
	let zoomTrans = zt.match(regex3d);
	settingsObject.zOffset.x = zoomTrans[1];
	settingsObject.zOffset.y = zoomTrans[2];

	tileNum = selectAll('.leaflet-zoom-animated')[curZoom].length;
	let t = select('#defaultCanvas0').elt.style.transform;
	let mp = select('.leaflet-map-pane').elt.style.transform;
	const matches3d = mp.match(regex3d);
	if (matches3d) {
		settingsObject.offset.x = Number(matches3d[1]);
		settingsObject.offset.y = Number(matches3d[2]);
	}
	console.log("tiles");
	console.log(settingsObject.offset);
	console.log(settingsObject.zOffset);
}