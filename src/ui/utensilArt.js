import { THEME } from '../config/constants.js';

// Shared Warung utensil artwork. These compact vector illustrations keep the
// same cocoa outline, pandan teal, brass and teak palette across every game.
const OUTLINE = THEME.outlineDark;
const CREAM = 0xfff8e9cf;

export function createKnife(scene, x = 0, y = 0, scale = 1) {
  if (scene.textures.exists('utensil_knife')) return scene.add.image(x, y, 'utensil_knife').setScale(scale);
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.16).fillEllipse(0, 38, 42, 8);
  g.fillStyle(THEME.surfaceTeal, 1).fillRoundedRect(-14, -116, 28, 50, 8);
  g.fillStyle(THEME.surfaceTealLight, 1).fillRoundedRect(-10, -112, 8, 40, 4);
  g.lineStyle(3, OUTLINE, 1).strokeRoundedRect(-14, -116, 28, 50, 8);
  g.fillStyle(0xdbeafe, 1).fillRoundedRect(-19, -70, 38, 104, 8);
  g.fillStyle(0xffffff, 0.68).fillRoundedRect(-13, -64, 8, 88, 4);
  g.lineStyle(3, OUTLINE, 1).strokeRoundedRect(-19, -70, 38, 104, 8);
  g.lineStyle(2, THEME.brassGold, 1);
  g.strokeCircle(0, -103, 3);
  g.strokeCircle(0, -84, 3);
  c.add(g);
  return c;
}

export function createMeasuringCup(scene, x = 0, y = 0, scale = 1) {
  if (scene.textures.exists('utensil_measuring_cup')) return scene.add.image(x, y, 'utensil_measuring_cup').setScale(scale);
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.14).fillEllipse(0, 108, 92, 12);
  g.fillStyle(0xbae6fd, 0.28).fillRoundedRect(-74, -88, 148, 194, 14);
  g.fillStyle(CREAM, 0.32).fillRoundedRect(-67, -80, 126, 174, 10);
  g.fillTriangle(-74, -88, -98, -72, -74, -58);
  g.lineStyle(8, 0xbae6fd, 0.7).strokeRoundedRect(72, -45, 34, 112, 17);
  g.lineStyle(3, OUTLINE, 1).strokeRoundedRect(-74, -88, 148, 194, 14);
  g.lineStyle(3, OUTLINE, 1).strokeRoundedRect(72, -45, 34, 112, 17);
  g.lineStyle(3, 0xffffff, 0.75).lineBetween(-63, -76, -63, 88);
  for (let i = 0; i < 4; i++) {
    const yy = 72 - i * 42;
    g.lineStyle(2, OUTLINE, 0.78).lineBetween(31, yy, 61, yy);
  }
  c.add(g);
  return c;
}

export function createTeaCup(scene, x = 0, y = 0, scale = 1) {
  if (scene.textures.exists('utensil_tea_cup')) return scene.add.image(x, y, 'utensil_tea_cup').setScale(scale);
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.15).fillEllipse(0, 36, 86, 12);
  g.fillStyle(CREAM, 1).fillRoundedRect(-42, -22, 84, 56, 14);
  g.fillStyle(0xb45309, 1).fillEllipse(0, -20, 70, 22);
  g.fillStyle(0xf59e0b, 0.7).fillEllipse(0, -20, 58, 13);
  g.lineStyle(3, OUTLINE, 1).strokeRoundedRect(-42, -22, 84, 56, 14);
  g.lineStyle(6, THEME.surfaceTeal, 1).strokeCircle(45, 2, 18);
  g.lineStyle(3, OUTLINE, 1).strokeCircle(45, 2, 18);
  c.add(g);
  return c;
}

export function createTeaPot(scene, x = 0, y = 0, scale = 1) {
  if (scene.textures.exists('utensil_tea_pot')) return scene.add.image(x, y, 'utensil_tea_pot').setScale(scale);
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.14).fillEllipse(0, 42, 120, 12);
  g.fillStyle(THEME.surfaceTeal, 1).fillRoundedRect(-48, -30, 96, 62, 18);
  g.fillStyle(THEME.surfaceTealLight, 1).fillRoundedRect(-38, -22, 70, 18, 8);
  g.fillStyle(CREAM, 1).fillEllipse(0, -30, 54, 14);
  g.fillStyle(THEME.surfaceWood, 1).fillTriangle(46, -8, 78, 2, 46, 12);
  g.lineStyle(6, THEME.brassGold, 1).strokeCircle(-50, 0, 24);
  g.lineStyle(3, OUTLINE, 1).strokeRoundedRect(-48, -30, 96, 62, 18);
  g.lineStyle(3, OUTLINE, 1).strokeCircle(-50, 0, 24);
  c.add(g);
  return c;
}

export function createCashRegister(scene, x = 0, y = 0, scale = 1) {
  if (scene.textures.exists('utensil_cash_register')) return scene.add.image(x, y, 'utensil_cash_register').setScale(scale);
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.16).fillRoundedRect(-70, -34, 140, 72, 12);
  g.fillStyle(THEME.surfaceTeal, 1).fillRoundedRect(-74, -40, 148, 72, 12);
  g.fillStyle(THEME.surfaceTealLight, 1).fillRoundedRect(-64, -30, 128, 24, 7);
  g.fillStyle(0xdcfce7, 1).fillRoundedRect(-54, -26, 108, 16, 4);
  g.lineStyle(3, OUTLINE, 1).strokeRoundedRect(-74, -40, 148, 72, 12);
  for (let i = 0; i < 4; i++) {
    g.fillStyle(i === 3 ? THEME.accentRed : THEME.primary, 1).fillCircle(-48 + i * 32, 14, 8);
    g.lineStyle(1.5, OUTLINE, 0.8).strokeCircle(-48 + i * 32, 14, 8);
  }
  c.add(g);
  return c;
}

export function createMixingBowl(scene, x = 0, y = 0, scale = 1) {
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.16).fillEllipse(0, 42, 130, 16);
  g.fillStyle(CREAM, 1).fillEllipse(0, 0, 132, 48);
  g.fillStyle(0xfffdf5, 1).fillEllipse(0, -3, 104, 30);
  g.fillStyle(THEME.primaryLight, 0.8).fillEllipse(0, 2, 72, 18);
  g.lineStyle(3, OUTLINE, 1).strokeEllipse(0, 0, 132, 48);
  g.lineStyle(3, THEME.surfaceTeal, 1).strokeEllipse(0, 7, 105, 28);
  c.add(g);
  return c;
}

export function createThermometer(scene, x = 0, y = 0, scale = 1) {
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.13).fillEllipse(0, 116, 34, 8);
  g.fillStyle(CREAM, 1).fillCircle(0, -72, 23);
  g.fillStyle(0xfffdf5, 1).fillCircle(0, -72, 16);
  g.lineStyle(3, OUTLINE, 1).strokeCircle(0, -72, 23);
  g.fillStyle(0xfef3c7, 1).fillRoundedRect(-7, -48, 14, 160, 7);
  g.fillStyle(THEME.accentRed, 1).fillCircle(0, 98, 10);
  g.fillStyle(THEME.accentRed, 0.9).fillRoundedRect(-3, -20, 6, 118, 3);
  g.lineStyle(3, OUTLINE, 1).strokeRoundedRect(-7, -48, 14, 160, 7);
  c.add(g);
  return c;
}

export function createWok(scene, x = 0, y = 0, scale = 1) {
  if (scene.textures.exists('utensil_wok')) return scene.add.image(x, y, 'utensil_wok').setScale(scale);
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18).fillEllipse(0, 94, 214, 22);
  g.fillStyle(THEME.surfaceTeal, 1).fillEllipse(0, 0, 210, 168);
  g.fillStyle(THEME.surfaceTealDark, 1).fillEllipse(0, -8, 184, 138);
  g.lineStyle(4, THEME.brassGold, 1).strokeEllipse(0, 0, 210, 168);
  g.fillStyle(THEME.surfaceWood, 1).fillRoundedRect(96, -12, 84, 24, 8);
  g.fillStyle(THEME.surfaceWoodLight, 1).fillRoundedRect(105, -8, 66, 12, 5);
  g.lineStyle(3, OUTLINE, 1).strokeRoundedRect(96, -12, 84, 24, 8);
  c.add(g);
  return c;
}

export function createMoneyProps(scene, x = 0, y = 0, scale = 1) {
  if (scene.textures.exists('utensil_money')) return scene.add.image(x, y, 'utensil_money').setScale(scale);
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.14).fillEllipse(0, 28, 92, 10);
  g.fillStyle(0x86efac, 1).fillRoundedRect(-45, -20, 86, 34, 5);
  g.fillStyle(0xbbf7d0, 1).fillRoundedRect(-39, -14, 74, 22, 3);
  g.lineStyle(2, OUTLINE, 1).strokeRoundedRect(-45, -20, 86, 34, 5);
  g.fillStyle(THEME.brassGold, 1).fillCircle(42, 14, 12);
  g.fillStyle(THEME.primaryLight, 1).fillCircle(42, 14, 7);
  g.lineStyle(2, OUTLINE, 1).strokeCircle(42, 14, 12);
  c.add(g);
  return c;
}

export function createWokSpatula(scene, x = 0, y = 0, scale = 1) {
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.13).fillEllipse(0, 105, 40, 10);
  g.fillStyle(THEME.surfaceWood, 1).fillRoundedRect(-7, -16, 14, 112, 7);
  g.fillStyle(THEME.surfaceWoodLight, 1).fillRoundedRect(-3, -10, 4, 96, 2);
  g.lineStyle(2, OUTLINE, 1).strokeRoundedRect(-7, -16, 14, 112, 7);
  g.fillStyle(THEME.surfaceTeal, 1).fillEllipse(0, -58, 42, 52);
  g.fillStyle(THEME.surfaceTealLight, 1).fillEllipse(-4, -61, 23, 35);
  g.lineStyle(3, OUTLINE, 1).strokeEllipse(0, -58, 42, 52);
  g.lineStyle(2, THEME.brassGold, 1).lineBetween(-13, -70, -8, -47);
  g.lineStyle(2, THEME.brassGold, 1).lineBetween(0, -72, 0, -46);
  g.lineStyle(2, THEME.brassGold, 1).lineBetween(13, -70, 8, -47);
  c.add(g);
  return c;
}
