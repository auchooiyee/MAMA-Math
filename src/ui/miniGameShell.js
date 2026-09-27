import { THEME } from '../config/constants.js';
import localizationManager from '../managers/LocalizationManager.js';

/** Containers draw around (0, 0), so give their input hit-area matching centred art. */
export function setMiniGameInteractive(container, width, height) {
  container.setSize(width, height);
  // Phaser normalizes the pointer by adding the Container's display origin
  // before calling the hit-area predicate, so the bounds are 0..size here.
  const hitArea = { x: 0, y: 0, width, height };
  container.setInteractive(hitArea, (area, x, y) =>
    x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
  );
  if (container.input) container.input.cursor = 'pointer';
  return container;
}

/** Shared frame for every cooking mini-game. Content is added after the shell. */
export function createMiniGameShell(scene, container, title, instruction = '') {
  const isPortrait = scene.cameras.main.height > scene.cameras.main.width;
  // Keep the shared 776px shell inside narrow/mobile canvases.
  if (isPortrait) {
    const safeScale = Math.min(0.78, (scene.cameras.main.width - 24) / 776);
    container.setScale(Math.max(0.58, safeScale));
  }
  const frame = scene.add.graphics();
  frame.fillStyle(0x082f3a, 0.28).fillRoundedRect(-394, -224, 788, 456, 28);
  frame.fillStyle(THEME.panelLight, 0.98).fillRoundedRect(-388, -232, 776, 448, 24);
  frame.lineStyle(4, THEME.outlineDark, 1).strokeRoundedRect(-388, -232, 776, 448, 24);
  frame.lineStyle(2, THEME.accentGold, 0.8).strokeRoundedRect(-378, -222, 756, 428, 18);
  container.addAt(frame, 0);

  const ribbon = scene.add.graphics();
  ribbon.fillStyle(THEME.surfaceTealDark, 0.3).fillRoundedRect(-270, -286, 540, 54, 18);
  ribbon.fillStyle(THEME.panelLight, 1).fillRoundedRect(-276, -292, 540, 54, 18);
  ribbon.lineStyle(3, THEME.outlineDark, 1).strokeRoundedRect(-276, -292, 540, 54, 18);
  container.add(ribbon);

  const titleText = scene.add.text(0, -225, title, {
    fontFamily: 'Nunito, sans-serif', fontSize: '22px', fontStyle: 'bold', color: THEME.textDark,
    align: 'center', wordWrap: { width: 500 }
  }).setOrigin(0.5).setY(-265);
  if (titleText.width > 500) titleText.setScale(500 / titleText.width, 1);
  container.add(titleText);

  if (instruction) {
    const hint = scene.add.text(0, 218, instruction, {
      fontFamily: 'Nunito, sans-serif', fontSize: '15px', fontStyle: 'bold', color: THEME.textMuted,
      align: 'center', wordWrap: { width: 540 }, backgroundColor: '#fff8e7', padding: { x: 14, y: 6 }
    }).setOrigin(0.5);
    if (hint.width > 540) hint.setScale(540 / hint.width, 1);
    container.add(hint);
  }
  const isMs = localizationManager.getLanguage() === 'ms';
  const makeTopControl = (x, label, onClick) => {
    const control = scene.add.container(x, -263);
    const bg = scene.add.graphics();
    bg.fillStyle(THEME.surfaceTealDark, 1).fillRoundedRect(-20, -18, 40, 36, 10);
    bg.fillStyle(THEME.secondary, 1).fillRoundedRect(-18, -17, 36, 29, 9);
    bg.lineStyle(2, THEME.outlineDark, 1).strokeRoundedRect(-20, -18, 40, 36, 10);
    const text = scene.add.text(0, -2, label, {
      fontFamily: 'Nunito, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);
    control.add([bg, text]);
    setMiniGameInteractive(control, 40, 36);
    control.on('pointerdown', onClick);
    container.add(control);
    return control;
  };

  const overlay = scene.add.container(0, 0).setVisible(false);
  const overlayBg = scene.add.graphics();
  overlayBg.fillStyle(0x102e35, 0.78).fillRoundedRect(-384, -218, 768, 432, 24);
  overlayBg.lineStyle(3, THEME.accentGold, 1).strokeRoundedRect(-384, -218, 768, 432, 24);
  overlay.add(overlayBg);
  const overlayHit = scene.add.zone(0, 0, 768, 432).setInteractive();
  overlay.add(overlayHit);
  const modalTitle = scene.add.text(0, -150, isMs ? 'REHAT SEKEJAP' : 'TAKE A QUICK BREAK', {
    fontFamily: 'Nunito, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#fff8e7', align: 'center'
  }).setOrigin(0.5);
  const helpText = scene.add.text(0, -50, instruction || (isMs ? 'Ikut arahan dan tekan butang utama untuk bermain.' : 'Follow the instruction and use the main action button to play.'), {
    fontFamily: 'Nunito, sans-serif', fontSize: '19px', fontStyle: 'bold', color: '#fff8e7',
    align: 'center', wordWrap: { width: 600 }, lineSpacing: 8
  }).setOrigin(0.5);
  overlay.add([modalTitle, helpText]);

  const makeModalButton = (x, y, label, color, onClick) => {
    const button = scene.add.container(x, y);
    const buttonBg = scene.add.graphics();
    buttonBg.fillStyle(THEME.surfaceTealDark, 1).fillRoundedRect(-105, -22, 210, 48, 12);
    buttonBg.fillStyle(color, 1).fillRoundedRect(-105, -26, 210, 46, 12);
    buttonBg.lineStyle(2.5, THEME.outlineDark, 1).strokeRoundedRect(-105, -26, 210, 46, 12);
    const buttonText = scene.add.text(0, -4, label, {
      fontFamily: 'Nunito, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);
    button.add([buttonBg, buttonText]);
    setMiniGameInteractive(button, 210, 48).on('pointerdown', onClick);
    overlay.add(button);
    return button;
  };

  const resumeButton = makeModalButton(-120, 108, isMs ? 'SAMBUNG' : 'RESUME', THEME.secondary, () => {
    overlay.setVisible(false);
    scene.isMiniGamePaused = false;
  });
  const restartButton = makeModalButton(120, 108, isMs ? 'MULA SEMULA' : 'RESTART', THEME.accentRed, () => {
    scene.events.emit('minigame:restart');
  });
  container.add(overlay);

  const setOverlay = () => {
    overlay.setVisible(true);
    scene.isMiniGamePaused = true;
    container.bringToTop(overlay);
  };
  const helpControl = makeTopControl(-345, '?', setOverlay);
  const pauseControl = makeTopControl(345, 'Ⅱ', setOverlay);

  return { frame, ribbon, titleText, overlay, helpControl, pauseControl };
}
