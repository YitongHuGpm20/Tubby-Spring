import Phaser from "phaser";
import {
  Resort,
  ANIMALS,
  FACILITIES,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  type FacilityKind,
  type Pricing,
} from "./simulation/resort";
import { ResortScene, type Selection } from "./game/ResortScene";
import { artUri, facilityArt, icon } from "./game/art";
import "./style.css";
import {
  CHAPTERS,
  RESEARCH,
  ACHIEVEMENTS,
  METRIC_LABELS,
} from "./simulation/progression";
const SAVE_KEY = "tubby-springs-resort-v1";
let resetting = false;
let saved: unknown;
try {
  saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");
} catch {
  /* Start fresh if storage is unavailable. */
}
const world = new Resort(saved);
let selection: Selection = null;
let activePanel = "";
let renderedPanelHtml = "";
let muted = true;
let sound: AudioContext | null = null;
const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const money = (n: number) => Math.floor(n).toLocaleString("en-US");
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const img = (kind: FacilityKind) =>
  `<img src="${artUri(facilityArt[kind])}" alt=""/>`;
$("#app").innerHTML = `
<header class="topbar">
  <a class="brand" href="#" aria-label="Tubby Springs home"><span class="brand-sticker">♨</span><span><strong>Tubby Springs<span class="brand-dot">.</span></strong><small>A VERY UNBUSY BUSINESS</small></span></a>
  <div class="resort-stats"><button id="coins" class="stat-chip" data-panel="finance" title="Open the cashbook">${icon("coin")}<span><small>YOUR COINS</small><strong id="coin-count">300</strong></span></button><button class="stat-chip" data-panel="guests" title="Meet your guests">${icon("guests")}<span><small>HAPPY LITTLE VISITORS</small><strong id="guest-count">4 / 10</strong></span></button><span class="stat-chip reputation">${icon("star")}<span><small>WORD ON THE STREET</small><strong id="reputation-count">58 <em>/ 100</em></strong></span></span></div>
  <div class="top-actions"><button id="main-menu-button" class="icon-button" aria-label="Main menu" title="Main menu">☰</button><button id="sound" class="icon-button" aria-label="Enable sound" title="Enable sound">${icon("sound")}</button><button id="help" class="icon-button" aria-label="How to play" title="How to play">?</button><button id="open-journal" class="journal-button" data-panel="journal">${icon("book")}<span>Guestbook</span></button></div>
</header>
<main class="playfield" aria-label="Your animal hot spring resort">
  <div id="game" aria-label="Resort map. Drag to pan, scroll to zoom. Use the guest and facility lists for keyboard selection."></div>
  <div class="landscape-caption" aria-hidden="true"><span class="eyebrow">THE ART OF DOING NOTHING</span><h1>Little guests.<br>Big relaxation.</h1><p>Your cozy corner of the world.</p></div>
  <button id="goal-note" class="goal-note" inert data-panel="goals"><span class="tape"></span><span class="eyebrow">THE COMMISSION BOARD</span><strong id="goal-title">Make your first 100 coins</strong><span class="goal-bottom"><span id="goal-progress">32 / 100 earned</span><span>${icon("arrow")}</span></span><span class="goal-track"><i id="goal-fill"></i></span></button>
  <div id="day-card" class="day-card" inert><span id="weather-icon">${icon("sun")}</span><div><strong id="day-label">Day 1 · Sunny</strong><small id="weather-hint">Perfect weather for a little loafing.</small></div></div>
  <div class="context-tools"><button id="show-day" aria-controls="day-card" aria-expanded="false">Day &amp; weather</button><button id="show-goal" aria-controls="panel" aria-expanded="false">To-do</button></div>
  <div class="camera-tools"><button id="zoom-out" aria-label="Zoom out">−</button><span id="zoom">100%</span><button id="zoom-in" aria-label="Zoom in">+</button><button id="fit" title="Fit the whole resort">Fit</button></div>
  <div class="time-tools"><button id="pause" aria-label="Pause simulation">${icon("pause")}</button><button id="speed" title="Change simulation speed">1×</button></div>
  <div class="map-instructions" id="map-hint">Drag to wander · scroll to peek closer</div>
  <div id="toast" role="status" hidden></div>
  <aside id="panel" class="paper-panel" aria-label="Resort details" hidden><div class="panel-heading"><span class="eyebrow" id="panel-label">GUEST CARD</span><button id="close-panel" class="icon-button" aria-label="Close panel">${icon("close")}</button></div><div id="panel-body"></div></aside>
</main>
<footer class="bottom-bar">
  <div class="dock-intro"><span class="eyebrow">MAKE ROOM FOR</span><strong>more happy.</strong><button id="toggle-tools" aria-expanded="true" aria-controls="build-tools">Hide tools</button></div>
  <div class="build-tools" id="build-tools">${Object.entries(FACILITIES)
    .map(
      ([kind, f]) =>
        `<button class="build-card" data-build="${kind}" aria-pressed="false" title="${f.description}">${img(kind as FacilityKind)}<span><strong>${f.name}</strong><small>${icon("coin")} ${f.cost}</small></span></button>`,
    )
    .join("")}</div>
  <div class="dock-actions"><button class="party-button" id="party"><span>✳</span><strong>Towel party</strong><small>35 coins · spread the joy</small></button><button class="manage-button" data-panel="facilities">Manage facilities ${icon("arrow")}</button></div>
</footer>
<dialog id="welcome" class="welcome"><button id="close-help" class="icon-button" aria-label="Close guide">${icon("close")}</button><span class="eyebrow">WELCOME TO YOUR HAPPY LITTLE PLACE</span><div class="welcome-icon">♨</div><h2>Less hustle.<br>More hot springs.</h2><p>Build a cozy retreat. Your guests handle the relaxing.</p><div class="welcome-steps"><div><span>01</span><strong>Make a little room</strong><p>Choose a facility below, then click a clear spot in the garden.</p></div><div><span>02</span><strong>Let them be themselves</strong><p>Animals eat, soak, nap and pay on their own. Gardens grow with the weather.</p></div><div><span>03</span><strong>Keep it cozy</strong><p>Freshen up facilities, upgrade busy spots and earn happy reviews.</p></div></div><button id="start" class="primary-button">Open for loafing ${icon("arrow")}</button><small>8-coin entry · services earn coins · supplies cost coins each minute<br>Progress saves automatically on this browser.</small></dialog>
<dialog id="main-menu" class="main-menu" aria-labelledby="menu-title"><button id="close-menu" class="icon-button" aria-label="Close main menu">${icon("close")}</button><span class="eyebrow">A VERY UNBUSY BUSINESS</span><div class="welcome-icon">♨</div><h2 id="menu-title">Tubby Springs.</h2><p class="hand-note">Your happy little place.</p><div class="menu-options"><button id="menu-play" class="primary-button">${saved ? "Continue your retreat" : "Open for loafing"} ${icon("arrow")}</button><button id="menu-help" class="secondary-button">How to play</button><button class="secondary-button" id="menu-career">Your retreat journey</button><button id="menu-credits" class="secondary-button">Credits</button></div></dialog>
<dialog id="credits" class="credits-dialog" aria-labelledby="credits-title"><button id="close-credits" class="icon-button" aria-label="Close credits">${icon("close")}</button><span class="eyebrow">THE LITTLE DETAILS BEHIND THE BUBBLES</span><h2 id="credits-title">Credits</h2><p class="hand-note">A cozy place, made with a little help.</p><h3>Character art &amp; animation</h3><p>Created for Tubby Springs with <a href="https://dreamlayer.io/" target="_blank" rel="noopener noreferrer">DreamLayer</a>. All four animal designs, their reference images and all 12 animation sheets are DreamLayer-generated.</p><div class="credits-animals">${Object.entries(
  ANIMALS,
)
  .map(
    ([kind, animal]) =>
      `<article><img src="./art/${kind}-portrait.png" alt="${animal.name}"/><div><strong>${animal.name}</strong><small>${kind === "capybara" || kind === "penguin" ? "Walk · idle · bathing" : kind === "shiba" ? "Walk · idle · eating" : "Walk · idle · sleeping"}</small><span class="credits-provider">DreamLayer</span></div></article>`,
  )
  .join(
    "",
  )}</div><p class="credits-note">Guest portraits come from these same animations. Each animation has 7 transparent frames. Some other activities use idle poses with in-game effects.</p><h3>Scenery, facilities &amp; interface</h3><p>Original illustrations and code created for this project with Codex assistance: the landscape, hot spring, snack shack, cabins, garden, trees, signs, icons, paper cards, logo treatment, weather and activity effects.</p><h3>Visual inspiration</h3><p>Collage / Cutout Animation — the ninth style in <a href="https://vincentwei1021.github.io/mg-styles-15/" target="_blank" rel="noopener noreferrer">Vincent Wei’s 15 Motion Design Styles</a>. Used as a visual reference; the demo’s artwork is not included.</p><h3>Typography</h3><p><a href="https://github.com/undercasetype/Fraunces" target="_blank" rel="noopener noreferrer">Fraunces</a> — The Fraunces Project Authors.<br><a href="https://github.com/google/fonts/tree/main/ofl/patrickhand" target="_blank" rel="noopener noreferrer">Patrick Hand</a> — Patrick Wagesreiter.<br>Both distributed under the SIL Open Font License 1.1.</p><h3>Sound &amp; tools</h3><p>Interface sounds are synthesized in the game. Built with Phaser, Vite and TypeScript.</p><p class="credits-note">DreamLayer-generated art is subject to the service’s applicable terms. Full asset records and font license notices are included with the project.</p><button id="credits-back" class="primary-button">Back to main menu</button></dialog>
<dialog id="reset-dialog" class="reset-dialog"><h2>A fresh little start?</h2><p>This replaces your saved resort, coins and guest progress.</p><div><button id="cancel-reset">Keep my resort</button><button id="confirm-reset" class="primary-button">Start fresh</button></div></dialog>`;
const scene = new ResortScene(
  world,
  select,
  (kind, x, y) => {
    const before = world.facilities.length;
    notify(world.build(kind, x, y));
    if (world.facilities.length > before) {
      clearTool();
      tone();
      save();
    }
    render();
  },
  (z) => {
    $("#zoom").textContent = `${Math.round(z * 100)}%`;
  },
);
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
  backgroundColor: "#e7e8cf",
  scale: { mode: Phaser.Scale.RESIZE },
  audio: { noAudio: true },
  input: { activePointers: 2 },
  scene,
  pixelArt: false,
  roundPixels: false,
});
function tone(): void {
  if (muted) return;
  try {
    sound ??= new AudioContext();
    void sound.resume();
    const oscillator = sound.createOscillator(),
      gain = sound.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, sound.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      880,
      sound.currentTime + 0.08,
    );
    gain.gain.setValueAtTime(0.035, sound.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, sound.currentTime + 0.18);
    oscillator.connect(gain).connect(sound.destination);
    oscillator.start();
    oscillator.stop(sound.currentTime + 0.2);
  } catch {
    /* Sound is optional. */
  }
}
let toastTimer = 0;
function notify(text: string): void {
  $("#toast").textContent = text;
  $("#toast").hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    $("#toast").hidden = true;
  }, 4200);
}
function save(): void {
  if (resetting) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(world.snapshot()));
    world.saved = true;
  } catch {
    world.saved = false;
  }
}
function clearTool(): void {
  scene.tool = null;
  document
    .querySelectorAll("[data-build]")
    .forEach((el) => el.setAttribute("aria-pressed", "false"));
  $("#map-hint").textContent = "Drag to wander · scroll to peek closer";
  $("#game").classList.remove("placing");
}
function select(s: Selection): void {
  selection = s;
  scene.selected = s;
  activePanel = s?.type ?? "";
  if (s) {
    clearTool();
    $("#panel").hidden = false;
    renderPanel(true);
  } else closePanel();
}
function closePanel(): void {
  $("#panel").hidden = true;
  selection = null;
  scene.selected = null;
  activePanel = "";
}
function openPanel(name: string): void {
  clearTool();
  selection = null;
  scene.selected = null;
  activePanel = name;
  $("#panel").hidden = false;
  renderPanel(true);
}
const TUTORIAL_GOALS = [
  {
    id: "income",
    title: "Make your first 100 coins",
    value: () => Math.min(100, world.income),
    target: 100,
    text: "Guest entry and services earn coins automatically.",
  },
  {
    id: "lodge",
    title: "Build a cozy cabin",
    value: () => (world.facilities.some((f) => f.kind === "lodge") ? 1 : 0),
    target: 1,
    text: "A place to nap also increases guest capacity.",
  },
  {
    id: "reviews",
    title: "Earn 5 happy goodbyes",
    value: () => Math.min(5, world.happy),
    target: 5,
    text: "Keep guests comfortable for four- and five-star reviews.",
  },
  {
    id: "garden",
    title: "Let the garden flourish",
    value: () => Math.min(100, Math.floor(world.gardenScore)),
    target: 100,
    text: "Gardens grow over time. Rain helps them flourish.",
  },
  {
    id: "species",
    title: "Welcome all four friends",
    value: () => world.progression.seen.length,
    target: 4,
    text: "A lush garden or high reputation attracts penguins.",
  },
];
function journeyPanel(tab: string): string {
  const p = world.progression;
  const chapter = CHAPTERS[world.rank];
  const next = CHAPTERS[world.rank + 1];
  const nav = `<nav class="journey-tabs" aria-label="Retreat progress">${[
    ["goals", "To-do"],
    ["tutorial", "Getting started"],
    ["career", "Chapters"],
    ["research", "Research & staff"],
    ["districts", "Meadows"],
    ["achievements", "Achievements"],
  ]
    .map(
      ([id, title]) =>
        `<button data-panel="${id}" aria-current="${tab === id ? "page" : "false"}">${title}</button>`,
    )
    .join("")}</nav>`;
  let body = "";
  if (tab === "goals") {
    body = `<h2>Always a little to do.</h2><p>Three ongoing commissions. Claim a finished request to receive coins, research stamps and a fresh task. Difficulty grows with your retreat.</p><div class="chapter-summary"><strong>Chapter ${world.rank + 1} · ${chapter.name}</strong><small>${money(p.xp)} retreat XP · ${p.completed} commissions completed · ${p.stamps} stamps</small></div>${p.contracts
      .map((c) => {
        const value = world.contractProgress(c);
        const ready = value >= c.target;
        return `<article class="commission ${ready ? "ready" : ""}"><span class="eyebrow">${["SERVICES", "GUEST RELATIONS", "RESORT CARE"][c.slot]}</span><h3>${c.title}</h3><meter min="0" max="${c.target}" value="${value}"></meter><div class="receipt-row"><span>${money(value)} / ${money(c.target)} ${METRIC_LABELS[c.metric]}</span><strong>${c.coins} coins</strong></div><small>+${c.stamps} stamps · +${c.xp} XP</small><button class="${ready ? "primary" : "secondary"}-button" data-claim="${c.id}" ${ready ? "" : "disabled"}>${ready ? "Claim & get next request" : "In progress"}</button></article>`;
      })
      .join(
        "",
      )}<h3>${world.event.name}</h3><p>${world.rank ? world.event.text : "Seasonal guest clubs begin in Chapter 2."} Next club in ${Math.ceil(world.eventRemaining / 60)} minutes.</p>`;
  } else if (tab === "tutorial") {
    body = `<h2>Getting started.</h2><p>Five introductory steps. Your ongoing To-do board keeps going after these are finished.</p>${TUTORIAL_GOALS.map((goal) => `<div class="goal-item ${world.milestones.has(goal.id) ? "complete" : ""}"><span class="goal-check">${icon(world.milestones.has(goal.id) ? "check" : "star")}</span><div><strong>${goal.title}</strong><p>${goal.text}</p><small>${world.milestones.has(goal.id) ? "DONE" : `${goal.value()} / ${goal.target}`}</small></div></div>`).join("")}<button class="primary-button" data-tutorial="true" ${p.tutorialClaimed || world.milestones.size < 5 ? "disabled" : ""}>${p.tutorialClaimed ? "Welcome gift received" : "Claim welcome gift · 100 coins + 3 stamps"}</button>`;
  } else if (tab === "career") {
    body = `<h2>A little place.<br>A long journey.</h2><p>${chapter.text} Chapters unlock through service XP and completed commissions. Play at your own pace.</p>${CHAPTERS.map((c, i) => `<article class="chapter-row ${i <= world.rank ? "complete" : ""}"><span>${String(i + 1).padStart(2, "0")}</span><div><strong>${c.name}</strong><p>${c.text}</p><small>${i <= world.rank ? "UNLOCKED" : `${money(p.xp)} / ${money(c.xp)} XP · ${p.completed} / ${c.tasks} commissions`}</small></div></article>`).join("")}<p class="panel-note">${next ? `Next: ${next.name}.` : "Your ongoing commissions and gold achievements continue beyond the final chapter."}</p>`;
  } else if (tab === "research") {
    body = `<h2>Tiny big ideas.</h2><p>Spend commission and achievement stamps on permanent improvements.</p><div class="receipt-row"><span>Research stamps</span><strong>${p.stamps}</strong></div>${RESEARCH.map((r) => `<article class="research-item"><h3>${r.name}</h3><p>${r.text}</p><small>Chapter ${r.rank + 1} · ${money(r.coins)} coins · ${r.stamps} stamps</small><button class="secondary-button" data-research="${r.id}" ${world.hasResearch(r.id) || world.rank < r.rank || world.coins < r.coins || p.stamps < r.stamps ? "disabled" : ""}>${world.hasResearch(r.id) ? "Researched" : world.rank < r.rank ? `Unlocks in Chapter ${r.rank + 1}` : "Research"}</button></article>`).join("")}<h3>The towel team</h3><p>${p.staff} / 12 caretakers. Each costs 2 coins per simulation minute and refreshes ${world.hasResearch("staff") ? "two facilities" : "one facility"} below 70% cleanliness each round. Supplies cost 4 coins per cleaned facility.</p><button class="primary-button" data-hire="true" ${!world.hasResearch("care") || p.staff >= 12 || world.coins < 120 + p.staff * 80 ? "disabled" : ""}>Hire caretaker · ${120 + p.staff * 80} coins</button><button class="text-button" data-dismiss="true" ${p.staff ? "" : "disabled"}>Let one caretaker clock off</button>`;
  } else if (tab === "districts") {
    body = `<h2>Nine little neighborhoods.</h2><p>The center meadow is your first retreat. Specialize each meadow to shape your layout: matching facilities gain capacity and service fees. Garden themes also improve natural growth.</p>${p.districts
      .map(
        (d, i) =>
          `<article class="research-item"><h3>${["Northwest", "North", "Northeast", "West", "Central", "East", "Southwest", "South", "Southeast"][i]} meadow · ${d.level ? `Level ${d.level}` : "Unthemed"}</h3><p>${d.kind ? `${FACILITIES[d.kind].name} focus · +${d.level} slots, +${d.level * 8}% service fees` : "Choose a focus for this district."}</p>${Object.entries(
            FACILITIES,
          )
            .map(([kind, f]) => {
              const cost = world.districtCost(i, kind as FacilityKind);
              const stamps = world.districtStamps(i, kind as FacilityKind);
              const changing = d.kind !== null && d.kind !== kind;
              return `<button class="secondary-button" data-district="${i}" data-theme="${kind}" ${!Number.isFinite(cost) || world.rank < 3 || (!changing && d.level >= 2 && world.rank < 6) || world.coins < cost || p.stamps < stamps ? "disabled" : ""}>${d.kind === kind ? "Upgrade" : changing ? "Change to" : "Choose"} ${f.name} · ${Number.isFinite(cost) ? `${money(cost)} coins${stamps ? ` + ${stamps} stamps` : ""}` : "Max level"}</button>`;
            })
            .join(
              "",
            )}<button class="text-button" data-focus-meadow="${i}">Find this meadow →</button></article>`,
      )
      .join("")}`;
  } else {
    body = `<h2>The little trophy shelf.</h2><p>${p.achievements.length} / ${ACHIEVEMENTS.length} achievements. Each badge awards research stamps automatically; each reward is granted once.</p>${ACHIEVEMENTS.map(
      (a) => {
        const done = p.achievements.includes(a.id);
        return `<article class="achievement-row ${done ? "complete" : ""}"><span>${icon(done ? "check" : "star")}</span><div><strong>${a.title}</strong><p>${a.text}</p><small>${done ? "UNLOCKED" : `${money(Math.min(a.target, world.achievementValue(a.metric)))} / ${money(a.target)}`} · +${a.stamps} stamps</small></div></article>`;
      },
    ).join("")}`;
  }
  return nav + body;
}
function renderPanel(force = false): void {
  let label = "",
    html = "";
  if (activePanel === "guest" && selection?.type === "guest") {
    const g = world.guests.find((g) => g.id === selection!.id);
    if (!g) {
      closePanel();
      return;
    }
    label = "A VERY IMPORTANT GUEST";
    html = `<div class="guest-portrait"><img src="./art/${g.kind}-portrait.png" alt="${ANIMALS[g.kind].name}"/></div><span class="tag">${ANIMALS[g.kind].name}</span><h2>${escape(g.name)}</h2><p class="hand-note">${ANIMALS[g.kind].description}</p><div class="behavior-pill">${g.state === "bathing" ? "Taking relaxation very seriously" : g.state === "eating" ? "Conducting a snack inspection" : g.state === "sleeping" ? "In a meeting with their pillow" : g.state === "queueing" ? "Patiently waiting. Mostly." : g.state === "leaving" ? "Heading home with stories" : "Exploring the good life"}</div><div class="needs">${[
      ["Hunger", g.hunger],
      ["Tiredness", g.energy],
      ["Need for a soak", g.comfort],
    ]
      .map(
        ([name, val]) =>
          `<label>${name}<span>${Math.round(val as number)}%</span><meter min="0" max="100" value="${val}"></meter></label>`,
      )
      .join(
        "",
      )}</div><p class="panel-note">Lower needs mean a happier guest. Animals choose their own activities.</p><div class="receipt-row"><span>Happiness</span><strong>${Math.round(g.satisfaction)}%</strong></div><div class="receipt-row"><span>Spent at your retreat</span><strong>${money(g.spent)} coins</strong></div><button class="primary-button" data-focus-guest="${g.id}">Find this little friend ${icon("arrow")}</button>`;
  } else if (activePanel === "facility" && selection?.type === "facility") {
    const f = world.facilities.find((f) => f.id === selection!.id);
    if (!f) {
      closePanel();
      return;
    }
    label = "A COZY LITTLE INVESTMENT";
    const upgrade = world.upgradeCost(f);
    html = `<div class="facility-portrait">${img(f.kind)}</div><span class="tag">LEVEL ${f.level}</span><h2>${FACILITIES[f.kind].name}</h2><p class="hand-note">${FACILITIES[f.kind].description}</p><div class="receipt-row"><span>Guests relaxing</span><strong>${world.occupancy(f)} / ${world.capacityOf(f)}</strong></div><div class="receipt-row"><span>Service price</span><strong>${world.fee(f) ? `${world.fee(f)} coins` : "On the house"}</strong></div><div class="receipt-row"><span>Supplies per minute</span><strong>${FACILITIES[f.kind].upkeep * f.level} coins</strong></div><div class="receipt-row"><span>Guests served</span><strong>${f.served}</strong></div><div class="needs"><label>Cleanliness<span>${Math.round(f.cleanliness)}%</span><meter min="0" max="100" value="${f.cleanliness}"></meter></label>${f.kind === "garden" ? `<label>Natural growth<span>${Math.round(f.growth)}%</span><meter min="0" max="100" value="${f.growth}"></meter></label>` : ""}</div><button class="primary-button" data-clean="${f.id}" ${world.coins < 8 || f.cleanliness >= 98 ? "disabled" : ""}>Fresh towels · 8 coins</button><button class="secondary-button" data-upgrade="${f.id}" ${world.coins < upgrade || f.level >= world.maxLevel ? "disabled" : ""}>${f.level >= world.maxLevel ? "Research more comfort" : `Upgrade · ${upgrade} coins`}</button>`;
  } else if (activePanel === "finance") {
    label = "THE LITTLE CASHBOOK";
    html = `<h2>Good business.<br>Better naps.</h2><div class="big-balance">${icon("coin")} ${money(world.coins)}<small>COINS IN THE TIN</small></div><div class="receipt-row"><span>Total earned</span><strong>+${money(world.income)}</strong></div><div class="receipt-row"><span>Total spent</span><strong>−${money(world.expenses)}</strong></div><div class="receipt-row"><span>Operating balance</span><strong>${money(world.income - world.expenses)}</strong></div><p class="panel-note">Entry costs ${world.entryFee} coins. Guests pay at the start of a service. Supplies are paid every simulation minute.</p><label class="pricing-label" for="pricing">Your pricing approach</label><select id="pricing"><option value="friendly" ${world.pricing === "friendly" ? "selected" : ""}>Friendly · more guests, lower fees</option><option value="fair" ${world.pricing === "fair" ? "selected" : ""}>Fair · a happy middle ground</option><option value="premium" ${world.pricing === "premium" ? "selected" : ""}>Premium · higher fees, pickier guests</option></select><button class="secondary-button" data-party="true" ${world.coins < 35 ? "disabled" : ""}>Host a towel party · 35 coins</button><button class="text-button" data-panel="facilities">Manage all facilities →</button><h3>Recent transactions</h3><div class="entry-list">${world.entries
      .filter(
        (e) =>
          e.type === "income" || e.type === "expense" || e.type === "arrival",
      )
      .slice(0, 14)
      .map(
        (e) =>
          `<div class="entry"><span>${escape(e.text)}</span><strong class="${e.type === "expense" ? "negative" : "positive"}">${e.type === "expense" ? "−" : "+"}${e.amount}</strong></div>`,
      )
      .join("")}</div>`;
  } else if (activePanel === "guests") {
    label = "THE GUEST REGISTER";
    html = `<h2>Meet the loafers.</h2><p>${world.guests.length} guests. ${world.departed} happy journeys home.</p><div class="guest-list">${world.guests.map((g) => `<button class="guest-row" data-guest="${g.id}"><img src="./art/${g.kind}-portrait.png" alt=""/><span><strong>${escape(g.name)}</strong><small>${ANIMALS[g.kind].name} · ${g.state}</small></span>${icon("arrow")}</button>`).join("") || "<p>A quiet moment. New guests will arrive soon.</p>"}</div><p class="panel-note">Raccoons love cabins. Penguins arrive once your garden flourishes or your reputation reaches 72.</p><button class="secondary-button" data-panel="facilities">Manage facilities</button>`;
  } else if (activePanel === "facilities") {
    label = "YOUR LITTLE NEIGHBORHOOD";
    html = `<h2>Room to relax.</h2><p>Check the busy spots. Keep the good ones cozy.</p><div class="guest-list">${world.facilities.map((f) => `<button class="guest-row" data-facility="${f.id}">${img(f.kind)}<span><strong>${FACILITIES[f.kind].name}</strong><small>Level ${f.level} · ${world.occupancy(f)}/${world.capacityOf(f)} guests · ${Math.round(f.cleanliness)}% clean</small></span>${icon("arrow")}</button>`).join("")}</div>`;
  } else if (
    [
      "goals",
      "tutorial",
      "research",
      "achievements",
      "career",
      "districts",
    ].includes(activePanel)
  ) {
    label = "YOUR LITTLE RETREAT JOURNEY";
    html = journeyPanel(activePanel);
  } else {
    label = "TALES FROM THE TOWEL RACK";
    html = `<h2>The guestbook.</h2><p class="hand-note">Mostly compliments. Occasionally towel allegations.</p><div class="journal-totals"><span><strong>${world.happy}</strong>happy reviews</span><span><strong>${world.departed}</strong>goodbyes</span></div><div class="story-list">${world.entries
      .filter((e) => e.type === "story")
      .slice(0, 16)
      .map(
        (e) =>
          `<article><span class="eyebrow">DAY ${Math.floor(e.time / 180) + 1}</span><p>${escape(e.text)}</p></article>`,
      )
      .join(
        "",
      )}</div><p class="panel-note">${world.saved ? "Your retreat is saved in this browser." : "Saving is unavailable. Keep this tab open to retain progress."}</p><button id="reset" class="text-button">Start a fresh resort</button>`;
  }
  $("#panel-label").textContent = label;
  // Preserve keyboard focus during the live refresh and avoid replacing a focused control.
  const body = $("#panel-body");
  if (
    !force &&
    body.contains(document.activeElement) &&
    document.activeElement?.matches("input,select,textarea")
  )
    return;
  const focused = document.activeElement as HTMLElement | null;
  const attr =
    focused && body.contains(focused)
      ? Array.from(focused.attributes).filter((a) => a.name.startsWith("data-"))
      : undefined;
  if (force || renderedPanelHtml !== html) {
    renderedPanelHtml = html;
    const scroll = body.scrollTop;
    body.innerHTML = html;
    body.scrollTop = scroll;
    if (!force && attr?.length) {
      const control = body.querySelector<HTMLButtonElement>(
        attr.map((a) => `[${a.name}="${CSS.escape(a.value)}"]`).join(""),
      );
      if (control && !control.disabled) control.focus({ preventScroll: true });
    }
  }
}
const caption = $(".landscape-caption");
const dayCard = $("#day-card");
const goalNote = $("#goal-note");
const IDLE_CAPTION_MS = 60_000;
let lastInteraction = performance.now();
let dayUntil = 0;
let goalUntil = 0;
let previousDay = world.day;
let previousWeather = world.weather;
let previousMilestones = world.milestones.size;
let previousReady = 0;
let previousAchievements = world.progression.achievements.length;
let previousRank = world.rank;
function activity(): void {
  lastInteraction = performance.now();
  scene.idleCopyVisible = false;
  caption.classList.remove("is-visible");
  caption.setAttribute("aria-hidden", "true");
}
for (const event of [
  "pointerdown",
  "pointermove",
  "keydown",
  "wheel",
  "touchstart",
])
  document.addEventListener(event, activity, { passive: true });
$("#show-day").addEventListener("click", () => {
  dayUntil = dayCard.classList.contains("is-visible")
    ? 0
    : performance.now() + 10_000;
  renderContext();
});
$("#show-goal").addEventListener("click", () => openPanel("goals"));
function renderContext(): void {
  const now = performance.now();
  const unobstructed =
    !document.hidden &&
    !document.querySelector("dialog[open]") &&
    !activePanel &&
    !scene.tool;
  const idle = unobstructed && now - lastInteraction >= IDLE_CAPTION_MS;
  scene.idleCopyVisible = idle;
  caption.classList.toggle("is-visible", idle);
  caption.setAttribute("aria-hidden", String(!idle));
  for (const [card, button, until] of [
    [dayCard, $("#show-day"), dayUntil],
    [goalNote, $("#show-goal"), goalUntil],
  ] as const) {
    const visible = unobstructed && now < until;
    card.classList.toggle("is-visible", visible);
    card.toggleAttribute("inert", !visible);
    card.setAttribute("aria-hidden", String(!visible));
    button.setAttribute("aria-expanded", String(visible));
  }
}
function render(): void {
  if (world.day !== previousDay || world.weather !== previousWeather)
    dayUntil = performance.now() + 8_000;
  if (world.milestones.size > previousMilestones)
    goalUntil = performance.now() + 8_000;
  const readyCount = world.progression.contracts.filter(
    (c) => world.contractProgress(c) >= c.target,
  ).length;
  if (readyCount > previousReady) goalUntil = performance.now() + 8_000;
  if (world.progression.achievements.length > previousAchievements)
    notify(
      `Achievement unlocked: ${ACHIEVEMENTS.find((a) => a.id === world.progression.achievements.at(-1))?.title}`,
    );
  if (world.rank > previousRank)
    notify(`Chapter ${world.rank + 1}: ${CHAPTERS[world.rank].name}`);
  previousReady = readyCount;
  previousAchievements = world.progression.achievements.length;
  previousRank = world.rank;
  $("#show-goal").setAttribute(
    "aria-expanded",
    String(activePanel === "goals"),
  );
  previousDay = world.day;
  previousWeather = world.weather;
  previousMilestones = world.milestones.size;
  renderContext();
  $("#coin-count").textContent =
    world.coins >= 10000
      ? new Intl.NumberFormat("en", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(world.coins)
      : money(world.coins);
  $("#coin-count").title = `${money(world.coins)} coins`;
  $("#guest-count").textContent = `${world.guests.length} / ${world.capacity}`;
  $("#reputation-count").innerHTML =
    `${Math.round(world.reputation)} <em>/ 100</em>`;
  $("#day-label").textContent = `Day ${world.day} · ${world.weather}`;
  $("#weather-hint").textContent =
    world.weatherHint + (world.rank ? ` ${world.event.name}.` : "");
  $("#weather-icon").innerHTML = icon(
    world.weather === "Sunny" ? "sun" : "leaf",
  );
  const goal =
    world.progression.contracts.find(
      (c) => world.contractProgress(c) >= c.target,
    ) ?? world.progression.contracts[0];
  $("#show-goal").textContent = readyCount
    ? `To-do · ${readyCount} ready`
    : "To-do";
  $("#goal-title").textContent = goal.title;
  $("#goal-progress").textContent =
    `${money(world.contractProgress(goal))} / ${money(goal.target)} ${METRIC_LABELS[goal.metric]}`;
  $("#goal-fill").style.width =
    `${(world.contractProgress(goal) / goal.target) * 100}%`;
  document.querySelectorAll<HTMLButtonElement>("[data-build]").forEach((b) => {
    b.disabled = world.coins < FACILITIES[b.dataset.build as FacilityKind].cost;
  });
  $("#party").toggleAttribute("disabled", world.coins < 35);
  if (activePanel) renderPanel();
}
document.addEventListener("change", (event) => {
  const input = event.target as HTMLSelectElement;
  if (input.id === "pricing") {
    world.setPricing(input.value as Pricing);
    save();
    renderPanel(true);
    notify("Pricing updated. New guests will respond to your approach.");
  }
});
document.addEventListener("click", (event) => {
  const b = (event.target as Element).closest<HTMLButtonElement>("button");
  if (!b || b.disabled) return;
  tone();
  if (b.dataset.focusMeadow !== undefined) {
    const i = Number(b.dataset.focusMeadow);
    scene.focus((i % 3) * 1400 + 700, Math.floor(i / 3) * 950 + 475);
    closePanel();
    return;
  }
  if (b.dataset.district !== undefined) {
    notify(
      world.developDistrict(
        Number(b.dataset.district),
        b.dataset.theme as FacilityKind,
      ),
    );
    save();
    renderPanel(true);
    return;
  }
  if (
    b.dataset.claim ||
    b.dataset.research ||
    b.dataset.hire ||
    b.dataset.dismiss ||
    b.dataset.tutorial
  ) {
    const message = b.dataset.claim
      ? world.claimContract(Number(b.dataset.claim))
      : b.dataset.research
        ? world.research(b.dataset.research)
        : b.dataset.hire
          ? world.hireCaretaker()
          : b.dataset.dismiss
            ? world.dismissCaretaker()
            : world.claimTutorial();
    notify(message);
    save();
    render();
    renderPanel(true);
    return;
  }
  if (b.dataset.party) {
    notify(world.hostEvent());
    save();
    render();
    return;
  }
  if (b.dataset.panel) {
    openPanel(b.dataset.panel);
    return;
  }
  if (b.dataset.build) {
    const kind = b.dataset.build as FacilityKind;
    const was = scene.tool;
    closePanel();
    clearTool();
    if (was !== kind) {
      scene.tool = kind;
      b.setAttribute("aria-pressed", "true");
      $("#map-hint").textContent =
        `Place a ${FACILITIES[kind].name.toLowerCase()} · click clear ground · Esc to cancel`;
      $("#game").classList.add("placing");
    }
    return;
  }
  if (b.dataset.guest) {
    select({ type: "guest", id: Number(b.dataset.guest) });
    return;
  }
  if (b.dataset.facility) {
    const id = Number(b.dataset.facility);
    select({ type: "facility", id });
    const f = world.facilities.find((f) => f.id === id);
    if (f) scene.focus(f.x, f.y);
    return;
  }
  if (b.dataset.clean) {
    notify(world.clean(Number(b.dataset.clean)));
    save();
    renderPanel(true);
    return;
  }
  if (b.dataset.upgrade) {
    notify(world.upgrade(Number(b.dataset.upgrade)));
    save();
    renderPanel(true);
    return;
  }
  if (b.dataset.focusGuest) {
    const g = world.guests.find((g) => g.id === Number(b.dataset.focusGuest));
    if (g) scene.focus(g.x, g.y);
    return;
  }
  if (b.id === "reset") {
    $<HTMLDialogElement>("#reset-dialog").showModal();
    return;
  }
});
$("#close-panel").addEventListener("click", closePanel);
$("#pause").addEventListener("click", () => {
  world.paused = !world.paused;
  $("#pause").innerHTML = icon(world.paused ? "play" : "pause");
  $("#pause").setAttribute(
    "aria-label",
    world.paused ? "Resume simulation" : "Pause simulation",
  );
});
$("#speed").addEventListener("click", () => {
  world.speed = world.speed === 1 ? 2 : world.speed === 2 ? 4 : 1;
  $("#speed").textContent = `${world.speed}×`;
});
$("#zoom-in").addEventListener("click", () => scene.zoom(0.25));
$("#zoom-out").addEventListener("click", () => scene.zoom(-0.25));
$("#fit").addEventListener("click", () => scene.fit(true));
$("#party").addEventListener("click", () => {
  notify(world.hostEvent());
  save();
  render();
});
$("#sound").addEventListener("click", () => {
  muted = !muted;
  $("#sound").classList.toggle("muted", muted);
  $("#sound").setAttribute("aria-label", muted ? "Enable sound" : "Mute sound");
  $("#sound").title = muted ? "Enable sound" : "Mute sound";
  tone();
});
$("#toggle-tools").addEventListener("click", () => {
  const tools = $("#build-tools");
  tools.hidden = !tools.hidden;
  $("#toggle-tools").textContent = tools.hidden ? "Show tools" : "Hide tools";
  $("#toggle-tools").setAttribute("aria-expanded", String(!tools.hidden));
  $(".bottom-bar").classList.toggle("compact", tools.hidden);
  window.dispatchEvent(new Event("resize"));
});
const mainMenu = $<HTMLDialogElement>("#main-menu");
const credits = $<HTMLDialogElement>("#credits");
let menuWasPaused = false;
function openMenu(): void {
  if (mainMenu.open) return;
  clearTool();
  menuWasPaused = world.paused;
  world.paused = true;
  mainMenu.showModal();
}
function closeMenu(): void {
  mainMenu.close();
  world.paused = menuWasPaused;
}
function closeCredits(): void {
  credits.close();
}
$("#main-menu-button").addEventListener("click", openMenu);
$("#close-menu").addEventListener("click", closeMenu);
$("#menu-play").addEventListener("click", closeMenu);
$("#menu-career").addEventListener("click", () => {
  closeMenu();
  openPanel("career");
});
$("#menu-credits").addEventListener("click", () => credits.showModal());
$("#close-credits").addEventListener("click", closeCredits);
$("#credits-back").addEventListener("click", closeCredits);
mainMenu.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeMenu();
});
credits.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeCredits();
});
const welcome = $<HTMLDialogElement>("#welcome");
let helpWasPaused = false;
function openHelp(): void {
  helpWasPaused = world.paused;
  world.paused = true;
  welcome.showModal();
}
function closeHelp(): void {
  welcome.close();
  world.paused = helpWasPaused;
}
$("#help").addEventListener("click", openHelp);
$("#menu-help").addEventListener("click", openHelp);
$("#start").addEventListener("click", closeHelp);
$("#close-help").addEventListener("click", closeHelp);
welcome.addEventListener("cancel", (e) => {
  e.preventDefault();
  closeHelp();
});
$("#cancel-reset").addEventListener("click", () =>
  $<HTMLDialogElement>("#reset-dialog").close(),
);
$("#confirm-reset").addEventListener("click", () => {
  resetting = true;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* Storage can be unavailable. */
  }
  location.reload();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    clearTool();
    closePanel();
  }
});
let hiddenWasPaused = false;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hiddenWasPaused = world.paused;
    world.paused = true;
    save();
  } else {
    world.paused = hiddenWasPaused;
    activity();
  }
});
window.addEventListener("pagehide", save);
const uiTimer = window.setInterval(render, 500),
  saveTimer = window.setInterval(save, 5000);
window.addEventListener(
  "beforeunload",
  () => {
    window.clearInterval(uiTimer);
    window.clearInterval(saveTimer);
    game.destroy(true);
  },
  { once: true },
);
render();
openMenu();
