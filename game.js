// ======================
// 游戏业务层 - 同步版（无异步、无await、不踩坑）
// ======================
const Game = {
  // 生成新手剑（同步）
  givePlayerSword() {
    Core.saveGameDataSync({
      type: 'item',
      name: '新手剑',
      attack: 15,
      id: Date.now()
    });
    this.showMyBag();
  },

  // 查看背包（同步，点了就显示）
  showMyBag() {
    const allData = Core.getMyDataSync();
    const items = allData.filter(d => d.type === 'item');
    let txt = `🎒 我的背包\n`;
    items.forEach(it => {
      txt += `· ${it.name} 攻击+${it.attack}\n`;
    });
    document.getElementById('log').innerText = txt;
  },

  // 学习技能（同步）
  learnSkill(skillName, damage) {
    Core.saveGameDataSync({
      type: 'skill',
      name: skillName,
      damage: damage
    });
    this.showMyBag();
  },

  // 装备强化（同步）
  enhanceItem(itemId, level) {
    Core.saveGameDataSync({
      type: 'enhance',
      itemId: itemId,
      level: level
    });
    this.showMyBag();
  },

  // 宝石镶嵌（同步）
  insertGem(itemId, gemName, attr) {
    Core.saveGameDataSync({
      type: 'gem',
      itemId: itemId,
      gemName: gemName,
      attr: attr
    });
    this.showMyBag();
  }
};
