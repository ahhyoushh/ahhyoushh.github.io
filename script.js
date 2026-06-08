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
  showToast("DEV MODE READY: ctrl+shift+D", 8000);

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
