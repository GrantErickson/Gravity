<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-btn @click="pause = !pause" class="table">Pause</v-btn>
      </v-col>
      <v-col>
        <v-btn @click="zoom = !zoom" class="table">Toggle Zoom</v-btn>
      </v-col>
      <v-col>
        <v-btn @click="trails = !trails" class="table">Trails</v-btn>
      </v-col>
      <v-col>
        <v-btn @click="reset" class="table">Reset</v-btn>
      </v-col>
      <v-col>
        <v-select
          v-model="centerOnBody"
          :items="bodies"
          item-text="name"
          item-value="name"
          label="Center Point"
          solo
          clearable
          return-object
        ></v-select>
      </v-col>
    </v-row>
    <div class="pa-4 v-sheet theme--light rounded">
      <div class="v-data-table theme--light">
        <div class="v-data-table__wrapper">
          <table>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Position</th>
              <th class="text-left">Velocity</th>
              <th class="text-left">Forces</th>
              <th class="text-left">Net Force</th>
              <th class="text-left">Mass</th>
              <th class="text-left">Radius</th>
            </tr>
            <tr v-for="body in bodies" v-bind:key="body.name">
              <th class="text-left">{{ body.name }}</th>
              <td>
                {{ body.position.x.toPrecision(4) }} m,
                {{ body.position.y.toPrecision(4) }} m
              </td>
              <td>
                {{ body.velocity.x.toPrecision(4) }} m/s,
                {{ body.velocity.y.toPrecision(4) }} m/s
              </td>
              <td>{{ body.forces.length }}</td>
              <td>
                {{ body.netForce.x.toPrecision(4) }} N,
                {{ body.netForce.y.toPrecision(4) }} N
              </td>
              <td>{{ body.mass.toPrecision(4) }} kg</td>
              <td>{{ body.radius.toPrecision(4) }} m</td>
            </tr>
          </table>
        </div>
      </div>
      <div id="view">
        <!-- This is where the 3d view is -->
      </div>
    </div>
  </v-container>
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
  centerOnBody: Body | null = null;
  frameNumber: number = 0;
  trails: boolean = false;
  animationHook: number = 0;

  constructor() {
    super();
  }

  createBodies() {
    this.bodies = [];
    this.bodies.push(
      new Body(
        "Earth",
        new Vector(0.0, 0.0),
        new Vector(0.0, -10),
        5.97219e24,
        6.378e6,
        0x1111ff
      ) // Not sure why it needs a negative y velocity to stay more centered.
    );
    this.bodies.push(
      new Body(
        "Moon",
        new Vector(384399861, 0),
        new Vector(0, 1028.192),
        7.34767309e22,
        1737000,
        0x444444
      )
    );
    this.bodies.push(
      new Body(
        "Moon2",
        new Vector(434399861, 0),
        new Vector(0, -1128.192),
        7.34767309e22,
        1737000,
        0xaa2222
      )
    );
    this.bodies.push(
      new Body(
        "Moon3",
        new Vector(-334399861, 0),
        new Vector(0, -978.181),
        3.34767309e21,
        737000,
        0x33bb66
      )
    );
  }

  mounted() {
    this.reset();
  }

  reset() {
    cancelAnimationFrame(this.animationHook);
    this.frameNumber = 0;
    this.centerOnBody = null;
    document.getElementById("view")!.innerHTML = "";
    this.createBodies();
    this.setupScene();
  }

  setupScene() {
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
      let geometry: any = new SphereGeometry(
        body.radius * this.scale * 4,
        30,
        30
      );
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
      this.frameNumber++;
      this.animationHook = requestAnimationFrame(animate);
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
          //console.log(
          //  `${body.name}: ${sphere.position.x}, ${sphere.position.y}`
          //);
          let arrow: ArrowHelper = geometryMapping[body.name].arrow;
          let forceVector3 = new Vector3(body.netForce.x, body.netForce.y, 0);
          arrow.position.set(
            body.position.x * this.scale,
            body.position.y * this.scale,
            0
          );
          arrow.setLength(forceVector3.length() * this.forceScale + 0.2);
          arrow.setDirection(forceVector3.normalize());

          // Add a history dot
          if (this.frameNumber % 5 == 0 && this.trails) {
            // Add historical point
            const geometry = new BoxGeometry(0.03, 0.03, 0.03);
            const material = new MeshBasicMaterial({
              color: body.color,
              transparent: true,
              opacity: 0.5,
            });
            const history = new Mesh(geometry, material);
            history.position.x = body.position.x * this.scale;
            history.position.y = body.position.y * this.scale;
            scene.add(history);
          }
        }

        if (this.zoom) {
          camera.position.z = Math.abs(max) * 2;
        } else {
          camera.position.z = 5;
        }
        if (this.centerOnBody) {
          camera.position.x = this.centerOnBody.position.x * this.scale;
          camera.position.y = this.centerOnBody.position.y * this.scale;
          //console.log(`Centering on: ${this.centerOnBody.name}`);
        } else {
          camera.position.x = 0;
          camera.position.y = 0;
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
  radius: number;
  forces: Vector[] = [];
  netForce = new Vector(0, 0);
  color: number = 0;

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
