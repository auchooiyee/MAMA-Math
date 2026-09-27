import Phaser from 'phaser';
import { THEME } from '../config/constants.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // Render loading bar
    const width = 400;
    const height = 24;
    const x = (1280 - width) / 2;
    const y = 360;

    const bgBar = this.add.graphics();
    bgBar.fillStyle(0x27272a, 1);
    bgBar.fillRoundedRect(x, y, width, height, 12);

    const progressBar = this.add.graphics();
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(THEME.primary, 1);
      progressBar.fillRoundedRect(x + 2, y + 2, (width - 4) * value, height - 4, 10);
    });

    const text = this.add.text(640, 320, 'Loading Math Mama: Warung Matematik...', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      color: '#fef3c7'
    }).setOrigin(0.5);

    // Preload official "My Math Mama" and customer artwork
    try {
      this.load.image('chef_math_mama_raw', '/assets/chef_math_mama.webp');
      this.load.image('customer_pak_ali_raw', '/assets/customer_pak_ali.webp');
      this.load.image('customer_uncle_muthu_raw', '/assets/customer_uncle_muthu.webp');
      this.load.image('customer_kak_siti_raw', '/assets/customer_kak_siti.webp');
      this.load.image('customer_ah_ming_raw', '/assets/customer_ah_ming.webp');
      this.load.image('customer_kak_ros_raw', '/assets/customer_kak_ros.webp');
      this.load.image('dish_nasi_lemak_raw', '/assets/dish_nasi_lemak.webp');
      this.load.image('dish_roti_canai_raw', '/assets/dish_roti_canai.webp');
      this.load.image('dish_mee_goreng_raw', '/assets/dish_mee_goreng.webp');
      this.load.image('dish_teh_tarik_raw', '/assets/dish_teh_tarik.webp');
      this.load.image('dish_satay_raw', '/assets/dish_satay.webp');
      this.load.image('warung_utensils_atlas_raw', '/assets/warung-utensils-atlas.png');
      this.load.image('bg_warung_morning', '/assets/bg_warung_morning.webp');
    } catch (e) {
      console.warn('Artwork preload warning:', e);
    }

    // Procedurally generate textures (as instant render & fallback)
    this.generateProceduralTextures();
  }

  create() {
    // Generate high-resolution transparent portrait textures from loaded artwork
    this.createArtBadges();
    this.createUtensilTextures();

    this.time.delayedCall(200, () => {
      this.scene.start('MainMenuScene');
    });
  }

  createUtensilTextures() {
    const key = 'warung_utensils_atlas_raw';
    if (!this.textures.exists(key)) return;
    const source = this.textures.get(key).getSourceImage();
    if (!source) return;

    // Bounds were measured from the generated 1280px transparent atlas. Each
    // crop becomes a standalone texture so games can scale and layer it.
    const props = [
      ['utensil_knife', 24, 470, 128, 300],
      ['utensil_measuring_cup', 140, 586, 151, 190],
        ['utensil_wok', 310, 510, 258, 264],
        // The generated atlas packed the cup handle very close to the kettle.
        // Crop just the cup silhouette so neither asset leaks into its neighbor.
        ['utensil_tea_cup', 542, 624, 126, 148],
      ['utensil_tea_pot', 668, 507, 222, 270],
      ['utensil_cash_register', 878, 528, 194, 236],
      ['utensil_money', 914, 678, 148, 94],
      ['utensil_satay_grill', 1040, 558, 216, 212]
    ];

    props.forEach(([textureKey, sx, sy, sw, sh]) => {
      if (this.textures.exists(textureKey)) this.textures.remove(textureKey);
      const texture = this.textures.createCanvas(textureKey, sw, sh);
      if (!texture) return;
        texture.context.clearRect(0, 0, sw, sh);
        texture.context.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
        // Some generated props touch in the source atlas. Trim only the
        // neighboring pixels so props never show fragments of one another.
        if (textureKey === 'utensil_tea_pot') {
          texture.context.clearRect(0, 138, 14, sh - 138);
        }
        if (textureKey === 'utensil_cash_register') {
          texture.context.clearRect(164, 0, sw - 164, 156);
        }
        if (textureKey === 'utensil_wok') {
          // Cup artwork touches the far-right edge of the wok crop only below
          // the wooden handle; remove that lower sliver, preserving the handle.
          texture.context.clearRect(235, 108, sw - 235, sh - 108);
        }
        texture.refresh();
    });
  }

  createArtBadges() {
    const badgeMappings = [
      { rawKey: 'chef_math_mama_raw', targetKeys: ['chef_math_mama', 'customer_avatar'] },
      { rawKey: 'customer_pak_ali_raw', targetKeys: ['customer_pak_ali'] },
      { rawKey: 'customer_uncle_muthu_raw', targetKeys: ['customer_uncle_muthu'] },
      { rawKey: 'customer_kak_siti_raw', targetKeys: ['customer_kak_siti'] },
      { rawKey: 'customer_ah_ming_raw', targetKeys: ['customer_ah_ming'] },
      { rawKey: 'customer_kak_ros_raw', targetKeys: ['customer_kak_ros'] },
      { rawKey: 'dish_nasi_lemak_raw', targetKeys: ['dish_nasi_lemak'] },
      { rawKey: 'dish_roti_canai_raw', targetKeys: ['dish_roti_canai'] },
      { rawKey: 'dish_mee_goreng_raw', targetKeys: ['dish_mee_goreng'] },
      { rawKey: 'dish_teh_tarik_raw', targetKeys: ['dish_teh_tarik'] },
      { rawKey: 'dish_satay_raw', targetKeys: ['dish_satay'] }
    ];

    badgeMappings.forEach(({ rawKey, targetKeys }) => {
      try {
        if (this.textures.exists(rawKey)) {
          const srcImg = this.textures.get(rawKey).getSourceImage();
          if (srcImg) {
            targetKeys.forEach(targetKey => {
              if (this.textures.exists(targetKey)) {
                this.textures.remove(targetKey);
              }
              const size = 512;
              const canvasTex = this.textures.createCanvas(targetKey, size, size);
              if (canvasTex) {
                const ctx = canvasTex.context;
                ctx.clearRect(0, 0, size, size);

                // Keep the generated cutout transparent and preserve its proportions.
                // This replaces the old circular badge treatment so portraits sit
                // naturally against the illustrated warung scene.
                const sourceWidth = srcImg.naturalWidth || srcImg.width || size;
                const sourceHeight = srcImg.naturalHeight || srcImg.height || size;
                const scale = Math.min((size - 16) / sourceWidth, (size - 16) / sourceHeight);
                const drawWidth = sourceWidth * scale;
                const drawHeight = sourceHeight * scale;
                const drawX = (size - drawWidth) / 2;
                const drawY = (size - drawHeight) / 2;
                ctx.drawImage(srcImg, drawX, drawY, drawWidth, drawHeight);

                canvasTex.refresh();
              }
            });
          }
        }
      } catch (err) {
        console.warn(`Badge generation warning for ${rawKey}:`, err);
      }
    });
  }

  generateProceduralTextures() {
    // 1. Coin Texture (Juicy 2.5D Embossed Gold Coin)
    const coinCanvas = this.textures.createCanvas('icon_coin', 64, 64);
    if (coinCanvas) {
      this.drawJuicyCoin(coinCanvas.context, 64, 64);
      coinCanvas.refresh();
    }

    // 2. Star Texture (Juicy 2.5D Faceted Golden Achievement Star)
    const starCanvas = this.textures.createCanvas('icon_star', 64, 64);
    if (starCanvas) {
      this.drawJuicyStar(starCanvas.context, 64, 64);
      starCanvas.refresh();
    }

    // 3. Chef Avatar: Authentic Cooking Mama
    const mamaCanvas = this.textures.createCanvas('customer_avatar', 200, 220);
    if (mamaCanvas) {
      this.drawCookingMama(mamaCanvas.context, 200, 220);
      mamaCanvas.refresh();
    }

    // 4. Dish: Authentic Malaysian Nasi Lemak on Banana Leaf (Daun Pisang)
    const dishCanvas = this.textures.createCanvas('dish_nasi_lemak', 360, 280);
    if (dishCanvas) {
      this.drawAuthenticNasiLemak(dishCanvas.context, 360, 280);
      dishCanvas.refresh();
    }

    // 5. Dish: Roti Canai with Dhal Curry
    const rotiCanvas = this.textures.createCanvas('dish_roti_canai', 360, 280);
    if (rotiCanvas) {
      this.drawRotiCanai(rotiCanvas.context, 360, 280);
      rotiCanvas.refresh();
    }

    // 6. Dish: Mee Goreng Mamak
    const meeCanvas = this.textures.createCanvas('dish_mee_goreng', 360, 280);
    if (meeCanvas) {
      this.drawMeeGoreng(meeCanvas.context, 360, 280);
      meeCanvas.refresh();
    }

    // 7. Dish: Teh Tarik Kaw
    const tehCanvas = this.textures.createCanvas('dish_teh_tarik', 360, 280);
    if (tehCanvas) {
      this.drawTehTarik(tehCanvas.context, 360, 280);
      tehCanvas.refresh();
    }

    // 8. Dish: Satay Ayam Kajang
    const satayCanvas = this.textures.createCanvas('dish_satay', 360, 280);
    if (satayCanvas) {
      this.drawSatay(satayCanvas.context, 360, 280);
      satayCanvas.refresh();
    }

    // 9. Customer: Pak Ali (Songkok & Baju Melayu)
    const pakAliCanvas = this.textures.createCanvas('customer_pak_ali', 200, 220);
    if (pakAliCanvas) {
      this.drawPakAli(pakAliCanvas.context, 200, 220);
      pakAliCanvas.refresh();
    }

    // 10. Customer: Uncle Muthu (Moustache & Mamak Towel)
    const muthuCanvas = this.textures.createCanvas('customer_uncle_muthu', 200, 220);
    if (muthuCanvas) {
      this.drawUncleMuthu(muthuCanvas.context, 200, 220);
      muthuCanvas.refresh();
    }

    // 11. Customer: Kak Siti (Pastel Tudung & Rosy Cheeks)
    const sitiCanvas = this.textures.createCanvas('customer_kak_siti', 200, 220);
    if (sitiCanvas) {
      this.drawKakSiti(sitiCanvas.context, 200, 220);
      sitiCanvas.refresh();
    }

    // 12. Customer: Ah Ming (Eyeglasses & Polo)
    const mingCanvas = this.textures.createCanvas('customer_ah_ming', 200, 220);
    if (mingCanvas) {
      this.drawAhMing(mingCanvas.context, 200, 220);
      mingCanvas.refresh();
    }

    // 13. Customer: Kak Ros (Floral Batik Kebaya)
    const rosCanvas = this.textures.createCanvas('customer_kak_ros', 200, 220);
    if (rosCanvas) {
      this.drawKakRos(rosCanvas.context, 200, 220);
      rosCanvas.refresh();
    }
  }

  drawCookingMama(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Shoulders & White Chef Uniform
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(35, 220);
    ctx.quadraticCurveTo(45, 175, 75, 165);
    ctx.lineTo(125, 165);
    ctx.quadraticCurveTo(155, 175, 165, 220);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Chef coat side shading
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(35, 220);
    ctx.quadraticCurveTo(45, 175, 75, 165);
    ctx.lineTo(82, 172);
    ctx.quadraticCurveTo(55, 185, 48, 220);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(165, 220);
    ctx.quadraticCurveTo(155, 175, 125, 165);
    ctx.lineTo(118, 172);
    ctx.quadraticCurveTo(145, 185, 152, 220);
    ctx.closePath();
    ctx.fill();

    // Chef collar V-neck
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(85, 165);
    ctx.lineTo(100, 185);
    ctx.lineTo(115, 165);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Yellow chef neckerchief ribbon
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(100, 184, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(100, 182, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ribbon ends
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(96, 188);
    ctx.quadraticCurveTo(88, 205, 82, 218);
    ctx.lineTo(95, 212);
    ctx.lineTo(100, 190);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(104, 188);
    ctx.quadraticCurveTo(112, 205, 118, 218);
    ctx.lineTo(105, 212);
    ctx.lineTo(100, 190);
    ctx.closePath();
    ctx.fill();

    // 2. Neck
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(90, 142, 20, 26);
    ctx.fillStyle = '#fdba74';
    ctx.beginPath();
    ctx.ellipse(100, 145, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Brown hair back volume
    ctx.fillStyle = '#5c2e14';
    ctx.beginPath();
    ctx.ellipse(100, 105, 58, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Ears
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(46, 112, 9, 13, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(154, 112, 9, 13, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Inner ears
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.ellipse(47, 112, 5, 7, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(153, 112, 5, 7, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // 4. Face (Soft rounded anime chin)
    ctx.fillStyle = '#fff1e6';
    ctx.beginPath();
    ctx.moveTo(52, 95);
    ctx.quadraticCurveTo(48, 128, 70, 145);
    ctx.quadraticCurveTo(100, 160, 130, 145);
    ctx.quadraticCurveTo(152, 128, 148, 95);
    ctx.quadraticCurveTo(145, 60, 100, 58);
    ctx.quadraticCurveTo(55, 60, 52, 95);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 5. Cooking Mama Chestnut Hair Bangs
    ctx.fillStyle = '#78350f';
    // Left side tuft
    ctx.beginPath();
    ctx.moveTo(50, 92);
    ctx.quadraticCurveTo(55, 125, 62, 135);
    ctx.quadraticCurveTo(66, 115, 65, 92);
    ctx.closePath();
    ctx.fill();
    // Right side tuft
    ctx.beginPath();
    ctx.moveTo(150, 92);
    ctx.quadraticCurveTo(145, 125, 138, 135);
    ctx.quadraticCurveTo(134, 115, 135, 92);
    ctx.closePath();
    ctx.fill();

    // Center bangs
    ctx.beginPath();
    ctx.moveTo(55, 78);
    ctx.quadraticCurveTo(75, 102, 85, 88);
    ctx.quadraticCurveTo(100, 105, 115, 88);
    ctx.quadraticCurveTo(125, 102, 145, 78);
    ctx.quadraticCurveTo(100, 68, 55, 78);
    ctx.closePath();
    ctx.fill();

    // Hair shine highlight
    ctx.strokeStyle = 'rgba(254, 215, 170, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(100, 82, 35, 1.2 * Math.PI, 1.8 * Math.PI, false);
    ctx.stroke();

    // 6. Iconic Cooking Mama Pink Bandana
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(42, 90);
    ctx.quadraticCurveTo(45, 45, 100, 38);
    ctx.quadraticCurveTo(155, 45, 158, 90);
    ctx.quadraticCurveTo(140, 68, 100, 66);
    ctx.quadraticCurveTo(60, 68, 42, 90);
    ctx.closePath();
    ctx.fill();

    // Bandana white trim
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(42, 90);
    ctx.quadraticCurveTo(60, 68, 100, 66);
    ctx.quadraticCurveTo(140, 68, 158, 90);
    ctx.stroke();

    // Bandana top bow / knot
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.ellipse(100, 36, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bow loops
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(87, 32, 11, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(113, 32, 11, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(87, 32, 11, 7, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(113, 32, 11, 7, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // White polka dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const dots = [
      [65, 56, 3], [85, 48, 3], [115, 48, 3], [135, 56, 3],
      [52, 72, 2.5], [75, 62, 3], [100, 54, 3], [125, 62, 3], [148, 72, 2.5]
    ];
    for (const [dx, dy, dr] of dots) {
      ctx.beginPath();
      ctx.arc(dx, dy, dr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Eyebrows
    ctx.strokeStyle = '#5c2e14';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(76, 100, 12, 1.2 * Math.PI, 1.85 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(124, 100, 12, 1.15 * Math.PI, 1.8 * Math.PI, false);
    ctx.stroke();

    // 8. Sparkling Eyes
    this.drawMamaEye(ctx, 77, 114, false);
    this.drawMamaEye(ctx, 123, 114, true);

    // 9. Rosy Blushing Cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.38)';
    ctx.beginPath();
    ctx.ellipse(66, 130, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(134, 130, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cheerful blush sparkle lines
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(62, 128); ctx.lineTo(70, 132);
    ctx.moveTo(66, 126); ctx.lineTo(74, 130);
    ctx.moveTo(126, 130); ctx.lineTo(134, 126);
    ctx.moveTo(130, 132); ctx.lineTo(138, 128);
    ctx.stroke();

    // 10. Button Nose
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(100, 124, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 11. Joyful Smile
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(85, 136);
    ctx.quadraticCurveTo(100, 156, 115, 136);
    ctx.quadraticCurveTo(100, 133, 85, 136);
    ctx.closePath();
    ctx.fill();

    // Upper teeth
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(88, 136);
    ctx.quadraticCurveTo(100, 140, 112, 136);
    ctx.quadraticCurveTo(100, 134, 88, 136);
    ctx.closePath();
    ctx.fill();

    // Pink tongue
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.moveTo(92, 148);
    ctx.quadraticCurveTo(100, 142, 108, 148);
    ctx.quadraticCurveTo(100, 155, 92, 148);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawMamaEye(ctx, x, y, isRight) {
    // Eyelid / outline
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(x, y, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris (amber gradient)
    const irisGrad = ctx.createLinearGradient(x, y - 10, x, y + 10);
    irisGrad.addColorStop(0, '#78350f');
    irisGrad.addColorStop(0.5, '#b45309');
    irisGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 8.5, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(x, y + 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Primary sparkling catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x - 3, y - 3, 3.8, 4.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Secondary catchlight
    ctx.beginPath();
    ctx.arc(x + 3.5, y + 4.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyeliner & feminine eyelash flicks
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y - 2, 10, 1.15 * Math.PI, 1.85 * Math.PI, false);
    ctx.stroke();

    ctx.lineWidth = 1.8;
    const flip = isRight ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(x + flip * 7, y - 8);
    ctx.lineTo(x + flip * 11, y - 11);
    ctx.stroke();
  }

  drawAuthenticNasiLemak(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Banana Leaf (Daun Pisang) - Realistic angled placemat with natural green gradient
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 8;

    const leafGrad = ctx.createLinearGradient(20, 20, 340, 260);
    leafGrad.addColorStop(0, '#166534');
    leafGrad.addColorStop(0.3, '#15803d');
    leafGrad.addColorStop(0.7, '#16a34a');
    leafGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = leafGrad;

    ctx.beginPath();
    ctx.moveTo(35, 45);
    ctx.quadraticCurveTo(180, 18, 325, 35);
    ctx.quadraticCurveTo(345, 140, 335, 245);
    ctx.quadraticCurveTo(180, 265, 25, 240);
    ctx.quadraticCurveTo(15, 140, 35, 45);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Center midrib & transverse leaf veins
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 140);
    ctx.quadraticCurveTo(180, 138, 330, 140);
    ctx.stroke();

    ctx.lineWidth = 1.2;
    for (let vx = 45; vx < 320; vx += 14) {
      ctx.strokeStyle = vx % 28 === 0 ? 'rgba(34, 197, 94, 0.25)' : 'rgba(20, 83, 45, 0.35)';
      ctx.beginPath();
      ctx.moveTo(vx, 32);
      ctx.lineTo(vx + 15, 250);
      ctx.stroke();
    }

    // 2. Fragrant Coconut Rice Mound (Nasi Santan Kukus)
    const riceX = 180;
    const riceY = 140;
    const riceR = 64;

    // Rice mound shadow
    ctx.fillStyle = 'rgba(20, 83, 45, 0.45)';
    ctx.beginPath();
    ctx.ellipse(riceX, riceY + 12, riceR + 6, riceR - 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3D rice mound gradient
    const riceGrad = ctx.createRadialGradient(riceX - 15, riceY - 18, 10, riceX, riceY, riceR);
    riceGrad.addColorStop(0, '#ffffff');
    riceGrad.addColorStop(0.65, '#f8fafc');
    riceGrad.addColorStop(0.9, '#f1f5f9');
    riceGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = riceGrad;
    ctx.beginPath();
    ctx.ellipse(riceX, riceY, riceR, riceR - 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Delicate individual rice grains on surface
    ctx.fillStyle = '#ffffff';
    for (let g = 0; g < 48; g++) {
      const angle = (g / 48) * Math.PI * 2 + (g % 3) * 0.2;
      const dist = 12 + (g % 5) * 9;
      const gx = riceX + Math.cos(angle) * dist;
      const gy = riceY + Math.sin(angle) * (dist * 0.85);
      ctx.beginPath();
      ctx.ellipse(gx, gy, 4.5, 2, angle + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Signature Tied Daun Pandan (Pandan Knot on top of rice!)
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.ellipse(riceX, riceY - 4, 18, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(riceX, riceY - 6, 15, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(riceX - 12, riceY - 2);
    ctx.lineTo(riceX - 22, riceY + 8);
    ctx.moveTo(riceX + 10, riceY - 2);
    ctx.lineTo(riceX + 20, riceY + 6);
    ctx.stroke();

    // 4. Rich Spicy Sambal Tumis (Glistening, deep crimson-red sambal)
    const sambalX = 105;
    const sambalY = 155;
    // Sambal oil sheen
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.ellipse(sambalX, sambalY + 4, 38, 28, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Thick sambal paste
    const sambalGrad = ctx.createRadialGradient(sambalX - 8, sambalY - 6, 6, sambalX, sambalY, 32);
    sambalGrad.addColorStop(0, '#ef4444');
    sambalGrad.addColorStop(0.4, '#b91c1c');
    sambalGrad.addColorStop(0.85, '#991b1b');
    sambalGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = sambalGrad;
    ctx.beginPath();
    ctx.ellipse(sambalX, sambalY, 32, 24, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Dark caramelized chili flecks & chili oil droplets
    ctx.fillStyle = '#450a0a';
    for (let s = 0; s < 14; s++) {
      const sx = sambalX - 20 + (s * 3.2) % 40;
      const sy = sambalY - 14 + (s * 4.5) % 28;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Glistening chili oil highlights
    ctx.fillStyle = 'rgba(254, 202, 202, 0.7)';
    ctx.beginPath();
    ctx.ellipse(sambalX - 10, sambalY - 8, 8, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Tender Sambal Squid Rings (Sambal Sotong)
    const squids = [
      { x: sambalX - 8, y: sambalY - 4, r: 8.5 },
      { x: sambalX + 11, y: sambalY + 3, r: 9.5 },
      { x: sambalX - 2, y: sambalY + 9, r: 7.5 }
    ];
    for (const sq of squids) {
      // Outer ring
      ctx.fillStyle = '#fff5f5';
      ctx.beginPath();
      ctx.arc(sq.x, sq.y, sq.r, 0, Math.PI * 2);
      ctx.fill();
      // Inner sambal center
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(sq.x, sq.y, sq.r - 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Saucy squid outline
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(sq.x, sq.y, sq.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 5. Half Hard-Boiled Egg (Telur Rebus Separuh)
    const eggX = 245;
    const eggY = 162;

    ctx.fillStyle = 'rgba(20, 83, 45, 0.35)';
    ctx.beginPath();
    ctx.ellipse(eggX, eggY + 6, 26, 32, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Porcelain white egg body
    const eggGrad = ctx.createRadialGradient(eggX - 6, eggY - 8, 5, eggX, eggY, 30);
    eggGrad.addColorStop(0, '#ffffff');
    eggGrad.addColorStop(0.75, '#f8fafc');
    eggGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = eggGrad;
    ctx.beginPath();
    ctx.ellipse(eggX, eggY, 24, 30, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Creamy Golden-Orange Yolk
    const yolkGrad = ctx.createRadialGradient(eggX - 3, eggY - 3, 3, eggX, eggY, 15);
    yolkGrad.addColorStop(0, '#fef08a');
    yolkGrad.addColorStop(0.4, '#fbbf24');
    yolkGrad.addColorStop(0.85, '#f59e0b');
    yolkGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = yolkGrad;
    ctx.beginPath();
    ctx.ellipse(eggX, eggY, 15, 17, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.ellipse(eggX - 4, eggY - 5, 4, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 6. Crisp Sliced Cucumbers (Hirisan Timun Segar)
    this.drawCucumberSlice(ctx, 155, 78, 22);
    this.drawCucumberSlice(ctx, 195, 74, 20);

    // 7. Crispy Ikan Bilis (Fried Anchovies) & Peanuts (Kacang Tanah)
    const anchovyX = 228;
    const anchovyY = 95;
    for (let b = 0; b < 12; b++) {
      const bx = anchovyX - 16 + (b * 6) % 36;
      const by = anchovyY - 12 + (b * 7) % 28;
      const bAngle = 0.3 + (b % 4) * 0.4;
      ctx.fillStyle = b % 2 === 0 ? '#92400e' : '#78350f';
      ctx.beginPath();
      ctx.ellipse(bx, by, 7, 2.2, bAngle, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx - 3, by);
      ctx.lineTo(bx + 3, by);
      ctx.stroke();
    }

    // Roasted Peanuts
    const peanutX = 112;
    const peanutY = 100;
    for (let p = 0; p < 9; p++) {
      const px = peanutX - 14 + (p * 7) % 32;
      const py = peanutY - 10 + (p * 6) % 24;
      const pAngle = (p % 3) * 0.5;
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.ellipse(px, py, 5.5, 3.8, pAngle, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.ellipse(px + 0.5, py, 3.5, 2, pAngle, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawCucumberSlice(ctx, x, y, r) {
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(x, y, r - 2.5, 0, Math.PI * 2);
    ctx.fill();

    const fleshGrad = ctx.createRadialGradient(x, y, 2, x, y, r - 4);
    fleshGrad.addColorStop(0, '#f0fdf4');
    fleshGrad.addColorStop(0.6, '#dcfce7');
    fleshGrad.addColorStop(1, '#bbf7d0');
    ctx.fillStyle = fleshGrad;
    ctx.beginPath();
    ctx.arc(x, y, r - 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#86efac';
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1;
    for (let s = 0; s < 6; s++) {
      const sa = (s / 6) * Math.PI * 2;
      const sx = x + Math.cos(sa) * (r * 0.38);
      const sy = y + Math.sin(sa) * (r * 0.38);
      ctx.beginPath();
      ctx.ellipse(sx, sy, 3.2, 1.6, sa, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius, isStroke = false) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      graphics.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      graphics.lineTo(x, y);
      rot += step;
    }
    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    if (isStroke) {
      graphics.strokePath();
    } else {
      graphics.fillPath();
    }
  }

  drawJuicyCoin(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const r = 25;

    // 1. Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, r, r * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. 3D Bottom Lip (Extrusion)
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, r, r, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Outer Golden Rim with radial gradient
    const outerGrad = ctx.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, r);
    outerGrad.addColorStop(0, '#fef08a');
    outerGrad.addColorStop(0.3, '#fbbf24');
    outerGrad.addColorStop(0.8, '#f59e0b');
    outerGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Inner Recessed Circle
    const innerGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, r - 5);
    innerGrad.addColorStop(0, '#fde047');
    innerGrad.addColorStop(0.7, '#f59e0b');
    innerGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r - 5, r - 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Kawaii Smiling Coin Face
    // Crescent happy eyes
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 3, 4.5, Math.PI * 1.1, Math.PI * 1.9, false);
    ctx.arc(cx + 8, cy - 3, 4.5, Math.PI * 1.1, Math.PI * 1.9, false);
    ctx.stroke();

    // Rosy blushing cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy + 4, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 10, cy + 4, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute open mouth
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(cx, cy + 3, 4, 0.2, Math.PI - 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 2.2, 0, Math.PI);
    ctx.fill();

    // 6. Specular Curved Gloss Sheen on top quadrant
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(cx - 7, cy - 10, 11, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // 7. Sparkle Star Glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + 14, cy - 13, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawJuicyStar(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    this.drawCanvasStarPath(ctx, cx, cy + 4, 5, 26, 12);
    ctx.fill();

    // 3D Bottom Lip
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    this.drawCanvasStarPath(ctx, cx, cy + 3, 5, 25, 11.5);
    ctx.fill();

    // Star Base Gradient
    const grad = ctx.createRadialGradient(cx - 6, cy - 8, 4, cx, cy, 25);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.25, '#fef08a');
    grad.addColorStop(0.65, '#facc15');
    grad.addColorStop(1, '#eab308');
    ctx.fillStyle = grad;
    ctx.beginPath();
    this.drawCanvasStarPath(ctx, cx, cy, 5, 25, 11.5);
    ctx.fill();

    // Golden Outline
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Kawaii Anime Star Face
    // Big round eyes with catchlights
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 1, 3.2, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy - 1, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 7, cy - 2, 1.2, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy - 2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Rosy pink cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx - 9, cy + 3, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 9, cy + 3, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Happy mouth
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Specular Glint on top point
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(cx, cy - 16, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawCanvasStarPath(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  drawRotiCanai(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Plate shadow & plate
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(180, 150, 160, 95, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(180, 140, 155, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Roti Canai (layered round flatbread on left)
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(135, 140, 85, 65, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Flaky layered folds
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(135, 140, 60, 0.4, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(140, 142, 38, 1.2, Math.PI * 1.8);
    ctx.stroke();

    // Crispy golden toasted spots
    const spots = [
      { x: 100, y: 130, r: 10 }, { x: 145, y: 115, r: 12 }, { x: 165, y: 145, r: 14 },
      { x: 120, y: 160, r: 9 }, { x: 90, y: 155, r: 7 }, { x: 140, y: 140, r: 11 }
    ];
    spots.forEach(sp => {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(sp.x, sp.y, sp.r, sp.r * 0.7, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(sp.x, sp.y, sp.r * 0.5, sp.r * 0.35, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Dhal Curry Bowl on right
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(250, 145, 48, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(250, 140, 46, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Yellow Dhal Lentil Gravy
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(250, 140, 40, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chili oil swirl & fried shallot garnish
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(250, 138, 16, 0.2, Math.PI * 1.4);
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.fillRect(245, 135, 10, 4);
    ctx.fillRect(253, 142, 8, 4);

    ctx.restore();
  }

  drawMeeGoreng(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Plate
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(180, 150, 160, 95, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(180, 140, 155, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Mound of stir-fried dark yellow noodles
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(175, 140, 115, 68, 0, 0, Math.PI * 2);
    ctx.fill();

    // Noodle strands
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    for (let i = 80; i <= 260; i += 22) {
      ctx.beginPath();
      ctx.moveTo(i, 115);
      ctx.quadraticCurveTo(i + 15, 140, i - 10, 165);
      ctx.stroke();
    }

    // Fried Tofu Cubes
    ctx.fillStyle = '#92400e';
    ctx.fillRect(110, 130, 22, 18);
    ctx.fillRect(205, 125, 20, 18);
    ctx.fillRect(150, 160, 20, 16);

    // Sliced Red Chili & Green Scallions
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(140, 125, 8, 4, 0.4, 0, Math.PI * 2);
    ctx.ellipse(190, 155, 8, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(130, 145, 12, 5);
    ctx.fillRect(175, 130, 14, 5);
    ctx.fillRect(215, 145, 12, 5);

    // Calamansi Lime Wedge on plate rim
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(80, 150, 22, -0.5, Math.PI * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(80, 150, 16, -0.4, Math.PI * 0.65);
    ctx.closePath();
    ctx.fill();

    // Fried Egg on top
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(170, 135, 30, 22, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(170, 135, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawTehTarik(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Glass Mug & Saucer
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(180, 230, 85, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ceramic Saucer
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(180, 220, 80, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Glass Mug Body
    ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
    ctx.beginPath();
    ctx.moveTo(130, 75);
    ctx.lineTo(140, 210);
    ctx.quadraticCurveTo(180, 218, 220, 210);
    ctx.lineTo(230, 75);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Glass Handle
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(242, 140, 26, -Math.PI * 0.4, Math.PI * 0.5);
    ctx.stroke();

    // Tea Liquid (Pulled milky caramel gradient)
    const teaGrad = ctx.createLinearGradient(140, 80, 140, 210);
    teaGrad.addColorStop(0, '#ea580c');
    teaGrad.addColorStop(0.5, '#c2410c');
    teaGrad.addColorStop(1, '#9a3412');
    ctx.fillStyle = teaGrad;
    ctx.beginPath();
    ctx.moveTo(133, 85);
    ctx.lineTo(142, 208);
    ctx.quadraticCurveTo(180, 215, 218, 208);
    ctx.lineTo(227, 85);
    ctx.closePath();
    ctx.fill();

    // Thick Creamy Froth Cap (Buih Meleleh)
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(180, 75, 52, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bubbly froth mound spilling slightly over the glass edge
    const bubbles = [
      { x: 150, y: 70, r: 12 }, { x: 175, y: 62, r: 16 }, { x: 200, y: 68, r: 14 },
      { x: 165, y: 76, r: 11 }, { x: 190, y: 75, r: 10 }, { x: 135, y: 82, r: 8 }
    ];
    bubbles.forEach(b => {
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.restore();
  }

  drawSatay(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Banana leaf base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(180, 150, 160, 95, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(180, 140, 155, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Leaf ribs
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    for (let lx = 50; lx <= 310; lx += 28) {
      ctx.beginPath();
      ctx.moveTo(lx, 70);
      ctx.lineTo(lx - 15, 210);
      ctx.stroke();
    }

    // 4 Skewers of Grilled Satay
    const skewersY = [85, 115, 145, 175];
    skewersY.forEach((sy, idx) => {
      // Bamboo skewer
      ctx.strokeStyle = '#d4a373';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(50, sy + 5);
      ctx.lineTo(230, sy - 8);
      ctx.stroke();

      // Meat chunks
      for (let mx = 70; mx <= 180; mx += 28) {
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(mx, sy - ((mx - 70) * 0.08), 14, 10, -0.08, 0, Math.PI * 2);
        ctx.fill();

        // Charred grill marks
        ctx.fillStyle = '#451a03';
        ctx.fillRect(mx - 8, sy - 4, 16, 3);
        ctx.fillRect(mx - 6, sy + 2, 12, 2.5);
      }
    });

    // Kuah Kacang (Peanut Sauce Bowl on right)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(265, 135, 42, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.ellipse(265, 135, 36, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Peanut bits on sauce
    ctx.fillStyle = '#fef08a';
    for (let px = 245; px <= 285; px += 10) {
      ctx.fillRect(px, 130 + (px % 8), 4, 3);
    }

    // Ketupat Cubes (White rice cubes) & Cucumber chunks
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(235, 180, 18, 18);
    ctx.fillRect(258, 175, 18, 18);
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(235, 180, 18, 18);
    ctx.strokeRect(258, 175, 18, 18);

    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.ellipse(285, 185, 12, 10, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#15803d';
    ctx.stroke();

    ctx.restore();
  }

  drawPakAli(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Shoulders & Emerald Green Baju Melayu with clean cartoon outline
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.moveTo(30, 220);
    ctx.quadraticCurveTo(45, 172, 72, 162);
    ctx.lineTo(128, 162);
    ctx.quadraticCurveTo(155, 172, 170, 220);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // High collar (Cekak Musang) with sparkling gold button
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.roundRect(84, 156, 32, 18, 5);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Gold button
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(100, 165, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(99, 164, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 2. Chibi Rounded Head & Neck
    ctx.fillStyle = '#fcd34d'; // Warm Malay skin tone
    ctx.fillRect(90, 140, 20, 22);

    // Head oval (chubby kawaii cheeks)
    ctx.beginPath();
    ctx.moveTo(54, 98);
    ctx.quadraticCurveTo(50, 134, 76, 150);
    ctx.quadraticCurveTo(100, 162, 124, 150);
    ctx.quadraticCurveTo(150, 134, 146, 98);
    ctx.quadraticCurveTo(144, 66, 100, 64);
    ctx.quadraticCurveTo(56, 66, 54, 98);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Cute chibi ears
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.ellipse(50, 114, 8, 11, -0.15, 0, Math.PI * 2);
    ctx.ellipse(150, 114, 8, 11, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Kind Grandfatherly Arched Eyebrows
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(78, 92, 11, 1.15 * Math.PI, 1.85 * Math.PI, false);
    ctx.arc(122, 92, 11, 1.15 * Math.PI, 1.85 * Math.PI, false);
    ctx.stroke();

    // 4. Sparkling Anime Happy Eyes (warm smiling crescents with catchlights)
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(78, 106, 9, 1.15 * Math.PI, 1.85 * Math.PI, false);
    ctx.arc(122, 106, 9, 1.15 * Math.PI, 1.85 * Math.PI, false);
    ctx.stroke();
    // Warm twinkle star under right eye
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(133, 102, 2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Rosy Blushing Cheeks
    ctx.fillStyle = 'rgba(251, 113, 133, 0.42)';
    ctx.beginPath();
    ctx.ellipse(66, 118, 11, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(134, 118, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cheerful blush tick lines
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(63, 116); ctx.lineTo(69, 120);
    ctx.moveTo(131, 120); ctx.lineTo(137, 116);
    ctx.stroke();

    // 6. Cute Chibi Beard & Joyful Smile
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(88, 126);
    ctx.quadraticCurveTo(100, 142, 112, 126);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(100, 133, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy cloud-shaped white beard
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(82, 132);
    ctx.quadraticCurveTo(75, 148, 88, 154);
    ctx.quadraticCurveTo(100, 160, 112, 154);
    ctx.quadraticCurveTo(125, 148, 118, 132);
    ctx.quadraticCurveTo(100, 136, 82, 132);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 7. Velvet Black Songkok with Gold Trim
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(56, 75);
    ctx.quadraticCurveTo(100, 44, 144, 75);
    ctx.lineTo(142, 48);
    ctx.quadraticCurveTo(100, 20, 58, 48);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Golden Songkok Trim Ribbon
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(57, 73);
    ctx.quadraticCurveTo(100, 44, 143, 73);
    ctx.lineTo(143, 67);
    ctx.quadraticCurveTo(100, 38, 57, 67);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  drawUncleMuthu(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Shoulders & White Uniform Shirt with cocoa cartoon outline
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(30, 220);
    ctx.quadraticCurveTo(45, 172, 75, 162);
    ctx.lineTo(125, 162);
    ctx.quadraticCurveTo(155, 172, 170, 220);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Red checkered Mamak towel draped over left shoulder
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(38, 220);
    ctx.lineTo(58, 164);
    ctx.lineTo(82, 166);
    ctx.lineTo(68, 220);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Towel white check stripes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let ty = 172; ty <= 215; ty += 9) {
      ctx.beginPath();
      ctx.moveTo(44, ty);
      ctx.lineTo(76, ty);
      ctx.stroke();
    }

    // 2. Chibi Rounded Head & Neck
    ctx.fillStyle = '#d97706'; // Warm honey-caramel skin tone
    ctx.fillRect(88, 140, 24, 24);

    // Chubby face oval
    ctx.beginPath();
    ctx.moveTo(52, 98);
    ctx.quadraticCurveTo(48, 134, 74, 150);
    ctx.quadraticCurveTo(100, 162, 126, 150);
    ctx.quadraticCurveTo(152, 134, 148, 98);
    ctx.quadraticCurveTo(145, 66, 100, 64);
    ctx.quadraticCurveTo(55, 66, 52, 98);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Chibi ears
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(48, 114, 8, 11, -0.15, 0, Math.PI * 2);
    ctx.ellipse(152, 114, 8, 11, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Wavy Black Hair
    ctx.fillStyle = '#262626';
    ctx.beginPath();
    ctx.ellipse(100, 68, 48, 26, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Hair shine arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(100, 70, 36, 1.2 * Math.PI, 1.8 * Math.PI, false);
    ctx.stroke();

    // 4. Big Expressive Anime Eyes with Catchlights
    // Left eye
    ctx.fillStyle = '#331f12';
    ctx.beginPath();
    ctx.ellipse(78, 104, 7, 9, 0, 0, Math.PI * 2);
    ctx.ellipse(122, 104, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sparkle catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(76, 101, 2.8, 0, Math.PI * 2);
    ctx.arc(120, 101, 2.8, 0, Math.PI * 2);
    ctx.arc(80, 107, 1.5, 0, Math.PI * 2);
    ctx.arc(124, 107, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Rosy Cheeks
    ctx.fillStyle = 'rgba(251, 113, 133, 0.42)';
    ctx.beginPath();
    ctx.ellipse(65, 118, 10, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(135, 118, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Joyful Genial Smile with teeth
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(100, 126, 13, 0.1, Math.PI - 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Upper teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(92, 126, 16, 5);
    // Tongue
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(100, 136, 6, Math.PI, 0);
    ctx.fill();

    // 7. Iconic Cute Mamak Moustache!
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(100, 120);
    ctx.quadraticCurveTo(80, 114, 68, 127);
    ctx.quadraticCurveTo(82, 132, 100, 124);
    ctx.quadraticCurveTo(118, 132, 132, 127);
    ctx.quadraticCurveTo(120, 114, 100, 120);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  drawKakSiti(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Shoulders & Pastel Rose Tudung Drape with clean cartoon outline
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(25, 220);
    ctx.quadraticCurveTo(45, 160, 75, 145);
    ctx.lineTo(125, 145);
    ctx.quadraticCurveTo(155, 160, 175, 220);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Tudung fold curves on chest
    ctx.strokeStyle = '#db2777';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(85, 148);
    ctx.quadraticCurveTo(100, 185, 120, 220);
    ctx.stroke();

    // Shiny gold flower brooch with pearl center
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(75, 175, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // Pearl center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(75, 175, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Chibi Face Oval Framed by Tudung
    ctx.fillStyle = '#fff1e6'; // Soft porcelain skin tone
    ctx.beginPath();
    ctx.ellipse(100, 108, 35, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Rosy Blushing Cheeks with cute sparkle
    ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.beginPath();
    ctx.ellipse(76, 118, 10, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(124, 118, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Blush tick marks
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(73, 116); ctx.lineTo(79, 120);
    ctx.moveTo(121, 120); ctx.lineTo(127, 116);
    ctx.stroke();

    // 3. Cute Doe Eyes with Feminine Lashes & Dual Highlights
    ctx.fillStyle = '#331f12';
    ctx.beginPath();
    ctx.ellipse(82, 102, 6, 8.5, 0, 0, Math.PI * 2);
    ctx.ellipse(118, 102, 6, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Big sparkling highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(80, 99, 2.8, 0, Math.PI * 2);
    ctx.arc(116, 99, 2.8, 0, Math.PI * 2);
    ctx.arc(84, 105, 1.5, 0, Math.PI * 2);
    ctx.arc(120, 105, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Feminine Eyelash flicks
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(86, 96); ctx.lineTo(91, 92);
    ctx.moveTo(114, 96); ctx.lineTo(109, 92);
    ctx.stroke();

    // Sweet smiling lips
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(100, 124, 8, 0.2, Math.PI - 0.2);
    ctx.closePath();
    ctx.fill();

    // 4. Tudung Head Framing & Top Crown
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(100, 68, 48, 32, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Tudung inner edge contour
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(100, 68, 42, Math.PI * 0.95, Math.PI * 0.05, true);
    ctx.stroke();

    ctx.restore();
  }

  drawAhMing(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Shoulders & Teal Polo Shirt with clean cartoon outline
    ctx.fillStyle = '#0d9488';
    ctx.beginPath();
    ctx.moveTo(30, 220);
    ctx.quadraticCurveTo(45, 172, 75, 162);
    ctx.lineTo(125, 162);
    ctx.quadraticCurveTo(155, 172, 170, 220);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Polo Collar
    ctx.fillStyle = '#14b8a6';
    ctx.beginPath();
    ctx.moveTo(80, 162);
    ctx.lineTo(100, 185);
    ctx.lineTo(120, 162);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Chibi Rounded Head & Neck
    ctx.fillStyle = '#fffbeb'; // Light skin tone
    ctx.fillRect(88, 140, 24, 24);

    // Chubby face oval
    ctx.beginPath();
    ctx.moveTo(52, 98);
    ctx.quadraticCurveTo(48, 134, 74, 150);
    ctx.quadraticCurveTo(100, 162, 126, 150);
    ctx.quadraticCurveTo(152, 134, 148, 98);
    ctx.quadraticCurveTo(145, 66, 100, 64);
    ctx.quadraticCurveTo(55, 66, 52, 98);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Ears
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.ellipse(48, 112, 8, 11, -0.15, 0, Math.PI * 2);
    ctx.ellipse(152, 112, 8, 11, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Dark Messy Anime Bangs
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(100, 68, 45, 26, 0, Math.PI, 0);
    ctx.fill();
    // Cute fringe tufts
    ctx.beginPath();
    ctx.moveTo(62, 78);
    ctx.quadraticCurveTo(78, 96, 92, 82);
    ctx.quadraticCurveTo(110, 98, 132, 78);
    ctx.lineTo(135, 68);
    ctx.lineTo(62, 68);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hair shine highlight arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(100, 70, 34, 1.25 * Math.PI, 1.75 * Math.PI, false);
    ctx.stroke();

    // 4. Stylish Round Geek-Chic Glasses!
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(80, 104, 13, 0, Math.PI * 2);
    ctx.arc(120, 104, 13, 0, Math.PI * 2);
    ctx.stroke();
    // Glasses bridge
    ctx.beginPath();
    ctx.moveTo(93, 104);
    ctx.lineTo(107, 104);
    ctx.stroke();

    // Glare reflection arcs on glasses lenses
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(80, 104, 9, 1.1 * Math.PI, 1.5 * Math.PI, false);
    ctx.arc(120, 104, 9, 1.1 * Math.PI, 1.5 * Math.PI, false);
    ctx.stroke();

    // Cheerful pupils behind glasses
    ctx.fillStyle = '#331f12';
    ctx.beginPath();
    ctx.arc(80, 104, 5, 0, Math.PI * 2);
    ctx.arc(120, 104, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(78, 102, 2, 0, Math.PI * 2);
    ctx.arc(118, 102, 2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Rosy Cheeks
    ctx.fillStyle = 'rgba(251, 113, 133, 0.42)';
    ctx.beginPath();
    ctx.ellipse(65, 120, 10, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(135, 120, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Bright Energetic Smile with teeth & tongue
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(100, 125, 12, 0.1, Math.PI - 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(92, 125, 16, 4.5);
    // Tongue
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(100, 134, 5.5, Math.PI, 0);
    ctx.fill();

    ctx.restore();
  }

  drawKakRos(ctx, w, h) {
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Shoulders & Royal Purple Floral Batik Kebaya with cartoon outline
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.moveTo(25, 220);
    ctx.quadraticCurveTo(45, 165, 75, 155);
    ctx.lineTo(125, 155);
    ctx.quadraticCurveTo(155, 165, 175, 220);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Emerald green batik floral motifs
    ctx.fillStyle = '#10b981';
    for (let f = 0; f < 6; f++) {
      const fx = 45 + (f * 24);
      const fy = 185 + (f % 2 === 0 ? -6 : 6);
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gold Kerongsang Brooch
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(100, 180, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Chibi Rounded Head & Neck
    ctx.fillStyle = '#fed7aa'; // Warm peach skin
    ctx.fillRect(88, 140, 24, 20);

    ctx.beginPath();
    ctx.moveTo(52, 98);
    ctx.quadraticCurveTo(48, 134, 74, 150);
    ctx.quadraticCurveTo(100, 162, 126, 150);
    ctx.quadraticCurveTo(152, 134, 148, 98);
    ctx.quadraticCurveTo(145, 66, 100, 64);
    ctx.quadraticCurveTo(55, 66, 52, 98);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Ears with pearl earrings
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(48, 112, 8, 11, -0.15, 0, Math.PI * 2);
    ctx.ellipse(152, 112, 8, 11, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Pearl earring
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(48, 122, 3, 0, Math.PI * 2);
    ctx.arc(152, 122, 3, 0, Math.PI * 2);
    ctx.fill();

    // 3. Elegant Traditional Sanggul / Hair Bun with Orchid Hairpin
    ctx.fillStyle = '#262626';
    // Back hair bun on upper right
    ctx.beginPath();
    ctx.arc(135, 65, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Orchid Hairpin (Bunga Melur)
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(125, 55, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(125, 55, 3, 0, Math.PI * 2);
    ctx.fill();

    // Sleek black hair volume
    ctx.fillStyle = '#262626';
    ctx.beginPath();
    ctx.ellipse(100, 72, 48, 28, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#331f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 4. Sparkling Anime Eyes with Lashes
    ctx.fillStyle = '#331f12';
    ctx.beginPath();
    ctx.ellipse(80, 104, 6, 8.5, 0, 0, Math.PI * 2);
    ctx.ellipse(120, 104, 6, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(78, 101, 2.5, 0, Math.PI * 2);
    ctx.arc(118, 101, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Rosy Cheeks
    ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
    ctx.beginPath();
    ctx.ellipse(65, 118, 10, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(135, 118, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Warm Friendly Smile
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(100, 126, 9, 0.2, Math.PI - 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export default PreloadScene;
