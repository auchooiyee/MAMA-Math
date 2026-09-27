import audioManager from '../managers/AudioManager.js';
import localizationManager from '../managers/LocalizationManager.js';
import { THEME } from '../config/constants.js';
import { createButton } from '../ui/buttons.js';
import { createMiniGameShell } from '../ui/miniGameShell.js';

const DISHES = [
  { id: 'nasi_lemak', en: 'Nasi Lemak', ms: 'Nasi Lemak', price: 8.0, cost: 4.5 },
  { id: 'mee_goreng', en: 'Mee Goreng', ms: 'Mee Goreng', price: 7.5, cost: 3.8 },
  { id: 'satay_ayam', en: 'Satay Ayam', ms: 'Satay Ayam', price: 9.5, cost: 4.8 },
  { id: 'teh_tarik', en: 'Teh Tarik', ms: 'Teh Tarik', price: 3.0, cost: 1.2 }
];

export class ServeOrderGame {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.recipe = options.recipe || { id: 'nasi_lemak', sellingPrice: 8, baseCost: 4.5 };
    this.customer = options.customer || { name: 'Customer' };
    this.onComplete = options.onComplete || (() => {});
    this.phase = 'dish';
    this.isCompleted = false;
    this.container = scene.add.container(640, 380);
    this.createUI();
  }

  createUI() {
    const isMs = localizationManager.getLanguage() === 'ms';
    createMiniGameShell(this.scene, this.container, isMs ? 'HIDANG PESANAN' : 'SERVE THE ORDER', isMs ? 'Padankan hidangan dan kira untung' : 'Match the dish, then calculate the profit');

    const customerCard = this.scene.add.graphics();
    customerCard.fillStyle(THEME.surfaceTealDark, 1).fillRoundedRect(-300, -165, 600, 54, 14);
    customerCard.lineStyle(2, THEME.accentGold, 1).strokeRoundedRect(-300, -165, 600, 54, 14);
    this.container.add(customerCard);
    this.customerText = this.scene.add.text(0, -138, `👤 ${this.customer.name || 'Customer'}  •  ${isMs ? 'Pesanan' : 'Order'}: ?`, {
      fontFamily: 'Nunito, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#fff8e7'
    }).setOrigin(0.5);
    this.container.add(this.customerText);

    this.prompt = this.scene.add.text(0, -90, isMs ? 'Pilih hidangan yang betul' : 'Choose the correct dish', {
      fontFamily: 'Nunito, sans-serif', fontSize: '18px', fontStyle: 'bold', color: THEME.textDark
    }).setOrigin(0.5);
    this.container.add(this.prompt);
    this.feedback = this.scene.add.text(0, 170, '', {
      fontFamily: 'Nunito, sans-serif', fontSize: '18px', fontStyle: 'bold', color: THEME.textDark
    }).setOrigin(0.5);
    this.container.add(this.feedback);

    const target = DISHES.find(d => d.id === this.recipe.id) || DISHES[0];
    const choices = [target, ...DISHES.filter(d => d.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 2)];
    choices.forEach((dish, index) => {
      const x = index === 0 ? -190 : index === 1 ? 0 : 190;
      const btn = createButton(this.scene, x, 35, dish[isMs ? 'ms' : 'en'], {
        width: 170, height: 54, fontSize: '16px',
        bgColor: index === 0 ? THEME.secondary : THEME.surfaceTealLight,
        bgDarkColor: THEME.secondaryDark,
        onClick: () => this.chooseDish(dish, target)
      });
      this.container.add(btn.container);
    });
    this.targetDish = target;
  }

  chooseDish(dish, target) {
    if (this.isCompleted || this.phase !== 'dish') return;
    const isMs = localizationManager.getLanguage() === 'ms';
    if (dish.id !== target.id) {
      this.fail(isMs ? 'Cuba lagi — hidangan tidak sepadan.' : 'Try again — that dish does not match.');
      return;
    }
    audioManager.playCorrect();
    this.phase = 'price';
    this.prompt.setText(isMs ? 'Pilih harga jual yang betul' : 'Choose the correct selling price');
    this.customerText.setText(`👤 ${this.customer.name || 'Customer'}  •  ${isMs ? 'Pesanan' : 'Order'}: ${target.en}`);
    this.feedback.setText(isMs ? 'Padanan betul! Sekarang kira untung.' : 'Correct match! Now calculate the profit.').setColor('#047857');
    this.showPriceChoices(target);
  }

  showPriceChoices(target) {
    const prices = [target.price, target.price + 1, Math.max(1, target.price - 1)].sort(() => 0.5 - Math.random());
    prices.forEach((price, index) => {
      const btn = createButton(this.scene, -115 + index * 115, 110, `RM ${price.toFixed(2)}`, {
        width: 102, height: 48, fontSize: '15px', bgColor: THEME.primary, bgDarkColor: THEME.primaryDark,
        onClick: () => this.choosePrice(price, target)
      });
      this.container.add(btn.container);
    });
  }

  choosePrice(price, target) {
    if (this.isCompleted || this.phase !== 'price') return;
    const isMs = localizationManager.getLanguage() === 'ms';
    if (Math.abs(price - target.price) > 0.01) {
      this.fail(isMs ? 'Harga tidak tepat. Cuba lagi.' : 'That price is not correct. Try again.');
      return;
    }
    this.isCompleted = true;
    audioManager.playCorrect();
    const profit = target.price - target.cost;
    this.feedback.setText(`${isMs ? 'Untung' : 'Profit'}: RM ${profit.toFixed(2)} ✓`).setColor('#047857');
    this.scene.tweens.add({ targets: this.container, scaleX: 1.06, scaleY: 1.06, duration: 180, yoyo: true });
    this.scene.time.delayedCall(700, () => { this.destroy(); this.onComplete(1.0); });
  }

  fail(message) {
    audioManager.playWrong();
    this.feedback.setText(message).setColor('#b91c1c');
    this.scene.tweens.add({ targets: this.container, x: 650, duration: 55, yoyo: true, repeat: 2 });
  }

  update() {}
  destroy() { if (this.container && this.container.active) this.container.destroy(true); }
}

export default ServeOrderGame;
