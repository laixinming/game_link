// ======================
// 底层不可篡改核心库 - 绝对不修改
// 功能：钱包、助记词、哈希链、数据强绑定钱包、通用存储接口
// ======================
const Core = (function() {
  const KEY_MNE = 'wallet_mnemonic';
  const KEY_CHAIN = 'game_chain';
  const words = "apple banana cherry date elder fig grape honey ice juice kite lemon mango nut orange pear queen rose sun tomato umbrella van water xmas yellow zebra".split(' ');

  // 日志输出
  function log(t) {
    const el = document.getElementById('log');
    if (el) el.innerText = `[${new Date().toLocaleString()}] ${t}\n` + el.innerText;
  }

  // SHA256 哈希
  async function sha256(s) {
    const enc = new TextEncoder();
    const d = await crypto.subtle.digest('SHA-256', enc.encode(s));
    return Array.from(new Uint8Array(d)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // 初始化链
  function initChain() {
    if (!localStorage.getItem(KEY_CHAIN)) {
      localStorage.setItem(KEY_CHAIN, '[]');
    }
  }

  // 钱包状态
  function hasWallet() { return !!localStorage.getItem(KEY_MNE); }
  function getCurrentWallet() { return localStorage.getItem(KEY_MNE); }

  // 自动登录
  function autoLogin() {
    initChain();
    if (hasWallet()) {
      log('✅ 自动登录成功');
      if (window.Game) Game.showMyBag();
    } else {
      log('ℹ️ 请创建或恢复钱包');
    }
  }

  // 创建钱包
  function createWallet() {
    if (hasWallet()) return log('⚠️ 已有钱包，无需重复创建');
    const mne = Array(12).fill(0).map(() => words[Math.random() * words.length | 0]).join(' ');
    localStorage.setItem(KEY_MNE, mne);
    log('✅ 新钱包已创建');
  }

  // 查看助记词
  function showMnemonic() {
    const m = getCurrentWallet();
    m ? log('📄 助记词：' + m) : log('⚠️ 未创建钱包');
  }

  // 助记词恢复账号
  function restoreByMnemonic() {
    const v = document.getElementById('input_mne').value.trim();
    const arr = v.split(/\s+/).filter(i => i);
    if (arr.length !== 12) return log('❌ 助记词必须12个单词');
    localStorage.setItem(KEY_MNE, v);
    log('✅ 账号恢复成功');
    if (window.Game) Game.showMyBag();
  }

  // ====================== 核心通用接口 ======================
  // 保存游戏数据（自动绑定当前钱包，不可篡改）
  async function saveGameData(bizData) {
    if (!hasWallet()) return log('⚠️ 请先登录'), false;
    const chain = JSON.parse(localStorage.getItem(KEY_CHAIN));
    const prevHash = chain.length ? chain[chain.length - 1].hash : 'genesis';

    // 自动注入归属人，游戏层无需处理
    const blockData = {
      owner: getCurrentWallet(),
      ...bizData
    };

    const block = {
      index: chain.length,
      time: Date.now(),
      prevHash,
      data: blockData,
      hash: ''
    };
    block.hash = await sha256(JSON.stringify(block));
    chain.push(block);
    localStorage.setItem(KEY_CHAIN, JSON.stringify(chain));
    log('📦 数据已上链·绑定钱包');
    return true;
  }

  // 只获取当前钱包的数据
  function getMyGameData() {
    if (!hasWallet()) return [];
    const me = getCurrentWallet();
    const chain = JSON.parse(localStorage.getItem(KEY_CHAIN) || '[]');
    return chain.map(b => b.data).filter(d => d.owner === me);
  }

  // 校验数据是否被篡改
  async function verifyChain() {
    const chain = JSON.parse(localStorage.getItem(KEY_CHAIN) || '[]');
    for (let i = 1; i < chain.length; i++) {
      const cur = chain[i], pre = chain[i - 1];
      const reHash = await sha256(JSON.stringify({ ...cur, hash: '' }));
      if (cur.hash !== reHash || cur.prevHash !== pre.hash) return false;
    }
    return true;
  }

  async function verifyChainBtn() {
    (await verifyChain()) ? log('✅ 数据完好·未篡改') : log('❌ 数据已被篡改！');
  }

  // 导出存档
  function exportArchive() {
    const data = {
      mnemonic: getCurrentWallet(),
      chain: JSON.parse(localStorage.getItem(KEY_CHAIN))
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u; a.download = 'archive.json'; a.click();
    URL.revokeObjectURL(u);
    log('📤 存档导出成功');
  }

  // 导入存档
  function importArchive() {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = '.json';
    i.onchange = e => {
      const fr = new FileReader();
      fr.onload = ev => {
        try {
          const d = JSON.parse(ev.target.result);
          localStorage.setItem(KEY_MNE, d.mnemonic);
          localStorage.setItem(KEY_CHAIN, JSON.stringify(d.chain));
          log('📥 存档导入成功');
          if (window.Game) Game.showMyBag();
        } catch (e) { log('❌ 导入失败'); }
      };
      fr.readAsText(e.target.files[0]);
    };
    i.click();
  }

  return {
    init: autoLogin,
    hasWallet,
    createWallet,
    showMnemonic,
    restoreByMnemonic,
    saveGameData,
    getMyGameData,
    verifyChainBtn,
    exportArchive,
    importArchive
  };
})();

// 初始化
window.addEventListener('load', Core.init);

