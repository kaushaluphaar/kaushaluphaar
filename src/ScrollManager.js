import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default class ScrollManager {
  constructor(camera, world, scene) {
    this.camera = camera;
    this.world = world;
    this.scene = scene;
    
    this.scrollY = window.scrollY;
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Use the object distance from World.js
    this.objectDistance = this.world.objectDistance; 

    requestAnimationFrame(() => {
      this.setupHTMLScroll();
      this.setupCameraScroll();
      this.setupNavigationDots();
      this.setupLogoAnimation();
      ScrollTrigger.refresh();
    });
  }

  playEntryAnimation() {
    // Initial reveal animation for hero
    const tl = gsap.timeline();
    const heroLogo = document.getElementById('hero-logo');
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroLogo) {
      tl.fromTo(heroLogo, {
        scale: 0.85,
        y: 24,
        opacity: 0,
      }, {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: 'power3.out'
      }, "-=0.5");
    }

    if (heroTitle && heroTitle !== heroLogo) {
      tl.from(heroTitle, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      }, "-=1");
    }

    if (heroSubtitle) {
      tl.fromTo(heroSubtitle, {
        y: 24,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.out'
      }, "-=0.8");
    }
  }

  setupLogoAnimation() {
    const heroSection = document.getElementById('hero');
    const heroLogoWrapper = document.getElementById('hero-logo-wrapper');
    const heroLogo = document.getElementById('hero-logo');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    const fadeTargets = [heroLogo, heroSubtitle].filter(Boolean);

    if (heroLogoWrapper && heroSection && fadeTargets.length > 0) {
      const endScrollDistance = 360;
      gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: `+=${endScrollDistance}`,
          scrub: 0.5,
        }
      })
      .to(heroLogoWrapper, {
        top: "1.5rem",
        scale: 0.55,
        yPercent: 0,
        ease: "none"
      }, 0)
      .to(fadeTargets, {
        opacity: 0,
        y: -52,
        duration: 0.5,
        stagger: 0.18,
        ease: "none"
      }, 0);
    }
  }

  setupCameraScroll() {
    // Tie the Three.js camera position to the overall page scroll
    
    // We update the camera's Y position to go down through the scene
    gsap.to(this.camera.position, {
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        onUpdate: (self) => {
          // Progress bar update
          gsap.set('#scroll-progress-bar', { width: `${self.progress * 100}%` });
        }
      },
      // The total distance the camera should move down
      y: -this.objectDistance * 3,
      ease: 'none'
    });

    // Parallax effect on meshes based on scroll progress
    this.world.meshes.forEach((mesh, index) => {
      if (mesh) {
        gsap.to(mesh.rotation, {
          scrollTrigger: {
            trigger: `[data-section="${index}"]`,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8
          },
          x: "+=1.5",
          z: "+=0.5",
          ease: "none"
        });
      }
    });
  }

  setupHTMLScroll() {
    // Add reveal animations to HTML elements cleanly separating them from Three.js logic
    
    // Section headers reveal up
    gsap.utils.toArray('.section-header').forEach(header => {
      gsap.fromTo(header, 
        { opacity: 0, y: 50 },
        {
          scrollTrigger: {
            trigger: header,
            start: "top 80%",
          },
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out"
        }
      );
    });

    // Stagger products cards
    ScrollTrigger.create({
      trigger: '.products-cards',
      start: 'top 75%',
      onEnter: () => {
        gsap.to('.product-card', {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out'
        });
      }
    });

    // Story Section Reveal
    gsap.utils.toArray('.story-text > *').forEach((el, index) => {
      gsap.fromTo(el, 
        { opacity: 0, x: -30 },
        {
          scrollTrigger: {
            trigger: '.story-layout',
            start: "top 70%",
          },
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: index * 0.1,
          ease: "power2.out"
        }
      );
    });

    gsap.fromTo('.story-image-frame',
      { opacity: 0, scale: 0.8, rotation: -5 },
      {
        scrollTrigger: {
          trigger: '.story-layout',
          start: "top 70%",
        },
        opacity: 1,
        scale: 1,
        rotation: 2,
        duration: 1.2,
        ease: "back.out(1.5)"
      }
    );

    // Contact Section Reveal
    gsap.fromTo(['.contact-text', '.cta-buttons'],
      { opacity: 0, y: 40 },
      {
        scrollTrigger: {
          trigger: '.contact-layout',
          start: "top 75%",
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
      }
    );
  }

  setupNavigationDots() {
    const dots = document.querySelectorAll('.nav-dot');
    const sections = gsap.utils.toArray('.scroll-section');

    // Show nav dots after hero section
    ScrollTrigger.create({
      trigger: '#products',
      start: "top center",
      onEnter: () => document.getElementById('nav-dots').classList.add('visible'),
      onLeaveBack: () => document.getElementById('nav-dots').classList.remove('visible')
    });

    // Update active dot based on scroll section
    sections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onToggle: self => {
          if (self.isActive) {
            dots.forEach(d => {
              d.classList.remove('active');
              d.removeAttribute('aria-current');
              d.setAttribute('tabindex', '-1');
            });
            if(dots[i]) {
              dots[i].classList.add('active');
              dots[i].setAttribute('aria-current', 'true');
              dots[i].removeAttribute('tabindex');
            }
          }
        }
      });
    });

    // Click to scroll to section smoothly
    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        gsap.to(window, {
          duration: 1.5,
          scrollTo: { y: sections[i], offsetY: 0, autoKill: false },
          ease: "power3.inOut"
        });
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const activeDot = document.querySelector('.nav-dot:focus');
        if (activeDot) {
          const index = parseInt(activeDot.dataset.section);
          gsap.to(window, {
            duration: 1.5,
            scrollTo: { y: sections[index], offsetY: 0, autoKill: false },
            ease: "power3.inOut"
          });
        }
      }
    });
  }
}
