class Attractor {
  float x, y;
  float r;
  float mass;
  float G;
  
  Attractor(float x, float y, float r, float mass, float G) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.mass = mass;
    this.G = G;
  }
  
  void display() {
    stroke(0);
    fill(150);
    ellipse(x, y, r*2, r*2);
  }
  
  void update() {
    if (mousePressed && dist(mouseX, mouseY, x, y) < r && mouseButton == LEFT) {
      x = mouseX;
      y = mouseY;
    }
  }
  
  PVector attract(Mover m) {
    PVector force = PVector.sub(new PVector(x, y), new PVector(m.x, m.y));
    float distSq = force.magSq();
    distSq = constrain(distSq, 25, 1000);
    float strength = G * mass * m.mass / distSq;
    force.normalize();
    force.mult(strength);
    return force;
  }
}

class Mover {
  float x, y;
  float r;
  float mass;
  float G;
  PVector velocity;
  
  Mover(float x, float y, float r, float mass, float G) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.mass = mass;
    this.G = G;
    velocity = new PVector(0, 0);
  }
  
  void display() {
    stroke(0);
    fill(255, 0, 0);
    ellipse(x, y, r*2, r*2);
  }
  
  void update(PVector force) {
    PVector acceleration = PVector.div(force, mass);
    velocity.add(acceleration);
    x += velocity.x;
    y += velocity.y;
  }
}

Attractor a;
Mover m;

void setup() {
  size(600, 400);
  a = new Attractor(width/2, height/2, 30, 50, 5);
  m = new Mover(random(width), random(height), 10, 10, 50);
}

void draw() {
  background(255);
  
  // передвижение аттрактора и притяжение мувера к аттрактору
  a.update();
  PVector force = a.attract(m);
  
  // увеличение силы притяжения мувера и добавление зависимости от перемещения аттрактора
  float dist = dist(a.x, a.y, m.x, m.y);
  force.mult(map(dist, 0, width, 0.1, 1));
  
  // обновление и отрисовка шаров
  m.update(force);
  m.display();
  a.display();
}
