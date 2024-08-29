"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.createElement("div");
  tooltip.className = "footnote-tooltip";
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);

  let activeFootnoteRef = null;
  let tooltipTimer = null;
  let isMobile = window.innerWidth <= 768; // Define mobile breakpoint

  // Update isMobile on window resize
  window.addEventListener("resize", () => {
    isMobile = window.innerWidth <= 768;
  });

  function smoothScroll(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const targetPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 800; // ms
      let start = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percentage = Math.min(progress / duration, 1);

        window.scrollTo(
          0,
          startPosition + distance * easeInOutCubic(percentage),
        );

        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      }

      window.requestAnimationFrame(step);
    }
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  function showTooltip(target) {
    if (isMobile) return; // Don't show tooltip on mobile

    clearTimeout(tooltipTimer);
    const footnoteId = target.getAttribute("href").slice(1);
    const footnoteContent = document.getElementById(footnoteId);
    if (footnoteContent) {
      let tooltipContent = footnoteContent.innerHTML.replace(
        /<a href="#fnref[0-9]+" class="footnote-backref">.[^<]*<\/a>/,
        "",
      );
      tooltip.innerHTML = tooltipContent.trim();
      tooltip.style.display = "block";
      positionTooltip(target);
      activeFootnoteRef = target;
    }
  }

  function hideTooltip() {
    if (isMobile) return; // Don't hide tooltip on mobile (it's not shown anyway)

    tooltipTimer = setTimeout(() => {
      tooltip.style.display = "none";
      activeFootnoteRef = null;
    }, 300); // 300ms delay before hiding
  }

  // Handle all clicks on the document
  document.addEventListener("click", (e) => {
    let target = e.target.closest('sup[id^="fnref"] a, .footnote-backref');
    if (target) {
      e.preventDefault();
      const targetId = target.getAttribute("href").slice(1);
      if (target.closest('sup[id^="fnref"]')) {
        if (isMobile) {
          // On mobile, just scroll to the footnote
          smoothScroll(targetId);
        } else {
          // On desktop, show tooltip and scroll
          showTooltip(target);
          setTimeout(() => {
            smoothScroll(targetId);
          }, 100);
        }
      } else {
        smoothScroll(targetId);
      }
      return;
    }

    // Close tooltip if clicking outside (desktop only)
    if (
      !isMobile &&
      !tooltip.contains(e.target) &&
      e.target !== activeFootnoteRef
    ) {
      hideTooltip();
    }
  });

  // Handle footnote hover for tooltip (desktop only)
  document.addEventListener("mouseover", (e) => {
    if (isMobile) return;
    let target = e.target.closest('sup[id^="fnref"] a');
    if (target) {
      showTooltip(target);
    }
  });

  // Handle mouseout (desktop only)
  document.addEventListener("mouseout", (e) => {
    if (isMobile) return;
    if (
      !e.relatedTarget ||
      (!tooltip.contains(e.relatedTarget) &&
        e.relatedTarget !== activeFootnoteRef)
    ) {
      hideTooltip();
    }
  });

  // Prevent tooltip from closing when hovering over it (desktop only)
  tooltip.addEventListener("mouseover", () => {
    if (isMobile) return;
    clearTimeout(tooltipTimer);
  });

  // Hide tooltip when mouse leaves it (desktop only)
  tooltip.addEventListener("mouseout", (e) => {
    if (isMobile) return;
    if (!e.relatedTarget || e.relatedTarget !== activeFootnoteRef) {
      hideTooltip();
    }
  });

  function positionTooltip(target) {
    const targetRect = target.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    let top = targetRect.bottom + window.scrollY + 5; // 5px below the footnote reference

    if (left < 0) left = 0;
    if (left + tooltipWidth > windowWidth) left = windowWidth - tooltipWidth;
    if (top + tooltipHeight > window.scrollY + windowHeight) {
      top = targetRect.top + window.scrollY - tooltipHeight - 5; // 5px above the footnote reference
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }
});
