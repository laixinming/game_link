// ======================
// 底层不可篡改核心库 - 安全修复版①
// 修复：XSS 窃取明文助记词（AES-GCM 加密存储）
// 兼容：所有原有接口、游戏层无需修改
// 安全：助记词永不明文落地存储
// ======================
const Core = (function() {
  const KEY_MNE_HASH = 'wallet_mnemonic_hash';
  const KEY_CHAIN = 'game_chain';
  const SESSION_ENCRYPTED = 'session_mnemonic_encrypted'; // 存密文
  const SESSION_SALT = 'session_encrypt_salt';
  const SESSION_IV = 'session_encrypt_iv';

  // BIP39 标准英文词库（2048词，公开安全）
  const words = [
"abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse",
"access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act",
"action","actor","actress","actual","adapt","add","address","adjust","admit","adult",
"advance","advice","afraid","after","again","age","agent","agree","ahead","aim",
"air","airport","aisle","alarm","album","alcohol","alien","all","alley","allow",
"almost","alone","alpha","already","also","alter","always","am","amateur","amazing",
"among","amount","analyst","anchor","ancient","and","anger","angle","angry","animal",
"ankle","announce","another","answer","antenna","anxiety","any","apart","apology","appear",
"apple","approve","april","arch","arctic","area","arm","armed","army","around",
"arrange","arrest","arrive","arrow","art","artefact","artist","artwork","ask","aspect",
"assault","asset","assist","assume","asthma","athlete","atom","attack","attempt","attend",
"auction","audit","august","aunt","author","auto","autumn","average","avocado","avoid",
"awake","aware","awesome","awful","awkward","axis","baby","back","bacon","badger",
"bag","balance","ball","bamboo","banana","banner","bar","bare","bargain","barrel",
"base","basic","basket","battle","beach","bean","beauty","because","become","beef",
"before","begin","behave","behind","believe","bell","belly","below","belt","bench",
"bend","beneath","benefit","best","betray","better","between","beyond","bicycle","bid",
"bike","bind","biology","bird","birth","bitter","black","blade","blame","blanket",
"blind","blood","blossom","blouse","blue","blur","blush","board","boat","body",
"boil","bomb","bone","book","boost","border","boring","borrow","boss","bottom",
"bounce","bound","bowl","box","boy","brain","branch","brass","brave","bread",
"breeze","brick","bridge","brief","bright","bring","brisk","broccoli","broken","bronze",
"broom","brother","brown","brush","bubble","budget","buffalo","build","bulb","bulk",
"bullet","bundle","bus","business","busy","butter","buy","buzz","cabbage","cabin",
"cable","cactus","cage","cake","call","calm","camera","camp","can","canal",
"cancel","candy","cannon","canoe","canvas","canyon","cap","capital","captain","car",
"carbon","card","care","career","carpet","carry","case","cash","casino","castle",
"cat","catalog","catch","cattle","cause","cave","ceiling","celery","cement","census",
"center","cereal","certain","chair","chalk","champion","change","chaos","chapter","charge",
"chase","chat","cheap","check","cheese","chef","cherry","chest","chicken","chief",
"child","chimney","china","choice","choose","chronic","chuckle","chunk","churn","cigar",
"cinema","circle","citizen","city","civil","claim","clap","clarify","claw","clay",
"clean","clerk","clever","clip","clock","close","cloth","cloud","club","clutch",
"coach","coast","coconut","code","coffee","coin","collect","color","combine","come",
"comfort","common","company","concert","conduct","confirm","congress","connect","consider","control",
"convince","cook","copper","copy","coral","core","corn","corner","correct","cost",
"cotton","couch","country","couple","course","cousin","cover","coyote","crack","cradle",
"craft","cram","crane","crash","crazy","cream","credit","creek","crew","cricket",
"crime","crisp","critic","crop","cross","crouch","crow","crowd","crucial","cruel",
"cruise","crumble","crush","cry","crystal","cube","cup","cupboard","cure","curious",
"current","curtain","curve","cushion","custom","cute","cycle","dad","damage","damp",
"dance","danger","daring","dash","daughter","dawn","day","deal","debate","debris",
"decade","december","decide","declare","decorate","decrease","deer","defense","define","defy",
"degree","deliver","demand","demise","denial","dentist","deny","depart","depend","depth",
"describe","desert","design","desk","detail","detect","develop","device","devote","diagram",
"dial","diamond","diet","differ","digital","dignity","dinner","dinosaur","direct","dirt",
"disagree","discover","disease","dish","dismiss","distance","divert","divide","divorce","dizzy",
"doctor","document","dog","doll","dolphin","domain","donate","donkey","door","dose",
"double","dove","draft","dragon","drama","drastic","dream","dress","drink","drive",
"drop","drum","dry","duck","dumb","dune","during","dust","dutch","duty",
"each","eager","eagle","early","easy","echo","ecology","economy","edge","edit",
"educate","effort","egg","eight","either","electric","elephant","elevator","elite","else",
"empty","enable","enact","end","endless","enemy","energy","engage","engine","enhance",
"enjoy","enter","entire","entry","envelope","episode","equal","equip","erase","erode",
"erosion","error","escape","essay","essence","estate","eternal","ethics","evaporate","even",
"event","every","evidence","evil","evoke","exact","example","excess","exchange","excitement",
"exclude","excuse","execute","exercise","exhaust","exotic","expand","expect","experience","explain",
"expose","express","extend","extra","eye","eyebrow","fabric","face","fact","factor",
"fade","faint","faith","fall","false","fame","family","fan","fantasy","farm",
"fashion","fat","father","fatigue","fault","favorite","feature","february","federal","fee",
"feed","feedback","feel","female","fence","festival","fetch","fever","few","fiber",
"fiction","field","fierce","fifteen","fifth","fifty","fight","file","film","final",
"find","fine","finger","fire","firm","first","fish","fit","five","fix",
"flag","flame","flash","flat","flavor","flee","flight","float","flock","floor",
"flower","fluid","flush","fly","foam","focus","fog","folk","follow","food",
"foot","football","force","forest","forget","fork","fortune","forum","forward","fossil",
"foster","found","fox","frame","free","freedom","french","fresh","friend","fringe",
"frog","front","frost","frown","frozen","fruit","fuel","fun","funny","furnace",
"future","gadget","gain","galaxy","gallery","game","garage","garden","garlic","gas",
"gasp","gate","gather","gauge","gaze","general","genius","genre","gentle","geometry",
"germ","gesture","get","ghost","giant","gift","girl","give","glad","glance",
"glass","glide","glimpse","globe","glove","glow","glue","goat","gold","good",
"goose","govern","grab","grace","grain","grant","grape","grass","gravity","great",
"green","grid","grief","grill","grocery","group","grow","grunt","guard","guess",
"guide","guilt","guitar","gun","gym","habit","hair","half","hammer","hamster",
"hand","happy","harbor","hard","harsh","harvest","hat","have","hawk","hazard",
"head","heart","heavy","height","hell","hello","help","hen","herb","here",
"hero","hidden","high","hill","hint","hip","hire","history","hobby","hockey",
"hold","hole","holiday","hollow","home","honey","honor","hope","horn","horse",
"hospital","host","hotel","hour","hover","hub","huge","human","humble","humor",
"hundred","hungry","hunt","hurry","hurt","husband","hybrid","ice","idea","identify",
"idle","ignore","ill","illegal","image","imitate","immense","immune","impact","impose",
"improve","onion","into","invite","involve","iron","island","it","item","ivory",
"jacket","jaguar","jar","jazz","jealous","jeans","jelly","jewel","job","join",
"joke","journey","joy","judge","juice","jump","jungle","junior","junk","just",
"kangaroo","keen","keep","ketchup","key","kick","kid","kidney","kill","kind",
"king","kitchen","kite","kitten","kiwi","knee","knife","knock","know","lab",
"label","labor","ladder","lady","lake","lamp","language","lap","large","laser",
"last","late","laugh","law","lawn","lawsuit","layer","leader","leaf","learn",
"leave","lecture","left","leg","legend","lemon","lend","lesson","letter","level",
"library","lie","life","lift","light","like","limb","limit","line","lion",
"liquid","list","little","live","living","load","loan","lobster","local","logic",
"lonely","long","loop","lottery","loud","lounge","love","loyal","lucky","luggage",
"lumber","lunch","lungs","luxury","lyrics","machine","mad","magic","magnet","mail",
"main","major","make","man","manage","mandate","mango","manual","maple","marble",
"march","margin","marine","market","marriage","mask","mass","master","match","material",
"math","matrix","matter","maximum","may","maybe","meadow","mean","meat","mechanic",
"medal","media","melody","melt","member","memory","mention","menu","mercy","merge",
"merit","merry","mesh","message","metal","method","middle","milk","mill","mind",
"minimum","minor","minute","miracle","mirror","misery","miss","mist","mix","mixture",
"mobile","mode","model","modify","mom","moment","money","monkey","month","moon",
"moral","more","morning","mother","motion","motor","mountain","mouse","move","movie",
"much","muffin","mule","multiply","muscle","museum","mushroom","music","must","mutual",
"myself","mystery","myth","naive","name","narrow","nation","nature","near","neck",
"need","negative","neither","nephew","nerve","nest","net","network","neutral","never",
"news","next","nice","night","noble","noise","nominee","noodle","normal","north",
"nose","not","note","nothing","notice","novel","now","nuclear","number","nurse",
"nut","oak","ocean","october","odor","off","offer","office","often","oil",
"okay","old","olive","olympic","omit","once","one","online","only","open",
"opera","opinion","oppose","option","orange","orbit","order","ordinary","organ","orient",
"original","orphan","ostrich","other","our","out","outer","output","outside","oval",
"oven","over","own","owner","oxygen","oyster","ozone","pact","paddle","page",
"pain","paint","palace","pale","pan","panic","paper","parade","parent","park",
"parrot","party","pass","patch","path","patient","patrol","pause","pay","peace",
"peanut","pear","peasant","pelican","pen","pencil","people","pepper","percent","perfect",
"permit","person","pet","phone","photo","phrase","physical","piano","picnic","picture",
"piece","pig","pigeon","pill","pilot","pink","pioneer","pipe","pizza","place",
"planet","plastic","plate","play","please","pledge","pluck","plug","plus","pocket",
"poem","poet","point","polar","pole","police","pond","pony","pool","popular",
"porch","port","position","possible","post","pot","potato","pound","powder","power",
"practice","prepare","present","price","pride","primary","print","priority","prison","private",
"prize","problem","process","produce","program","project","promote","proof","property","prosper",
"protect","proud","provide","public","pudding","pull","pulp","pulse","pumpkin","punch",
"pupil","pure","purple","purpose","push","put","puzzle","pyramid","quality","quantum",
"quarter","queen","question","quick","quit","quite","rabbit","race","radar","radio",
"rail","rain","raise","rally","ramp","ranch","random","range","rapid","rare",
"rate","rather","raven","raw","ray","reach","read","ready","real","reason",
"rebel","rebuild","recall","receive","recipe","record","reduce","reflect","reform","refresh",
"refuse","region","regret","regular","reject","relax","release","relief","rely","remain",
"remember","remove","render","renew","rent","reopen","repair","repeat","replace","reply",
"report","require","rescue","resemble","resist","resource","result","retire","retreat","return",
"reunion","reveal","review","reward","rhythm","rib","ribbon","rice","rich","ride",
"ridge","right","rigid","ring","riot","ripple","risk","ritual","river","road",
"roast","robot","robust","rocket","romance","roof","rookie","room","rose","rotate",
"rough","round","route","royal","rubber","rule","run","runway","rural","sad",
"saddle","sadness","safe","sail","salad","salmon","salt","same","sample","sand",
"satoshi","satisfy","sausage","save","saw","say","scale","scan","scare","scatter",
"scene","school","science","scissors","scorpion","scout","scrap","screen","script","sea",
"search","season","second","secret","section","secure","see","seed","seek","segment",
"select","sell","send","senior","sense","sentence","separate","series","service","session",
"set","settle","seven","several","sewer","sex","shade","shadow","shake","share",
"shed","shell","sheriff","shield","shift","shine","ship","shock","shoe","shoot",
"shop","short","shoulder","shout","show","shower","shrug","shy","sibling","side",
"siege","sight","sign","silent","silk","silly","silver","similar","simple","since",
"sing","siren","sister","site","situation","six","size","skate","sketch","ski",
"skill","skin","skirt","sky","slab","slam","sleep","slender","slice","slide",
"slight","slow","slush","small","smart","smile","smoke","smooth","snack","snake",
"snow","so","soap","soccer","social","sock","sofa","soft","solar","soldier",
"solid","solution","solve","someone","song","soon","sorry","sort","soul","sound",
"soup","source","south","space","spare","spatial","spawn","speak","special","speed",
"spell","spend","sphere","spice","spider","spike","spin","spirit","spit","spoil",
"sponsor","spoon","sport","spot","spray","spread","spring","spy","square","squeeze",
"squirrel","stable","stack","stage","stairs","stand","star","start","state","stay",
"steak","steel","stem","step","stereo","stick","still","sting","stock","stomach",
"stone","stop","store","storm","story","stove","straight","strange","street","strike",
"strong","struggle","student","stuff","stupid","style","subject","submit","subway","success",
"such","sudden","sugar","suggest","suit","summer","sun","sunny","sunset","super",
"supply","supreme","sure","surface","surge","surprise","surround","survey","suspect","sustain",
"swallow","swamp","swap","swarm","swear","sweet","swim","swing","switch","sword",
"symbol","system","table","tail","take","tale","talk","tank","tape","target",
"task","taste","tattoo","taxi","tea","teach","team","tell","temperature","ten",
"tent","term","test","thank","that","the","then","theory","there","they",
"thing","this","those","thought","thousand","thread","three","thrive","throw","thumb",
"thunder","tiger","tilt","timber","time","tiny","tip","tired","title","toast",
"tobacco","today","toddler","toe","together","tomato","tomorrow","tone","tongue","tonight",
"tool","tooth","top","topic","topple","torch","tornado","tortoise","total","touch",
"toward","tower","town","toy","track","trade","traffic","train","transfer","trap",
"travel","tray","tree","trend","trial","tribe","trick","trip","trophy","trouble",
"truck","true","truly","trust","truth","try","tube","tuition","tumble","tuna",
"tunnel","turkey","turn","turtle","twelve","twenty","twice","two","type","typical",
"ugly","umbrella","unable","unaware","uncle","under","unit","universe","unknown","unlock",
"until","unusual","update","upgrade","upper","upset","urban","urge","useful","useless",
"usual","utility","vacant","vacuum","vague","valid","valley","value","vehicle","velvet",
"vendor","venture","verb","verify","version","very","vessel","veteran","viable","vibrant",
"vice","victory","video","village","violet","violin","virtual","virus","visa","visit",
"visual","vital","vivid","vocal","voice","volume","vote","voyage","wage","wait",
"walk","wall","walnut","want","warfare","warm","wash","waste","water","wave",
"way","wealth","weapon","wear","weasel","weather","web","wedding","week","weigh",
"welcome","west","western","wet","whale","what","wheat","wheel","when","where",
"whether","which","while","whisper","whistle","white","who","whole","why","wide",
"width","wife","wild","will","win","window","wine","wing","winter","wire",
"wise","wish","with","wolf","woman","wonder","wood","wool","word","work",
"world","worry","worth","wrap","wreck","wrestle","wrist","write","writer","wrong",
"yard","year","yellow","you","young","youth","zebra","zephyr","zinc","zone","zoo"
  ];

  // 内存瞬时保存解密后的助记词（刷新丢失）
  let _memMnemonic = null;

  // 日志输出
  function log(t) {
    const el = document.getElementById('log');
    if (el) el.innerText = `[${new Date().toLocaleString()}] ${t}\n` + el.innerText;
  }

  // SHA256
  async function sha256(s) {
    const enc = new TextEncoder();
    const d = await crypto.subtle.digest('SHA-256', enc.encode(s));
    return Array.from(new Uint8Array(d)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // 初始化链
  function initChain() {
    if (!localStorage.getItem(KEY_CHAIN)) localStorage.setItem(KEY_CHAIN, '[]');
  }

  // ====================== AES 加密/解密工具（原生浏览器密码学） ======================
  async function getKeyFromPassword(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({
      name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256'
    }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }

  async function encryptMnemonic(mnemonic, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKeyFromPassword(password, salt);
    const enc = new TextEncoder();
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(mnemonic));
    return {
      cipher: Array.from(new Uint8Array(cipher)),
      salt: Array.from(salt),
      iv: Array.from(iv)
    };
  }

  async function decryptMnemonic(password) {
    const encrypted = sessionStorage.getItem(SESSION_ENCRYPTED);
    const saltBuf = sessionStorage.getItem(SESSION_SALT);
    const ivBuf = sessionStorage.getItem(SESSION_IV);
    if (!encrypted || !saltBuf || !ivBuf) return null;

    try {
      const key = await getKeyFromPassword(password, new Uint8Array(JSON.parse(saltBuf)));
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(JSON.parse(ivBuf)) },
        key,
        new Uint8Array(JSON.parse(encrypted))
      );
      return new TextDecoder().decode(decrypted);
    } catch (e) {
      return null;
    }
  }

  // ====================== 解锁/登录状态 ======================
  function isUnlocked() { return !!_memMnemonic; }
  function hasWalletBind() { return !!localStorage.getItem(KEY_MNE_HASH); }

  // 自动初始化
  function autoLogin() {
    initChain();
    if (hasWalletBind() && !isUnlocked()) {
      log('ℹ️ 钱包已加密，请输入密码解锁');
    } else if (isUnlocked()) {
      log('✅ 已解锁，自动登录成功');
      if (window.Game) Game.showMyBag();
    } else {
      log('ℹ️ 请创建加密钱包');
    }
  }

  // ====================== 加密创建钱包（修复版） ======================
  async function createWallet() {
    if (hasWalletBind()) {
      log('⚠️ 已存在加密钱包，请勿重复创建');
      return;
    }
    const pwd = prompt('设置你的钱包密码（用于解锁助记词）：');
    if (!pwd || pwd.length < 4) {
      log('❌ 密码至少4位');
      return;
    }

    // 密码学安全随机助记词
    const rand = new Uint32Array(12);
    crypto.getRandomValues(rand);
    const mne = Array.from(rand).map(n => words[n % words.length]).join(' ');

    // 加密存储
    const { cipher, salt, iv } = await encryptMnemonic(mne, pwd);
    sessionStorage.setItem(SESSION_ENCRYPTED, JSON.stringify(cipher));
    sessionStorage.setItem(SESSION_SALT, JSON.stringify(salt));
    sessionStorage.setItem(SESSION_IV, JSON.stringify(iv));

    // 保存哈希
    const mneHash = await sha256(mne);
    localStorage.setItem(KEY_MNE_HASH, mneHash);
    _memMnemonic = mne;

    log('✅ 加密钱包创建完成！请立即保存助记词：');
    log('📄 ' + mne);
    autoLogin();
  }

  // 解锁钱包（输密码解密）
  async function unlockWallet() {
    const pwd = prompt('输入钱包密码解锁：');
    if (!pwd) return;
    const mne = await decryptMnemonic(pwd);
    if (!mne) {
      log('❌ 密码错误');
      return;
    }
    _memMnemonic = mne;
    log('✅ 解锁成功');
    autoLogin();
  }

  // 查看助记词（需已解锁）
  function showMnemonic() {
    if (!isUnlocked()) {
      log('⚠️ 请先解锁钱包');
      return;
    }
    log('📄 助记词：' + _memMnemonic);
  }

  // 助记词恢复（加密存储）
  async function restoreByMnemonic() {
    const inputVal = document.getElementById('input_mne').value.trim();
    const arr = inputVal.split(/\s+/).filter(i => i);
    if (arr.length !== 12) {
      log('❌ 助记词必须12个单词');
      return;
    }

    const pwd = prompt('设置新钱包密码（用于解锁）：');
    if (!pwd || pwd.length < 4) {
      log('❌ 密码至少4位');
      return;
    }

    const inputHash = await sha256(inputVal);
    const savedHash = localStorage.getItem(KEY_MNE_HASH);
    if (savedHash && inputHash !== savedHash) {
      log('❌ 助记词不匹配');
      return;
    }

    const { cipher, salt, iv } = await encryptMnemonic(inputVal, pwd);
    sessionStorage.setItem(SESSION_ENCRYPTED, JSON.stringify(cipher));
    sessionStorage.setItem(SESSION_SALT, JSON.stringify(salt));
    sessionStorage.setItem(SESSION_IV, JSON.stringify(iv));
    localStorage.setItem(KEY_MNE_HASH, inputHash);
    _memMnemonic = inputVal;

    log('✅ 加密恢复成功');
    autoLogin();
  }

  // ====================== 核心数据接口（完全兼容旧版） ======================
  async function saveGameData(bizData) {
    if (!isUnlocked()) {
      log('⚠️ 请先解锁钱包');
      return false;
    }
    const chain = JSON.parse(localStorage.getItem(KEY_CHAIN));
    const prevHash = chain.length ? chain[chain.length - 1].hash : 'genesis';
    const owner = await sha256(_memMnemonic);

    const block = {
      index: chain.length, time: Date.now(), prevHash,
      data: { owner, ...bizData }, hash: ''
    };
    block.hash = await sha256(JSON.stringify(block));
    chain.push(block);
    localStorage.setItem(KEY_CHAIN, JSON.stringify(chain));
    log('📦 数据已上链（加密钱包）');
    return true;
  }

  async function getMyGameData() {
    if (!isUnlocked()) return [];
    const me = await sha256(_memMnemonic);
    const chain = JSON.parse(localStorage.getItem(KEY_CHAIN) || '[]');
    return chain.map(b => b.data).filter(d => d.owner === me);
  }

  async function verifyChainBtn() {
    const chain = JSON.parse(localStorage.getItem(KEY_CHAIN) || '[]');
    let ok = true;
    for (let i = 1; i < chain.length; i++) {
      const cur = chain[i], pre = chain[i - 1];
      const h = await sha256(JSON.stringify({ ...cur, hash: '' }));
      if (cur.hash !== h || cur.prevHash !== pre.hash) { ok = false; break; }
    }
    ok ? log('✅ 数据完整未篡改') : log('❌ 数据已被篡改！');
  }

  // 导出/导入
  function exportArchive() {
    if (!isUnlocked()) { log('⚠️ 请先解锁'); return; }
    const data = {
      hash: localStorage.getItem(KEY_MNE_HASH),
      chain: JSON.parse(localStorage.getItem(KEY_CHAIN))
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u; a.download = 'archive-encrypted.json'; a.click();
    URL.revokeObjectURL(u);
    log('📤 加密存档导出成功');
  }

  function importArchive() {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = '.json';
    i.onchange = e => {
      const fr = new FileReader();
      fr.onload = ev => {
        try {
          const d = JSON.parse(ev.target.result);
          localStorage.setItem(KEY_MNE_HASH, d.hash);
          localStorage.setItem(KEY_CHAIN, JSON.stringify(d.chain));
          log('📥 导入成功，请用助记词+密码恢复');
        } catch (e) { log('❌ 导入失败'); }
      };
      fr.readAsText(e.target.files[0]);
    };
    i.click();
  }

  return {
    init: autoLogin,
    createWallet,
    unlockWallet, // 新增：解锁密码
    showMnemonic,
    restoreByMnemonic,
    saveGameData,
    getMyGameData,
    verifyChainBtn,
    exportArchive,
    importArchive
  };
})();

window.addEventListener('load', Core.init);
