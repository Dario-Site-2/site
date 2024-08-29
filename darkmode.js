"use strict";

function applyDarkMode() {
  const isDarkMode = localStorage.getItem("darkMode") === "enabled";
  document.documentElement.classList.toggle("dark-mode", isDarkMode);
}

function toggleDarkMode() {
  const isDarkMode = localStorage.getItem("darkMode") === "enabled";
  localStorage.setItem("darkMode", isDarkMode ? "disabled" : "enabled");
  applyDarkMode();
}

function initDarkMode() {
  const toggle = document.getElementById("darkModeToggle");
  if (toggle) {
    toggle.addEventListener("change", toggleDarkMode);
  }
}

// Initialize dark mode
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDarkMode);
} else {
  initDarkMode();
}
