import * as THREE from 'three';

export default class World {
  constructor(scene, textureLoader) {
    this.scene = scene;
    this.textureLoader = textureLoader;
    this.meshes = [];

    this.objectDistance = 4;
  }

  async init() {
    this.meshes = [null, null, null];
  }

  update(deltaTime) {
  }
}
