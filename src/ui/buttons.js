import audioManager from '../managers/AudioManager.js';
import { THEME } from '../config/constants.js';

/**
 * Adjust hex color brightness
 * @param {number} hex - e.g. 0xf59e0b
 * @param {number} percent - positive to lighten (+0.2), negative to darken (-0.25)
 */
function adjustBrightness(hex, percent) {
  const r = Math.min(255, Math.max(0, Math.round(((hex >> 16) & 0xff) * (1 + percent))));
  const g = Math.min(255, Math.max(0, Math.round(((hex >> 8) & 0xff) * (1 + percent))));
  const b = Math.min(255, Math.max(0, Math.round((hex & 0xff) * (1 + percent))));
  return (r << 16) | (g << 8) | b;
}

/**
 * Creates a tactile 2.5D casual mobile game button with:
 * - Ambient drop shadow
 * - 3D extrusion bottom lip (physical depth)
 * - Main pill body with glossy top specular highlight
 * - Physical press depression translation & squish animation
 */
export function createButton(scene, x, y, text, options = {}) {
  const width = options.width || 220;
  const height = options.height || 58;
  const radius = options.radius !== undefined ? options.radius : Math.min(12, Math.floor(height / 3));
  const lipHeight = options.lipHeight !== undefined ? options.lipHeight : Math.max(5, Math.floor(height * 0.12));

  const bgColor = options.bgColor !== undefined ? options.bgColor : THEME.primary;
  const bgDarkColor = options.bgDarkColor !== undefined ? options.bgDarkColor : adjustBrightness(bgColor, -0.12);
  const lipColor = options.lipColor !== undefined ? options.lipColor : adjustBrightness(bgColor, -0.32);
  const textColor = options.textColor || '#ffffff';
  const requestedFontSize = parseInt(options.fontSize || '20', 10);
  const fontSize = `${Math.max(18, requestedFontSize)}px`;
  const onClick = options.onClick || (() => {});

  const container = scene.add.container(x, y);

  // 1. Ambient Drop Shadow (bottommost layer)
  const shadowGfx = scene.add.graphics();
  shadowGfx.fillStyle(0x092f3b, 0.28);
  shadowGfx.fillRoundedRect(-width / 2, -height / 2 + lipHeight + 3, width, height, radius);
  container.add(shadowGfx);

  // 2. 3D Extrusion Lip (darker base with clean outline)
  const lipGfx = scene.add.graphics();
  lipGfx.fillStyle(lipColor, 1);
  lipGfx.fillRoundedRect(-width / 2, -height / 2 + lipHeight, width, height, radius);
  lipGfx.lineStyle(2.5, THEME.outlineDark, 1);
  lipGfx.strokeRoundedRect(-width / 2, -height / 2 + lipHeight, width, height, radius);
  container.add(lipGfx);

  // 3. Button Face Container (translates down on press)
  const faceContainer = scene.add.container(0, 0);
  container.add(faceContainer);

  const faceGfx = scene.add.graphics();
  faceContainer.add(faceGfx);

  const drawFace = (color, isHover = false) => {
    faceGfx.clear();

    // Main rounded button body
    faceGfx.fillStyle(isHover ? adjustBrightness(color, 0.08) : color, 1);
    faceGfx.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

    // Top Gloss Specular Sheen (crescent highlight)
    faceGfx.fillStyle(0xfff4d6, isHover ? 0.22 : 0.12);
    const sheenH = Math.max(8, Math.floor(height * 0.38));
    faceGfx.fillRoundedRect(-width / 2 + 3, -height / 2 + 2, width - 6, sheenH, radius - 2);

    // Clean Cartoon Cocoa Outline
    faceGfx.lineStyle(2.5, THEME.outlineDark, 1);
    faceGfx.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  };

  drawFace(bgColor, false);

  // Label with gentle text shadow for maximum readability
  const isDarkText = typeof textColor === 'string' && (textColor.startsWith('#3') || textColor.startsWith('#1') || textColor.startsWith('#0') || textColor.startsWith('#2') || textColor === '#451a03');
  const label = scene.add.text(0, -1, text, {
    fontFamily: 'Nunito, sans-serif',
    fontSize,
    fontStyle: 'bold',
    color: textColor,
    align: 'center',
    shadow: {
      offsetX: 0,
      offsetY: 1.2,
      color: isDarkText ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0,0,0,0.45)',
      blur: 2,
      fill: true
    }
  }).setOrigin(0.5);
  faceContainer.add(label);

  const hitWidth = width;
  const hitHeight = height + lipHeight;
  container.setSize(hitWidth, hitHeight);
  const hitArea = { x: 0, y: 0, width: hitWidth, height: hitHeight };
  container.setInteractive(hitArea, (area, x, y) =>
    x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
  );
  if (container.input) container.input.cursor = 'pointer';

  let isPressed = false;

  container.on('pointerover', () => {
    if (!isPressed) {
      drawFace(bgColor, true);
      scene.tweens.add({
        targets: container,
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 100,
        ease: 'Sine.easeOut'
      });
    }
  });

  container.on('pointerout', () => {
    isPressed = false;
    drawFace(bgColor, false);
    faceContainer.y = 0;
    scene.tweens.add({
      targets: container,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 100,
      ease: 'Sine.easeOut'
    });
  });

  let lastClickTime = 0;
  const executeClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 250) return;
    lastClickTime = now;

    try {
      audioManager.playClick();
    } catch (e) {
      console.warn('Audio click error:', e);
    }

    isPressed = true;
    // Physical depression into the 3D lip!
    faceContainer.y = lipHeight - 1;

    scene.tweens.add({
      targets: container,
      scaleX: 0.96,
      scaleY: 0.94,
      duration: 70,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        isPressed = false;
        faceContainer.y = 0;
      }
    });

    try {
      onClick();
    } catch (err) {
      console.error('Error in button onClick:', err);
    }
  };

  container.on('pointerdown', executeClick);

  return {
    container,
    setText: (newText) => label.setText(newText),
    destroy: () => container.destroy()
  };
}
