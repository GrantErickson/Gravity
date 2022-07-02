<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-btn-toggle v-model="pause" dense>
          <v-btn :value="true"><v-icon>mdi-pause</v-icon></v-btn>
          <v-btn :value="false"><v-icon>mdi-play</v-icon></v-btn>
        </v-btn-toggle>
        <v-btn-toggle dense>
          <v-btn @click="reset"><v-icon>mdi-restart</v-icon></v-btn>
        </v-btn-toggle>
        <!-- <v-chip>{{ calcsPerSecond }} fps</v-chip> -->
        <v-chip color="primary"
          >{{ maxErrorPercentInLastSecond.toPrecision(2) }}%
        </v-chip>
      </v-col>
      <v-col>
        <v-switch v-model="zoom" label="Auto Zoom"></v-switch>
      </v-col>
      <v-col>
        <v-switch v-model="trails" label="Trails" dense></v-switch>
      </v-col>
      <v-col>
        <v-row>
          <v-col>
            <v-select
              v-model="dt"
              :items="dtValues"
              label="Time Step"
            ></v-select>
          </v-col>
          <v-col>
            <v-chip-group>
              <v-chip>{{ calcsPerSecond }} fps</v-chip>
            </v-chip-group>
          </v-col>
        </v-row>
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
                {{ body.position.x.toPrecision(3) }},
                {{ body.position.y.toPrecision(3) }},
                {{ body.position.z.toPrecision(3) }}
              </span>
              <v-row v-if="body.selected">
                <v-col>
                  <v-text-field
                    suffix="x m"
                    v-model.number="body.position.x"
                    dense
                  ></v-text-field>
                  <v-text-field
                    suffix="y m"
                    v-model.number="body.position.y"
                    dense
                  ></v-text-field>
                  <v-text-field
                    suffix="z m"
                    v-model.number="body.position.z"
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>
            </td>
            <td>
              <span v-if="!body.selected">
                {{ body.velocity.x.toPrecision(3) }},
                {{ body.velocity.y.toPrecision(3) }},
                {{ body.velocity.z.toPrecision(3) }}
              </span>
              <v-row v-if="body.selected">
                <v-col>
                  <v-text-field
                    suffix="x m/s"
                    v-model.number="body.velocity.x"
                    dense
                  ></v-text-field>
                  <v-text-field
                    suffix="y m/s"
                    v-model.number="body.velocity.y"
                    dense
                  ></v-text-field>
                  <v-text-field
                    suffix="z m/s"
                    v-model.number="body.velocity.z"
                    dense
                  ></v-text-field>
                </v-col>
              </v-row>
            </td>
            <td>
              <span v-if="true">
                {{ body.netForce.x.toPrecision(3) }},
                {{ body.netForce.y.toPrecision(3) }},
                {{ body.netForce.z.toPrecision(3) }}
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
                  <v-text-field
                    suffix="z in N"
                    v-model.number="body.netForce.z"
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
                    suffix="kg"
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
                    suffix="m"
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
import * as THREE from "three";
import Body from "~/models/body";
import { BodyState } from "~/models/body";
import Setup from "~/models/setup";
import EarthMoonAndOthers from "~/models/earthMoonAndOthers";
import EarthMoon from "~/models/earthMoon";
import Chaos from "~/models/chaos";
import Binary from "~/models/binary";
import Vector from "~/models/vector";
import GeometryMapping from "~/models/geometryMapping";

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
  private myTrails: boolean = false;
  animationHook: number = 0;
  setups: Setup[];
  selectedSetup!: Setup;
  lastCalcSecond: number = 0;
  calcsPerSecond: number = 0;
  calcCounter: number = 0;
  calcTimerId: NodeJS.Timeout = null!;
  tableHidden: boolean = false;
  maxErrorPercentInLastSecond: number = 0;
  maxErrorPercentInThisSecond: number = 0;

  geometryMapping: { [name: string]: GeometryMapping } = {};

  get trails(): boolean {
    return this.myTrails;
  }
  set trails(value: boolean) {
    console.log("Set " + this.trails + " to " + value);
    this.myTrails = value;
    console.log("Set Done" + this.trails + " to " + value);
    this.bodies.forEach((body) => {
      this.geometryMapping[body.name].lastPoint = null;
    });
  }

  constructor() {
    super();
    this.setups = [];
    this.setups.push(new EarthMoon());
    this.setups.push(new EarthMoonAndOthers());
    this.setups.push(new Chaos());
    this.setups.push(new Binary());
    this.selectedSetup = this.setups[0];
  }

  mounted() {
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
    this.calcTimerId = setInterval(this.calculate, 1);
  }

  setupScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      document.getElementById("table")!.clientWidth / (window.innerHeight / 2),
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(
      document.getElementById("table")!.clientWidth,
      window.innerHeight / 2
    );
    document.getElementById("view")!.appendChild(renderer.domElement);

    for (let body of this.bodies) {
      // Create the sphere
      let geometry: any = new THREE.SphereGeometry(
        body.radius * this.scale * 4,
        30,
        30
      );
      let material = new THREE.MeshBasicMaterial({ color: body.color });
      let sphere: THREE.Mesh = new THREE.Mesh(geometry, material);
      sphere.position.x = body.position.x * this.scale;
      sphere.position.y = body.position.y * this.scale;
      sphere.position.z = body.position.z * this.scale;
      scene.add(sphere);

      // Create the force arrow
      let arrow = new THREE.ArrowHelper(
        new THREE.Vector3(body.position.x, body.position.y, 0),
        new THREE.Vector3(1, 0, 0),
        0,
        body.color
      );
      scene.add(arrow);
      // Save to a mapping for access later
      this.geometryMapping[body.name] = {
        sphere: sphere,
        arrow: arrow,
        trails: new Array<
          THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>
        >(),
        lastPoint: null,
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
        let sphere: THREE.Mesh = this.geometryMapping[body.name].sphere;
        sphere.position.x = body.position.x * this.scale;
        sphere.position.y = body.position.y * this.scale;
        sphere.position.z = body.position.z * this.scale;
        if (max < Math.abs(sphere.position.x))
          max = Math.abs(sphere.position.x);
        if (max < Math.abs(sphere.position.y))
          max = Math.abs(sphere.position.y);

        let arrow: THREE.ArrowHelper = this.geometryMapping[body.name].arrow;
        let forceVector3 = new THREE.Vector3(
          body.netForce.x,
          body.netForce.y,
          body.netForce.z
        );
        arrow.position.set(
          body.position.x * this.scale,
          body.position.y * this.scale,
          body.position.z * this.scale
        );

        arrow.setLength(
          forceVector3.length() * this.forceScale +
            (body.state != BodyState.Destroyed ? 0.2 : 0)
        );
        arrow.setDirection(forceVector3.normalize());

        // Add a history line
        if (this.trails) {
          console.log("Trails");
          // Make sure there has been minimal movement
          const lastPoint = this.geometryMapping[body.name].lastPoint!;
          let length = 100;
          const points: THREE.Vector3[] = [];
          if (lastPoint) {
            points.push(
              new THREE.Vector3(
                lastPoint.x * this.scale,
                lastPoint.y * this.scale,
                lastPoint.z * this.scale
              )
            );
            points.push(
              new THREE.Vector3(
                body.position.x * this.scale,
                body.position.y * this.scale,
                body.position.z * this.scale
              )
            );
            length = points[0].clone().sub(points[1]).length();
          }

          if (length > 0.1) {
            // Add historical line
            const material = new THREE.LineBasicMaterial({
              color: body.color,
              transparent: true,
              opacity: 0.4,
            });

            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            const line = new THREE.Line(geometry, material);
            scene.add(line);
            this.geometryMapping[body.name].trails.push(line);
            this.geometryMapping[body.name].lastPoint = body.position.clone();

            if (this.geometryMapping[body.name].trails.length > 100) {
              this.removeTrail(
                this.geometryMapping[body.name].trails.shift()!,
                scene,
                10
              );
            }
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
    trail: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>,
    scene: THREE.Scene,
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

  calculate() {
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
                  let newMomentum = body.momentum
                    .clone()
                    .add(otherBody.momentum);
                  let newVelocity = newMomentum
                    .clone()
                    .divideScalar(body.mass + otherBody.mass);
                  body.mass += otherBody.mass;
                  body.velocity = newVelocity;
                  otherBody.state = BodyState.Destroyed;
                  otherBody.velocity = new Vector(0, 0, 0);
                  otherBody.netForce = new Vector(0, 0, 0);
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
