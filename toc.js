"use strict";

function scrollToElementWithPadding(element) {
  const SCROLL_PADDING = 120; // Increased padding
  const headerHeight = document.querySelector("header").offsetHeight;
  const elementPosition = element.getBoundingClientRect().top;
  const currentScrollPosition = window.pageYOffset;

  let targetScrollPosition;
  if (elementPosition < 0) {
    // Scrolling upwards (e.g., from footnote to reference)
    targetScrollPosition =
      currentScrollPosition + elementPosition - SCROLL_PADDING - headerHeight;
  } else {
    // Scrolling downwards (e.g., from reference to footnote)
    targetScrollPosition =
      currentScrollPosition + elementPosition - SCROLL_PADDING - headerHeight;
  }

  window.scrollTo({
    top: targetScrollPosition,
    behavior: "smooth",
  });
}

function highlightTarget(targetId) {
  const target = document.getElementById(targetId);
  if (target) {
    scrollToElementWithPadding(target);
    const link = target.querySelector("a") || target;
    link.classList.remove("highlight-target");
    void link.offsetWidth; // Trigger reflow
    link.classList.add("highlight-target");

    // Remove the highlight class after animation
    setTimeout(() => {
      link.classList.remove("highlight-target");
    }, 5000); // 5 seconds, matching the CSS animation duration
  }
}

let headers = [];

function updateActiveTocItem() {
  const tocList = document.getElementById("tocList");
  let activeHeader = null;
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollPosition + windowHeight >= documentHeight - 50) {
    activeHeader = headers[headers.length - 1];
  } else {
    for (let i = headers.length - 1; i >= 0; i--) {
      if (headers[i].getBoundingClientRect().top <= 50) {
        activeHeader = headers[i];
        break;
      }
    }
  }

  tocList
    .querySelectorAll("a")
    .forEach((link) => link.classList.remove("active"));
  if (activeHeader) {
    const activeLink = tocList.querySelector(`a[href="#${activeHeader.id}"]`);
    if (activeLink) activeLink.classList.add("active");
  } else if (scrollPosition === 0) {
    tocList.querySelector("a")?.classList.add("active");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const tocList = document.getElementById("tocList");
  const contentContainer = document.querySelector(".content-container");
  headers = contentContainer ? contentContainer.querySelectorAll("h2") : [];
  const tocToggle = document.getElementById("tocToggle");
  const toc = document.querySelector(".toc-container");
  const closeButton = document.getElementById("tocCloseButton");
  let mobileTocLink = document.querySelector(".mobile-toc-link");
  const backToTop = document.getElementById("back-to-top");

  const MOBILE_BREAKPOINT = 1076;

  if (tocList && headers.length > 0) {
    let isOpen = window.innerWidth > MOBILE_BREAKPOINT;

    // Create mobile TOC link if it doesn't exist
    if (!mobileTocLink) {
      mobileTocLink = document.createElement("div");
      mobileTocLink.className = "mobile-toc-link";
      mobileTocLink.textContent = "[Table of Contents]";
      if (contentContainer) {
        contentContainer.insertBefore(
          mobileTocLink,
          contentContainer.firstChild,
        );
      }
    }

    function toggleToc() {
      isOpen = !isOpen;
      updateTocVisibility();
    }

    function updateTocVisibility() {
      const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

      document.body.classList.toggle("toc-visible", isOpen);
      if (tocToggle) {
        tocToggle.textContent = isOpen ? "×" : "☰";
      }
      if (closeButton) {
        closeButton.style.display = isMobile && isOpen ? "block" : "none";
      }
      mobileTocLink.style.display = isMobile ? "block" : "none";
      if (toc) {
        toc.style.display = isOpen ? "block" : "none";
      }
    }

    // Function to generate a URL-friendly ID from text
    function generateId(text) {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Add click event listeners
    if (tocToggle) {
      tocToggle.addEventListener("click", toggleToc);
    }
    mobileTocLink.addEventListener("click", toggleToc);
    if (closeButton) {
      closeButton.addEventListener("click", toggleToc);
    }

    // Add this resize event listener here
    window.addEventListener("resize", function () {
      updateTocVisibility();
    });

    // Clear existing TOC entries
    tocList.innerHTML = "";

    // Generate table of contents
    headers.forEach((header) => {
      const li = document.createElement("li");
      const a = document.createElement("a");

      if (!header.id) {
        header.id = generateId(header.textContent);
      }

      a.href = "#" + header.id;
      a.textContent = header.textContent;
      a.className = header.tagName.toLowerCase();

      li.appendChild(a);
      tocList.appendChild(li);
    });

    // Add scroll event listener
    window.addEventListener("scroll", updateActiveTocItem);

    // Smooth scrolling for ToC links
    tocList.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        e.preventDefault();
        const targetId = e.target.getAttribute("href").slice(1);

        if (e.target.textContent.toLowerCase() === "overview") {
          // Scroll to the top of the page for the Overview link
          window.scrollTo({ top: 0, behavior: "smooth" });
          history.pushState(null, null, window.location.pathname);
        } else {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            scrollToElementWithPadding(targetElement);
            history.pushState(null, null, `#${targetId}`);
          }
        }

        if (window.innerWidth <= MOBILE_BREAKPOINT) {
          toggleToc(); // Close TOC after clicking a link on mobile
        }
      }
    });

    // Adjust TOC visibility on window resize
    window.addEventListener("resize", updateTocVisibility);

    // Initial call to set correct visibility
    updateTocVisibility();
    updateActiveTocItem();
  }

  // Back to top functionality
  if (backToTop) {
    backToTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Add smooth scrolling to footnote links and backlinks
  document.addEventListener("click", function (e) {
    if (
      e.target.tagName === "A" &&
      (e.target.getAttribute("href").startsWith("#fn") ||
        e.target.classList.contains("footnote-backref"))
    ) {
      e.preventDefault();
      const targetId = e.target.getAttribute("href").slice(1);
      highlightTarget(targetId);
      history.pushState(null, null, `#${targetId}`);
    }
  });

  // Handle initial load with hash
  if (window.location.hash) {
    const targetId = window.location.hash.slice(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      setTimeout(() => {
        highlightTarget(targetId);
      }, 100);
    }
  }
});

console.log(
  "%cIf you're curious about making reliable, interpretable, and steerable AI systems, you might enjoy working with us at Anthropic. Take a look at our openings: https://anthropic.com/careers",
  "font-family: monospace; font-size: 14px; color: #141413; background-color: #F0EFEA; padding: 5px; border-radius: 5px;",
);
