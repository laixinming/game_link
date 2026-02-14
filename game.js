// ======================
// 游戏业务层 - 所有玩法/装备/技能/强化 都写在这里
// 依赖：core.js（只调用接口，不修改底层）
// ======================
const Game = {
  // ====================== 基础玩法 ======================
  async givePlayerSword() {
    if (!Core.hasWallet()) return alert('请先创建钱包');
    await Core.saveGameData({
      type: 'item',
      name: '新手剑',
      attack: 15,
      id: Date.now()
    });
    this.showMyBag();
  },

  // 查看背包（只看自己的装备）
  showMyBag() {
    const myData = Core.getMyGameData();
    const items = myData.filter(d => d.type === 'item');
    let txt = `🎒 我的背包\n`;
    items.forEach(it => txt += `· ${it.name} 攻击+${it.attack}\n`);
    document.getElementById('log').innerText = txt;
  },

  // ====================== 扩展1：人物技能 ======================
  async learnSkill(skillName, damage) {
    await Core.saveGameData({
      type: 'skill',
      name: skillName,
      damage: damage
    });
    this.showMyBag();
  },

  // ====================== 扩展2：装备强化 ======================
  async enhanceItem(itemId, level) {
    await Core.saveGameData({
      type: 'enhance',
      itemId: itemId,
      level: level
    });
    this.showMyBag();
  },

  // ====================== 扩展3：宝石镶嵌 ======================
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
