import { THEME } from '../config/constants.js';

/**
 * Creates a cute Japanese cooking-game recipe card / modal panel with:
 * - Warm cream parchment body
 * - Thick warm cocoa cartoon outline
 * - Delicate honey-gold inner border
 * - Cute pastel washi-tape decorative stickers at corners
 * - Bouncy entrance pop animation
 */
export function createPanel(scene, x, y, width, height, options = {}) {
  const container = scene.add.container(x, y);
  const bgColor = options.bgColor !== undefined ? options.bgColor : THEME.panelBg;
  const strokeColor = options.strokeColor !== undefined ? options.strokeColor : THEME.outlineDark;
  const radius = options.radius || 16;
  const alpha = options.alpha !== undefined ? options.alpha : 0.98;
  const animated = options.animated !== undefined ? options.animated : true;

  const bg = scene.add.graphics();

  // 1. Soft Warm Ambient Shadow
  bg.fillStyle(0x092f3b, 0.26);
  bg.fillRoundedRect(-width / 2 - 2, -height / 2 + 7, width + 4, height, radius + 2);
  bg.fillStyle(0x092f3b, 0.12);
  bg.fillRoundedRect(-width / 2 - 4, -height / 2 + 12, width + 8, height + 2, radius + 4);

  // 2. 3D Bottom Extrusion Lip
  bg.fillStyle(THEME.surfaceWood, 0.72);
  bg.fillRoundedRect(-width / 2, -height / 2 + 4, width, height, radius);

  // 3. Main Warm Cream Panel Body
  bg.fillStyle(bgColor, alpha);
  bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

  // 4. Subtle Top Sheen Highlight
  bg.fillStyle(0xffffff, 0.45);
  bg.fillRoundedRect(-width / 2 + 4, -height / 2 + 3, width - 8, Math.max(14, height * 0.18), radius - 3);

  // 5. Clean Thick Cartoon Outline
  bg.lineStyle(2.5, strokeColor, 1);
  bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

  // 6. Inner Delicate Honey Butter Accent Stroke
  bg.lineStyle(1.5, THEME.panelBorder, 0.9);
  bg.strokeRoundedRect(-width / 2 + 5, -height / 2 + 5, width - 10, height - 10, radius - 4);

  // 7. Cute Washi-Tape Stickers at Top Corners
  if (options.tape !== false) {
    const tapeW = 38;
    const tapeH = 14;
    // Left tape (Strawberry Coral)
    bg.fillStyle(THEME.accentRed, 0.9);
    bg.fillRect(-width / 2 + 12, -height / 2 - 4, tapeW, tapeH);
    bg.lineStyle(1, THEME.accentRedLip, 0.6);
    bg.strokeRect(-width / 2 + 12, -height / 2 - 4, tapeW, tapeH);

    // Right tape (Pandan Mint)
    bg.fillStyle(THEME.secondaryLight, 0.9);
    bg.fillRect(width / 2 - 12 - tapeW, -height / 2 - 4, tapeW, tapeH);
    bg.lineStyle(1, THEME.secondaryDark, 0.6);
    bg.strokeRect(width / 2 - 12 - tapeW, -height / 2 - 4, tapeW, tapeH);
  }

  container.add(bg);

  // Optional entrance pop animation
  if (animated && scene.tweens) {
    container.setScale(0.88);
    container.setAlpha(0.2);
    scene.tweens.add({
      targets: container,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 1.0,
      duration: 180,
      ease: 'Back.easeOut'
    });
  }

  return {
    container,
    destroy: () => container.destroy()
  };
}
