document.addEventListener("DOMContentLoaded", () => {
  
  // --- 1. ANIMATED PARTICLE BACKGROUND ---
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");

  let particlesArray = [];
  const numberOfParticles = 60;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x > canvas.width) this.x = 0;
      else if (this.x < 0) this.x = canvas.width;

      if (this.y > canvas.height) this.y = 0;
      else if (this.y < 0) this.y = canvas.height;
    }

    draw() {
      ctx.fillStyle = `rgba(0, 242, 254, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }
  initParticles();

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();

      // Connect nearby particles with subtle lines
      for (let j = i; j < particlesArray.length; j++) {
        const dx = particlesArray[i].x - particlesArray[j].x;
        const dy = particlesArray[i].y - particlesArray[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 242, 254, ${0.15 - distance / 700})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
          ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // --- 2. TYPING TAGLINE ANIMATION ---
  const taglineElement = document.getElementById("typing-tagline");
  const phrases = [
    "Exploring Code, Logic & Creativity",
    "Embedded Systems & ESP32 Enthusiast",
    "Abstract Algebra & Mathematical Modeling",
    "Data Structures & Algorithmic Problem Solving"
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
      taglineElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
    } else {
      taglineElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentPhrase.length) {
      typeSpeed = 2000; // Pause at end of sentence
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 500;
    }

    setTimeout(typeEffect, typeSpeed);
  }
  typeEffect();

  // --- 3. CHART.JS SGPA GRAPH ---
  const chartCtx = document.getElementById('sgpaChart').getContext('2d');
  
  // Gradient fill for chart line
  const gradient = chartCtx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, 'rgba(0, 242, 254, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

  new Chart(chartCtx, {
    type: 'line',
    data: {
      labels: ['Sem 1', 'Sem 2', 'Sem 3'],
      datasets: [{
        label: 'SGPA',
        data: [8.60, 8.75, 8.95],
        borderColor: '#00f2fe',
        borderWidth: 3,
        pointBackgroundColor: '#060913',
        pointBorderColor: '#00f2fe',
        pointBorderWidth: 2,
        pointRadius: 6,
        fill: true,
        backgroundColor: gradient,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 8.0,
          max: 10.0,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });

  // --- 4. PROJECT CATEGORY FILTER ---
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      projectCards.forEach(card => {
        if (filter === "all" || card.getAttribute("data-category") === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // --- 5. SCROLL REVEAL & COUNTER ANIMATION ---
  const reveals = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll(".counter-number");
  let countersTriggered = false;

  function handleScroll() {
    const triggerBottom = window.innerHeight * 0.85;

    reveals.forEach(reveal => {
      const top = reveal.getBoundingClientRect().top;
      if (top < triggerBottom) {
        reveal.classList.add("active");
      }
    });

    // Trigger counters when DSA section is in view
    const dsaSection = document.getElementById("dsa");
    if (dsaSection) {
      const dsaTop = dsaSection.getBoundingClientRect().top;
      if (dsaTop < triggerBottom && !countersTriggered) {
        countersTriggered = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute("data-target");
          let current = 0;
          const increment = Math.ceil(target / 50);

          const updateCounter = () => {
            current += increment;
            if (current >= target) {
              counter.textContent = target + "+";
            } else {
              counter.textContent = current;
              setTimeout(updateCounter, 30);
            }
          };
          updateCounter();
        });
      }
    }
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Trigger initial check

  // --- 6. CONTACT FORM VALIDATION ---
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");

    // Validate Name
    if (nameInput.value.trim() === "") {
      nameInput.parentElement.classList.add("invalid");
      isValid = false;
    } else {
      nameInput.parentElement.classList.remove("invalid");
    }

    // Validate Email
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailInput.value.match(emailPattern)) {
      emailInput.parentElement.classList.add("invalid");
      isValid = false;
    } else {
      emailInput.parentElement.classList.remove("invalid");
    }

    // Validate Message
    if (messageInput.value.trim() === "") {
      messageInput.parentElement.classList.add("invalid");
      isValid = false;
    } else {
      messageInput.parentElement.classList.remove("invalid");
    }

    if (isValid) {
      formStatus.textContent = "Transmission Sent Successfully! I'll reach out soon.";
      contactForm.reset();
      setTimeout(() => {
        formStatus.textContent = "";
      }, 5000);
    }
  });
});
