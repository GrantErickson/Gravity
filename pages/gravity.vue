<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-btn-toggle dense>
          <v-btn @click="pause = !pause">Pause</v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col>
        <v-btn-toggle dense>
          <v-btn @click="zoom = !zoom">Toggle Zoom</v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col>
        <v-btn-toggle dense>
          <v-btn @click="trails = !trails">Trails</v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col>
        <v-btn @click="reset">Reset</v-btn>
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
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Edit</th>
            <th class="text-left">Name</th>
            <th class="text-left">Position (m)</th>
            <th class="text-left">Velocity (m/s)</th>
            <th class="text-left">Net Force (N)</th>
            <th class="text-left">Mass (kg)</th>
            <th class="text-left">Radius (m)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="body in bodies" v-bind:key="body.name">
            <td>
              <v-checkbox v-model="body.selected"></v-checkbox>
            </td>
            <td class="text-left" :style="{ color: '#' + body.hexColor }">
              <span style="font-weight: bold"> {{ body.name }}</span>
            </td>
            <td>
              <span v-if="!body.selected">
                {{ body.position.x.toPrecision(4) }},
                {{ body.position.y.toPrecision(4) }}
              </span>
              <v-row v-if="body.selected">
                <v-col>
                  <v-text-field
                    suffix="x in m"
                    v-model.number="body.position.x"
                    dense
                  ></v-text-field>
                  <v-text-field
                    suffix="y in m"
                    v-model.number="body.position.y"
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>
            </td>
            <td>
              <span v-if="!body.selected">
                {{ body.velocity.x.toPrecision(4) }},
                {{ body.velocity.y.toPrecision(4) }}
              </span>
              <v-row v-if="body.selected">
                <v-col>
                  <v-text-field
                    suffix="x in m/s"
                    v-model.number="body.velocity.x"
                    dense
                  ></v-text-field>
                  <v-text-field
                    suffix="y in m/s"
                    v-model.number="body.velocity.y"
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>
            </td>
            <td>
              <span v-if="true">
                {{ body.netForce.x.toPrecision(4) }},
                {{ body.netForce.y.toPrecision(4) }}
              </span>
              <v-row v-if="false">
                <v-col>
                  <v-text-field
                    suffix="x in N"
                    v-model.number="body.netForce.x"
                    dense
                  ></v-text-field>
                  <v-text-field
                    suffix="y in N"
                    v-model.number="body.netForce.y"
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>
            </td>
            <td>
              <span v-if="!body.selected">
                {{ body.mass.toPrecision(4) }}
              </span>
              <v-row v-if="body.selected">
                <v-col>
                  <v-text-field
                    suffix="in kg"
                    v-model.number="body.mass"
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>
            </td>
            <td>
              <span v-if="!body.selected">
                {{ body.radius.toPrecision(4) }}
              </span>
              <v-row v-if="body.selected">
                <v-col>
                  <v-text-field
                    suffix="in m"
                    v-model.number="body.radius"
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <v-row>
      <v-col cols="12">
        <div id="view" width="100%">
          <!-- This is where the 3d view is -->
        </div>
      </v-col>
    </v-row>
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
        new Vector(0.0, 0),
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
        "Moon 2",
        new Vector(434399861, 0),
        new Vector(0, -1128.192),
        7.34767309e22,
        1737000,
        0xaa2222
      )
    );
    this.bodies.push(
      new Body(
        "Moon 3",
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

    camera.position.z = 4;

    let animate = () => {
      this.animationHook = requestAnimationFrame(animate);
      if (!this.pause) {
        this.calculate();
        this.frameNumber++;
      }
      let max = 4;
      for (let body of this.bodies) {
        let sphere: Mesh = geometryMapping[body.name].sphere;
        sphere.position.x = body.position.x * this.scale;
        sphere.position.y = body.position.y * this.scale;
        if (max < Math.abs(sphere.position.x))
          max = Math.abs(sphere.position.x);
        if (max < Math.abs(sphere.position.y))
          max = Math.abs(sphere.position.y);
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
        camera.position.z = max * 1.4;
      } else {
        camera.position.z = 4 * 1.4;
      }
      if (this.centerOnBody) {
        camera.position.x = this.centerOnBody.position.x * this.scale;
        camera.position.y = this.centerOnBody.position.y * this.scale;
        //console.log(`Centering on: ${this.centerOnBody.name}`);
      } else {
        camera.position.x = 0;
        camera.position.y = 0;
      }

      renderer.render(scene, camera);
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
  selected: boolean = false;

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
