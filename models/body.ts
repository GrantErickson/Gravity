import Vector from "~/models/vector";

export default class Body {
  name: string;
  position: Vector;
  velocity: Vector;
  mass: number;
  radius: number;
  forces: Vector[] = [];
  netForce = new Vector(0, 0);
  color: number = 0;
  selected: boolean = false;
  G = 6.6743e-11; //m^3 kg^-1 s^-2

  constructor(
    name: string,
    position: Vector,
    velocity: Vector,
    mass: number,
    radius: number,
    color: number
  ) {
    this.position = position;
    this.velocity = velocity;
    this.mass = mass;
    this.name = name;
    this.radius = radius;
    this.color = color;
  }

  get hexColor() {
    return this.color.toString(16);
  }

  addForce(body: Body) {
    // Calculate the magnitude
    let r = Math.pow(
      Math.pow(this.position.x - body.position.x, 2) +
        Math.pow(this.position.y - body.position.y, 2),
      0.5
    );
    let force = (this.G * this.mass * body.mass) / Math.pow(r, 2);

    // Calculate the components
    let scale = Math.pow(
      Math.pow(force, 2) /
        (Math.pow(this.position.x - body.position.x, 2) +
          Math.pow(this.position.y - body.position.y, 2)),
      0.5
    );

    let x = (body.position.x - this.position.x) * scale;
    let y = (body.position.y - this.position.y) * scale;

    //Create the final vector
    this.forces.push(new Vector(x, y));
  }

  calculateNetForce() {
    this.netForce = new Vector(0, 0);
    for (let force of this.forces) {
      this.netForce.x += force.x;
      this.netForce.y += force.y;
    }
  }

  updatePosition(dt: number) {
    // Update Velocity
    this.velocity.x += (this.netForce.x / this.mass) * dt;
    this.velocity.y += (this.netForce.y / this.mass) * dt;

    // Update Position
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }
}
