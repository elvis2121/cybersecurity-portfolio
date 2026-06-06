import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const contentDir = path.join(root, "content");
const publicDir = path.join(root, "public");
const outputDir = path.join(root, "docs");

const profile = JSON.parse(await fs.readFile(path.join(srcDir, "profile.json"), "utf8"));
const projectMetadata = JSON.parse(await fs.readFile(path.join(srcDir, "projects.json"), "utf8"));

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const inlineMarkdown = (value = "") =>
  escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

const extractSection = (markdown, heading, nextHeadingPattern = "##|###") => {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) return "";

  const nextHeading = new RegExp(`^(?:${nextHeadingPattern})\\s`);
  const collected = [];

  for (let index = start + 1; index < lines.length; index += 1) {
    if (nextHeading.test(lines[index].trim())) break;
    collected.push(lines[index]);
  }

  return collected.join("\n").trim();
};

const extractBullets = (section) =>
  section
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("- "))
    .map((line) => line.trim().slice(2).trim());

const parseProject = async (metadata) => {
  const projectDir = path.join(contentDir, "projects", metadata.slug);
  const markdown = await fs.readFile(path.join(projectDir, "README.md"), "utf8");
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? metadata.slug;
  const objective = extractSection(markdown, "## Objective", "###");
  const skillsSection = extractSection(markdown, "### Skills Learned", "###|##");
  const toolsSection = extractSection(markdown, "### Tools Used", "##");
  const steps = extractSection(markdown, "## Steps", "##");
  const skills = extractBullets(skillsSection);
  const tools = extractBullets(toolsSection);
  const assetsDir = path.join(projectDir, "assets");
  let assets = [];

  try {
    assets = (await fs.readdir(assetsDir))
      .filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    assets = [];
  }

  return {
    ...metadata,
    title,
    objective,
    skills,
    tools,
    steps,
    assets,
    screenshotCount: assets.length,
    github: `${profile.github}/${metadata.slug}`
  };
};

const projects = (await Promise.all(projectMetadata.map(parseProject))).sort(
  (a, b) => a.order - b.order
);

const categories = ["All", ...new Set(projects.map((project) => project.category))];

const renderTags = (tags) =>
  `<ul class="tag-list">${tags.map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`).join("")}</ul>`;

const renderHeader = ({ homePath = "./", current = "" } = {}) => {
  const links = [
    ["About", `${homePath}#about`],
    ["Skills", `${homePath}#skills`],
    ["Projects", `${homePath}#projects`],
    ["Experience", `${homePath}#experience`],
    ["Contact", `${homePath}#contact`]
  ];

  return `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header">
      <div class="container nav-shell">
        <a class="brand" href="${homePath}" aria-label="${escapeHtml(profile.name)} home">
          <span class="brand-mark" aria-hidden="true">EN</span>
          <span class="brand-name">${escapeHtml(profile.name)} / SOC Analyst</span>
        </a>
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-navigation" data-menu-button>
          <span aria-hidden="true"></span>
          <span class="sr-only">Toggle navigation</span>
        </button>
        <nav class="site-nav" id="site-navigation" aria-label="Primary navigation" data-site-nav data-open="false">
          ${links
            .map(
              ([label, href]) =>
                `<a href="${href}"${current === label ? ' aria-current="page"' : ""}>${label}</a>`
            )
            .join("")}
          <a class="nav-social" href="${profile.github}" target="_blank" rel="noreferrer">GitHub</a>
          <a class="nav-social" href="${profile.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>
        </nav>
      </div>
    </header>`;
};

const renderFooter = ({ homePath = "./" } = {}) => `
  <footer class="site-footer">
    <div class="container footer-inner">
      <span>© <span data-current-year></span> ${escapeHtml(profile.name)}. Built for evidence-led security work.</span>
      <div class="footer-links">
        <a href="${profile.github}" target="_blank" rel="noreferrer">GitHub</a>
        <a href="${profile.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="mailto:${profile.email}">Email</a>
      </div>
    </div>
  </footer>`;

const pageDocument = ({ title, description, body, assetPrefix = "." }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#070914">
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${assetPrefix}/assets/styles.css">
  <script src="${assetPrefix}/assets/app.js" defer></script>
</head>
<body>
${body}
</body>
</html>`;

const projectCard = (project, index) => `
  <article class="project-card" data-project-category="${escapeHtml(project.category)}" data-reveal>
    <div class="project-thumb">
      <img src="./content/projects/${project.slug}/assets/${project.assets[0]}" alt="" loading="lazy" width="900" height="480">
      <span class="project-number">${String(index + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}</span>
    </div>
    <div class="project-body">
      <p class="project-category">${escapeHtml(project.category)} · ${project.screenshotCount} evidence images</p>
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.objective)}</p>
      <a class="project-link" href="./projects/${project.slug}.html">View detailed case study</a>
    </div>
  </article>`;

const principles = [
  ["01", "Investigate with evidence", "Use packet captures, logs, endpoint artifacts, and reproducible test results before drawing conclusions."],
  ["02", "Communicate the signal", "Turn technical observations into clear impact, priority, and next actions for the wider team."],
  ["03", "Improve the workflow", "Automate repeatable tasks and feed lessons from each investigation back into detection and response."]
];

const homeBody = `
  ${renderHeader()}
  <main id="main-content">
    <section class="hero">
      <div class="container hero-grid">
        <div data-reveal>
          <span class="eyebrow">Hello, I'm</span>
          <h1>${escapeHtml(profile.name)}<span class="hero-title">${escapeHtml(profile.title)} specializing as a ${escapeHtml(profile.specialty)}</span></h1>
          <p class="hero-copy">${escapeHtml(profile.summary)}</p>
          <p class="hero-meta">
            <span>${escapeHtml(profile.location)}</span>
            <span><i class="status-dot" aria-hidden="true"></i>${escapeHtml(profile.availability)}</span>
          </p>
          <div class="button-row">
            <a class="button" href="#projects">Explore security projects</a>
            <a class="button button-secondary" href="mailto:${profile.email}">Email Elvis</a>
          </div>
        </div>
        <div class="portrait-frame" data-reveal>
          <img src="./assets/elvis-njau-portrait.webp" alt="Portrait of Elvis Njau" width="960" height="1200">
          <div class="portrait-label"><strong>Blue-team mindset</strong>Curious, methodical, and ready to contribute.</div>
        </div>
      </div>
    </section>

    <section class="stats-strip" aria-label="Portfolio highlights">
      <div class="container stats-grid">
        <div class="stat"><strong>${projects.length}</strong><span>Published labs</span></div>
        <div class="stat"><strong>${projects.reduce((total, project) => total + project.screenshotCount, 0)}+</strong><span>Evidence captures</span></div>
        <div class="stat"><strong>8 yrs</strong><span>IT experience</span></div>
        <div class="stat"><strong>${profile.certifications.length}</strong><span>Certifications</span></div>
      </div>
    </section>

    <section class="section" id="about">
      <div class="container about-grid">
        <aside class="about-aside" data-reveal>
          <p class="section-kicker">About Elvis</p>
          <h2 class="section-title">Security work grounded in <span class="accent-text">curiosity and proof.</span></h2>
          <p class="section-copy">${escapeHtml(profile.objective)}</p>
        </aside>
        <div class="principles">
          ${principles
            .map(
              ([index, title, copy]) => `
                <article class="principle" data-reveal>
                  <span class="principle-index">${index}</span>
                  <div><h3>${title}</h3><p>${copy}</p></div>
                </article>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section projects-section" id="skills">
      <div class="container">
        <p class="section-kicker">Technical capability</p>
        <h2 class="section-title">A practical toolkit for <span class="accent-text">modern security operations.</span></h2>
        <p class="section-copy">Hands-on experience across monitoring, investigation, testing, automation, infrastructure, and security frameworks.</p>
        <div class="skills-grid">
          ${profile.skillGroups
            .map(
              (group) => `
                <article class="skill-card" data-reveal>
                  <h3>${escapeHtml(group.title)}</h3>
                  <p>${escapeHtml(group.description)}</p>
                  ${renderTags(group.tools)}
                </article>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section projects-section" id="projects">
      <div class="container">
        <div class="projects-heading">
          <div>
            <p class="section-kicker">Selected evidence</p>
            <h2 class="section-title">Published <span class="accent-text">cybersecurity projects.</span></h2>
          </div>
          <p class="section-copy">Every project below is published on GitHub and includes the full lab report with readable technical evidence.</p>
        </div>
        <div class="filter-bar" aria-label="Filter projects">
          ${categories
            .map(
              (category, index) =>
                `<button class="filter-button${index === 0 ? " is-active" : ""}" type="button" aria-pressed="${index === 0}" data-project-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`
            )
            .join("")}
        </div>
        <div class="project-grid">
          ${projects.map(projectCard).join("")}
        </div>
      </div>
    </section>

    <section class="section" id="experience">
      <div class="container">
        <p class="section-kicker">Professional foundation</p>
        <h2 class="section-title">Experience supporting <span class="accent-text">reliable, secure operations.</span></h2>
        <div class="timeline">
          ${profile.experience
            .map(
              (job) => `
                <article class="timeline-item" data-reveal>
                  <div class="timeline-period">${escapeHtml(job.period)}</div>
                  <div class="timeline-content">
                    <h3>${escapeHtml(job.role)}</h3>
                    <p class="timeline-company">${escapeHtml(job.company)}</p>
                    <ul>${job.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>
                  </div>
                </article>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section projects-section" id="certifications">
      <div class="container">
        <p class="section-kicker">Continuous learning</p>
        <h2 class="section-title">Cybersecurity <span class="accent-text">certifications.</span></h2>
        <div class="cert-grid">
          ${profile.certifications
            .map(
              (certification) => `
                <article class="cert-card" data-reveal>
                  <span class="cert-date">${escapeHtml(certification.date)}</span>
                  <h3>${escapeHtml(certification.name)}</h3>
                  <p>${escapeHtml(certification.issuer)}</p>
                </article>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container opportunity-card" data-reveal>
        <div class="opportunity-grid">
          <div>
            <p class="section-kicker">What I'm looking for</p>
            <h2 class="section-title">A junior SOC role with room to <span class="accent-text">investigate and grow.</span></h2>
            <p class="section-copy">${escapeHtml(profile.objective)}</p>
          </div>
          <ul class="opportunity-list">
            <li>Alert monitoring, triage, escalation, and incident documentation</li>
            <li>Network, endpoint, identity, and cloud telemetry analysis</li>
            <li>Threat hunting, IOC enrichment, and MITRE ATT&CK mapping</li>
            <li>Detection tuning, playbook improvement, and analyst automation</li>
            <li>Collaborative learning in a disciplined blue-team environment</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="contact-strip" id="contact">
      <div class="container contact-card" data-reveal>
        <div>
          <p class="section-kicker">Let's connect</p>
          <h2>Hiring for a junior SOC analyst?</h2>
          <p>${escapeHtml(profile.location)} · ${escapeHtml(profile.availability)}</p>
        </div>
        <div class="button-row">
          <a class="button" href="mailto:${profile.email}">Email ${escapeHtml(profile.name)}</a>
          <a class="button button-secondary" href="${profile.linkedin}" target="_blank" rel="noreferrer">LinkedIn profile</a>
        </div>
      </div>
    </section>
  </main>
  ${renderFooter()}
`;

const renderSteps = (project) => {
  const lines = project.steps.split(/\r?\n/);
  const chunks = [];
  let listOpen = false;
  let pendingCaption = "";

  const closeList = () => {
    if (listOpen) {
      chunks.push("</ul>");
      listOpen = false;
    }
  };

  for (const sourceLine of lines) {
    const line = sourceLine.trim();
    if (!line) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = Math.min(heading[1].length, 3);
      chunks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const caption = line.match(/^\*(Ref\s+\d+:\s*[\s\S]+)\*$/i);
    if (caption) {
      closeList();
      pendingCaption = caption[1].trim();
      continue;
    }

    const image = line.match(/<img\s+[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i);
    if (image) {
      closeList();
      const source = `../content/projects/${project.slug}/${image[1]}`;
      const description = pendingCaption || image[2] || "Project evidence";
      chunks.push(`
        <figure class="evidence-item" data-reveal>
          <figcaption class="evidence-caption">${inlineMarkdown(description)}</figcaption>
          <a class="evidence-link" href="${source}" data-evidence-link data-caption="${escapeHtml(description)}">
            <img src="${source}" alt="${escapeHtml(image[2] || description)}" loading="lazy">
          </a>
        </figure>`);
      pendingCaption = "";
      continue;
    }

    if (line.startsWith("- ")) {
      if (!listOpen) {
        chunks.push("<ul>");
        listOpen = true;
      }
      chunks.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    closeList();
    if (pendingCaption) {
      chunks.push(`<p class="evidence-caption">${inlineMarkdown(pendingCaption)}</p>`);
      pendingCaption = "";
    }
    chunks.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  closeList();
  return chunks.join("\n");
};

const renderProjectPage = (project) => {
  const body = `
    ${renderHeader({ homePath: "../" })}
    <main id="main-content">
      <section class="project-hero">
        <div class="container">
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <a href="../">Portfolio</a><span>/</span><a href="../#projects">Projects</a><span>/</span><span>${escapeHtml(project.title)}</span>
          </nav>
          <div class="project-hero-grid">
            <div data-reveal>
              <p class="section-kicker">${escapeHtml(project.category)} case study</p>
              <h1>${escapeHtml(project.title)}</h1>
              <p class="project-objective">${escapeHtml(project.objective)}</p>
              <div class="button-row">
                <a class="button" href="${project.github}" target="_blank" rel="noreferrer">View GitHub repository</a>
                <a class="button button-secondary" href="../#projects">All projects</a>
              </div>
            </div>
            <aside class="project-facts" data-reveal>
              <div class="project-fact"><span>Focus</span><strong>${escapeHtml(project.category)}</strong></div>
              <div class="project-fact"><span>Evidence</span><strong>${project.screenshotCount} screenshots</strong></div>
              <div class="project-fact"><span>Repository</span><strong>Public on GitHub</strong></div>
            </aside>
          </div>
        </div>
      </section>

      <section class="container project-summary-grid">
        <article class="summary-card" data-reveal>
          <h2>Skills demonstrated</h2>
          <ul>${project.skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("")}</ul>
        </article>
        <article class="summary-card" data-reveal>
          <h2>Tools used</h2>
          ${renderTags(project.tools)}
        </article>
      </section>

      <section class="report-shell">
        <div class="container">
          <div class="report-header">
            <div>
              <p class="section-kicker">Technical walkthrough</p>
              <h2 class="section-title">Lab evidence and <span class="accent-text">investigation steps.</span></h2>
            </div>
            <a class="button button-secondary" href="${project.github}" target="_blank" rel="noreferrer">Open on GitHub</a>
          </div>
          <article class="report-content">${renderSteps(project)}</article>
        </div>
      </section>
    </main>
    <dialog class="lightbox" data-lightbox>
      <img src="" alt="" data-lightbox-image>
      <footer>
        <p data-lightbox-caption></p>
        <button type="button" onclick="this.closest('dialog').close()">Close</button>
      </footer>
    </dialog>
    ${renderFooter({ homePath: "../" })}
  `;

  return pageDocument({
    title: `${project.title} | ${profile.name}`,
    description: project.objective,
    body,
    assetPrefix: ".."
  });
};

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(path.join(outputDir, "projects"), { recursive: true });
await fs.cp(publicDir, outputDir, { recursive: true });
await fs.cp(contentDir, path.join(outputDir, "content"), { recursive: true });
await fs.mkdir(path.join(outputDir, "assets"), { recursive: true });
await fs.copyFile(path.join(srcDir, "styles.css"), path.join(outputDir, "assets", "styles.css"));
await fs.copyFile(path.join(srcDir, "app.js"), path.join(outputDir, "assets", "app.js"));

await fs.writeFile(
  path.join(outputDir, "index.html"),
  pageDocument({
    title: `${profile.name} | Junior Cybersecurity Engineer & SOC Analyst`,
    description: `${profile.name} is a junior cybersecurity engineer and SOC analyst in ${profile.location}. Explore published security projects, skills, certifications, and experience.`,
    body: homeBody
  })
);

for (const project of projects) {
  await fs.writeFile(
    path.join(outputDir, "projects", `${project.slug}.html`),
    renderProjectPage(project)
  );
}

await fs.writeFile(path.join(outputDir, ".nojekyll"), "");
await fs.writeFile(
  path.join(outputDir, "404.html"),
  pageDocument({
    title: `Page not found | ${profile.name}`,
    description: "The requested portfolio page could not be found.",
    body: `${renderHeader()}<main id="main-content" class="not-found"><div><p class="section-kicker">404</p><h1>Page not found</h1><p class="section-copy">The page may have moved.</p><a class="button" href="./">Return to portfolio</a></div></main>${renderFooter()}`
  })
);

console.log(`Built ${projects.length} project pages in ${outputDir}`);
