/**
 * ==========================================
 * PORTFOLIO INTERACTIVE CORE ENGINE
 * ==========================================
 * Features:
 * 1. Interactive Geometric Canvas (Math coordinate space)
 * 2. TDR Oscilloscope / Circuit Simulator (Featured Project card)
 * 3. Scroll Reveal & Metric Gauge Counters
 * 4. Magnetic Physics for Social Buttons & CTAs
 * 5. Responsive Mobile Nav Menu & Floating Form Controls
 */

document.addEventListener('DOMContentLoaded', () => {

  // Global Configuration
  const isMobile = window.innerWidth < 768;

  /* ==========================================
   * 1. THE HERO MATHEMATICAL COORDINATE CANVAS
   * ========================================== */
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let width = (heroCanvas.width = heroCanvas.offsetWidth);
    let height = (heroCanvas.height = heroCanvas.offsetHeight);

    const particles = [];
    const particleCount = isMobile ? 30 : 70;
    const connectionDistance = 110;
    const mouse = { x: null, y: null, radius: 150 };

    // Resize Handler
    window.addEventListener('resize', () => {
      width = heroCanvas.width = heroCanvas.offsetWidth;
      height = heroCanvas.height = heroCanvas.offsetHeight;
    });

    // Capture Mouse Move inside Hero
    document.getElementById('hero').addEventListener('mousemove', (e) => {
      const rect = heroCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    document.getElementById('hero').addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Particle Object Structure
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 2 + 1;
        this.hue = Math.random() > 0.6 ? 45 : 200; // Gold or subtle blue nodes
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Boundaries Collision
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse Gravitational Attraction
        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= dx * force * 0.03;
            this.y -= dy * force * 0.03;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.hue === 45 ? 'rgba(212, 175, 55, 0.65)' : 'rgba(241, 229, 172, 0.4)';
        ctx.fill();
      }
    }

    // Populate Particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Draw Mathematical Grid Background
    function drawCoordinateGrid() {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 60;

      // Draw vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw subtle math axes
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
      ctx.lineWidth = 1.5;
      
      // X-Axis
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Y-Axis
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
    }

    // Canvas Frame Loop
    function animateHeroCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Render math grid under particles
      drawCoordinateGrid();

      // Update & Draw nodes
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Draw Constellation Connections
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Mouse Interaction Links
      if (mouse.x !== null) {
        particles.forEach((p) => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.25;
            ctx.strokeStyle = `rgba(241, 229, 172, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        });
      }

      requestAnimationFrame(animateHeroCanvas);
    }

    animateHeroCanvas();
  }

  /* ==========================================
   * 2. THE TDR OSCILLOSCOPE FAULT DIAGNOSTIC VISUALIZER
   * ========================================== */
  const circuitCanvas = document.getElementById('circuit-canvas');
  if (circuitCanvas) {
    const ctx = circuitCanvas.getContext('2d');
    let width = (circuitCanvas.width = circuitCanvas.parentElement.offsetWidth);
    let height = (circuitCanvas.height = circuitCanvas.parentElement.offsetHeight);

    window.addEventListener('resize', () => {
      if (circuitCanvas.parentElement) {
        width = circuitCanvas.width = circuitCanvas.parentElement.offsetWidth;
        height = circuitCanvas.height = circuitCanvas.parentElement.offsetHeight;
      }
    });

    let timeOffset = 0;

    function drawOscilloscope() {
      ctx.clearRect(0, 0, width, height);

      // Grid Layout
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
      ctx.lineWidth = 1;
      const spacing = 20;

      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Title & Telemetry text inside screen
      ctx.fillStyle = 'rgba(241, 229, 172, 0.7)';
      ctx.font = '10px Courier New';
      ctx.fillText('TDR WAVEFORM RESOLUTION', 15, 25);
      ctx.fillText('REFLECTOMETER STATE: ACTIVE', 15, 40);
      ctx.fillText('IMPEDANCE DETECT: 50 OHM', 15, 55);

      // Render TDR (Time-Domain Reflectometry) Waveform
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';

      const startX = 20;
      const flatY = height * 0.65;
      const faultX = width * 0.55; 
      const faultStepHeight = 40; 

      ctx.moveTo(startX, flatY);

      // Loop pixels horizontally to plot signal reflection
      for (let x = startX; x < width - 20; x++) {
        let y = flatY;

    

        // Add subtle oscilloscope noise/oscillation
        y += Math.sin((x + timeOffset) * 0.15) * 0.95;

        ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Reset Shadow properties
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Draw Fault Cursor Crosshair Indicator
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      
      // Vertical dash at fault point
      ctx.moveTo(faultX + 30, 20);
      ctx.lineTo(faultX + 30, height - 20);
      
      // Horizontal dash
      ctx.moveTo(20, flatY + faultStepHeight);
      ctx.lineTo(width - 20, flatY + faultStepHeight);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Marker Badge Text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(`FAULT DETECTED: ${((faultX + 30) * 0.18).toFixed(2)}m`, faultX - 10, flatY - 15);

      timeOffset += 1.5;
      requestAnimationFrame(drawOscilloscope);
    }

    drawOscilloscope();
  }

  /* ==========================================
   * 3. SCROLL REVEAL & SGPI METRICS ANIMATION (Intersection Observer)
   * ========================================== */
  const reveals = document.querySelectorAll('.reveal');
  const scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        scrollRevealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  reveals.forEach(el => scrollRevealObserver.observe(el));

  // SGPI Counter & Arc Progress Trigger
  const metricsSection = document.getElementById('academics');
  const sgpiCircle = document.getElementById('sgpi-progress-circle');
  const sgpiCounter = document.getElementById('sgpi-counter');
  let metricsAnimated = false;

  const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !metricsAnimated) {
        metricsAnimated = true;
        animateSgpiGauge();
        animateSkillsBars();
      }
    });
  }, {
    threshold: 0.2
  });

  if (metricsSection) {
    metricsObserver.observe(metricsSection);
  }

  // Animate SGPI circular gauge and number counter
  function animateSgpiGauge() {
    if (!sgpiCircle || !sgpiCounter) return;

    // Stroke Dash Calculations: 
    // Arc Max length = 2 * PI * r (r = 100) ≈ 628
    const maxDash = 628;
    const targetSGPI = 8.95;
    const maxScale = 10.0;
    
    const targetOffset = maxDash - (targetSGPI / maxScale) * maxDash;

    // Trigger SVG path transition
    sgpiCircle.style.strokeDashoffset = targetOffset;

    // Numeric decimal counter animation
    let currentVal = 0.00;
    const increment = 0.09;
    const duration = 2000; // ms
    const stepTime = Math.abs(Math.floor(duration / (targetSGPI / increment)));

    const counterInterval = setInterval(() => {
      currentVal += increment;
      if (currentVal >= targetSGPI) {
        currentVal = targetSGPI;
        clearInterval(counterInterval);
      }
      sgpiCounter.textContent = currentVal.toFixed(2);
    }, stepTime);
  }

  // Skills Progress Track Reveal Animation
  function animateSkillsBars() {
    const bars = document.querySelectorAll('.skill-bar');
    bars.forEach(bar => {
      const targetPercent = bar.getAttribute('data-val');
      bar.style.width = `${targetPercent}%`;
    });
  }

  /* ==========================================
   * 4. HACKATHON SKILLS INVENTORY TRIGGER (Fallback)
   * ========================================== */
  // If the skills section enters first, ensure skill bars reveal
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSkillsBars();
          skillsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    skillsObserver.observe(skillsSection);
  }

  /* ==========================================
   * 5. MAGNETIC PHYSICS INTERACTIONS (CTAs & SOCIALS)
   * ========================================== */
  const magneticElements = document.querySelectorAll('.social-link, .btn-primary, .btn-secondary, .nav-link, .logo');
  
  if (!isMobile) {
    magneticElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const bound = el.getBoundingClientRect();
        
        // Calculate coordinate offsets relative to center of element
        const x = e.clientX - bound.left - bound.width / 2;
        const y = e.clientY - bound.top - bound.height / 2;

        // Apply dynamic translate matrix physics (spring effect)
        el.style.transform = `translate3d(${x * 0.32}px, ${y * 0.32}px, 0)`;
        if (el.classList.contains('social-link')) {
          el.style.boxShadow = `0 0 25px rgba(212, 175, 55, 0.3)`;
        }
      });

      el.addEventListener('mouseleave', () => {
        // Smoothly spring element back to default coordinates
        el.style.transform = 'translate3d(0px, 0px, 0px)';
        if (el.classList.contains('social-link')) {
          el.style.boxShadow = 'none';
        }
      });
    });
  }

  /* ==========================================
   * 6. NAVIGATION SCROLL & HAMBURGER SYSTEM
   * ========================================== */
  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Change Header layout on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Navigation Highlighting on scroll
    let currentActive = 'hero';
    const sections = document.querySelectorAll('section');

    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentActive = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-sec') === currentActive) {
        link.classList.add('active');
      }
    });
  });

  // Hamburger Nav overlay Toggle
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close menu when a navigation link is selected
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  /* ==========================================
   * 7. PREMIUM CONTACT TELEMETRY FORM HANDLER
   * ========================================== */
  const form = document.getElementById('portfolio-form');
  const successOverlay = document.getElementById('success-overlay');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Pull Inputs
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      // Form validation rules
      if (!name || !email || !subject || !message) {
        alert('All telemetry data fields must be populated to initiate contact.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please specify a secure, valid email protocols structure.');
        return;
      }

      // Secure processing animation state
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.textContent = 'TRANSMITTING LINK...';
      submitBtn.style.opacity = '0.7';
      submitBtn.style.pointerEvents = 'none';

      // Mock network latency for a highly realistic technical feel
      setTimeout(() => {
        // Activate Luxury success modal
        if (successOverlay) {
          successOverlay.classList.add('active');
        }

        // Reset Inputs
        form.reset();
        
        // Reset submit button state
        submitBtn.textContent = 'SEND TRANSMISSION';
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'all';

        // Auto close success modal after 4 seconds
        setTimeout(() => {
          successOverlay.classList.remove('active');
        }, 4500);

      }, 1600);
    });

    // Manual click inside success modal resets it instantly
    if (successOverlay) {
      successOverlay.addEventListener('click', () => {
        successOverlay.classList.remove('active');
      });
    }
  }

});
