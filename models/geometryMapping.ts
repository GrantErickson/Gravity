import Vector from "~/models/vector";
import * as THREE from "three";

export default interface GeometryMapping {
  lastPoint: Vector | null;
  sphere: THREE.Mesh;
  arrow: THREE.ArrowHelper;
  trails: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[];
}
