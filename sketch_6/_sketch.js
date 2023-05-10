// Объект карты
let myMap;
// Холст p5js
let canvas;
// Объект mappa
const mappa = new Mappa('Leaflet');

let serverList = {
	'osm' : 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
	'light' : 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
	'dark' : 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
	'voyager' : 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
	'light_nolabels' : 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
	'light_only_labels' : 'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
	'dark_nolabels' : 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
	'dark_only_labels' : 'http://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png',
	'voyager_nolabels' : 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png',
	'voyager_only_labels' : 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png',
	'voyager_labels_under' : 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png',
	'toner': 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
	'terrain' : 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
	'watercolor' : 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png'
};
// Дополнительные настройки карты (координаты центра, масштаб, сервер)
const options = {
	lat: 45.356219,
	lng: 36.467378,
	zoom: 15,
	style: serverList['osm'],
};

let polys = [];
let nodes = [];

// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup() {
	canvas = createCanvas(windowWidth, windowHeight);

	myMap = mappa.tileMap(options);

	myMap.overlay(canvas);
	myMap.onChange(onChangedMap);

	queryOSM(makeQueryFromArea("Керчь"));
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
	queryOSM(makeQueryFromCoords(myMap.pixelToLatLng(mouseX, mouseY), 'building'));
}

function keyPressed() {
}

function mouseMoved() {
}

function onChangedMap() {
	redraw();
}