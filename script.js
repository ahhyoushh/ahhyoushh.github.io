// ================= FEATURED CAROUSEL =================
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("featuredCarousel");
  const dots = document.getElementById("featuredDots");

  if (!carousel || !dots) return;

  const cards = carousel.querySelectorAll(".featured-card");
  const dotElements = dots.querySelectorAll(".dot");
  let currentIndex = 0;
  let autoRotateInterval;

  function showCard(index) {
    // Remove all classes from all cards and dots
    cards.forEach((card, i) => {
      card.classList.remove("active", "prev", "next");

      // Calculate position relative to active card
      const diff = i - index;

      if (diff === 0) {
        card.classList.add("active");
      } else if (diff === -1 || (index === 0 && i === cards.length - 1)) {
        card.classList.add("prev");
      } else if (diff === 1 || (index === cards.length - 1 && i === 0)) {
        card.classList.add("next");
      }
    });

    dotElements.forEach(dot => dot.classList.remove("active"));
    dotElements[index].classList.add("active");

    currentIndex = index;
  }

  function nextCard() {
    const next = (currentIndex + 1) % cards.length;
    showCard(next);
  }

  function startAutoRotate() {
    autoRotateInterval = setInterval(nextCard, 3500); // 3.5 seconds
  }

  function stopAutoRotate() {
    clearInterval(autoRotateInterval);
  }

  // Dot click handlers
  dotElements.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showCard(index);
      stopAutoRotate();
      startAutoRotate(); // Restart auto-rotation
    });
  });

  // Pause on hover
  carousel.addEventListener("mouseenter", stopAutoRotate);
  carousel.addEventListener("mouseleave", startAutoRotate);

  // Initialize carousel with first card
  showCard(0);

  // Start auto-rotation
  startAutoRotate();
});

// ================= RUN =================
// (removed initIdeas calls)


// ================= DEV MODE =================
document.addEventListener("DOMContentLoaded", () => {
  const toast = document.getElementById("dev-toast");
  let devMode = false;

  if (!toast) return;

  // ================= SHOW TOAST FUNCTION =================
  const showToast = (msg, duration = 2000) => {
    toast.querySelector("#dev-toast-text").textContent = msg;
    toast.style.opacity = 1;
    toast.style.pointerEvents = "auto";

    setTimeout(() => {
      toast.style.opacity = 0;
      toast.style.pointerEvents = "none";
    }, duration);
  };

  // ================= AUTO LOAD NOTIFICATION =================
  showToast("DEV READY", 8000);

  // ================= DISABLE BOOKMARK SHORTCUT =================
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.code === "KeyD") {
      e.preventDefault(); // stops bookmark dialog
    }
  });

  // ================= DEV MODE TOGGLE (CTRL + SHIFT + D) =================
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === "KeyD") {
      e.preventDefault();

      devMode = !devMode;

      if (devMode) {
        document.body.classList.add("dev-mode");
        showToast("DEV MODE: ON");
      } else {
        document.body.classList.remove("dev-mode");
        showToast("DEV MODE: OFF");
      }
    }
  });
});

