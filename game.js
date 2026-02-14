// ======================
// 游戏业务层（稳定版）
// 只写玩法：装备、技能、强化、宝石等
// 完全不修改底层
// ======================
const Game = {
  // 给玩家新手剑
  async givePlayerSword() {
    await Core.saveGameData({
      type: 'item',
      name: '新手剑',
      attack: 15,
      id: Date.now()
    });
    this.showMyBag();
  },

  // 查看背包（修复异步问题）
  async showMyBag() {
    const myData = await Core.getMyGameData();
    const items = myData.filter(d => d.type === 'item');
    let txt = `🎒 我的背包（仅自己可见）\n`;
    items.forEach(it => {
      txt += `· ${it.name} 攻击+${it.attack}\n`;
    });
    document.getElementById('log').innerText = txt;
  },

  // 学习技能
  async learnSkill(skillName, damage) {
    await Core.saveGameData({
      type: 'skill',
      name: skillName,
      damage: damage
    });
    this.showMyBag();
  },

  // 装备强化
  async enhanceItem(itemId, level) {
    await Core.saveGameData({
      type: 'enhance',
      itemId: itemId,
      level: level
    });
    this.showMyBag();
  },

  // 宝石镶嵌
  async insertGem(itemId, gemName, attr) {
    await Core.saveGameData({
      type: 'gem',
      itemId: itemId,
      gemName: gemName,
      attr: attr
    });
    this.showMyBag();
  }
};
