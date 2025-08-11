import Vector from "~/models/vector";
import * as THREE from "three";

export type GeometryMapping = {
  lastPoint: Vector | null;
  sphere: THREE.Mesh;
  arrow: THREE.ArrowHelper;
  trails: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[];
};
