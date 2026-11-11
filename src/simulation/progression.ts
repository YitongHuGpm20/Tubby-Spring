export type Metric =
  | "services"
  | "spring"
  | "cafe"
  | "lodge"
  | "garden"
  | "happy"
  | "income"
  | "cleaned"
  | "parties"
  | "built"
  | "upgraded";
export type Metrics = Record<Metric, number>;
export interface Contract {
  id: number;
  slot: number;
  metric: Metric;
  baseline: number;
  target: number;
  title: string;
  coins: number;
  stamps: number;
  xp: number;
}
export interface ProgressSave {
  districts: {
    kind: "spring" | "cafe" | "lodge" | "garden" | null;
    level: number;
  }[];
  xp: number;
  stamps: number;
  completed: number;
  sequence: number;
  contracts: Contract[];
  achievements: string[];
  research: string[];
  cleaned: number;
  parties: number;
  built: number;
  upgraded: number;
  seen: string[];
  tutorialClaimed: boolean;
  staff: number;
}
export const CHAPTERS = [
  {
    name: "A tiny retreat",
    xp: 0,
    tasks: 0,
    text: "Meet your first guests and learn the rhythm.",
  },
  {
    name: "Word gets around",
    xp: 350,
    tasks: 3,
    text: "Add cabins, balance queues and train a caretaker.",
  },
  {
    name: "A proper little holiday",
    xp: 2200,
    tasks: 12,
    text: "Research comfortable rooms and try event specialities.",
  },
  {
    name: "Room to roam",
    xp: 9000,
    tasks: 35,
    text: "Develop new meadow districts and improve travel.",
  },
  {
    name: "The towel society",
    xp: 25000,
    tasks: 85,
    text: "Manage larger crowds and specialist facilities.",
  },
  {
    name: "A very unbusy empire",
    xp: 70000,
    tasks: 150,
    text: "Master five-level facilities and staff efficiency.",
  },
  {
    name: "Legend of the loafers",
    xp: 140000,
    tasks: 300,
    text: "Complete the gold guest and district collections.",
  },
  {
    name: "The grand little getaway",
    xp: 230000,
    tasks: 650,
    text: "Finish the mastery collection. Your next commission is always waiting.",
  },
];
export const RESEARCH = [
  {
    id: "care",
    name: "Towel training",
    rank: 1,
    coins: 250,
    stamps: 3,
    text: "Hire caretakers who clean low-cleanliness facilities automatically.",
  },
  {
    id: "rooms",
    name: "Roomier rooms",
    rank: 2,
    coins: 2500,
    stamps: 8,
    text: "Unlock facility level 4.",
  },
  {
    id: "trails",
    name: "Meadow trails",
    rank: 3,
    coins: 9500,
    stamps: 12,
    text: "Guests move 40% faster between facilities.",
  },
  {
    id: "promotion",
    name: "Tiny travel agency",
    rank: 3,
    coins: 15000,
    stamps: 15,
    text: "Visitors arrive 30% faster; capacity increases by 8.",
  },
  {
    id: "supplies",
    name: "Reusable everything",
    rank: 4,
    coins: 40000,
    stamps: 20,
    text: "Facility upkeep costs 25% less.",
  },
  {
    id: "deluxe",
    name: "Deluxe loafing",
    rank: 5,
    coins: 85000,
    stamps: 30,
    text: "Unlock facility level 5 and 10% higher service fees.",
  },
  {
    id: "staff",
    name: "The towel academy",
    rank: 5,
    coins: 60000,
    stamps: 25,
    text: "Caretakers clean twice as many facilities each round.",
  },
  {
    id: "welcome",
    name: "Guest relations",
    rank: 6,
    coins: 160000,
    stamps: 35,
    text: "Arriving guests start 10 points happier.",
  },
];
export const EVENTS = [
  {
    name: "Quiet soaking club",
    kind: "spring",
    animal: "capybara",
    text: "Capybaras visit more often. Hot spring fees +25%.",
  },
  {
    name: "The bun inspection",
    kind: "cafe",
    animal: "shiba",
    text: "Shibas lead a snack investigation. Snack fees +25%.",
  },
  {
    name: "Pajama symposium",
    kind: "lodge",
    animal: "raccoon",
    text: "Raccoons need nap rooms. Cabin fees +25%.",
  },
  {
    name: "Pebble appreciation day",
    kind: "garden",
    animal: "penguin",
    text: "Penguins explore the gardens. Garden comfort improves.",
  },
] as const;
export function freshProgress(): ProgressSave {
  return {
    districts: Array.from({ length: 9 }, () => ({ kind: null, level: 0 })),
    xp: 0,
    stamps: 0,
    completed: 0,
    sequence: 0,
    contracts: [],
    achievements: [],
    research: [],
    cleaned: 0,
    parties: 0,
    built: 0,
    upgraded: 0,
    seen: [],
    tutorialClaimed: false,
    staff: 0,
  };
}
export function rankOf(p: ProgressSave): number {
  let rank = 0;
  CHAPTERS.forEach((c, i) => {
    if (p.xp >= c.xp && p.completed >= c.tasks) rank = i;
  });
  return rank;
}
const TITLES: Record<Metric, string> = {
  services: "A good round of loafing",
  spring: "The bubble committee",
  cafe: "Bun quality assurance",
  lodge: "Very important naps",
  garden: "A stroll worth taking",
  happy: "Happy little goodbyes",
  income: "Fill the coin tin",
  cleaned: "Fresh towel patrol",
  parties: "A tiny celebration",
  built: "Make room for more",
  upgraded: "Comfort improvements",
};
export function nextContract(
  p: ProgressSave,
  slot: number,
  metrics: Metrics,
): Contract {
  const rank = rankOf(p);
  const cycle = p.sequence++;
  const service: Metric[] = ["spring", "cafe", "services", "garden", "lodge"];
  const hospitality: Metric[] = ["happy", "income", "parties"];
  const management: Metric[] = ["cleaned", "upgraded", "built", "services"];
  let metric = (slot === 0 ? service : slot === 1 ? hospitality : management)[
    Math.floor(cycle / 3) %
      (slot === 0
        ? service.length
        : slot === 1
          ? hospitality.length
          : management.length)
  ];
  if (metric === "lodge" && metrics.built === 0) metric = "services";
  // Finite construction cannot block an endless task board.
  if (
    (metric === "built" && metrics.built >= 28) ||
    (metric === "upgraded" && metrics.upgraded >= 70)
  )
    metric = "cleaned";
  const base =
    metric === "income"
      ? 1200
      : metric === "happy"
        ? 12
        : metric === "parties" || metric === "built" || metric === "upgraded"
          ? 1
          : metric === "cleaned"
            ? 6
            : 60;
  const target = Math.round(
    base *
      (metric === "built" || metric === "upgraded" || metric === "parties"
        ? 1
        : 1 + rank * 0.5),
  );
  return {
    id: cycle + 1,
    slot,
    metric,
    baseline: metrics[metric],
    target,
    title: TITLES[metric],
    coins: 75 + rank * 50,
    stamps: 1 + Math.floor(rank / 3),
    xp: 30 + rank * 20,
  };
}
export const METRIC_LABELS: Record<string, string> = {
  services: "guest services",
  spring: "soaks",
  cafe: "snacks served",
  lodge: "naps",
  garden: "garden visits",
  happy: "happy goodbyes",
  income: "coins earned",
  cleaned: "freshen-ups",
  parties: "towel parties",
  built: "new facilities",
  upgraded: "upgrades",
  species: "animal species",
  districts: "inhabited meadows",
  districtPlans: "meadows with level-2 themes",
  research: "research projects",
  contracts: "commissions",
  rank: "chapters",
};
export interface Achievement {
  id: string;
  title: string;
  text: string;
  target: number;
  metric:
    | Metric
    | "species"
    | "districts"
    | "research"
    | "contracts"
    | "districtPlans"
    | "rank";
  stamps: number;
}
export const ACHIEVEMENTS: Achievement[] = [
  ...(
    [
      ["services", "Professional loafing", [100, 10000, 100000]],
      ["happy", "Five-star feelings", [25, 1000, 10000]],
      ["income", "The coin collection", [2500, 100000, 1500000]],
      ["cleaned", "Towel detective", [20, 1000, 12000]],
      ["parties", "Social butterfly", [5, 100, 500]],
      ["contracts", "The commission club", [10, 150, 600]],
      ["districts", "Meadow explorer", [3, 6, 9]],
      ["research", "Tiny big ideas", [2, 5, 8]],
      ["districtPlans", "Neighborhood personality", [3, 6, 9]],
    ] as const
  ).flatMap(([metric, name, targets]) =>
    targets.map((target, i) => ({
      id: `${metric}-${i}`,
      title: `${name} · ${["Bronze", "Silver", "Gold"][i]}`,
      text: `Reach ${target.toLocaleString()} ${METRIC_LABELS[metric]}.`,
      target,
      metric,
      stamps: [2, 5, 12][i],
    })),
  ),
  {
    id: "species",
    title: "The whole adorable gang",
    text: "Welcome all four animal species across any visits.",
    target: 4,
    metric: "species",
    stamps: 3,
  },
  {
    id: "mastery",
    title: "Grand master of doing nothing",
    text: "Reach the final chapter and complete 650 commissions.",
    target: 7,
    metric: "rank",
    stamps: 20,
  },
];
