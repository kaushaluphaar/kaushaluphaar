import * as THREE from 'three';

/**
 * ProductGallery3D.js
 * An interactive 3D component for inspecting artisan products with golden aesthetics.
 */
export default class ProductGallery3D {
  constructor(containerId, productType) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    if (!this.supportsWebGL()) {
      this.container.innerHTML = '<div role="status" style="display:flex;align-items:center;justify-content:center;height:100%;padding:1.5rem;text-align:center;color:#fff;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.1);border-radius:20px;">3D preview is unavailable because WebGL is not supported in this browser.</div>';
      return;
    }

    this.productType = productType;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight || 500;

    this.init();
  }

  supportsWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  }

  init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.createProductMesh();
    this.setupInteraction();
    this.tick();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xfff8e7, 0.6);
    this.scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0xffd700, 3);
    keyLight.position.set(3, 3, 4);
    this.scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xffe4b5, 2);
    fillLight.position.set(-3, 1, 3);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 3, -3);
    this.scene.add(rimLight);

    const bottomLight = new THREE.PointLight(0xffa500, 1);
    bottomLight.position.set(0, -3, 2);
    this.scene.add(bottomLight);
  }

  createMaterials() {
    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 1.0,
      roughness: 0.15,
      emissive: 0x332200,
      emissiveIntensity: 0.3
    });

    this.goldDarkMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      metalness: 1.0,
      roughness: 0.25,
      emissive: 0x221100,
      emissiveIntensity: 0.2
    });

    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.05,
      transmission: 0.95,
      thickness: 0.5,
      transparent: true,
      opacity: 0.3,
      ior: 1.5
    });
  }

  createProductMesh() {
    this.createMaterials();

    switch(this.productType) {
      case 'keychain':
        this.mesh = new THREE.Group();
        const torusKnot = new THREE.Mesh(
          new THREE.TorusKnotGeometry(0.6, 0.15, 128, 24),
          this.goldMaterial
        );
        this.mesh.add(torusKnot);
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.2, 0.04, 16, 32),
          this.goldDarkMaterial
        );
        ring.position.y = 0.8;
        this.mesh.add(ring);
        break;

      case 'scrapbook':
        this.mesh = new THREE.Group();
        for(let i = 0; i < 4; i++) {
          const page = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 1.3, 0.08),
            i % 2 === 0 ? this.goldMaterial : this.goldDarkMaterial
          );
          page.position.z = i * 0.12 - 0.2;
          page.rotation.y = Math.sin(i * 0.3) * 0.1;
          page.castShadow = true;
          page.receiveShadow = true;
          this.mesh.add(page);
        }
        break;

      case 'photoframe':
        this.mesh = new THREE.Group();
        const frameOuter = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 3.0, 0.15),
          this.goldMaterial
        );
        const frameInner = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 2.4, 0.2),
          this.glassMaterial
        );
        frameInner.position.z = 0.05;
        this.mesh.add(frameOuter);
        this.mesh.add(frameInner);

        const decorativeCorner1 = this.createCornerDecoration();
        decorativeCorner1.position.set(0.95, 1.25, 0.08);
        this.mesh.add(decorativeCorner1);

        const decorativeCorner2 = this.createCornerDecoration();
        decorativeCorner2.position.set(-0.95, 1.25, 0.08);
        decorativeCorner2.scale.x = -1;
        this.mesh.add(decorativeCorner2);

        const decorativeCorner3 = this.createCornerDecoration();
        decorativeCorner3.position.set(0.95, -1.25, 0.08);
        decorativeCorner3.scale.y = -1;
        this.mesh.add(decorativeCorner3);

        const decorativeCorner4 = this.createCornerDecoration();
        decorativeCorner4.position.set(-0.95, -1.25, 0.08);
        decorativeCorner4.scale.set(-1, -1, 1);
        this.mesh.add(decorativeCorner4);
        break;

      case 'coasters':
        this.mesh = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const coaster = new THREE.Mesh(
            new THREE.CylinderGeometry(0.9, 0.85, 0.1, 48),
            i === 1 ? this.goldMaterial : this.goldDarkMaterial
          );
          coaster.rotation.x = Math.PI * 0.1 * (i - 1);
          coaster.position.set((i - 1) * 0.5, (i - 1) * 0.08, i * 0.15 - 0.25);
          coaster.castShadow = true;
          this.mesh.add(coaster);
        }
        break;

      case 'mugs':
        this.mesh = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.7, 0.65, 1.3, 40, 1, true),
          this.goldMaterial
        );
        body.castShadow = true;
        this.mesh.add(body);

        const handle = new THREE.Mesh(
          new THREE.TorusGeometry(0.35, 0.06, 20, 48, Math.PI * 1.3),
          this.goldDarkMaterial
        );
        handle.position.set(0.75, 0, 0);
        handle.rotation.y = Math.PI * 0.5;
        handle.rotation.z = Math.PI * 0.15;
        this.mesh.add(handle);

        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(0.7, 0.04, 16, 48),
          this.goldMaterial
        );
        rim.rotation.x = Math.PI * 0.5;
        rim.position.y = 0.65;
        this.mesh.add(rim);
        break;

      case 'wallart':
        this.mesh = new THREE.Group();
        const backing = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 2.4, 0.1),
          this.goldDarkMaterial
        );
        this.mesh.add(backing);

        const relief = new THREE.Mesh(
          new THREE.TorusKnotGeometry(0.55, 0.12, 120, 24),
          this.goldMaterial
        );
        relief.position.z = 0.2;
        this.mesh.add(relief);

        const border = new THREE.Mesh(
          new THREE.TorusGeometry(1.1, 0.05, 16, 64),
          this.goldMaterial
        );
        border.position.z = 0.12;
        this.mesh.add(border);
        break;

      default:
        this.mesh = new THREE.Mesh(
          new THREE.TorusKnotGeometry(0.6, 0.15, 128, 24),
          this.goldMaterial
        );
    }

    this.scene.add(this.mesh);
  }

  createCornerDecoration() {
    const group = new THREE.Group();
    const vertical = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.4, 0.08),
      this.goldMaterial
    );
    vertical.position.y = 0.15;
    group.add(vertical);

    const horizontal = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.08, 0.08),
      this.goldMaterial
    );
    horizontal.position.x = 0.15;
    group.add(horizontal);

    return group;
  }

  setupInteraction() {
    this.targetRotationY = 0;
    this.targetRotationX = 0;
    this.mouse = new THREE.Vector2();

    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / this.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / this.height) * 2 + 1;

      this.targetRotationY = this.mouse.x * Math.PI * 0.3;
      this.targetRotationX = this.mouse.y * Math.PI * 0.15;
    });

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight || 500;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
  }

  tick() {
    if (this.mesh) {
      this.mesh.rotation.y += 0.003;

      this.mesh.rotation.y += (this.targetRotationY - this.mesh.rotation.y) * 0.03;
      this.mesh.rotation.x += (this.targetRotationX - this.mesh.rotation.x) * 0.03;

      this.mesh.position.y = Math.sin(Date.now() * 0.0015) * 0.08;
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }
}
