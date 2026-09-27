import { THEME } from '../config/constants.js';

/** Shared visual foundation for every Warung page. */
export function createWarungBackdrop(scene, { dim = 0.08, counter = false } = {}) {
  const bg = scene.add.image(640, 360, 'bg_warung_morning')
    .setDisplaySize(1280, 720)
    .setDepth(-30)
    .setAlpha(0.98);
  const wash = scene.add.graphics().setDepth(-29);
  wash.fillGradientStyle(THEME.surfaceTealDark, THEME.surfaceTealDark, THEME.surfaceWood, THEME.surfaceWood, 0.16, 0.16, 0.08, 0.08);
  wash.fillRect(0, 0, 1280, 720);
  if (dim) {
    wash.fillStyle(0x102a35, dim).fillRect(0, 0, 1280, 720);
  }
  if (counter) {
    const floor = scene.add.graphics().setDepth(-28);
    floor.fillStyle(THEME.surfaceWood, 0.2).fillRect(0, 540, 1280, 180);
    floor.lineStyle(3, THEME.outlineDark, 0.35).lineBetween(0, 540, 1280, 540);
  }
  return { bg, wash };
}

export function createWarmCard(scene, x, y, width, height, { depth = 0, alpha = 0.96 } = {}) {
  const card = scene.add.graphics().setPosition(x, y).setDepth(depth);
  card.fillStyle(THEME.surfaceTealDark, 0.28).fillRoundedRect(-width / 2 + 4, -height / 2 + 8, width, height, 24);
  card.fillStyle(THEME.panelBg, alpha).fillRoundedRect(-width / 2, -height / 2, width, height, 22);
  card.lineStyle(4, THEME.outlineDark, 0.95).strokeRoundedRect(-width / 2, -height / 2, width, height, 22);
  card.lineStyle(2, THEME.accentGold, 0.65).strokeRoundedRect(-width / 2 + 8, -height / 2 + 8, width - 16, height - 16, 16);
  return card;
}

export function createModalShade(scene, alpha = 0.62) {
  return scene.add.rectangle(640, 360, 1280, 720, 0x142b32, alpha).setDepth(50);
}
