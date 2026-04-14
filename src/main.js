import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SceneManager from './Scene.js';
import World from './World.js';
import ScrollManager from './ScrollManager.js';
import ProductCarousel from './ProductCarousel.js';

gsap.registerPlugin(ScrollTrigger);

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

class App {
  constructor() {
    this.init();
  }

  setupHeroFallbackAnimation() {
    const heroSection = document.getElementById('hero');
    const heroLogo = document.getElementById('hero-logo');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    const fadeTargets = [heroLogo, heroSubtitle].filter(Boolean);
    if (!heroSection || fadeTargets.length === 0) return;

    gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: '+=360',
        scrub: 0.5,
      }
    }).to(fadeTargets, {
      opacity: 0,
      y: -52,
      duration: 0.5,
      stagger: 0.18,
      ease: 'none'
    });
  }

  async init() {
    window.scrollTo(0, 0);
    // Keep product interactions available even when 3D path fails.
    this.productCarousel = new ProductCarousel();

    if (!supportsWebGL()) {
      const canvas = document.querySelector('#webgl');
      if (canvas) canvas.remove();

      const fallback = document.createElement('div');
      fallback.setAttribute('role', 'status');
      fallback.style.cssText = 'position:fixed;inset:1rem;z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem;text-align:center;background:rgba(0,0,0,0.35);backdrop-filter:blur(10px);color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:1rem;font-family:var(--font-body);';
      fallback.textContent = 'WebGL is not supported in this browser, so the 3D background is hidden.';
      document.body.appendChild(fallback);

      this.setupHeroFallbackAnimation();
      return;
    }

    // 1. Setup Three.js Scene
    this.canvas = document.querySelector('#webgl');
    if (!this.canvas) return;
    this.sceneManager = new SceneManager(this.canvas);
    
    // 2. Add World Objects
    this.world = new World(this.sceneManager.scene, this.sceneManager.textureLoader);
    try {
      await this.world.init();
    } catch (error) {
      console.error('World initialization failed', error);
      this.setupHeroFallbackAnimation();
      return;
    }

    // 3. Setup Scroll Animations
    this.scrollManager = new ScrollManager(
      this.sceneManager.camera, 
      this.world, 
      this.sceneManager.scene
    );
    
    // 4. Start Render Loop
    window.requestAnimationFrame((timestamp) => this.tick(timestamp));

    // Trigger entry animation after initial paint to avoid race conditions.
    gsap.delayedCall(0.15, () => {
      this.scrollManager.playEntryAnimation();
    });
  }

  tick(timestamp) {
    if (document.hidden) {
      window.requestAnimationFrame((nextTimestamp) => this.tick(nextTimestamp));
      return;
    }

    if (!this.sceneManager || !this.world) return;
    this.sceneManager.timer.update(timestamp);
    const deltaTime = this.sceneManager.timer.getDelta();

    this.world.update(deltaTime);
    this.sceneManager.render();

    window.requestAnimationFrame((nextTimestamp) => this.tick(nextTimestamp));
  }
}

// Boot application
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
