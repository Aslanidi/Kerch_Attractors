// Объект карты
let myMap;
// Холст p5js
let canvas;
// Объект mappa
const mappa = new Mappa('Leaflet');
// Дополнительные настройки карты (координаты центра, масштаб, сервер)
const options = {
  lat: 45.351083,
  lng: 36.472463,
  zoom: 15,
  style: 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
};

let objs = [];

// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup () {
  canvas = createCanvas(windowWidth, windowHeight);

  myMap = mappa.tileMap(options);

  myMap.overlay(canvas);
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw () {
  // background(100);
  clear();

  // Отрисовка кругов для каждого элемента в массиве objs
  for (let i = 0; i < objs.length; i++) {
    fill(255. / objs.length * i, 0, 0);
    let pt = myMap.latLngToPixel(objs[i]);
    ellipse(pt.x, pt.y, 3 + 5 * i, 3 + 5 * i);
  }

  // Отрисовка курсора мыши
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
  console.log(myMap.pixelToLatLng(mouseX, mouseY));
  if (keyIsPressed === true && keyCode === CONTROL) {
    objs.push(myMap.pixelToLatLng(mouseX, mouseY));
  }
}
