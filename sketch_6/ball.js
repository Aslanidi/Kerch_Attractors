class Ball {
	constructor(r, pos, vel, acc, mappaObj) {
		let pg = mappaObj.latLngToPixel(pos.x, pos.y);
		this.pos = new p5.Vector(pg.x, pg.y);
		let pp = mappaObj.pixelToLatLng(this.pos.x, this.pos.y);
		console.log(pp);
		this.posGeo = pp;
		this.vel = vel;
		this.acc = acc;
		this.r = r;
		this.friction = 1;
		this.bounce_friction = 1;
		this.collided = false;
		this.mappaObj = mappaObj;
	}

	draw() {
		let color = constrain(map(this.vel.mag(), 0, 10, 240, 40), 40, 240);
		// console.log(this.vel.mag());
		// console.log(color);
		fill(color, 200);
		if (!this.collided) {
			noStroke();
		} else {
			stroke(255, 0, 0);
			this.collided = false;
		}
		ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);

		let f = this.acc.copy();
		// f.normalize();
		// f.mult(this.acc.mag());
		f.mult(200);
		f.add(this.pos);
		stroke(230, 0, 0, 100);
		line(this.pos.x, this.pos.y, f.x, f.y);

		let d = this.vel.copy();
		// d.normalize();
		// d.mult(this.vel.mag());
		d.mult(10);
		d.add(this.pos);
		stroke(0, 0, 230, 100);
		line(this.pos.x, this.pos.y, d.x, d.y);
		// console.log(Math.round(this.vel.x * 100)/100 + ' ' + Math.round(this.vel.y*100)/100);
	}

	accel() {
		let target = attractor.copy();
		target.sub(this.pos);
		target.normalize();
		target.mult(0.1);
		this.acc = target;
		if (this.pos.dist(attractor) < settingsObject.effectField) {
			this.friction = 1;
		} else {
			this.friction = 0.9;
		}
		this.syncToGeo();
	}

	touch() {
		let avgVel = new p5.Vector(0, 0);
		let collisions = 0;
		for (let i = 0; i < balls.length; i++) {
			if (balls[i] === this) continue;
			let d = this.pos.dist(balls[i].pos);
			if (d > 0 && d <= (this.r + balls[i].r) * 1.5) {
				avgVel.add(this.pos.copy().sub(balls[i].pos).normalize());
				collisions += 1;
			}
		}
		// avgVel.add(this.vel);
		// collisions += 1;
		if (collisions > 0) {
			avgVel.div(collisions);
			this.vel.add(avgVel);
			this.vel.mult(this.bounce_friction);
			this.collided = true;
		}
		// let targetD = this.r + balls[i].r;
		// let diff = (targetD - d) / 2;
		// this.vel.sub(balls[i].vel);
		// balls[i].vel.add(this.vel);
		// this.vel.mult(this.bounce_friction);
		// balls[i].vel.mult(balls[i].bounce_friction);
		// let dPos = this.vel.copy().normalize().mult(diff);
		// this.pos.add(dPos);
		// let bPos = balls[i].vel.copy().normalize().mult(diff);
		// balls[i].pos.add(bPos);
		// }
		this.syncToGeo();
	}

	update() {
		if (settingsObject.useGlobal) {
			this.acc.x = settingsObject.forces_x;
			this.acc.y = settingsObject.forces_y;
		} else {
			this.accel();
		}

		this.vel.add(this.acc);
		this.vel.mult(this.friction);
		this.pos.add(this.vel);
		if (settingsObject.collide) {
			this.touch();
		}

		if (settingsObject.useGlobal) {
			if (this.pos.x + this.r > width) {
				this.pos.x = width - this.r;
				this.vel.mult([-1, 1]);
				this.vel.mult(this.bounce_friction);
			}
			if (this.pos.x + this.r < 0) {
				this.pos.x = this.r;
				this.vel.mult([-1, 1]);
				this.vel.mult(this.bounce_friction);
			}
			if (this.pos.y + this.r > height) {
				this.pos.y = height - this.r;
				this.vel.mult([1, -1]);
				this.vel.mult(this.bounce_friction);
			}
			if (this.pos.y + this.r < 0) {
				this.pos.y = this.r;
				this.vel.mult([1, -1]);
				this.vel.mult(this.bounce_friction);
			}
		}
		this.syncToGeo();
	}

	syncToGeo() {
		let pg = this.mappaObj.pixelToLatLng(this.pos.x, this.pos.y);
		this.posGeo.lat = pg.lat;
		this.posGeo.lng = pg.lng;
	}

	syncToPixel() {
		let pp = this.mappaObj.latLngToPixel(this.posGeo);
		console.log(this.posGeo);
		console.log(pp);
		this.pos.x = pp.x;
		this.pos.y = pp.y;
		console.log(myMap);
		console.log(this.mappaObj);
	}
}