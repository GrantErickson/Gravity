<template>
  <div class="pa-4 v-sheet theme--light rounded">
    <div class="v-data-table theme--light">
      <div class="v-data-table__wrapper">
        <v-btn @click="calculate" class="table">Calculate</v-btn>
        <v-btn @click="togglePause" class="table">Pause</v-btn>
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
} from "three";

const G = 6.6743e-11; //m^3 kg^-1 s^-2

@Component
export default class Gravity extends Vue {
  // Class properties will be component data
  bodies: Body[] = [];
  dt: number = 10000;
  scale: number = 5e-9;
  pause: boolean = false;

  constructor() {
    super();
    this.bodies.push(
      new Body("Earth", new Vector(0.0, 0.0), new Vector(0.0, -10), 5.97219e24) // Not sure why it needs a negative y velocity to stay more centered.
    );
    this.bodies.push(
      new Body(
        "Moon",
        new Vector(384399861, 0),
        new Vector(0, 1028.192),
        7.34767309e22
      )
    );
    // this.bodies.push(
    //   new Body(
    //     "Moon2",
    //     new Vector(334399861, 0),
    //     new Vector(0, -1128.192),
    //     7.34767309e22
    //   )
    // );
    // this.bodies.push(
    //   new Body(
    //     "Moon3",
    //     new Vector(-334399861, 0),
    //     new Vector(0, -928.192),
    //     7.34767309e22
    //   )
    // );
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
      let geometry = new SphereGeometry(0.1, 30, 30);
      let material = new MeshBasicMaterial({ color: 0x501fa0 });
      let sphere: Mesh = new Mesh(geometry, material);
      sphere.position.x = body.position.x * this.scale;
      sphere.position.y = body.position.y * this.scale;
      scene.add(sphere);
      geometryMapping[body.name] = sphere;
    }

    camera.position.z = 5;

    let animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);

      if (!this.pause) {
        this.calculate();

        for (let body of this.bodies) {
          let sphere: Mesh = geometryMapping[body.name];
          sphere.position.x = body.position.x * this.scale;
          sphere.position.y = body.position.y * this.scale;
          console.log(
            `${body.name}: ${sphere.position.x}, ${sphere.position.y}`
          );
        }
      }
    };

    animate();
  }

  togglePause() {
    this.pause = !this.pause;
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

  constructor(name: string, position: Vector, velocity: Vector, mass: number) {
    this.position = position;
    this.velocity = velocity;
    this.mass = mass;
    this.name = name;
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
