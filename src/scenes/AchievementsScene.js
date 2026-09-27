import Phaser from 'phaser';
import localizationManager from '../managers/LocalizationManager.js';
import badgeManager from '../managers/BadgeManager.js';
import { createButton } from '../ui/buttons.js';
import { THEME } from '../config/constants.js';
import { createWarungBackdrop } from '../ui/warungStyle.js';

export class AchievementsScene extends Phaser.Scene {
  constructor() {
    super('AchievementsScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    const isPortrait = height > width;
    const badges = badgeManager.getAllBadges();
    const unlockedCount = badges.filter((badge) => badge.isUnlocked).length;

    this.createBackground(width, height);

    createButton(this, isPortrait ? 76 : 92, 48, localizationManager.t('achievements.back'), {
      width: isPortrait ? 120 : 145,
      height: 44,
      fontSize: '14px',
      bgColor: 0x334155,
      bgDarkColor: 0x1e293b,
      onClick: () => this.scene.start('MainMenuScene')
    });

    this.add.text(width / 2, isPortrait ? 58 : 52, localizationManager.t('achievements.title'), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPortrait ? '30px' : '34px',
      color: '#fff7d6',
      fontStyle: 'bold',
      stroke: '#713f12',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(width / 2, isPortrait ? 103 : 92,
      localizationManager.t('achievements.progress', { unlocked: unlockedCount, total: badges.length }), {
        fontFamily: 'Nunito, sans-serif',
        fontSize: isPortrait ? '16px' : '17px',
        color: '#fef3c7',
        fontStyle: 'bold'
      }).setOrigin(0.5);

    this.renderBadgeGrid(badges, isPortrait, width, height);
  }

  createBackground(width, height) {
    const bg = createWarungBackdrop(this, { dim: 0.12, counter: true }).wash;

    for (let i = 0; i < 22; i++) {
      const x = (i * 173) % width;
      const y = 115 + ((i * 109) % Math.max(180, height - 130));
      const radius = 3 + (i % 4);
      bg.fillStyle(i % 2 === 0 ? THEME.primary : 0x6ee7b7, 0.16);
      bg.fillCircle(x, y, radius);
    }
  }

  renderBadgeGrid(badges, isPortrait, width, height) {
    const cols = isPortrait ? 3 : 4;
    const rows = Math.ceil(badges.length / cols);
    const sidePadding = isPortrait ? 24 : 82;
    const top = isPortrait ? 155 : 125;
    const bottomPadding = isPortrait ? 34 : 30;
    const gapX = isPortrait ? 12 : 20;
    const gapY = isPortrait ? 13 : 16;
    const cardWidth = (width - sidePadding * 2 - gapX * (cols - 1)) / cols;
    const cardHeight = (height - top - bottomPadding - gapY * (rows - 1)) / rows;

    badges.forEach((badge, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = sidePadding + cardWidth / 2 + col * (cardWidth + gapX);
      const y = top + cardHeight / 2 + row * (cardHeight + gapY);
      this.createBadgeCard(x, y, cardWidth, cardHeight, badge, isPortrait);
    });
  }

  createBadgeCard(x, y, width, height, badge, isPortrait) {
    const card = this.add.container(x, y);
    const bg = this.add.graphics();

    bg.fillStyle(0x000000, 0.2);
    bg.fillRoundedRect(-width / 2 + 3, -height / 2 + 5, width, height, 16);
    bg.fillStyle(badge.isUnlocked ? 0xfffbeb : 0x172033, badge.isUnlocked ? 0.98 : 0.92);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
    bg.lineStyle(2.5, badge.isUnlocked ? 0xfbbf24 : 0x475569, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);
    card.add(bg);

    const iconY = -height * 0.25;
    const icon = this.add.text(0, iconY, badge.isUnlocked ? badge.icon : '🔒', {
      fontSize: isPortrait ? '32px' : '40px'
    }).setOrigin(0.5);
    card.add(icon);

    const title = this.add.text(0, iconY + (isPortrait ? 39 : 44), localizationManager.t(badge.titleKey), {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: isPortrait ? '13px' : '17px',
      color: badge.isUnlocked ? '#713f12' : '#cbd5e1',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 18 }
    }).setOrigin(0.5);
    card.add(title);

    const description = this.add.text(0, height * 0.2, localizationManager.t(badge.descKey), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: isPortrait ? '10px' : '13px',
      color: badge.isUnlocked ? '#7c2d12' : '#e2e8f0',
      align: 'center',
      lineSpacing: 1,
      wordWrap: { width: width - 20 }
    }).setOrigin(0.5);
    card.add(description);

    if (badge.isUnlocked) {
      card.setScale(0.96);
      this.tweens.add({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        duration: 420,
        delay: 45 * Math.min(8, badge.chapter || 0),
        ease: 'Back.easeOut'
      });
    } else {
      card.setAlpha(0.96);
    }
  }
}

export default AchievementsScene;
