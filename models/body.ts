import { MeshToonMaterial } from "three";
import Vector from "~/models/vector";

export const enum BodyState {
  Normal = 0,
  Destroyed = 1,
  Divided = 2,
}

export default class Body {
  readonly G = 6.6743e-11; //m^3 kg^-1 s^-2

  name: string;
  position: Vector;
  velocity: Vector;
  mass: number;
  radius: number;
  forces: Vector[] = [];
  netForce = new Vector(0, 0, 0);
  color: number = 0;
  selected: boolean = false;
  state: BodyState = BodyState.Normal;
  percentOfDiameterInLastMove: number = 0;

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

  get momentum(): Vector {
    return new Vector(
      this.velocity.x * this.mass,
      this.velocity.y * this.mass,
      this.velocity.z + this.mass
    );
  }

  addForce(body: Body) {
    // Calculate the magnitude
    let r = Math.pow(
      Math.pow(this.position.x - body.position.x, 2) +
        Math.pow(this.position.y - body.position.y, 2) +
        Math.pow(this.position.z - body.position.z, 2),
      0.5
    );
    let force = (this.G * this.mass * body.mass) / Math.pow(r, 2);

    // Calculate the components
    let scale = Math.pow(
      Math.pow(force, 2) /
        (Math.pow(this.position.x - body.position.x, 2) +
          Math.pow(this.position.y - body.position.y, 2) +
          Math.pow(this.position.z - body.position.z, 2)),
      0.5
    );

    //Create the final vector
    let newForce = body.position
      .clone()
      .subtract(this.position)
      .multiplyScalar(scale);

    this.forces.push(newForce);
  }

  calculateNetForce() {
    this.netForce = new Vector(0, 0, 0);
    for (let force of this.forces) {
      this.netForce.add(force);
    }
  }

  updatePosition(dt: number) {
    // Update Velocity
    this.velocity.x += (this.netForce.x / this.mass) * dt;
    this.velocity.y += (this.netForce.y / this.mass) * dt;
    this.velocity.z += (this.netForce.z / this.mass) * dt;
    let lastX = this.position.x;
    let lastY = this.position.y;
    let lastZ = this.position.z;

    // Update Position
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;

    let distanceMoved = Math.pow(
      Math.pow(this.position.x - lastX, 2) +
        Math.pow(this.position.y - lastY, 2) +
        Math.pow(this.position.z - lastZ, 2),
      0.5
    );
    this.percentOfDiameterInLastMove =
      (distanceMoved / (this.radius * 2)) * 100;
    // Distance moved
  }

  detectCollision(body: Body): boolean {
    let r = Math.pow(
      Math.pow(this.position.x - body.position.x, 2) +
        Math.pow(this.position.y - body.position.y, 2) +
        Math.pow(this.position.z - body.position.z, 2),
      0.5
    );
    if (r < this.radius + body.radius) {
      return true;
    }
    return false;
  }
}
