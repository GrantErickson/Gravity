<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-btn-toggle v-model="pause" density="compact">
          <v-btn :value="true"><v-icon>mdi-pause</v-icon></v-btn>
          <v-btn :value="false"><v-icon>mdi-play</v-icon></v-btn>
        </v-btn-toggle>
        <v-btn-toggle density="compact">
          <v-btn @click="reset"><v-icon>mdi-restart</v-icon></v-btn>
        </v-btn-toggle>
        <v-chip color="primary">
          {{ maxErrorPercentInLastSecond.toPrecision(2) }}%
        </v-chip>
      </v-col>
      <v-col>
        <v-switch v-model="zoom" label="Auto Zoom"></v-switch>
      </v-col>
      <v-col>
        <v-switch v-model="trails" label="Trails" density="compact"></v-switch>
      </v-col>
      <v-col>
        <v-row>
          <v-col>
            <v-select
              v-model="dt"
              :items="dtValues"
              item-title="name"
              item-value="value"
              label="Time Step"
              @update:model-value="setCurrentDt"
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
          item-title="name"
          label="Center Point"
          clearable
          return-object
        ></v-select>
      </v-col>
      <v-col>
        <v-select
          v-model="selectedSetup"
          :items="setups"
          item-title="title"
          label="Setup"
          return-object
          @update:model-value="reset"
        ></v-select>
      </v-col>
    </v-row>
    <v-table id="table" density="compact">
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
        <tr v-for="body in bodies" :key="body.name">
          <td>
            <v-checkbox v-model="body.selected" density="compact"></v-checkbox>
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
                  density="compact"
                ></v-text-field>
                <v-text-field
                  suffix="y m"
                  v-model.number="body.position.y"
                  density="compact"
                ></v-text-field>
                <v-text-field
                  suffix="z m"
                  v-model.number="body.position.z"
                  density="compact"
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
                  density="compact"
                ></v-text-field>
                <v-text-field
                  suffix="y m/s"
                  v-model.number="body.velocity.y"
                  density="compact"
                ></v-text-field>
                <v-text-field
                  suffix="z m/s"
                  v-model.number="body.velocity.z"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
          </td>
          <td>
            <span>
              {{ body.netForce.x.toPrecision(3) }},
              {{ body.netForce.y.toPrecision(3) }},
              {{ body.netForce.z.toPrecision(3) }}
            </span>
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
                  density="compact"
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
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-row>
      <v-col cols="12">
        <div id="view" width="100%">
          <!-- This is where the 3d view is -->
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import * as THREE from "three";
import Body from "~/models/body";
import { BodyState } from "~/models/body";
import EarthMoonAndOthers from "~/models/earthMoonAndOthers";
import EarthMoon from "~/models/earthMoon";
import Chaos from "~/models/chaos";
import Binary from "~/models/binary";
import Vector from "~/models/vector";

// Type definitions
interface Setup {
  title: string;
  bodies(): Body[];
}

interface GeometryMapping {
  lastPoint: Vector | null;
  sphere: THREE.Mesh;
  arrow: THREE.ArrowHelper;
  trails: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[];
}

// Reactive state
const bodies = ref<Body[]>([]);
const activeBodies = ref<Body[]>([]);
const dt = ref<number>(100);
const currentDt = ref<number>(100);
const isAdaptiveSpeed = ref<boolean>(false);
const scale = ref<number>(5e-9);
const forceScale = ref<number>(2e-21);
const pause = ref<boolean>(false);
const zoom = ref<boolean>(false);
const centerOnBody = ref<Body | null>(null);
const frameNumber = ref<number>(0);
const myTrails = ref<boolean>(false);
const animationHook = ref<number>(0);
const setups = ref<Setup[]>([]);
const selectedSetup = ref<Setup>();
const lastCalcSecond = ref<number>(0);
const calcsPerSecond = ref<number>(0);
const calcCounter = ref<number>(0);
const calcTimerId = ref<NodeJS.Timeout | null>(null);
const tableHidden = ref<boolean>(false);
const maxErrorPercentInLastSecond = ref<number>(0);
const maxErrorPercentInThisSecond = ref<number>(0);
const targetMaxMovePercentage = ref<number>(1);

// Three.js objects
const scene = ref<THREE.Scene | null>(null);
const camera = ref<THREE.PerspectiveCamera | null>(null);
const renderer = ref<THREE.WebGLRenderer | null>(null);
const raycaster = ref<THREE.Raycaster>(markRaw(new THREE.Raycaster()));
const mouseVector = ref<THREE.Vector3>(markRaw(new THREE.Vector3()));
const clickableObjects = ref<THREE.Object3D[]>([]);
const geometryMapping = ref<{ [name: string]: GeometryMapping }>({});

// Computed properties
const trails = computed({
  get: () => myTrails.value,
  set: (value: boolean) => {
    myTrails.value = value;
    bodies.value.forEach((body) => {
      geometryMapping.value[body.name].lastPoint = null;
    });
  }
});

// Methods
const setCurrentDt = () => {
  if (dt.value > 0) {
    currentDt.value = dt.value;
    isAdaptiveSpeed.value = false;
  } else {
    currentDt.value = 25 * Math.abs(dt.value);
    isAdaptiveSpeed.value = true;
  }
};

const onMouseMove = (event: MouseEvent) => {
  if (!renderer.value) return;
  
  mouseVector.value.x =
    ((event.clientX - renderer.value.domElement.offsetLeft) /
      renderer.value.domElement.clientWidth) *
      2 -
    1;
  mouseVector.value.y =
    -(
      (event.clientY - renderer.value.domElement.offsetTop - 64) /
      renderer.value.domElement.clientHeight
    ) *
      2 +
    1;
  raycaster.value.setFromCamera(mouseVector.value, camera.value!);

  const intersects = raycaster.value.intersectObjects(
    clickableObjects.value,
    false
  );
};

const reset = () => {
  if (!selectedSetup.value) return;
  
  if (process.client) {
    localStorage.setItem("selectedSetup", selectedSetup.value.title);
  }
  
  if (animationHook.value) {
    cancelAnimationFrame(animationHook.value);
  }
  if (calcTimerId.value) {
    clearInterval(calcTimerId.value);
  }
  
  frameNumber.value = 0;
  centerOnBody.value = null;
  
  const viewElement = document.getElementById("view");
  if (viewElement) {
    viewElement.innerHTML = "";
  }
  
  bodies.value = selectedSetup.value.bodies();
  activeBodies.value = bodies.value.filter(() => true);
  setupScene();
  calcTimerId.value = setInterval(calculate, 1);
  setCurrentDt();
};

const setupScene = () => {
  scene.value = markRaw(new THREE.Scene());
  
  const tableElement = document.getElementById("table");
  if (!tableElement) return;
  
  camera.value = markRaw(new THREE.PerspectiveCamera(
    75,
    tableElement.clientWidth / (window.innerHeight / 2),
    0.1,
    1000
  ));

  renderer.value = markRaw(new THREE.WebGLRenderer());
  renderer.value.setSize(
    tableElement.clientWidth,
    window.innerHeight / 2
  );
  
  const viewElement = document.getElementById("view");
  if (viewElement) {
    viewElement.appendChild(renderer.value.domElement);
  }

  for (let body of bodies.value) {
    // Create the sphere
    let geometry: any = markRaw(new THREE.SphereGeometry(
      body.radius * scale.value * 4,
      30,
      30
    ));
    let material = markRaw(new THREE.MeshBasicMaterial({ color: body.color }));
    let sphere: THREE.Mesh = markRaw(new THREE.Mesh(geometry, material));
    sphere.position.x = body.position.x * scale.value;
    sphere.position.y = body.position.y * scale.value;
    sphere.position.z = body.position.z * scale.value;
    scene.value.add(sphere);
    clickableObjects.value.push(sphere);

    // Create the force arrow
    let arrow = markRaw(new THREE.ArrowHelper(
      new THREE.Vector3(body.position.x, body.position.y, 0),
      new THREE.Vector3(1, 0, 0),
      0,
      body.color
    ));
    scene.value.add(arrow);
    
    // Save to a mapping for access later
    geometryMapping.value[body.name] = {
      sphere: sphere,
      arrow: arrow,
      trails: new Array<
        THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>
      >(),
      lastPoint: null,
    };
  }

  camera.value.position.z = 4;

  // Animation loop
  const animate = () => {
    animationHook.value = requestAnimationFrame(animate);
    if (!pause.value) {
      frameNumber.value++;
    }
    let max = 4;
    for (let body of bodies.value) {
      let sphere: THREE.Mesh = geometryMapping.value[body.name].sphere;
      sphere.position.x = body.position.x * scale.value;
      sphere.position.y = body.position.y * scale.value;
      sphere.position.z = body.position.z * scale.value;
      if (max < Math.abs(sphere.position.x))
        max = Math.abs(sphere.position.x);
      if (max < Math.abs(sphere.position.y))
        max = Math.abs(sphere.position.y);

      let arrow: THREE.ArrowHelper = geometryMapping.value[body.name].arrow;
      let forceVector3 = markRaw(new THREE.Vector3(
        body.netForce.x,
        body.netForce.y,
        body.netForce.z
      ));
      arrow.position.set(
        body.position.x * scale.value,
        body.position.y * scale.value,
        body.position.z * scale.value
      );

      arrow.setLength(
        forceVector3.length() * forceScale.value +
          (body.state != BodyState.Destroyed ? 0.2 : 0)
      );
      arrow.setDirection(forceVector3.normalize());

      // Add a history line
      if (trails.value) {
        const lastPoint = geometryMapping.value[body.name].lastPoint!;
        let length = 100;
        const points: THREE.Vector3[] = [];
        if (lastPoint) {
          points.push(
            markRaw(new THREE.Vector3(
              lastPoint.x * scale.value,
              lastPoint.y * scale.value,
              lastPoint.z * scale.value
            ))
          );
          points.push(
            markRaw(new THREE.Vector3(
              body.position.x * scale.value,
              body.position.y * scale.value,
              body.position.z * scale.value
            ))
          );
          length = points[0].clone().sub(points[1]).length();
        }

        if (length > 0.1) {
          // Add historical line
          const material = markRaw(new THREE.LineBasicMaterial({
            color: body.color,
            transparent: true,
            opacity: 0.4,
          }));

          const geometry = markRaw(new THREE.BufferGeometry().setFromPoints(points));

          const line = markRaw(new THREE.Line(geometry, material));
          scene.value!.add(line);
          geometryMapping.value[body.name].trails.push(line);
          geometryMapping.value[body.name].lastPoint = body.position.clone();

          if (geometryMapping.value[body.name].trails.length > 100) {
            removeTrail(
              geometryMapping.value[body.name].trails.shift()!,
              scene.value!,
              10
            );
          }
        }
      }
    }

    if (zoom.value) {
      camera.value!.position.z = max * 1.4;
    } else {
      camera.value!.position.z = 4 * 1.4;
    }
    if (centerOnBody.value) {
      camera.value!.position.x = centerOnBody.value.position.x * scale.value;
      camera.value!.position.y = centerOnBody.value.position.y * scale.value;
    } else {
      camera.value!.position.x = 0;
      camera.value!.position.y = 0;
    }

    renderer.value!.render(scene.value!, camera.value!);
  };

  animate();
};

const removeTrail = (
  trail: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>,
  scene: THREE.Scene,
  iteration: number
) => {
  iteration--;
  trail.material.opacity *= 0.8;

  if (iteration > 0) {
    setTimeout(() => {
      removeTrail(trail, scene, iteration);
    }, 500);
  } else {
    scene.remove(trail);
  }
};

const calculate = () => {
  if (!pause.value) {
    if (lastCalcSecond.value != Math.floor(Date.now() / 1000)) {
      calcsPerSecond.value = calcCounter.value;
      calcCounter.value = 0;
      lastCalcSecond.value = Math.floor(Date.now() / 1000);
      maxErrorPercentInLastSecond.value = maxErrorPercentInThisSecond.value;
      maxErrorPercentInThisSecond.value = 0;
    }
    for (let x = 0; x < 100; x++) {
      calcCounter.value++;
      for (let body of activeBodies.value) {
        // Calculate the force from each other body
        body.forces = [];
        for (let other of activeBodies.value) {
          if (body !== other) {
            body.addForce(other);
          }
        }
        body.calculateNetForce();
        body.updatePosition(currentDt.value);

        if (isAdaptiveSpeed.value) {
          if (body.percentOfDiameterInLastMove > Math.abs(dt.value) * 0.8) {
            currentDt.value = currentDt.value * 0.5;
          } else if (
            body.percentOfDiameterInLastMove <
            Math.abs(dt.value) * 0.5
          ) {
            currentDt.value = currentDt.value * 1.2;
          }
        }
        if (
          maxErrorPercentInThisSecond.value < body.percentOfDiameterInLastMove
        ) {
          maxErrorPercentInThisSecond.value = body.percentOfDiameterInLastMove;
        }
      }

      // Detect collisions
      for (let body of activeBodies.value) {
        for (let otherBody of activeBodies.value) {
          // Make sure they aren't the same
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
                activeBodies.value = bodies.value.filter(
                  (b) => b.state != BodyState.Destroyed
                );
              }
            }
          }
        }
      }
    }
  }
};

const dtValues = [
  { name: "auto 10%", value: -10 },
  { name: "auto 5%", value: -5 },
  { name: "auto 2%", value: -2 },
  { name: "auto 1%", value: -1 },
  { name: "auto .5%", value: -0.5 },
  { name: "0.1", value: 0.1 },
  { name: "1", value: 1 },
  { name: "5", value: 5 },
  { name: "10", value: 10 },
  { name: "50", value: 50 },
  { name: "100", value: 100 },
  { name: "500", value: 500 },
  { name: "1000", value: 1000 },
  { name: "5000", value: 5000 },
  { name: "10000", value: 10000 },
  { name: "50000", value: 50000 },
  { name: "100000", value: 100000 },
];

// Initialize component
onMounted(() => {
  setups.value = [];
  setups.value.push(new EarthMoon());
  setups.value.push(new EarthMoonAndOthers());
  setups.value.push(new Chaos());
  setups.value.push(new Binary());
  
  if (process.client) {
    const storedSetup = localStorage.getItem("selectedSetup") || "";
    if (storedSetup !== "") {
      selectedSetup.value = setups.value.find(
        (setup) => setup.title === storedSetup
      );
    } else {
      selectedSetup.value = setups.value[0];
    }
    window.addEventListener("mousemove", onMouseMove, false);
  } else {
    selectedSetup.value = setups.value[0];
  }
  
  setCurrentDt();
  reset();
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener("mousemove", onMouseMove, false);
  }
  if (animationHook.value) {
    cancelAnimationFrame(animationHook.value);
  }
  if (calcTimerId.value) {
    clearInterval(calcTimerId.value);
  }
});
</script>
