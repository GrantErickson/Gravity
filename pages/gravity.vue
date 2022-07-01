<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-btn-toggle dense>
          <v-btn @click="pause = !pause">Pause</v-btn>
        </v-btn-toggle>
        <v-chip>{{ calcsPerSecond }} </v-chip>
        <v-chip color="primary"
          >{{ maxErrorPercentInLastSecond.toPrecision(2) }}%
        </v-chip>
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
        <v-select v-model="dt" :items="dtValues" label="Time Step"></v-select>
      </v-col>
      <v-col>
        <v-select
          v-model="centerOnBody"
          :items="bodies"
          item-text="name"
          label="Center Point"
          clearable
          return-object
        ></v-select>
      </v-col>
      <v-col>
        <v-select
          v-model="selectedSetup"
          :items="setups"
          item-text="title"
          label="Setup"
          return-object
          @change="reset"
        ></v-select>
      </v-col>
    </v-row>
    <v-simple-table id="table">
      <template v-slot:default>
        <thead @click="tableHidden = !tableHidden">
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
        <tbody v-if="!tableHidden">
          <tr v-for="body in bodies" v-bind:key="body.name">
            <td>
              <v-checkbox v-model="body.selected"></v-checkbox>
            </td>
            <td class="text-left" :style="{ color: '#' + body.hexColor }">
              <span style="font-weight: bold"> {{ body.name }}</span>
              <span v-if="body.state == 1"> (Destroyed)</span>
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
import Body from "~/models/body";
import { BodyState } from "~/models/body";
import Setup from "~/models/setup";
import EarthMoonAndOthers from "~/models/earthMoonAndOthers";
import EarthMoon from "~/models/earthMoon";
import Chaos from "~/models/chaos";
import Binary from "~/models/binary";
import Vector from "~/models/vector";

@Component
export default class Gravity extends Vue {
  // Class properties will be component data
  bodies: Body[] = [];
  activeBodies: Body[] = [];
  dt: number = 100;
  scale: number = 5e-9;
  forceScale: number = 2e-21;
  pause: boolean = false;
  zoom: boolean = false;
  centerOnBody: Body | null = null;
  frameNumber: number = 0;
  trails: boolean = false;
  animationHook: number = 0;
  setups: Setup[] = [];
  selectedSetup!: Setup;
  lastCalcSecond: number = 0;
  calcsPerSecond: number = 0;
  calcCounter: number = 0;
  calcTimerId: NodeJS.Timeout = null!;
  tableHidden: boolean = false;
  maxErrorPercentInLastSecond: number = 0;
  maxErrorPercentInThisSecond: number = 0;

  constructor() {
    super();
  }

  loadSetups() {
    this.setups = [];
    this.setups.push(new EarthMoon());
    this.setups.push(new EarthMoonAndOthers());
    this.setups.push(new Chaos());
    this.setups.push(new Binary());
  }

  mounted() {
    this.loadSetups();
    this.selectedSetup = this.setups[0];
    this.reset();
  }

  reset() {
    cancelAnimationFrame(this.animationHook);
    clearInterval(this.calcTimerId);
    this.frameNumber = 0;
    this.centerOnBody = null;
    document.getElementById("view")!.innerHTML = "";
    this.bodies = this.selectedSetup.bodies();
    this.activeBodies = this.bodies.filter((b) => true);
    this.setupScene();
    this.calcTimerId = setInterval(this.calc, 1);
  }

  setupScene() {
    const scene = new Scene();
    const camera = new PerspectiveCamera(
      75,
      document.getElementById("table")!.clientWidth / (window.innerHeight / 2),
      0.1,
      1000
    );
    let geometryMapping: any = {};

    const renderer = new WebGLRenderer();
    renderer.setSize(
      document.getElementById("table")!.clientWidth,
      window.innerHeight / 2
    );
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
        trails: new Array<Mesh<BoxGeometry, MeshBasicMaterial>>(),
      };
    }

    camera.position.z = 4;

    // Animation loop
    let animate = () => {
      this.animationHook = requestAnimationFrame(animate);
      if (!this.pause) {
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

        arrow.setLength(
          forceVector3.length() * this.forceScale +
            (body.state != BodyState.Destroyed ? 0.2 : 0)
        );
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
          geometryMapping[body.name].trails.push(history);
          if (geometryMapping[body.name].trails.length > 100) {
            this.removeTrail(
              geometryMapping[body.name].trails.shift(),
              scene,
              10
            );
          }
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

  removeTrail(
    trail: Mesh<BoxGeometry, MeshBasicMaterial>,
    scene: Scene,
    iteration: number
  ) {
    iteration--;
    trail.material.opacity *= 0.8;

    if (iteration > 0) {
      setTimeout(() => {
        this.removeTrail(trail, scene, iteration);
      }, 500);
    } else {
      scene.remove(trail);
    }
  }

  calc() {
    if (!this.pause) {
      if (this.lastCalcSecond != Math.floor(Date.now() / 1000)) {
        this.calcsPerSecond = this.calcCounter;
        this.calcCounter = 0;
        this.lastCalcSecond = Math.floor(Date.now() / 1000);
        this.maxErrorPercentInLastSecond = this.maxErrorPercentInThisSecond;
        this.maxErrorPercentInThisSecond = 0;
      }
      for (let x = 0; x < 100; x++) {
        this.calcCounter++;
        for (let body of this.activeBodies) {
          // Calculate the force from each other body
          body.forces = [];
          for (let other of this.activeBodies) {
            if (body !== other) {
              body.addForce(other);
            }
          }
          body.calculateNetForce();
          body.updatePosition(this.dt);
          if (
            this.maxErrorPercentInThisSecond < body.percentOfDiameterInLastMove
          ) {
            this.maxErrorPercentInThisSecond = body.percentOfDiameterInLastMove;
          }
        }

        // Detect collisions
        for (let body of this.activeBodies) {
          for (let otherBody of this.activeBodies) {
            // Make sure they aren't the same (This is redundant, with the next one, but left in for clarity)
            if (body.name != otherBody.name) {
              // Make sure the body is always larger than the other body
              if (body.mass > otherBody.mass) {
                // See if they are touching
                if (body.detectCollision(otherBody)) {
                  console.log(`${body.name} collided with ${otherBody.name}`);
                  // Assume they will combine into a new body
                  // Determine the new velocity vector based on momentum
                  let newMomentum = body.momentum.add(otherBody.momentum);
                  let newVelocity = newMomentum.divideScalar(
                    body.mass + otherBody.mass
                  );
                  body.mass += otherBody.mass;
                  body.velocity = newVelocity;
                  otherBody.state = BodyState.Destroyed;
                  otherBody.velocity = new Vector(0, 0);
                  otherBody.netForce = new Vector(0, 0);
                  otherBody.mass = 0;
                  otherBody.radius = 0;
                  this.activeBodies = this.bodies.filter(
                    (b) => b.state != BodyState.Destroyed
                  );
                  // Add a point at the last location of the other body
                  // let sphere: Mesh = geometryMapping[otherBody.name].sphere;
                  // sphere.scale.x = 3;
                  // sphere.scale.y = 3;
                  // sphere.scale.x = 3;
                  // let arrow: ArrowHelper = geometryMapping[otherBody.name].arrow;
                  // scene.remove(arrow);
                }
              }
            }
          }
        }
      }
    }
  }

  dtValues = [
    1, 5, 10, 50, 75, 100, 250, 500, 750, 1000, 5000, 10000, 50000, 100000,
  ];
}
</script>
