import {
  freshProgress,
  nextContract,
  rankOf,
  RESEARCH,
  EVENTS,
  ACHIEVEMENTS,
  type ProgressSave,
  type Metrics,
  type Contract,
} from "./progression";
export type AnimalKind = "capybara" | "shiba" | "raccoon" | "penguin";
export type FacilityKind = "spring" | "cafe" | "lodge" | "garden";
export type Pricing = "friendly" | "fair" | "premium";
export type GuestState =
  | "arriving"
  | "walking"
  | "queueing"
  | "bathing"
  | "eating"
  | "sleeping"
  | "wandering"
  | "leaving";
export const ANIMALS: Record<
  AnimalKind,
  { name: string; description: string; speed: number; preference: FacilityKind }
> = {
  capybara: {
    name: "Capybara",
    description: "Professional relaxation consultant.",
    speed: 30,
    preference: "spring",
  },
  shiba: {
    name: "Shiba",
    description: "Claims every chair is reserved.",
    speed: 45,
    preference: "cafe",
  },
  raccoon: {
    name: "Raccoon",
    description: "The towel is definitely theirs. Probably.",
    speed: 39,
    preference: "lodge",
  },
  penguin: {
    name: "Penguin",
    description: "Requests the coldest hot spring.",
    speed: 34,
    preference: "garden",
  },
};
export const FACILITIES: Record<
  FacilityKind,
  {
    name: string;
    cost: number;
    fee: number;
    capacity: number;
    duration: number;
    upkeep: number;
    description: string;
  }
> = {
  spring: {
    name: "Hot spring",
    cost: 120,
    fee: 16,
    capacity: 3,
    duration: 16,
    upkeep: 3,
    description: "A warm soak. Towels on heads encouraged.",
  },
  cafe: {
    name: "Snack shack",
    cost: 90,
    fee: 12,
    capacity: 2,
    duration: 10,
    upkeep: 2,
    description: "Berry buns and suspiciously large appetites.",
  },
  lodge: {
    name: "Cozy cabin",
    cost: 160,
    fee: 24,
    capacity: 2,
    duration: 22,
    upkeep: 4,
    description: "A little nap can become a whole holiday.",
  },
  garden: {
    name: "Wild garden",
    cost: 55,
    fee: 0,
    capacity: 4,
    duration: 12,
    upkeep: 0,
    description: "Grows naturally. A free place to unwind.",
  },
};
export interface Facility {
  id: number;
  kind: FacilityKind;
  x: number;
  y: number;
  level: number;
  cleanliness: number;
  growth: number;
  served: number;
}
export interface Guest {
  id: number;
  name: string;
  kind: AnimalKind;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: GuestState;
  facilityId: number | null;
  timer: number;
  stay: number;
  hunger: number;
  energy: number;
  comfort: number;
  satisfaction: number;
  spent: number;
  services: number;
  queueTime: number;
  quirkAt: number;
}
export interface Entry {
  id: number;
  time: number;
  text: string;
  type: "income" | "expense" | "story" | "arrival";
  amount: number;
}
export const WORLD_WIDTH = 4200,
  WORLD_HEIGHT = 2850;
export const START_OFFSET_X = 1400,
  START_OFFSET_Y = 950;
export const ENTRANCE_X = 2100,
  ENTRANCE_Y = 1870;
const NAMES = [
  "Mochi",
  "Noodle",
  "Bean",
  "Waffles",
  "Biscuit",
  "Pickle",
  "Tofu",
  "Peanut",
  "Pudding",
  "Boba",
  "Miso",
  "Dumpling",
  "Coco",
  "Pebble",
  "Toast",
  "Pip",
];
export interface Snapshot {
  version: 1 | 2;
  progression?: ProgressSave;
  pricing: Pricing;
  coins: number;
  reputation: number;
  elapsed: number;
  income: number;
  expenses: number;
  departed: number;
  happy: number;
  facilities: Facility[];
  guests: Guest[];
  entries: Entry[];
  nextId: number;
  arrivalTimer: number;
  maintenanceTimer: number;
  weather: string;
  weatherTimer: number;
  randomState: number;
  milestones: string[];
}
export class Resort {
  progression: ProgressSave = freshProgress();
  pricing: Pricing = "fair";
  coins = 300;
  reputation = 58;
  elapsed = 0;
  income = 0;
  expenses = 0;
  departed = 0;
  happy = 0;
  paused = false;
  speed = 1;
  saved = true;
  facilities: Facility[] = [];
  guests: Guest[] = [];
  entries: Entry[] = [];
  milestones = new Set<string>();
  private nextId = 1;
  private arrivalTimer = 0;
  private maintenanceTimer = 0;
  weather = "Sunny";
  private weatherTimer = 0;
  private randomState = 84271;
  constructor(snapshot?: unknown) {
    this.facilities = [
      {
        id: this.nextId++,
        kind: "spring",
        x: 2100,
        y: 1380,
        level: 1,
        cleanliness: 100,
        growth: 0,
        served: 0,
      },
      {
        id: this.nextId++,
        kind: "cafe",
        x: 2420,
        y: 1310,
        level: 1,
        cleanliness: 100,
        growth: 0,
        served: 0,
      },
      {
        id: this.nextId++,
        kind: "garden",
        x: 1830,
        y: 1480,
        level: 1,
        cleanliness: 100,
        growth: 35,
        served: 0,
      },
    ];
    if (snapshot && this.restore(snapshot)) {
      this.ensureContracts();
      return;
    }
    this.log("Your little retreat is open. Let the loafing begin.", "story");
    for (let i = 0; i < 4; i++) {
      this.arrive(i % 2 === 0 ? "capybara" : "shiba");
      const g = this.guests.at(-1)!;
      g.x = START_OFFSET_X + 620 + i * 52;
      g.y = START_OFFSET_Y + 730 + (i % 2) * 35;
    }
    this.ensureContracts();
  }
  random(): number {
    this.randomState ^= this.randomState << 13;
    this.randomState ^= this.randomState >>> 17;
    this.randomState ^= this.randomState << 5;
    return (this.randomState >>> 0) / 4294967296;
  }
  get entryFee(): number {
    return this.pricing === "friendly"
      ? 6
      : this.pricing === "premium"
        ? 10
        : 8;
  }
  setPricing(value: Pricing): void {
    if (
      !["friendly", "fair", "premium"].includes(value) ||
      this.pricing === value
    )
      return;
    this.pricing = value;
    this.log(`Prices are now ${value}. A new approach to the art of loafing.`);
  }
  get capacity(): number {
    return Math.min(
      60,
      8 +
        this.rank * 2 +
        (this.hasResearch("promotion") ? 8 : 0) +
        this.facilities
          .filter((f) => f.kind === "lodge")
          .reduce((n, f) => n + f.level * 3, 0) +
        Math.floor(this.reputation / 25),
    );
  }
  get weatherHint(): string {
    return this.weather === "Rainy"
      ? "Rain feeds the garden. Guests prefer a warm soak."
      : this.weather === "Breezy"
        ? "A cool breeze brings new visitors."
        : "Sunny skies, lazy afternoons.";
  }
  get gardenScore(): number {
    return this.facilities
      .filter((f) => f.kind === "garden")
      .reduce((n, f) => n + f.growth, 0);
  }
  get day(): number {
    return Math.floor(this.elapsed / 180) + 1;
  }
  occupancy(f: Facility): number {
    return this.guests.filter(
      (g) =>
        g.facilityId === f.id &&
        ["bathing", "eating", "sleeping", "wandering"].includes(g.state),
    ).length;
  }
  capacityOf(f: Facility): number {
    return (
      FACILITIES[f.kind].capacity +
      f.level -
      1 +
      (this.districtAt(f.x, f.y).kind === f.kind
        ? this.districtAt(f.x, f.y).level
        : 0)
    );
  }
  fee(f: Facility): number {
    const base =
      FACILITIES[f.kind].fee + (f.kind === "garden" ? 0 : (f.level - 1) * 4);
    return Math.round(
      base *
        (1 +
          (this.districtAt(f.x, f.y).kind === f.kind
            ? this.districtAt(f.x, f.y).level * 0.08
            : 0)) *
        (this.hasResearch("deluxe") ? 1.1 : 1) *
        (this.rank >= 1 && this.event.kind === f.kind ? 1.25 : 1) *
        (this.pricing === "friendly"
          ? 0.75
          : this.pricing === "premium"
            ? 1.25
            : 1),
    );
  }
  log(text: string, type: Entry["type"] = "story", amount = 0): void {
    this.entries.unshift({
      id: this.nextId++,
      time: this.elapsed,
      text,
      type,
      amount,
    });
    this.entries = this.entries.slice(0, 70);
  }
  spend(amount: number, text: string): boolean {
    if (!Number.isFinite(amount) || amount < 0 || this.coins < amount)
      return false;
    this.coins -= amount;
    this.expenses += amount;
    this.log(text, "expense", amount);
    return true;
  }
  build(kind: FacilityKind, x: number, y: number): string {
    if (!(kind in FACILITIES)) return "Choose a facility first.";
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      x < 160 ||
      x > WORLD_WIDTH - 160 ||
      y < 190 ||
      y > WORLD_HEIGHT - 160
    )
      return "Build inside the garden boundary.";
    if (this.facilities.length >= 128)
      return "The retreat has room for 128 facilities.";
    if (this.facilities.some((f) => Math.hypot(f.x - x, f.y - y) < 175))
      return "Give your neighbors a little breathing room.";
    if (
      !this.spend(
        FACILITIES[kind].cost,
        `Built a ${FACILITIES[kind].name.toLowerCase()}.`,
      )
    )
      return "Not enough coins. Let your guests enjoy a few more services.";
    this.facilities.push({
      id: this.nextId++,
      kind,
      x,
      y,
      level: 1,
      cleanliness: 100,
      growth: kind === "garden" ? 12 : 0,
      served: 0,
    });
    this.progression.built++;
    this.checkMilestones();
    return "Built! Your guests will discover it on their own.";
  }
  upgrade(id: number): string {
    const f = this.facilities.find((f) => f.id === id);
    if (!f) return "Facility not found.";
    if (f.level >= this.maxLevel)
      return "Research more comfort to unlock the next level.";
    const cost = this.upgradeCost(f);
    if (!this.spend(cost, `Upgraded ${FACILITIES[f.kind].name}.`))
      return "Not enough coins for this upgrade.";
    f.level++;
    this.progression.upgraded++;
    f.cleanliness = 100;
    return "More room, more comfort. Guests approve.";
  }
  clean(id: number): string {
    const f = this.facilities.find((f) => f.id === id);
    if (!f) return "Facility not found.";
    if (f.cleanliness >= 98) return "Already sparkling.";
    if (!this.spend(8, `Freshened up ${FACILITIES[f.kind].name}.`))
      return "Need 8 coins to freshen this up.";
    f.cleanliness = 100;
    this.progression.cleaned++;
    return "Fresh towels. Fresh start.";
  }
  hostEvent(): string {
    if (!this.spend(35, "Hosted a towel party."))
      return "A towel party costs 35 coins.";
    this.progression.parties++;
    this.reputation = Math.min(100, this.reputation + 3);
    for (const g of this.guests) {
      g.satisfaction = Math.min(100, g.satisfaction + 12);
      g.comfort = Math.max(0, g.comfort - 15);
    }
    this.arrivalTimer = 20;
    this.log("Towel party! Bean insists this is formalwear.");
    return "Party on! Guests feel happier and word is spreading.";
  }
  private arrive(force?: AnimalKind): void {
    if (this.guests.length >= this.capacity) return;
    const unlocked: AnimalKind[] = ["capybara", "shiba"];
    if (
      this.facilities.some((f) => f.kind === "lodge") ||
      this.reputation >= 60
    )
      unlocked.push("raccoon");
    if (this.gardenScore >= 80 || this.reputation >= 72)
      unlocked.push("penguin");
    const kind =
      force ??
      (this.rank >= 1 &&
      unlocked.includes(this.event.animal) &&
      this.random() < 0.4
        ? this.event.animal
        : unlocked[Math.floor(this.random() * unlocked.length)]);
    if (!this.progression.seen.includes(kind)) this.progression.seen.push(kind);
    const n = this.nextId++;
    this.guests.push({
      id: n,
      name: NAMES[n % NAMES.length],
      kind,
      x: ENTRANCE_X + (this.random() - 0.5) * 50,
      y: START_OFFSET_Y + 895,
      targetX: ENTRANCE_X,
      targetY: START_OFFSET_Y + 730,
      state: "arriving",
      facilityId: null,
      timer: 0,
      stay: 0,
      hunger: 25 + this.random() * 35,
      energy: 25 + this.random() * 30,
      comfort: 45 + this.random() * 25,
      satisfaction:
        (this.pricing === "friendly"
          ? 72
          : this.pricing === "premium"
            ? 58
            : 65) + (this.hasResearch("welcome") ? 10 : 0),
      spent: this.entryFee,
      services: 0,
      queueTime: 0,
      quirkAt: 30 + this.random() * 40,
    });
    this.coins += this.entryFee;
    this.income += this.entryFee;
    this.log(
      `${NAMES[n % NAMES.length]} checked in. Tiny luggage, big plans.`,
      "arrival",
      this.entryFee,
    );
  }
  step(dt: number): void {
    if (this.paused || !Number.isFinite(dt) || dt <= 0) return;
    const remaining = Math.min(dt, 2);
    let time = remaining;
    while (time > 0) {
      const h = Math.min(0.1, time);
      this.tick(h);
      time -= h;
    }
  }
  private tick(dt: number): void {
    const previousSecond = Math.floor(this.elapsed);
    this.elapsed += dt;
    this.arrivalTimer += dt;
    this.maintenanceTimer += dt;
    this.weatherTimer += dt;
    if (this.weatherTimer >= 75) {
      this.weatherTimer = 0;
      this.weather = ["Sunny", "Rainy", "Breezy"][
        Math.floor(this.random() * 3)
      ];
      this.log(this.weatherHint);
    }
    const interval = Math.max(
      7,
      21 -
        this.reputation * 0.11 -
        (this.weather === "Breezy" ? 2 : 0) +
        (this.pricing === "premium" ? 5 : this.pricing === "friendly" ? -3 : 0),
    );
    if (
      this.arrivalTimer >=
      (interval * (this.hasResearch("promotion") ? 0.7 : 1)) /
        (1 + this.rank * 0.12)
    ) {
      this.arrivalTimer = 0;
      this.arrive();
    }
    if (this.maintenanceTimer >= 60) {
      this.maintenanceTimer = 0;
      const bill =
        Math.ceil(
          this.facilities.reduce(
            (n, f) => n + FACILITIES[f.kind].upkeep * f.level,
            0,
          ) * (this.hasResearch("supplies") ? 0.75 : 1),
        ) +
        this.progression.staff * 2;
      if (!this.spend(bill, "Supplies, maintenance and caretaker wages.")) {
        this.reputation = Math.max(0, this.reputation - 2);
        this.log(
          "Supplies are running low. Earn coins through guest services.",
        );
      }
      this.runCaretakers();
    }
    for (const f of this.facilities) {
      f.cleanliness = Math.max(0, f.cleanliness - dt * 0.018);
      if (f.kind === "garden")
        f.growth = Math.min(
          100,
          f.growth +
            dt *
              (this.weather === "Rainy" ? 0.65 : 0.23) *
              (1 + f.level * 0.2) *
              (this.districtAt(f.x, f.y).kind === "garden"
                ? 1 + this.districtAt(f.x, f.y).level * 0.2
                : 1),
        );
    }
    for (const g of [...this.guests]) {
      g.stay += dt;
      g.hunger = Math.min(100, g.hunger + dt * 0.2);
      g.energy = Math.min(100, g.energy + dt * 0.15);
      g.comfort = Math.min(
        100,
        g.comfort + dt * (this.weather === "Rainy" ? 0.3 : 0.18),
      );
      if (g.stay >= g.quirkAt) {
        g.quirkAt += 65 + this.random() * 60;
        const stories: Record<AnimalKind, string[]> = {
          capybara: [
            "fell asleep halfway through a very important nothing.",
            "has declared this pool their new office.",
          ],
          shiba: [
            "reserved a chair with one single hair.",
            "is reviewing the bun-to-belly ratio.",
          ],
          raccoon: [
            "is definitely returning that towel. Eventually.",
            "insists the snack was complimentary.",
          ],
          penguin: [
            "asked for ice in the hot spring.",
            "brought a pebble as a five-star review.",
          ],
        };
        this.log(`${g.name} ${stories[g.kind][Math.floor(this.random() * 2)]}`);
      }
      if (
        g.state === "arriving" ||
        g.state === "walking" ||
        g.state === "leaving"
      ) {
        const dx = g.targetX - g.x,
          dy = g.targetY - g.y,
          d = Math.hypot(dx, dy);
        const speed =
          ANIMALS[g.kind].speed * (this.hasResearch("trails") ? 1.4 : 1);
        if (d > speed * dt) {
          g.x += (dx / d) * speed * dt;
          g.y += (dy / d) * speed * dt;
        } else {
          g.x = g.targetX;
          g.y = g.targetY;
          if (g.state === "leaving") {
            this.depart(g);
            continue;
          }
          if (g.state === "arriving") this.choose(g);
          else this.admit(g);
        }
      } else if (g.state === "queueing") {
        g.queueTime += dt;
        const f = this.facilities.find((f) => f.id === g.facilityId);
        if (f && this.occupancy(f) < this.capacityOf(f)) this.admit(g);
        else if (g.queueTime > 16) {
          g.satisfaction = Math.max(0, g.satisfaction - 6);
          g.facilityId = null;
          this.choose(g);
        }
      } else {
        g.timer -= dt;
        const f = this.facilities.find((f) => f.id === g.facilityId);
        if (g.state === "eating") g.hunger = Math.max(0, g.hunger - dt * 5);
        if (g.state === "sleeping") g.energy = Math.max(0, g.energy - dt * 4);
        if (g.state === "bathing") g.comfort = Math.max(0, g.comfort - dt * 4);
        if (g.state === "wandering") {
          g.comfort = Math.max(
            0,
            g.comfort -
              dt * (this.rank >= 1 && this.event.kind === "garden" ? 3 : 2),
          );
          g.energy = Math.max(0, g.energy - dt * 0.6);
        }
        if (f)
          g.satisfaction = Math.max(
            0,
            Math.min(
              100,
              g.satisfaction + dt * (f.cleanliness > 45 ? 0.25 : -0.6),
            ),
          );
        if (g.timer <= 0) {
          g.facilityId = null;
          if ((g.stay > 140 && g.services >= 3) || g.stay > 260) {
            this.leave(g);
          } else this.choose(g);
        }
      }
      if (
        g.state === "wandering" &&
        this.guests.some(
          (other) =>
            other.id !== g.id &&
            other.state === "wandering" &&
            Math.hypot(other.x - g.x, other.y - g.y) < 95,
        )
      )
        g.satisfaction = Math.min(100, g.satisfaction + dt * 0.15);
      if (g.state !== "leaving" && g.stay > 310) this.leave(g);
    }
    this.checkMilestones();
    if (Math.floor(this.elapsed) !== previousSecond) this.checkAchievements();
  }
  private choose(g: Guest): void {
    let best: Facility | undefined;
    let score = -Infinity;
    for (const f of this.facilities) {
      const need =
        f.kind === "spring"
          ? g.comfort
          : f.kind === "cafe"
            ? g.hunger
            : f.kind === "lodge"
              ? g.energy
              : 25 + f.growth * 0.12;
      const preference = ANIMALS[g.kind].preference === f.kind ? 13 : 0;
      const s =
        need +
        preference +
        (this.rank >= 1 && this.event.kind === f.kind ? 12 : 0) -
        Math.hypot(f.x - g.x, f.y - g.y) * 0.012 +
        this.random() * 14 -
        this.occupancy(f) * 6 -
        (100 - f.cleanliness) * 0.25;
      if (s > score) {
        score = s;
        best = f;
      }
    }
    if (!best) {
      g.state = "wandering";
      g.timer = 6;
      return;
    }
    g.facilityId = best.id;
    g.targetX = best.x + (this.random() - 0.5) * 45;
    g.targetY = best.y + 75 + (this.random() - 0.5) * 25;
    g.state = "walking";
    g.queueTime = 0;
  }
  private admit(g: Guest): void {
    const f = this.facilities.find((f) => f.id === g.facilityId);
    if (!f) {
      this.choose(g);
      return;
    }
    if (this.occupancy(f) >= this.capacityOf(f)) {
      g.state = "queueing";
      g.targetX = f.x;
      g.targetY = f.y + 100;
      return;
    }
    const slot = this.occupancy(f);
    g.x = f.x + (slot - (this.capacityOf(f) - 1) / 2) * 46;
    g.y = f.y + 55 + (slot % 2) * 12;
    g.state =
      f.kind === "spring"
        ? "bathing"
        : f.kind === "cafe"
          ? "eating"
          : f.kind === "lodge"
            ? "sleeping"
            : "wandering";
    g.timer = FACILITIES[f.kind].duration;
    g.queueTime = 0;
    g.services++;
    f.served++;
    this.progression.xp++;
    f.cleanliness = Math.max(0, f.cleanliness - 2.5);
    const fee = this.fee(f);
    this.coins += fee;
    this.income += fee;
    g.spent += fee;
    if (fee)
      this.log(
        `${g.name} enjoyed ${FACILITIES[f.kind].name.toLowerCase()}.`,
        "income",
        fee,
      );
  }
  private leave(g: Guest): void {
    g.facilityId = null;
    g.state = "leaving";
    g.targetX = ENTRANCE_X;
    g.targetY = ENTRANCE_Y;
  }
  private depart(g: Guest): void {
    this.guests = this.guests.filter((x) => x.id !== g.id);
    this.departed++;
    const rating = Math.min(5, Math.max(1, Math.round(g.satisfaction / 20)));
    if (rating >= 4) this.happy++;
    this.reputation = Math.max(
      0,
      Math.min(100, this.reputation + (g.satisfaction - 65) * 0.035),
    );
    const tip = rating >= 4 ? Math.round(g.spent * 0.1) : 0;
    this.coins += tip;
    this.income += tip;
    this.log(
      `${g.name} left a ${rating}-star review${tip ? ` and a ${tip}-coin tip` : ""}.`,
      "story",
      tip,
    );
  }
  private checkMilestones(): void {
    if (this.income >= 100) this.milestones.add("income");
    if (this.facilities.some((f) => f.kind === "lodge"))
      this.milestones.add("lodge");
    if (this.happy >= 5) this.milestones.add("reviews");
    if (this.progression.seen.length >= 4) this.milestones.add("species");
    if (this.gardenScore >= 100) this.milestones.add("garden");
  }
  get rank(): number {
    return rankOf(this.progression);
  }
  get event() {
    return EVENTS[Math.floor(this.elapsed / 900) % EVENTS.length];
  }
  get eventRemaining(): number {
    return 900 - (this.elapsed % 900);
  }
  get maxLevel(): number {
    return this.hasResearch("deluxe") ? 5 : this.hasResearch("rooms") ? 4 : 3;
  }
  hasResearch(id: string): boolean {
    return this.progression.research.includes(id);
  }
  upgradeCost(f: Facility): number {
    return Math.round(
      FACILITIES[f.kind].cost * f.level * 0.75 * (f.level >= 3 ? f.level : 1),
    );
  }
  get metrics(): Metrics {
    const served = (kind: FacilityKind) =>
      this.facilities
        .filter((f) => f.kind === kind)
        .reduce((sum, f) => sum + f.served, 0);
    return {
      services: this.facilities.reduce((sum, f) => sum + f.served, 0),
      spring: served("spring"),
      cafe: served("cafe"),
      lodge: served("lodge"),
      garden: served("garden"),
      happy: this.happy,
      income: this.income,
      cleaned: this.progression.cleaned,
      parties: this.progression.parties,
      built: this.progression.built,
      upgraded: this.progression.upgraded,
    };
  }
  get districts(): number {
    return new Set(
      this.facilities.map(
        (f) =>
          `${Math.min(2, Math.floor(f.x / 1400))}:${Math.min(2, Math.floor(f.y / 950))}`,
      ),
    ).size;
  }
  contractProgress(c: Contract): number {
    return Math.min(c.target, Math.max(0, this.metrics[c.metric] - c.baseline));
  }
  private ensureContracts(): void {
    for (let slot = 0; slot < 3; slot++)
      if (!this.progression.contracts.some((c) => c.slot === slot))
        this.progression.contracts.push(
          nextContract(this.progression, slot, this.metrics),
        );
  }
  claimContract(id: number): string {
    const c = this.progression.contracts.find((c) => c.id === id);
    if (!c || this.contractProgress(c) < c.target)
      return "This commission is still in progress.";
    this.coins += c.coins; // Task grants are not service revenue and cannot complete earnings tasks.
    this.progression.stamps += c.stamps;
    this.progression.xp += c.xp;
    this.progression.completed++;
    this.progression.contracts = this.progression.contracts.filter(
      (task) => task.id !== id,
    );
    this.ensureContracts();
    this.checkAchievements();
    this.log(`Commission complete: ${c.title}. A new request is on the board.`);
    return `Commission complete! +${c.coins} coins, +${c.stamps} stamps. A new request awaits.`;
  }
  claimTutorial(): string {
    if (this.progression.tutorialClaimed || this.milestones.size < 5)
      return "Finish the five getting-started steps first.";
    this.progression.tutorialClaimed = true;
    this.coins += 100;
    this.progression.stamps += 3;
    this.progression.xp += 50;
    return "Getting started complete! +100 coins and +3 research stamps.";
  }
  research(id: string): string {
    const item = RESEARCH.find((r) => r.id === id);
    if (!item || this.hasResearch(id)) return "Already researched.";
    if (this.rank < item.rank) return "Reach the required chapter first.";
    if (this.progression.stamps < item.stamps || this.coins < item.coins)
      return "More coins or research stamps are needed.";
    this.spend(item.coins, `Researched ${item.name}.`);
    this.progression.stamps -= item.stamps;
    this.progression.research.push(id);
    this.checkAchievements();
    return `${item.name} researched. ${item.text}`;
  }
  hireCaretaker(): string {
    if (!this.hasResearch("care")) return "Research Towel training first.";
    if (this.progression.staff >= 12)
      return "Your 12 caretakers have this covered.";
    const cost = 120 + this.progression.staff * 80;
    if (!this.spend(cost, "Hired a caretaker."))
      return "Not enough coins to hire a caretaker.";
    this.progression.staff++;
    return "Caretaker hired. Wages: 2 coins per simulation minute.";
  }
  dismissCaretaker(): string {
    if (!this.progression.staff) return "No caretakers to dismiss.";
    this.progression.staff--;
    return "One caretaker has clocked off. Wage costs reduced.";
  }
  private runCaretakers(): void {
    const count = this.progression.staff * (this.hasResearch("staff") ? 2 : 1);
    const dirty = this.facilities
      .filter((f) => f.cleanliness < 70)
      .sort((a, b) => a.cleanliness - b.cleanliness)
      .slice(0, count);
    for (const f of dirty)
      if (this.spend(4, `Caretaker refreshed ${FACILITIES[f.kind].name}.`)) {
        f.cleanliness = 100;
        this.progression.cleaned++;
      }
  }
  districtAt(x: number, y: number) {
    return this.progression.districts[
      Math.max(0, Math.min(2, Math.floor(y / 950))) * 3 +
        Math.max(0, Math.min(2, Math.floor(x / 1400)))
    ];
  }
  districtCost(index: number, kind: FacilityKind): number {
    const d = this.progression.districts[index];
    if (!d) return Infinity;
    return d.kind !== null && d.kind !== kind
      ? 5000 * d.level
      : ([5000, 15000, 45000][d.level] ?? Infinity);
  }
  districtStamps(index: number, kind: FacilityKind): number {
    const d = this.progression.districts[index];
    return d.kind !== null && d.kind !== kind ? 0 : 3 + d.level * 3;
  }
  developDistrict(index: number, kind: FacilityKind): string {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= 9 ||
      !Object.hasOwn(FACILITIES, kind)
    )
      return "Choose a meadow and a theme.";
    const d = this.progression.districts[index];
    const changing = d.kind !== null && d.kind !== kind;
    if (this.rank < 3 || (!changing && d.level >= 2 && this.rank < 6))
      return "Unlock themed meadows in Chapter 4; level 3 in Chapter 7.";
    if (!changing && d.level >= 3) return "This meadow is fully developed.";
    const coins = this.districtCost(index, kind),
      stamps = this.districtStamps(index, kind);
    if (
      this.progression.stamps < stamps ||
      !this.spend(
        coins,
        `Developed meadow ${index + 1}: ${FACILITIES[kind].name}.`,
      )
    )
      return "More coins or research stamps are needed.";
    this.progression.stamps -= stamps;
    d.kind = kind;
    if (!changing) d.level++;
    this.checkAchievements();
    return `Meadow ${index + 1}: ${FACILITIES[kind].name} theme, level ${d.level}. Matching facilities gain ${d.level} service slots and ${d.level * 8}% service fees.`;
  }
  achievementValue(metric: string): number {
    if (metric === "species") return this.progression.seen.length;
    if (metric === "districts") return this.districts;
    if (metric === "districtPlans")
      return this.progression.districts.filter((d) => d.level >= 2).length;
    if (metric === "research") return this.progression.research.length;
    if (metric === "contracts") return this.progression.completed;
    if (metric === "rank")
      return this.progression.completed >= 650 ? this.rank : 0;
    return this.metrics[metric as keyof Metrics] ?? 0;
  }
  private checkAchievements(): void {
    for (const a of ACHIEVEMENTS)
      if (
        !this.progression.achievements.includes(a.id) &&
        this.achievementValue(a.metric) >= a.target
      ) {
        this.progression.achievements.push(a.id);
        this.progression.stamps += a.stamps;
        this.log(
          `Achievement unlocked: ${a.title}. +${a.stamps} research stamps.`,
        );
      }
  }
  private restoreProgress(value: unknown): ProgressSave {
    const p =
      value && typeof value === "object"
        ? (structuredClone(value) as ProgressSave)
        : undefined;
    if (p && !Array.isArray(p.districts))
      p.districts = freshProgress().districts;
    const valid =
      p &&
      [
        p.xp,
        p.stamps,
        p.completed,
        p.sequence,
        p.cleaned,
        p.parties,
        p.built,
        p.upgraded,
        p.staff,
      ].every((n) => Number.isFinite(n) && n >= 0) &&
      p.staff <= 12 &&
      p.districts.length === 9 &&
      p.districts.every(
        (d) =>
          (d.kind === null || Object.hasOwn(FACILITIES, d.kind)) &&
          Number.isInteger(d.level) &&
          d.level >= 0 &&
          d.level <= 3 &&
          (d.kind !== null || d.level === 0),
      ) &&
      [p.contracts, p.achievements, p.research, p.seen].every(Array.isArray) &&
      p.contracts.length <= 3 &&
      typeof p.tutorialClaimed === "boolean" &&
      p.contracts.every(
        (c) =>
          Number.isInteger(c.id) &&
          c.id > 0 &&
          Number.isInteger(c.slot) &&
          c.slot >= 0 &&
          c.slot < 3 &&
          typeof c.title === "string" &&
          Object.hasOwn(this.metrics, c.metric) &&
          [c.baseline, c.target, c.coins, c.stamps, c.xp].every(
            (n) => Number.isFinite(n) && n >= 0,
          ) &&
          c.target > 0,
      ) &&
      new Set(p.contracts.map((c) => c.slot)).size === p.contracts.length &&
      new Set(p.contracts.map((c) => c.id)).size === p.contracts.length;
    if (valid) {
      const result = structuredClone(p);
      result.achievements = [
        ...new Set(
          result.achievements.filter((id) =>
            ACHIEVEMENTS.some((a) => a.id === id),
          ),
        ),
      ];
      result.research = [
        ...new Set(
          result.research.filter((id) => RESEARCH.some((r) => r.id === id)),
        ),
      ];
      result.seen = [
        ...new Set(result.seen.filter((id) => Object.hasOwn(ANIMALS, id))),
      ];
      result.sequence = Math.max(
        result.sequence,
        ...result.contracts.map((c) => c.id),
      );
      return result;
    }
    const result = freshProgress();
    result.xp = this.facilities.reduce((sum, f) => sum + f.served, 0);
    result.built = Math.max(0, this.facilities.length - 3);
    result.upgraded = this.facilities.reduce((sum, f) => sum + f.level - 1, 0);
    result.seen = [...new Set(this.guests.map((g) => g.kind))];
    return result;
  }
  snapshot(): Snapshot {
    return {
      version: 2,
      progression: structuredClone(this.progression),
      pricing: this.pricing,
      coins: this.coins,
      reputation: this.reputation,
      elapsed: this.elapsed,
      income: this.income,
      expenses: this.expenses,
      departed: this.departed,
      happy: this.happy,
      facilities: this.facilities,
      guests: this.guests,
      entries: this.entries,
      nextId: this.nextId,
      arrivalTimer: this.arrivalTimer,
      maintenanceTimer: this.maintenanceTimer,
      weather: this.weather,
      weatherTimer: this.weatherTimer,
      randomState: this.randomState,
      milestones: [...this.milestones],
    };
  }
  private restore(value: unknown): boolean {
    try {
      const s = value as Snapshot;
      if (
        ![1, 2].includes(s.version) ||
        !Array.isArray(s.facilities) ||
        !Array.isArray(s.guests) ||
        !Array.isArray(s.entries) ||
        !Array.isArray(s.milestones) ||
        s.facilities.length > 128 ||
        s.guests.length > 60
      )
        return false;
      const nums = [
        s.coins,
        s.reputation,
        s.elapsed,
        s.income,
        s.expenses,
        s.departed,
        s.happy,
        s.nextId,
        s.arrivalTimer,
        s.maintenanceTimer,
        s.weatherTimer,
        s.randomState,
      ];
      if (
        nums.some((n) => !Number.isFinite(n)) ||
        s.coins < 0 ||
        s.reputation < 0 ||
        s.reputation > 100
      )
        return false;
      if (
        s.facilities.some(
          (f) =>
            !(f.kind in FACILITIES) ||
            ![f.id, f.x, f.y, f.level, f.cleanliness, f.growth, f.served].every(
              Number.isFinite,
            ) ||
            f.level < 1 ||
            f.level > 5,
        )
      )
        return false;
      const states = [
        "arriving",
        "walking",
        "queueing",
        "bathing",
        "eating",
        "sleeping",
        "wandering",
        "leaving",
      ];
      if (
        s.guests.some(
          (g) =>
            !(g.kind in ANIMALS) ||
            !states.includes(g.state) ||
            typeof g.name !== "string" ||
            ![
              g.id,
              g.x,
              g.y,
              g.targetX,
              g.targetY,
              g.timer,
              g.stay,
              g.hunger,
              g.energy,
              g.comfort,
              g.satisfaction,
              g.spent,
              g.services,
              g.queueTime,
              g.quirkAt,
            ].every(Number.isFinite),
        )
      )
        return false;
      if (
        s.entries.some(
          (e) =>
            typeof e.text !== "string" ||
            !["income", "expense", "story", "arrival"].includes(e.type) ||
            ![e.id, e.time, e.amount].every(Number.isFinite),
        )
      )
        return false;
      if (!["Sunny", "Rainy", "Breezy"].includes(s.weather)) return false;
      if (
        s.pricing !== undefined &&
        !["friendly", "fair", "premium"].includes(s.pricing)
      )
        return false;
      this.pricing = s.pricing ?? "fair";
      this.coins = s.coins;
      this.reputation = s.reputation;
      this.elapsed = s.elapsed;
      this.income = s.income;
      this.expenses = s.expenses;
      this.departed = s.departed;
      this.happy = s.happy;
      this.facilities = structuredClone(s.facilities);
      this.guests = structuredClone(s.guests);
      this.entries = structuredClone(s.entries);
      if (s.version === 1) {
        const shift = (n: number, offset: number, limit: number) => {
          const value = n + offset;
          return value > limit - 160 ? value - (limit - 320) : value;
        };
        for (const f of this.facilities) {
          f.x = shift(f.x, START_OFFSET_X, WORLD_WIDTH);
          f.y = shift(f.y, START_OFFSET_Y, WORLD_HEIGHT);
        }
        for (const g of this.guests) {
          g.x = shift(g.x, START_OFFSET_X, WORLD_WIDTH);
          g.y = shift(g.y, START_OFFSET_Y, WORLD_HEIGHT);
          g.targetX = shift(g.targetX, START_OFFSET_X, WORLD_WIDTH);
          g.targetY = shift(g.targetY, START_OFFSET_Y, WORLD_HEIGHT);
        }
      }
      this.progression = this.restoreProgress(s.progression);
      this.nextId = s.nextId;
      this.arrivalTimer = s.arrivalTimer;
      this.maintenanceTimer = s.maintenanceTimer;
      this.weather = s.weather;
      this.weatherTimer = s.weatherTimer;
      this.randomState = s.randomState;
      this.milestones = new Set(
        s.milestones.filter((id) =>
          ["income", "lodge", "reviews", "species", "garden"].includes(id),
        ),
      );
      return true;
    } catch {
      return false;
    }
  }
}
