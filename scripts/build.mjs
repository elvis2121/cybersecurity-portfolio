import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const contentDir = path.join(root, "content");
const publicDir = path.join(root, "public");
const outputDir = path.join(root, "docs");

const profile = JSON.parse(await fs.readFile(path.join(srcDir, "profile.json"), "utf8"));
const projectMetadata = JSON.parse(await fs.readFile(path.join(srcDir, "projects.json"), "utf8"));
const assetVersion = createHash("sha256")
  .update(await fs.readFile(path.join(srcDir, "styles.css")))
  .update(await fs.readFile(path.join(srcDir, "app.js")))
  .digest("hex")
  .slice(0, 10);

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");


const SKIP_EXTRA_SECTIONS = new Set([
  "Repository Structure",
  "GitHub Pages",
  "Notes",
  "Objective",
  "Objectives",
  "Steps",
  "Evidence Walkthrough"
]);

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

const splitH2Sections = (markdown) => {
  const lines = markdown.split(/\r?\n/);
  const sections = [];
  let current = null;

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[1].trim(), body: [] };
      continue;
    }
    if (!current) continue;
    if (/^#\s+/.test(line) && !/^##/.test(line)) continue;
    current.body.push(line);
  }
  if (current) sections.push(current);
  return sections.map((section) => ({
    title: section.title,
    body: section.body.join("\n").trim()
  }));
};

const firstParagraph = (text = "") => {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => !block.startsWith("#") && !block.startsWith("|") && !block.startsWith("```"));
  if (!blocks.length) return "";
  return blocks[0].replace(/\n+/g, " ").trim();
};

const toolsFromLabStack = (section) => {
  const tools = [];
  for (const line of section.split(/\r?\n/)) {
    if (!line.startsWith("|") || /^\|\s*-+/.test(line) || /^\|\s*Layer\s*\|/i.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 2) continue;
    const componentCell = cells[1];
    for (const match of componentCell.matchAll(/`([^`]+)`/g)) {
      tools.push(match[1]);
    }
    if (!/`/.test(componentCell)) {
      componentCell
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => tools.push(part));
    }
  }
  return [...new Set(tools)];
};

const resolveMarkdownHref = (href, project) => {
  if (/^(https?:|mailto:|#)/i.test(href)) return href;
  const cleaned = href.replace(/^\.\//, "").replace(/^\.\.\//, "");
  return `${project.github}/blob/main/${cleaned}`;
};

const inlineMarkdown = (value = "", project = null) =>
  escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const target = project ? resolveMarkdownHref(href, project) : href;
      const external = /^https?:/i.test(target);
      return `<a href="${escapeHtml(target)}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${label}</a>`;
    });

const isTableRow = (line) => line.trim().startsWith("|") && line.trim().endsWith("|");
const isTableDivider = (line) => /^\|\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(line.trim());

const renderMarkdownTable = (rows, project) => {
  if (rows.length < 2) return "";
  const parseRow = (row) =>
    row
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  const header = parseRow(rows[0]);
  const bodyRows = rows.slice(2).map(parseRow);
  return `
    <div class="md-table-wrap">
      <table class="md-table">
        <thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell, project)}</th>`).join("")}</tr></thead>
        <tbody>
          ${bodyRows
            .map(
              (cells) =>
                `<tr>${cells.map((cell) => `<td>${inlineMarkdown(cell, project)}</td>`).join("")}</tr>`
            )
            .join("\n")}
        </tbody>
      </table>
    </div>`;
};

const renderEvidenceFigure = (project, sourcePath, alt, caption) => {
  const source = `../content/projects/${project.slug}/${sourcePath.replace(/^\.\//, "")}`;
  const description = caption || alt || "Project evidence";
  return `
        <figure class="evidence-item" data-reveal>
          <figcaption class="evidence-caption">${inlineMarkdown(description, project)}</figcaption>
          <a class="evidence-link" href="${source}" data-evidence-link data-caption="${escapeHtml(description)}">
            <img src="${source}" alt="${escapeHtml(alt || description)}" loading="lazy">
          </a>
        </figure>`;
};

const renderMarkdown = (markdown, project) => {
  const lines = markdown.split(/\r?\n/);
  const chunks = [];
  let listOpen = false;
  let pendingCaption = "";
  let inCode = false;
  let codeLang = "";
  let codeLines = [];
  let tableRows = [];

  const closeList = () => {
    if (listOpen) {
      chunks.push("</ul>");
      listOpen = false;
    }
  };

  const flushTable = () => {
    if (!tableRows.length) return;
    closeList();
    chunks.push(renderMarkdownTable(tableRows, project));
    tableRows = [];
  };

  const flushCode = () => {
    if (!inCode) return;
    chunks.push(
      `<pre class="md-pre"><code class="language-${escapeHtml(codeLang || "text")}">${escapeHtml(
        codeLines.join("\n")
      )}</code></pre>`
    );
    inCode = false;
    codeLang = "";
    codeLines = [];
  };

  for (const sourceLine of lines) {
    const raw = sourceLine;
    const line = raw.trim();

    if (line.startsWith("```")) {
      flushTable();
      closeList();
      if (inCode) {
        flushCode();
      } else {
        if (pendingCaption) {
          chunks.push(`<p class="evidence-caption">${inlineMarkdown(pendingCaption, project)}</p>`);
          pendingCaption = "";
        }
        inCode = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      }
      continue;
    }

    if (inCode) {
      codeLines.push(raw.replace(/\n$/, ""));
      continue;
    }

    if (!line) {
      flushTable();
      closeList();
      continue;
    }

    if (isTableRow(line)) {
      closeList();
      tableRows.push(line);
      continue;
    }
    flushTable();

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = Math.min(heading[1].length, 3);
      chunks.push(`<h${level}>${inlineMarkdown(heading[2], project)}</h${level}>`);
      continue;
    }

    if (line.startsWith(">")) {
      closeList();
      const quote = line.replace(/^>\s?/, "");
      chunks.push(`<blockquote class="md-quote">${inlineMarkdown(quote, project)}</blockquote>`);
      continue;
    }

    const italicCaption = line.match(/^\*(Ref\s+\d+:\s*[\s\S]+)\*$/i);
    if (italicCaption) {
      closeList();
      pendingCaption = italicCaption[1].trim();
      continue;
    }

    const boldCaption = line.match(/^\*\*(Ref\s+\d+\.)\*\*\s*(.+)$/i);
    if (boldCaption) {
      closeList();
      pendingCaption = `${boldCaption[1]} ${boldCaption[2]}`.trim();
      continue;
    }

    const htmlImage = line.match(/<img\s+[^>]*src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/i);
    if (htmlImage) {
      closeList();
      chunks.push(renderEvidenceFigure(project, htmlImage[1], htmlImage[2] || "", pendingCaption));
      pendingCaption = "";
      continue;
    }

    const mdImage = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (mdImage) {
      closeList();
      chunks.push(renderEvidenceFigure(project, mdImage[2], mdImage[1], pendingCaption));
      pendingCaption = "";
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!listOpen) {
        chunks.push("<ul>");
        listOpen = true;
      }
      chunks.push(`<li>${inlineMarkdown(line.slice(2), project)}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!listOpen) {
        chunks.push("<ul>");
        listOpen = true;
      }
      chunks.push(`<li>${inlineMarkdown(line.replace(/^\d+\.\s+/, ""), project)}</li>`);
      continue;
    }

    closeList();
    if (pendingCaption) {
      chunks.push(`<p class="evidence-caption">${inlineMarkdown(pendingCaption, project)}</p>`);
      pendingCaption = "";
    }
    chunks.push(`<p>${inlineMarkdown(line, project)}</p>`);
  }

  flushTable();
  flushCode();
  closeList();
  if (pendingCaption) {
    chunks.push(`<p class="evidence-caption">${inlineMarkdown(pendingCaption, project)}</p>`);
  }
  return chunks.join("\n");
};

const parseProject = async (metadata) => {
  const projectDir = path.join(contentDir, "projects", metadata.slug);
  const markdown = await fs.readFile(path.join(projectDir, "README.md"), "utf8");
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? metadata.slug;
  const h2Sections = splitH2Sections(markdown);

  let objective = extractSection(markdown, "## Objective", "###|##");
  if (!objective) {
    const overview = h2Sections.find((section) => section.title === "Overview");
    objective = overview ? firstParagraph(overview.body) : "";
  }
  if (!objective) {
    const objectives = extractSection(markdown, "## Objectives", "##");
    const bullets = extractBullets(objectives);
    objective = bullets.length ? bullets.join(" ") : firstParagraph(markdown.replace(/^#.*\n/, ""));
  }

  let skills = extractBullets(extractSection(markdown, "### Skills Learned", "###|##"));
  if (!skills.length) {
    skills = extractBullets(extractSection(markdown, "## Objectives", "##"));
  }
  if (!skills.length) {
    skills = extractBullets(extractSection(markdown, "## Overview", "##"));
  }

  let tools = extractBullets(extractSection(markdown, "### Tools Used", "##"));
  if (!tools.length) {
    const labStack = extractSection(markdown, "## Lab Stack", "##");
    tools = toolsFromLabStack(labStack);
  }

  let steps = extractSection(markdown, "## Steps", "##");
  let stepsHeading = "Lab evidence and investigation steps.";
  if (!steps) {
    steps = extractSection(markdown, "## Evidence Walkthrough", "##");
    stepsHeading = "Evidence walkthrough.";
  }

  const extraSections = h2Sections
    .filter((section) => !SKIP_EXTRA_SECTIONS.has(section.title))
    .filter((section) => section.body.trim().length > 0)
    .map((section) => ({
      title: section.title,
      html: renderMarkdown(section.body, {
        ...metadata,
        github: `${profile.github}/${metadata.slug}`
      })
    }));

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
    stepsHeading,
    extraSections,
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
          <span class="brand-name">${escapeHtml(profile.name)} / SOC Analyst (L2)</span>
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
  <link rel="icon" type="image/png" sizes="64x64" href="${assetPrefix}/assets/favicon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="${assetPrefix}/assets/apple-touch-icon.png">
  <link rel="stylesheet" href="${assetPrefix}/assets/styles.css?v=${assetVersion}">
  <script src="${assetPrefix}/assets/app.js?v=${assetVersion}" defer></script>
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
  ["01", "Engineer resilient defenses", "Design layered controls, segmented environments, and dependable telemetry that reduce risk across infrastructure, endpoints, networks, applications, and cloud platforms."],
  ["02", "Lead response and risk decisions", "Guide investigations, validate threats and vulnerabilities, and translate technical evidence into prioritized remediation and clear direction for stakeholders."],
  ["03", "Scale security capability", "Automate repeatable workflows, improve detection and response playbooks, mentor technical teams, and turn operational lessons into stronger controls."]
];

const homeBody = `
  ${renderHeader()}
  <main id="main-content">
    <section class="hero">
      <div class="container hero-grid">
        <div data-reveal>
          <span class="eyebrow">Hello, I'm</span>
          <h1>${escapeHtml(profile.name)}<span class="hero-title">${escapeHtml(profile.title)}</span></h1>
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
        <div class="stat"><strong>${profile.certifications.length}</strong><span>Credentials</span></div>
      </div>
    </section>

    <section class="section" id="about">
      <div class="container about-grid">
        <aside class="about-aside" data-reveal>
          <p class="section-kicker">About Elvis</p>
          <h2 class="section-title">Security engineering grounded in <span class="accent-text">strategy and proof.</span></h2>
          <p class="section-copy">${escapeHtml(profile.aboutSenior)}</p>
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
        <div class="project-grid" id="project-grid">
          ${projects.map(projectCard).join("")}
        </div>
        <div class="projects-more">
          <button class="button button-secondary projects-more-button" type="button" aria-controls="project-grid" aria-expanded="false" data-project-more hidden>
            Read more
          </button>
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
                    ${job.impact ? `<p class="timeline-impact"><strong>Impact</strong>${escapeHtml(job.impact)}</p>` : ""}
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
        <h2 class="section-title">Cybersecurity <span class="accent-text">credentials.</span></h2>
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

    <section class="section" id="career-target">
      <div class="container opportunity-card" data-reveal>
        <div class="opportunity-grid">
          <div>
            <p class="section-kicker">What I'm looking for</p>
            <h2 class="section-title">${escapeHtml(profile.careerTarget.headingLead)} <span class="accent-text">${escapeHtml(profile.careerTarget.headingAccent)}</span></h2>
            <p class="section-copy">${escapeHtml(profile.careerTarget.summary)}</p>
          </div>
          <ul class="opportunity-list">
            ${profile.careerTarget.priorities.map((priority) => `<li>${escapeHtml(priority)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </section>

    <section class="contact-strip" id="contact">
      <div class="container contact-card" data-reveal>
        <div>
          <p class="section-kicker">Let's connect</p>
          <h2>Hiring a SOC Analyst (L2) or Detection Engineer?</h2>
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


const renderSteps = (project) => renderMarkdown(project.steps || "", project);

const renderExtraSections = (project) => {
  if (!project.extraSections?.length) return "";
  return project.extraSections
    .map(
      (section) => `
      <section class="report-shell report-extra">
        <div class="container">
          <div class="report-header">
            <div>
              <p class="section-kicker">Project detail</p>
              <h2 class="section-title">${escapeHtml(section.title)}</h2>
            </div>
          </div>
          <article class="report-content">${section.html}</article>
        </div>
      </section>`
    )
    .join("\n");
};

const renderProjectPage = (project) => {
  const skillsHtml = project.skills.length
    ? `<ul>${project.skills.map((skill) => `<li>${inlineMarkdown(skill, project)}</li>`).join("")}</ul>`
    : `<p class="section-copy">See the detail sections below for skills demonstrated in this project.</p>`;
  const toolsHtml = project.tools.length
    ? renderTags(project.tools)
    : `<p class="section-copy">See the lab stack and detail sections for tools used.</p>`;
  const stepsAccent = project.stepsHeading?.includes("Evidence")
    ? "Evidence <span class=\"accent-text\">walkthrough.</span>"
    : "Lab evidence and <span class=\"accent-text\">investigation steps.</span>";

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
              <p class="project-objective">${inlineMarkdown(project.objective, project)}</p>
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
          ${skillsHtml}
        </article>
        <article class="summary-card" data-reveal>
          <h2>Tools used</h2>
          ${toolsHtml}
        </article>
      </section>

      ${renderExtraSections(project)}

      <section class="report-shell">
        <div class="container">
          <div class="report-header">
            <div>
              <p class="section-kicker">Technical walkthrough</p>
              <h2 class="section-title">${stepsAccent}</h2>
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
    description: project.objective.replace(/[`*_]/g, "").slice(0, 300),
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
    title: `${profile.name} | SOC Analyst (L2) / Detection Engineer`,
    description: `${profile.name} is a SOC Analyst (L2) and detection engineer in ${profile.location}. Explore published security projects, skills, certifications, and experience.`,
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
