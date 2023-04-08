Attractor a;
Mover[] movers = new Mover[10];

void setup() {
  size(640, 360);
  smooth();
  a = new Attractor();
  for (int i = 0; i < movers.length; i++) {
    movers[i] = new Mover(random(0.1, 2), random(width), random(height));
  }
}

void draw() {
  background(255);
  a.display();
  for (int i = 0; i < movers.length; i++) {
    PVector force = a.attract(movers[i]);
    movers[i].applyForce(force);
    movers[i].update();
    movers[i].display();
  }
}

class Attractor {
  PVector location;
  float mass;
  float G;
  
  Attractor() {
    location = new PVector(width/2, height/2);
    mass = 100;
    G = 1;
  }
  
  PVector attract(Mover m) {
    PVector force = PVector.sub(location, m.location);
    float distance = force.mag();
    distance = constrain(distance, 5, 25);
    force.normalize();
    float strength = (G * mass * m.mass) / (distance * distance);
    force.mult(strength);
    return force;
  }
  
  void display() {
    stroke(0);
    fill(127);
    ellipse(location.x, location.y, mass/2, mass/2);
  }
  
  void handleDrag() {
    if (mousePressed && dist(mouseX, mouseY, location.x, location.y) < mass/2) {
      location.x = mouseX;
      location.y = mouseY;
    }
  }
}

class Mover {
  PVector location;
  PVector velocity;
  PVector acceleration;
  float mass;
  
  Mover(float m, float x, float y) {
    mass = m;
    location = new PVector(x, y);
    velocity = new PVector(0, 0);
    acceleration = new PVector(0, 0);
  }
  
  void applyForce(PVector force) {
    PVector f = PVector.div(force, mass);
    acceleration.add(f);
  }
  
  void update() {
    velocity.add(acceleration);
    location.add(velocity);
    acceleration.mult(0);
  }
  
  void display() {
    stroke(0);
    fill(255, 0, 0);
    ellipse(location.x, location.y, mass*16, mass*16);
  }
}
