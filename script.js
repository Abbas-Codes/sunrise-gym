(() => {
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let parallaxFrame = 0;
    const $hero = $(".hero");
    const $heroImages = $(".hero-slide img");

    function updateHeroParallax() {
      parallaxFrame = 0;
      const heroRect = $hero[0].getBoundingClientRect();
      const distanceFromCenter = window.innerHeight / 2 - (heroRect.top + heroRect.height / 2);
      const offset = Math.max(-70, Math.min(70, distanceFromCenter * 0.14));
      $heroImages.css("transform", `translate3d(0, ${offset}px, 0)`);
    }

    function requestHeroParallaxUpdate() {
      if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateHeroParallax);
    }

    $(window).on("scroll.heroParallax resize.heroParallax", requestHeroParallaxUpdate);
    updateHeroParallax();
  }

  const count = document.querySelector(".slider-count strong");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroSwiper = new Swiper(".hero", {
    loop: true,
    speed: reducedMotion ? 0 : 700,
    autoplay: reducedMotion ? false : {
      delay: 7500,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
      waitForTransition: false
    },
    navigation: {
      nextEl: ".slider-arrow.next",
      prevEl: ".slider-arrow.previous"
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true
    },
    pagination: {
      el: ".hero-dots",
      clickable: true,
      renderBullet(index, className) {
        return `<button class="hero-dot ${className}" type="button" aria-label="Show slide ${index + 1}"></button>`;
      }
    },
    on: {
      slideChange(swiper) {
        count.textContent = String(swiper.realIndex + 1).padStart(2, "0");
      }
    }
  });
  count.textContent = String(heroSwiper.realIndex + 1).padStart(2, "0");

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  }));

  const comparison = document.querySelector(".comparison-slider");
  const comparisonVisual = document.querySelector(".transform-visual");
  comparison.addEventListener("input", () => {
    comparisonVisual.style.setProperty("--compare-position", `${comparison.value}%`);
  });

  const track = document.querySelector("#journeyTrack");
  const svg = document.querySelector("#trackSvg");
  const base = document.querySelector("#trackBase");
  const progress = document.querySelector("#trackProgress");
  const steps = [...document.querySelectorAll(".step")];
  const nodes = [...document.querySelectorAll(".node")];
  let pathLength = 1;
  let raf = 0;

  function makePath() {
    const trackRect = track.getBoundingClientRect();
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const width = track.clientWidth;
    const height = track.scrollHeight;
    const centerX = element => {
      const rect = element.getBoundingClientRect();
      return rect.left - trackRect.left + rect.width / 2;
    };
    const centerY = element => {
      const rect = element.getBoundingClientRect();
      return rect.top - trackRect.top + rect.height / 2;
    };
    let path = `M ${centerX(nodes[0])} ${centerY(nodes[0])}`;
    for (let i = 1; i < nodes.length; i++) {
      const x1 = centerX(nodes[i - 1]), y1 = centerY(nodes[i - 1]);
      const x2 = centerX(nodes[i]), y2 = centerY(nodes[i]);
      const midY = (y1 + y2) / 2;
      if (mobile) path += ` C ${x1} ${midY - 22}, ${x2} ${midY + 22}, ${x2} ${y2}`;
      else {
        const bend = Math.min(115, width * .14);
        const direction = i % 2 === 1 ? 1 : -1;
        path += ` C ${x1 + bend * direction} ${midY - 25}, ${x2 - bend * direction} ${midY + 25}, ${x2} ${y2}`;
      }
    }
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    base.setAttribute("d", path);
    progress.setAttribute("d", path);
    pathLength = base.getTotalLength() || 1;
    progress.style.strokeDasharray = `${pathLength}`;
    progress.style.strokeDashoffset = `${pathLength}`;
    updateProgress();
  }
  function updateProgress() {
    const trackRect = track.getBoundingClientRect();
    const anchor = window.innerHeight * .62;
    const passed = Math.max(0, Math.min(trackRect.height, anchor - trackRect.top));
    const fraction = trackRect.height ? passed / trackRect.height : 0;
    progress.style.strokeDashoffset = `${pathLength * (1 - fraction)}`;
    steps.forEach((step, i) => {
      const rect = step.getBoundingClientRect();
      step.classList.toggle("is-active", rect.top + rect.height * .42 < anchor || (i === 0 && trackRect.top < anchor));
    });
    raf = 0;
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(updateProgress); }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", makePath);
  if ("ResizeObserver" in window) new ResizeObserver(makePath).observe(track);
  window.addEventListener("load", makePath);
  makePath();
})();
