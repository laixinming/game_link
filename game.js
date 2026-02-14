// ======================
// 游戏业务层 - 装备强化/镶嵌/消耗版
// ======================
const Game = {
  // 给新手剑（带唯一itemId）
  givePlayerSword() {
    const itemId = Date.now();
    Core.saveGameDataSync({
      type: 'item',
      itemId: itemId,
      name: '新手剑',
      attack: 15,
      level: 0
    });
    this.showMyLatestItems();
  },

  // 显示【最新状态】背包（强化/镶嵌后自动更新）
  showMyLatestItems() {
    const items = Core.getMyItemsSync();
    let txt = `🎒 最新背包（已聚合强化/镶嵌）\n`;
    items.forEach(it => {
      txt += `· ${it.name} +${it.level || 0} 攻击+${it.attack} ${it.gem || ''}\n`;
    });
    document.getElementById('log').innerText = txt;
  },

  // 强化装备（对最新的一把剑生效）
  enhanceItem(levelUp) {
    const items = Core.getMyItemsSync();
    if (!items.length) {
      document.getElementById('log').innerText = '❌ 先获得装备再强化';
      return;
    }
    const target = items[0];
    Core.saveGameDataSync({
      type: 'item',
      itemId: target.itemId,
      level: (target.level || 0) + levelUp,
      attack: target.attack + levelUp * 5
    });
    this.showMyLatestItems();
  },

  // 镶嵌宝石
  insertGem(gemName, attr) {
    const items = Core.getMyItemsSync();
    if (!items.length) {
      document.getElementById('log').innerText = '❌ 先获得装备再镶嵌';
      return;
    }
    const target = items[0];
    Core.saveGameDataSync({
      type: 'item',
      itemId: target.itemId,
      gem: `[${gemName}]${attr}`
    });
    this.showMyLatestItems();
  },

  // 消耗/删除道具
  consumeItem() {
    const items = Core.getMyItemsSync();
    if (!items.length) {
      document.getElementById('log').innerText = '❌ 没有可消耗的装备';
      return;
    }
    Core.consumeItemSync(items[0].itemId);
    this.showMyLatestItems();
  },

  // 旧接口兼容
  showMyBag() {
    this.showMyLatestItems();
  }
};
