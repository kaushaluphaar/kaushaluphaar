import * as THREE from 'three';

export default class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    
    // Core components
    this.scene = new THREE.Scene();
    
    // Very subtle fog to give depth to the red environment
    this.scene.fog = new THREE.FogExp2(0x8B1A1A, 0.02);

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.timer = new THREE.Timer();
    this.timer.connect(document);
    this.textureLoader = new THREE.TextureLoader();

    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.setupResizeListener();
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100);
    this.camera.position.z = 6;
    this.camera.position.y = 0;
    this.scene.add(this.camera);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true, // Transparent to show CSS background
      antialias: true
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
    
    // Physically correct lighting settings
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    // Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Warm directional light mimicking a soft studio light
    const dirLight = new THREE.DirectionalLight(0xfff0dd, 2.5);
    dirLight.position.set(5, 5, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 15;
    dirLight.shadow.bias = -0.001;
    this.scene.add(dirLight);

    // subtle cool fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0xcceeff, 0.8);
    fillLight.position.set(-5, -2, -2);
    this.scene.add(fillLight);
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
