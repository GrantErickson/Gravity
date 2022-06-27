<template>
  <div class="pa-4 v-sheet theme--light rounded">
    <div class="v-data-table theme--light">
      <div class="v-data-table__wrapper">
        <v-btn @click="calculate" class="table">Calculate</v-btn>
        <v-btn @click="pause = !pause" class="table">Pause</v-btn>
        <v-btn @click="zoom = !zoom" class="table">Toggle Zoom</v-btn>
        <table>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">Position</th>
            <th class="text-left">Velocity</th>
            <th class="text-left">Forces</th>
            <th class="text-left">Net Force</th>
            <th class="text-left">Mass</th>
          </tr>
          <tr v-for="body in bodies" v-bind:key="body.name">
            <th>{{ body.name }}</th>
            <td>
              {{ body.position.x.toPrecision(4) }},
              {{ body.position.y.toPrecision(4) }}
            </td>
            <td>
              {{ body.velocity.x.toPrecision(4) }},
              {{ body.velocity.y.toPrecision(4) }}
            </td>
            <td>{{ body.forces.length }}</td>
            <td>
              {{ body.netForce.x.toPrecision(4) }},
              {{ body.netForce.y.toPrecision(4) }}
            </td>
            <td>{{ body.mass }}</td>
          </tr>
        </table>
      </div>
    </div>
    <div id="view">
      <!-- This is where the 3d view is -->
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  SphereGeometry,
  ArrowHelper,
  Vector3,
} from "three";

const G = 6.6743e-11; //m^3 kg^-1 s^-2

@Component
export default class Gravity extends Vue {
  // Class properties will be component data
  bodies: Body[] = [];
  dt: number = 10000;
  scale: number = 5e-9;
  forceScale: number = 2e-21;
  pause: boolean = false;
  zoom: boolean = false;

  constructor() {
    super();
    this.bodies.push(
      new Body(
        "Earth",
        new Vector(0.0, 0.0),
        new Vector(0.0, -10),
        5.97219e24,
        0x1111ff
      ) // Not sure why it needs a negative y velocity to stay more centered.
    );
    this.bodies.push(
      new Body(
        "Moon",
        new Vector(384399861, 0),
        new Vector(0, 1028.192),
        7.34767309e22,
        0x444444
      )
    );
    this.bodies.push(
      new Body(
        "Moon2",
        new Vector(334399861, 0),
        new Vector(0, -1128.192),
        7.34767309e22,
        0xaa2222
      )
    );
    this.bodies.push(
      new Body(
        "Moon3",
        new Vector(-334399861, 0),
        new Vector(0, -978.181),
        3.34767309e21,
        0x33bb66
      )
    );
  }

  mounted() {
    const scene = new Scene();
    const camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    let geometryMapping: any = {};

    const renderer = new WebGLRenderer();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    document.getElementById("view")!.appendChild(renderer.domElement);

    for (let body of this.bodies) {
      // Create the sphere
      let geometry: any = new SphereGeometry(0.1, 30, 30);
      let material = new MeshBasicMaterial({ color: body.color });
      let sphere: Mesh = new Mesh(geometry, material);
      sphere.position.x = body.position.x * this.scale;
      sphere.position.y = body.position.y * this.scale;
      scene.add(sphere);

      // Create the force arrow
      let arrow = new ArrowHelper(
        new Vector3(body.position.x, body.position.y, 0),
        new Vector3(1, 0, 0),
        0,
        body.color
      );
      scene.add(arrow);
      // Save to a mapping for access later
      geometryMapping[body.name] = {
        sphere: sphere,
        arrow: arrow,
      };
    }

    camera.position.z = 5;

    let animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);

      if (!this.pause) {
        this.calculate();

        let max = 2.5;
        for (let body of this.bodies) {
          let sphere: Mesh = geometryMapping[body.name].sphere;
          sphere.position.x = body.position.x * this.scale;
          sphere.position.y = body.position.y * this.scale;
          if (max < Math.abs(sphere.position.x)) max = sphere.position.x;
          if (max < Math.abs(sphere.position.y)) max = sphere.position.y;
          console.log(
            `${body.name}: ${sphere.position.x}, ${sphere.position.y}`
          );
          let arrow: ArrowHelper = geometryMapping[body.name].arrow;
          let forceVector3 = new Vector3(body.netForce.x, body.netForce.y, 0);
          arrow.position.set(
            body.position.x * this.scale,
            body.position.y * this.scale,
            0
          );
          arrow.setLength(forceVector3.length() * this.forceScale + 0.2);
          arrow.setDirection(forceVector3.normalize());
        }

        if (this.zoom) {
          camera.position.z = Math.abs(max) * 2;
        } else {
          camera.position.z = 5;
        }
      }
    };

    animate();
  }

  calculate() {
    for (let body of this.bodies) {
      // Calculate the force from each other body
      body.forces = [];
      for (let other of this.bodies) {
        if (body !== other) {
          body.addForce(other);
        }
      }
      body.calculateNetForce();
      body.updatePosition(this.dt);
    }
  }
}

class Body {
  name: string;
  position: Vector;
  velocity: Vector;
  mass: number;
  forces: Vector[] = [];
  netForce = new Vector(0, 0);
  color: number = 0;

  constructor(
    name: string,
    position: Vector,
    velocity: Vector,
    mass: number,
    color: number
  ) {
    this.position = position;
    this.velocity = velocity;
    this.mass = mass;
    this.name = name;
    this.color = color;
  }

  addForce(body: Body) {
    // Calculate the magnitude
    let r = Math.pow(
      Math.pow(this.position.x - body.position.x, 2) +
        Math.pow(this.position.y - body.position.y, 2),
      0.5
    );
    let force = (G * this.mass * body.mass) / Math.pow(r, 2);

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

class Vector {
  x: number = 0;
  y: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
</script>
