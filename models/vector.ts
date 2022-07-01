export default class Vector {
  x: number = 0;
  y: number = 0;
  z: number = 0;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  clone(): Vector {
    return new Vector(this.x, this.y, this.z);
  }

  add(vector: Vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
    return this;
  }
  subtract(vector: Vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;
    return this;
  }

  divideScalar(scalar: number): Vector {
    this.x /= scalar;
    this.y /= scalar;
    this.z /= scalar;
    return this;
  }
  multiplyScalar(scalar: number): Vector {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  length(): number {
    return Math.sqrt(
      Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2)
    );
  }
}
