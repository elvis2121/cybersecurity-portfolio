const body = document.body;
const menuButton = document.querySelector("[data-menu-button]");
const siteNav = document.querySelector("[data-site-nav]");

if (menuButton && siteNav) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    siteNav.dataset.open = "false";
    body.classList.remove("menu-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    siteNav.dataset.open = String(!isOpen);
    body.classList.toggle("menu-open", !isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 840) closeMenu();
  });
}

const filterButtons = document.querySelectorAll("[data-project-filter]");
const projectCards = document.querySelectorAll("[data-project-category]");
const projectMoreButton = document.querySelector("[data-project-more]");
const projectLimit = 4;
let activeProjectFilter = "All";
let projectsExpanded = false;

const updateProjects = () => {
  const matchingCards = [...projectCards].filter(
    (card) =>
      activeProjectFilter === "All" ||
      card.dataset.projectCategory === activeProjectFilter
  );

  projectCards.forEach((card) => {
    const matchingIndex = matchingCards.indexOf(card);
    const visible =
      matchingIndex !== -1 &&
      (projectsExpanded || matchingIndex < projectLimit);
    card.hidden = !visible;
  });

  if (!projectMoreButton) return;

  const hiddenProjectCount = Math.max(matchingCards.length - projectLimit, 0);
  projectMoreButton.hidden = hiddenProjectCount === 0;
  projectMoreButton.setAttribute("aria-expanded", String(projectsExpanded));
  projectMoreButton.textContent = projectsExpanded
    ? "Show less"
    : `Read more (${hiddenProjectCount})`;
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeProjectFilter = button.dataset.projectFilter;
    projectsExpanded = false;

    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    updateProjects();
  });
});

projectMoreButton?.addEventListener("click", () => {
  projectsExpanded = !projectsExpanded;
  updateProjects();
});

updateProjects();

const observer = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    )
  : null;

document.querySelectorAll("[data-reveal]").forEach((element) => {
  if (observer) observer.observe(element);
  else element.classList.add("is-visible");
});

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");

if (lightbox && lightboxImage) {
  document.querySelectorAll("[data-evidence-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!lightbox.showModal) return;
      event.preventDefault();
      lightboxImage.src = link.href;
      lightboxImage.alt = link.dataset.caption || "";
      if (lightboxCaption) lightboxCaption.textContent = link.dataset.caption || "";
      lightbox.showModal();
    });
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});
