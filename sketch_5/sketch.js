// Объект карты
let myMap;
// Холст p5js
let canvas;
// Объект mappa
const mappa = new Mappa('Leaflet');
// Дополнительные настройки карты (координаты центра, масштаб, сервер)
const options = {
	lat: 45.35,
	lng: 36.47,
	zoom: 15,
	style: 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
};




let attractors = []; // массив аттракторов
let movers = []; // массив муверов

// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup() {
	canvas = createCanvas(windowWidth, windowHeight);

	myMap = mappa.tileMap(options);

	myMap.overlay(canvas);

	// добавляем аттракторы в массив
	// attractors.push(new Attractor({lat : 45.3515, lng : 36.4695}));
	// attractors.push(new Attractor({lat: 45.3520, lng:36.4700}));
	// attractors.push(new Attractor({lat: 45.3525, lng:36.4705}));
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	// очищаем экран
	clear();

	// рисуем аттракторы
	attractors.forEach(a => a.display());

	// обновляем и рисуем муверов
	movers.forEach(m => {
		m.update();
		m.display();
	});

	// рисуем курсор мыши
	fill(255);
	ellipse(mouseX, mouseY, 21, 21);
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	canvas = resizeCanvas(windowWidth, windowHeight);
	myMap.mappaDiv.style.width = windowWidth + 'px';
	myMap.mappaDiv.style.height = windowHeight + 'px';
}

function mouseClicked() {
	// добавляем нового мувера при нажатии на Ctrl и клике мыши
	if (keyIsPressed === true && keyCode === CONTROL) {
		movers.push(new Mover(myMap.pixelToLatLng(mouseX, mouseY).lat, myMap.pixelToLatLng(mouseX, mouseY).lng));
	} else if (keyIsPressed === true && keyCode === ALT) {
		attractors.push(new Attractor(myMap.pixelToLatLng(mouseX, mouseY)));
	}
}

// класс мувера
class Mover {
	constructor(lat, lng) {
		let pos = myMap.latLngToPixel( lat, lng ); // преобразуем координаты в пиксели
		this.position = new p5.Vector(pos.x, pos.y)
		this.velocity = new p5.Vector(0, 0);
		this.acceleration = new p5.Vector(0, 0);
		this.mass = random(0.1, 2);
		this.color = color(random(255), random(255), random(255));
	}

	// метод отрисовки мувера
	display() {
		noStroke();
		fill(this.color);
		ellipse(this.position.x, this.position.y, this.mass * 16, this.mass * 16);
	}

	// метод обновления состояния мувера
	update() {
		// сбрасываем ускорение мувера
		this.acceleration.set(0, 0);
		// вычисляем силы, действующие на мувера со стороны аттракторов
		let totalForce = new p5.Vector(0, 0);
		attractors.forEach(a => {
			let force = a.attract(this);
			totalForce.add(force);
			// console.log(force);
		});

		// применяем силы к муверу
		this.acceleration.add(totalForce);

		// обновляем скорость и позицию мувера
		this.velocity.add(this.acceleration);
		this.velocity.limit(5);
		this.position.add(this.velocity);

		// обновляем координаты мувера на карте
		let latLng = myMap.pixelToLatLng(this.position.x, this.position.y);
		// let pos = myMap.latLngToPixel(latLng);
		// this.position.set(pos.x, pos.y);
	}
}

// класс аттрактора
class Attractor {
	constructor(geo) {
		// console.log(typeof(geo.lat));
		this.geo = geo;
		// this.geoPosition.lat = geo.lat;
		// this.geoPosition.lng = geo.lng;
		// this.position = new p5.Vector(0, 0);
		// this.pos = myMap.latLngToPixel( this.geo.lat, this.geo.lng ); // преобразуем координаты в пиксели
		this.position = new p5.Vector(0, 0);
		// console.log(this.pos);
		// console.log(lat, lng);
		// console.log(myMap);
		// console.log(this);
		this.radius = 100;
		this.color = color(255, 0, 0, 50);
	}
	
	// метод отрисовки аттрактора
	display() {
		noStroke();
		fill(this.color);
		let pos = myMap.latLngToPixel(this.geo.lat, this.geo.lng);
		ellipse(pos.x, pos.y, this.radius * 2, this.radius * 2);
		this.position.set(pos.x, pos.y);
	}

	// метод расчета силы притяжения
	attract(mover) {
		// расстояние между аттрактором и мувером
		let distance = this.position.dist(mover.position);
		// console.log(distance);

		// если мувер находится внутри радиуса аттрактора, притяжение усиливается
		if (distance < this.radius) {
			distance = this.radius;
		}

		// расчет вектора направления притяжения
		// let force = new p5.Vector(this.position.x - mover.position.x, this.position.y - mover.position.y);
		console.log(this.position);
		let force = this.position.copy();
		force.sub(mover.position);

		// расчет величины притяжения
		let strength = (5 * mover.mass * this.radius) / (distance * distance);

		// масштабирование вектора направления притяжения до нужной величины
		force.setMag(strength);

		// возврат вектора направления притяжения
		return force;
	}
}
