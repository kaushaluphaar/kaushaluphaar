/**
 * ProductCarousel.js
 * Handles auto-scroll, manual navigation, and hover pause for the products section.
 */
export default class ProductCarousel {
  constructor() {
    this.slider = document.getElementById('products-slider');
    this.prevBtn = document.getElementById('carousel-prev');
    this.nextBtn = document.getElementById('carousel-next');

    console.log('[Carousel] Constructor called');
    console.log('[Carousel] slider:', this.slider);
    console.log('[Carousel] prevBtn:', this.prevBtn);
    console.log('[Carousel] nextBtn:', this.nextBtn);

    if (!this.slider || !this.prevBtn || !this.nextBtn) {
      console.log('[Carousel] Missing elements, returning early');
      return;
    }

    this.autoScrollInterval = null;
    this.isHovered = false;

    this.init();
  }

  init() {
    console.log('[Carousel] init() called');

    // Keep coming-soon links inert without triggering hash-jump to page top.
    this.slider.querySelectorAll('.product-card.coming-soon .view-product-btn').forEach((link) => {
      link.setAttribute('aria-disabled', 'true');
      link.addEventListener('click', (event) => {
        event.preventDefault();
      });
    });

    // Manual Navigation
    this.prevBtn.addEventListener('click', () => {
      console.log('[Carousel] Prev button clicked');
      this.scroll('left');
      this.resetAutoScroll();
    });
    this.nextBtn.addEventListener('click', () => {
      console.log('[Carousel] Next button clicked');
      this.scroll('right');
      this.resetAutoScroll();
    });

    // Auto-scroll logic
    this.setupVisibilityObserver();

    // Pause on Hover
    // Use the wrapper to pause when hovering the buttons too
    const wrapper = this.slider.closest('.products-slider-wrapper');
    if (wrapper) {
      wrapper.addEventListener('mouseenter', () => {
        console.log('[Carousel] Mouse enter wrapper');
        this.isHovered = true;
      });
      wrapper.addEventListener('mouseleave', () => {
        console.log('[Carousel] Mouse leave wrapper');
        this.isHovered = false;
      });
    }

    // Start auto-scroll after a short delay
    setTimeout(() => {
      console.log('[Carousel] Starting auto-scroll');
      this.startAutoScroll();
    }, 1000);
  }

  scroll(direction) {
    const cards = Array.from(this.slider.querySelectorAll('.product-card'));
    if (cards.length === 0) {
      console.log('[Carousel] No cards found');
      return;
    }

    const cardWidth = cards[0].offsetWidth;
    const gap = 32;
    const scrollAmount = cardWidth + gap;

    console.log('[Carousel] Scrolling', direction, 'cardWidth:', cardWidth, 'scrollAmount:', scrollAmount);

    const target = direction === 'left'
      ? this.slider.scrollLeft - scrollAmount
      : this.slider.scrollLeft + scrollAmount;

    this.slider.scrollTo({
      left: target,
      behavior: 'smooth'
    });
  }

  setupVisibilityObserver() {
    console.log('[Carousel] Setting up visibility observer');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        console.log('[Carousel] Intersection:', entry.isIntersecting);
        if (entry.isIntersecting) {
          this.startAutoScroll();
        } else {
          this.stopAutoScroll();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.slider);
  }

  resetAutoScroll() {
    console.log('[Carousel] resetAutoScroll called');
    this.stopAutoScroll();
    this.startAutoScroll();
  }

  startAutoScroll() {
    console.log('[Carousel] startAutoScroll called, current interval:', this.autoScrollInterval);
    if (this.autoScrollInterval) {
      console.log('[Carousel] Already running, returning');
      return;
    }

    this.autoScrollInterval = setInterval(() => {
      if (this.isHovered) {
        console.log('[Carousel] Skipping - hovered');
        return;
      }

      const maxScroll = this.slider.scrollWidth - this.slider.clientWidth;
      console.log('[Carousel] Auto-scroll tick, scrollLeft:', this.slider.scrollLeft, 'maxScroll:', maxScroll);

      if (this.slider.scrollLeft >= maxScroll - 50) {
        console.log('[Carousel] Resetting to start');
        this.slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        console.log('[Carousel] Scrolling right');
        this.scroll('right');
      }
    }, 3500);
  }

  stopAutoScroll() {
    console.log('[Carousel] stopAutoScroll called');
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }
}
