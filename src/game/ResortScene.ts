import Phaser from "phaser";
import {
  Resort,
  FACILITIES,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  START_OFFSET_X,
  START_OFFSET_Y,
  type FacilityKind,
} from "../simulation/resort";
import spriteData from "./spriteManifest.json";
import { animationFrame, type AnimationInfo } from "./animation";
import { artUri, facilityArt, treeArt, blossomArt, signArt } from "./art";
const animations: Record<string, AnimationInfo> = spriteData;
export type Selection = { type: "guest" | "facility"; id: number } | null;
export class ResortScene extends Phaser.Scene {
  private guests = new Map<number, Phaser.GameObjects.Image>();
  private buildings = new Map<number, Phaser.GameObjects.Image>();
  private labels = new Map<number, Phaser.GameObjects.Text>();
  private statuses = new Map<number, Phaser.GameObjects.Text>();
  private effects!: Phaser.GameObjects.Graphics;
  private placement!: Phaser.GameObjects.Graphics;
  private pinch: { distance: number; zoom: number } | null = null;
  private down: {
    x: number;
    y: number;
    scrollX: number;
    scrollY: number;
  } | null = null;
  private dragged = false;
  private fitZoom = 1;
  private landscapeText?: Phaser.GameObjects.Text;
  idleCopyVisible = false;
  selected: Selection = null;
  tool: FacilityKind | null = null;
  constructor(
    public world: Resort,
    private onSelect: (selection: Selection) => void,
    private onBuild: (kind: FacilityKind, x: number, y: number) => void,
    private onZoom: (zoom: number) => void,
  ) {
    super("resort");
  }
  preload(): void {
    for (const [key, info] of Object.entries(animations))
      this.load.spritesheet(key, `./art/${key}.png`, {
        frameWidth: info.cell,
        frameHeight: info.cell,
      });
    for (const [kind, svg] of Object.entries(facilityArt))
      this.load.svg(kind, artUri(svg), { width: 400, height: 340 });
    this.load.svg("tree", artUri(treeArt), { width: 300, height: 255 });
    this.load.svg("blossom", artUri(blossomArt), { width: 300, height: 255 });
    this.load.svg("sign", artUri(signArt), { width: 400, height: 340 });
  }
  create(): void {
    this.cameras.main.setBackgroundColor("#e7e8cf");
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.drawGround();
    this.effects = this.add.graphics().setDepth(10000);
    this.placement = this.add.graphics().setDepth(10001);
    this.fit();
    this.scale.on("resize", () => this.fit());
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
        this.pinch = {
          distance: Phaser.Math.Distance.Between(
            this.input.pointer1.x,
            this.input.pointer1.y,
            this.input.pointer2.x,
            this.input.pointer2.y,
          ),
          zoom: this.cameras.main.zoom,
        };
        this.down = null;
        return;
      }
      this.down = {
        x: p.x,
        y: p.y,
        scrollX: this.cameras.main.scrollX,
        scrollY: this.cameras.main.scrollY,
      };
      this.dragged = false;
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (
        this.pinch &&
        this.input.pointer1.isDown &&
        this.input.pointer2.isDown
      ) {
        const distance = Phaser.Math.Distance.Between(
          this.input.pointer1.x,
          this.input.pointer1.y,
          this.input.pointer2.x,
          this.input.pointer2.y,
        );
        const cam = this.cameras.main;
        const center = cam.getWorldPoint(cam.width / 2, cam.height / 2);
        cam.setZoom(
          Phaser.Math.Clamp(
            (this.pinch.zoom * distance) / Math.max(1, this.pinch.distance),
            this.fitZoom,
            this.fitZoom * 9,
          ),
        );
        this.centerCamera(center.x, center.y);
        this.onZoom(cam.zoom / this.fitZoom);
        return;
      }
      if (!this.down || !p.isDown) return;
      const dx = p.x - this.down.x,
        dy = p.y - this.down.y;
      if (Math.hypot(dx, dy) > 6) this.dragged = true;
      if (this.dragged) {
        this.cameras.main.scrollX =
          this.down.scrollX - dx / this.cameras.main.zoom;
        this.cameras.main.scrollY =
          this.down.scrollY - dy / this.cameras.main.zoom;
      }
    });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      if (this.pinch) {
        this.pinch = null;
        this.down = null;
        return;
      }
      if (!this.dragged && this.down) {
        const pt = this.cameras.main.getWorldPoint(p.x, p.y);
        if (this.tool) this.onBuild(this.tool, pt.x, pt.y);
        else {
          const guest = [...this.world.guests]
            .reverse()
            .find((g) => Math.hypot(g.x - pt.x, g.y - 25 - pt.y) < 50);
          const building = this.world.facilities.find(
            (f) =>
              Math.abs(f.x - pt.x) < 90 && pt.y > f.y - 110 && pt.y < f.y + 65,
          );
          this.selected = guest
            ? { type: "guest", id: guest.id }
            : building
              ? { type: "facility", id: building.id }
              : null;
          this.onSelect(this.selected);
        }
      }
      this.down = null;
    });
    this.input.on("pointerupoutside", () => {
      this.down = null;
      this.pinch = null;
    });
    this.input.on(
      "wheel",
      (_p: Phaser.Input.Pointer, _objects: unknown, dx: number, dy: number) => {
        if (Math.abs(dx) > Math.abs(dy)) {
          this.cameras.main.scrollX += dx / this.cameras.main.zoom;
        } else this.zoom(dy > 0 ? -0.12 : 0.12);
      },
    );
    this.game.canvas.addEventListener("wheel", (e) => e.preventDefault(), {
      passive: false,
    });
  }
  private centerCamera(x: number, y: number): void {
    const cam = this.cameras.main;
    const padX = Math.max(0, (cam.width / cam.zoom - WORLD_WIDTH) / 2);
    const padY = Math.max(0, (cam.height / cam.zoom - WORLD_HEIGHT) / 2);
    cam.setBounds(
      -padX,
      -padY,
      WORLD_WIDTH + padX * 2,
      WORLD_HEIGHT + padY * 2,
    );
    cam.centerOn(
      padX > 0 ? WORLD_WIDTH / 2 : x,
      padY > 0 ? WORLD_HEIGHT / 2 : y,
    );
  }
  fit(includeAll = false): void {
    const cam = this.cameras.main;
    this.fitZoom = Math.min(cam.width / WORLD_WIDTH, cam.height / WORLD_HEIGHT);
    cam.setZoom(
      includeAll ? this.fitZoom : Math.min(cam.width / 1400, cam.height / 950),
    );
    this.centerCamera(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    this.onZoom(cam.zoom / this.fitZoom);
  }
  zoom(amount: number): void {
    const cam = this.cameras.main;
    const center = cam.getWorldPoint(cam.width / 2, cam.height / 2);
    cam.setZoom(
      Phaser.Math.Clamp(
        cam.zoom + this.fitZoom * 3 * amount,
        this.fitZoom,
        this.fitZoom * 9,
      ),
    );
    this.centerCamera(center.x, center.y);
    this.onZoom(cam.zoom / this.fitZoom);
  }
  focus(x: number, y: number): void {
    this.cameras.main.setZoom(this.fitZoom * 4.5);
    this.centerCamera(x, y);
    this.onZoom(4.5);
  }
  private drawGround(): void {
    let g = this.add.graphics().setDepth(-1000);
    g.fillStyle(0xd8dfbe).fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    // The original resort remains intact; new meadows extend beyond it.
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (row === 1 && col === 1) continue;
        const x = col * 1400,
          y = row * 950;
        g.fillStyle((row + col) % 2 ? 0xe1e4c4 : 0xd3ddbb);
        g.fillEllipse(x + 700, y + 475, 1370, 910);
        g.fillStyle(0xc5d4b1, 0.6);
        g.fillEllipse(x + 190, y + 110, 650, 290);
        g.fillEllipse(x + 1180, y + 770, 550, 340);
        g.lineStyle(22, 0xeddec0, 0.8);
        g.lineBetween(x + 80, y + 600, x + 1300, y + 600);
        g.lineBetween(x + 700, y + 70, x + 700, y + 880);
        for (let i = 0; i < 90; i++) {
          g.fillStyle(i % 3 ? 0xa2b78b : 0xc6ceab, 0.45);
          g.fillEllipse(
            x + 50 + ((i * 137.51) % 1300),
            y + 50 + ((i * 91.7) % 850),
            4,
            3,
          );
        }
        for (const [tx, ty] of [
          [100, 110],
          [1260, 150],
          [160, 790],
          [1240, 800],
        ]) {
          this.add
            .image(x + tx, y + ty, (row + col) % 2 ? "blossom" : "tree")
            .setDisplaySize(135, 155)
            .setDepth(y + ty - 100);
        }
      }
    }
    g = this.add
      .graphics()
      .setDepth(-999)
      .setPosition(START_OFFSET_X, START_OFFSET_Y);
    // A layered paper landscape with a calm central clearing.
    g.fillStyle(0xc5d4b1);
    g.fillEllipse(150, 180, 740, 360);
    g.fillEllipse(1220, 180, 800, 400);
    g.fillStyle(0xa9bea0);
    g.fillEllipse(100, 80, 680, 260);
    g.fillEllipse(1200, 35, 660, 300);
    g.fillStyle(0x819e88);
    g.fillEllipse(360, -20, 470, 250);
    g.fillEllipse(1070, -35, 450, 260);
    g.lineStyle(10, 0xf8f1dd, 0.7);
    g.strokeEllipse(700, 470, 1170, 780);
    g.fillStyle(0xe6e6c6);
    g.fillEllipse(700, 500, 1140, 750);
    g.fillStyle(0xeddec0);
    g.fillRoundedRect(663, 470, 74, 440, 35);
    g.fillRoundedRect(390, 605, 650, 64, 30);
    g.fillRoundedRect(988, 420, 65, 230, 25);
    g.lineStyle(3, 0xf7eed8, 0.9);
    g.strokeRoundedRect(663, 470, 74, 440, 35);
    g.fillStyle(0xa9cec4);
    g.fillEllipse(1290, 580, 180, 590);
    g.fillEllipse(1340, 260, 200, 300);
    g.lineStyle(7, 0xf5f0da);
    g.strokeEllipse(1290, 580, 180, 590);
    for (let i = 0; i < 200; i++) {
      const x = ((i * 137.51) % 1300) + 50,
        y = 160 + ((i * 91.7) % 640);
      if (Math.abs(x - 700) < 60 || (y > 600 && y < 680)) continue;
      g.fillStyle(i % 3 ? 0xa2b78b : 0xc6ceab, 0.45);
      g.fillEllipse(x, y, 3 + (i % 5), 2 + (i % 3));
    }
    const trees = [
      [140, 270],
      [235, 170],
      [1160, 215],
      [1250, 340],
      [90, 510],
      [230, 750],
      [1130, 745],
      [330, 140],
      [960, 160],
      [116, 700],
      [1210, 790],
    ];
    trees.forEach(([x, y], i) =>
      this.add
        .image(
          x + START_OFFSET_X,
          y + START_OFFSET_Y,
          i % 3 === 0 ? "blossom" : "tree",
        )
        .setDisplaySize(i % 3 === 0 ? 170 : 135, i % 3 === 0 ? 145 : 155)
        .setDepth(y + START_OFFSET_Y - 100),
    );
    this.add
      .image(815 + START_OFFSET_X, 815 + START_OFFSET_Y, "sign")
      .setDisplaySize(155, 135)
      .setDepth(800 + START_OFFSET_Y);
    const text = this.add
      .text(
        440 + START_OFFSET_X,
        230 + START_OFFSET_Y,
        "a little less hustle.\na little more bubble.",
        {
          fontFamily: "Georgia",
          fontSize: "24px",
          color: "#77876d",
          align: "center",
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5)
      .setAngle(-6)
      .setDepth(-500);
    this.landscapeText = text;
    text.setAlpha(0);
    // Wooden entrance and stepping stones.
    g.fillStyle(0xbda27a);
    for (let i = 0; i < 5; i++) g.fillRoundedRect(669, 828 + i * 17, 62, 10, 4);
    for (const [x, y] of [
      [530, 685],
      [560, 710],
      [590, 735],
      [830, 660],
      [870, 670],
    ]) {
      g.fillStyle(0xc3bca0).fillEllipse(x, y, 25, 14);
    }
  }
  update(_time: number, delta: number): void {
    if (this.landscapeText) {
      const target = this.idleCopyVisible ? 0.7 : 0;
      const alpha = this.landscapeText.alpha;
      const step = Math.min(delta, 100) / (this.idleCopyVisible ? 1200 : 600);
      this.landscapeText.setAlpha(
        alpha + Phaser.Math.Clamp(target - alpha, -step, step),
      );
    }
    this.world.step(Math.min(delta / 1000, 0.06) * this.world.speed);
    for (const f of this.world.facilities) {
      if (!this.buildings.has(f.id)) {
        const image = this.add
          .image(f.x, f.y, f.kind)
          .setDisplaySize(200, 170)
          .setDepth(f.y - 100);
        this.buildings.set(f.id, image);
        const label = this.add
          .text(f.x, f.y + 87, FACILITIES[f.kind].name, {
            fontFamily: "Georgia",
            fontSize: "16px",
            color: "#5c624b",
            backgroundColor: "#fff2dccc",
            padding: { x: 9, y: 4 },
          })
          .setOrigin(0.5)
          .setDepth(f.y + 1);
        this.labels.set(f.id, label);
      }
      const label = this.labels.get(f.id)!;
      const n = this.world.occupancy(f);
      label.setText(
        `${FACILITIES[f.kind].name}${f.level > 1 ? ` · Lv ${f.level}` : ""}  ${n}/${this.world.capacityOf(f)}`,
      );
      this.buildings.get(f.id)!.setAlpha(f.cleanliness < 30 ? 0.72 : 1);
    }
    for (const [id, image] of this.guests)
      if (!this.world.guests.some((g) => g.id === id)) {
        image.destroy();
        this.guests.delete(id);
        this.statuses.get(id)?.destroy();
        this.statuses.delete(id);
      }
    for (const guest of this.world.guests) {
      let sprite = this.guests.get(guest.id);
      if (!sprite) {
        sprite = this.add
          .image(guest.x, guest.y, guest.kind + "-walk", 0)
          .setDisplaySize(115, 115)
          .setOrigin(0.5, 0.98);
        this.guests.set(guest.id, sprite);
        const status = this.add
          .text(guest.x, guest.y - 85, "", {
            fontFamily: "Georgia",
            fontSize: "15px",
            color: "#625447",
            backgroundColor: "#fff5df",
            padding: { x: 6, y: 3 },
          })
          .setOrigin(0.5)
          .setDepth(10000);
        this.statuses.set(guest.id, status);
      }
      const moving = ["walking", "arriving", "leaving"].includes(guest.state);
      const action = moving
        ? "walk"
        : guest.state === "bathing"
          ? "bathing"
          : guest.state === "eating"
            ? "eating"
            : guest.state === "sleeping"
              ? "sleeping"
              : "idle";
      const desired = guest.kind + "-" + action,
        key = animations[desired]
          ? desired
          : animations[guest.kind + "-idle"]
            ? guest.kind + "-idle"
            : guest.kind + "-walk";
      const info = animations[key];
      const frame = animationFrame(info, this.world.elapsed, guest.id * 0.137);
      const size = 115 * (info.displayScale ?? 1);
      sprite
        .setTexture(key, frame)
        .setDisplaySize(size, size)
        .setOrigin(info.originX ?? 0.5, info.originY ?? 0.98)
        .setPosition(guest.x, guest.y)
        .setDepth(guest.y)
        .setFlipX(moving && guest.targetX < guest.x);
      sprite.setAngle(guest.state === "sleeping" ? -12 : 0);
      sprite.setAlpha(guest.state === "leaving" ? 0.8 : 1);
      const text = this.statuses.get(guest.id)!;
      const state = {
        bathing: "soaking",
        eating: "nom nom",
        sleeping: "zzz",
        queueing: "waiting",
        wandering: "unwinding",
        walking: "",
        arriving: "hello!",
        leaving: "bye!",
      }[guest.state];
      const selected =
        this.selected?.type === "guest" && this.selected.id === guest.id;
      text
        .setPosition(guest.x, guest.y - 100)
        .setText(selected ? `${guest.name} · ${state || "exploring"}` : state)
        .setVisible(
          selected || guest.state === "queueing" || guest.state === "sleeping",
        );
    }
    this.drawEffects();
    if (
      this.selected?.type === "guest" &&
      !this.world.guests.some((g) => g.id === this.selected!.id)
    ) {
      this.selected = null;
      this.onSelect(null);
    }
  }
  private drawEffects(): void {
    const clock = this.world.elapsed,
      g = this.effects;
    g.clear();
    this.placement.clear();
    for (const f of this.world.facilities) {
      if (f.kind === "spring") {
        for (let i = 0; i < 3; i++) {
          const t = (clock * 0.25 + i * 0.33) % 1;
          g.lineStyle(3, 0xfffaea, (1 - t) * 0.7);
          g.beginPath();
          g.moveTo(f.x - 35 + i * 35, f.y - 40 - t * 35);
          g.lineTo(
            f.x - 30 + i * 35 + Math.sin(clock + i) * 4,
            f.y - 55 - t * 35,
          );
          g.strokePath();
        }
      }
      if (f.kind === "garden") {
        const blooms = Math.floor(f.growth / 20);
        for (let i = 0; i < blooms; i++) {
          g.fillStyle(i % 2 ? 0xf5d089 : 0xe8ab9b);
          g.fillCircle(f.x - 65 + i * 28, f.y + 45 + Math.sin(i) * 10, 4);
        }
      }
    }
    for (const guest of this.world.guests) {
      if (guest.state === "bathing") {
        g.fillStyle(0xb9e0d9, 0.88);
        g.fillEllipse(guest.x, guest.y - 12, 82, 21);
        g.lineStyle(2, 0xf3f8e6, 0.8);
        g.strokeEllipse(
          guest.x,
          guest.y - 12,
          66 + Math.sin(clock * 2 + guest.id) * 5,
          15,
        );
      } else if (guest.state === "eating" && guest.kind !== "shiba") {
        g.fillStyle(0xf0bd7e);
        g.fillCircle(guest.x + 22, guest.y - 30, 7);
        g.fillStyle(0xdf9c81);
        g.fillCircle(guest.x + 24, guest.y - 33, 2);
      }
    }
    if (this.world.weather === "Rainy") {
      g.lineStyle(1.5, 0x6f9da4, 0.35);
      for (let i = 0; i < 180; i++) {
        const x = (i * 83 + clock * 18) % WORLD_WIDTH,
          y = (i * 97 + clock * 130) % WORLD_HEIGHT;
        g.lineBetween(x, y, x - 4, y + 12);
      }
    }
    if (this.selected) {
      const obj =
        this.selected.type === "guest"
          ? this.world.guests.find((x) => x.id === this.selected!.id)
          : this.world.facilities.find((x) => x.id === this.selected!.id);
      if (obj) {
        g.lineStyle(3, 0xb87354, 0.85);
        g.strokeEllipse(
          obj.x,
          obj.y + 10,
          this.selected.type === "guest" ? 95 : 215,
          35,
        );
      }
    }
    if (this.tool) {
      const p = this.input.activePointer,
        pt = this.cameras.main.getWorldPoint(p.x, p.y);
      const valid =
        pt.x >= 160 &&
        pt.x <= 1250 &&
        pt.y >= 190 &&
        pt.y <= 790 &&
        !this.world.facilities.some(
          (f) => Math.hypot(f.x - pt.x, f.y - pt.y) < 175,
        );
      this.placement.fillStyle(valid ? 0x779d82 : 0xc88471, 0.18);
      this.placement.lineStyle(3, valid ? 0x64896a : 0xc88471);
      this.placement.fillEllipse(pt.x, pt.y, 180, 120);
      this.placement.strokeEllipse(pt.x, pt.y, 180, 120);
    }
  }
}
