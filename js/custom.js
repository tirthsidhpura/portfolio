const body = document.body;
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const cursorGlow = document.querySelector(".cursor-glow");
const interactiveCards = document.querySelectorAll(".skill-card, .project-card, .education-card, .detail-card");
const networkCanvas = document.querySelector("[data-network-canvas]");
let themeToggle = document.querySelector("[data-theme-toggle]");

if (!themeToggle) {
  const legacyNav = document.querySelector(".navbar .container");
  if (legacyNav) {
    themeToggle = document.createElement("button");
    themeToggle.className = "theme-toggle";
    themeToggle.type = "button";
    themeToggle.setAttribute("data-theme-toggle", "");
    themeToggle.setAttribute("aria-label", "Switch color theme");
    themeToggle.innerHTML = "<span>Dark</span>";
    legacyNav.appendChild(themeToggle);
  }
}

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "dark") {
  body.classList.add("theme-dark");
}

function syncThemeToggle() {
  if (!themeToggle) return;
  themeToggle.querySelector("span").textContent = body.classList.contains("theme-dark") ? "Light" : "Dark";
}

syncThemeToggle();

themeToggle?.addEventListener("click", () => {
  body.classList.toggle("theme-dark");
  localStorage.setItem("portfolio-theme", body.classList.contains("theme-dark") ? "dark" : "light");
  syncThemeToggle();
});

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.opacity = "1";
    cursorGlow.style.transform = `translate3d(${event.clientX - 130}px, ${event.clientY - 130}px, 0)`;
  });

  window.addEventListener("pointerleave", () => {
    cursorGlow.style.opacity = "0";
  });
}

interactiveCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--x", `${x}%`);
    card.style.setProperty("--y", `${y}%`);
  });
});

function startNetworkCanvas(canvas) {
  const context = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let points = [];
  let rafId;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const pointCount = Math.max(34, Math.floor((width * height) / 24000));
    points = Array.from({ length: pointCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      r: Math.random() * 1.7 + 0.7,
    }));
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    const isDark = body.classList.contains("theme-dark");
    context.fillStyle = isDark ? "rgba(120,190,255,0.72)" : "rgba(0,0,0,0.5)";
    context.strokeStyle = isDark ? "rgba(120,190,255,0.22)" : "rgba(0,0,0,0.16)";

    points.forEach((point, index) => {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < 0 || point.x > width) point.vx *= -1;
      if (point.y < 0 || point.y > height) point.vy *= -1;

      context.beginPath();
      context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      context.fill();

      for (let nextIndex = index + 1; nextIndex < points.length; nextIndex += 1) {
        const nextPoint = points[nextIndex];
        const dx = point.x - nextPoint.x;
        const dy = point.y - nextPoint.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 145) {
          context.globalAlpha = 1 - distance / 145;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(nextPoint.x, nextPoint.y);
          context.stroke();
          context.globalAlpha = 1;
        }
      }
    });

    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(draw);
    }
  }

  resize();
  draw();
  window.addEventListener("resize", resize);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
  };
}

if (networkCanvas) {
  startNetworkCanvas(networkCanvas);
}
