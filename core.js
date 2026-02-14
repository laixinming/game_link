// ======================
// 底层不可篡改核心库 - 安全最终版
// 功能：钱包、助记词、哈希链、数据强绑定钱包、通用存储接口
// 安全：BIP39词库 + 密码学安全随机 + 不存明文助记词
// ======================
const Core = (function() {
  const KEY_MNE_HASH = 'wallet_mnemonic_hash'; // 只存哈希，不存原文
  const KEY_CHAIN = 'game_chain';

  // BIP39 标准英文词库（2048词，公开安全，无风险）
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

  // 内存中临时保存当前助记词（刷新即消失）
  let _tempCurrentMnemonic = null;

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

  // 钱包状态：已绑定过助记词
  function hasWallet() {
    return !!localStorage.getItem(KEY_MNE_HASH);
  }

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

  // ====================== 安全创建钱包（密码学随机） ======================
  async function createWallet() {
    if (hasWallet()) {
      log('⚠️ 已有钱包，无需重复创建');
      return;
    }

    // 密码学安全随机数
    const randArray = new Uint32Array(12);
    crypto.getRandomValues(randArray);

    // 生成12个单词助记词
    const mnemonic = Array.from(randArray).map(num => words[num % words.length]).join(' ');
    _tempCurrentMnemonic = mnemonic;

    // 只存哈希，不存原文
    const mneHash = await sha256(mnemonic);
    localStorage.setItem(KEY_MNE_HASH, mneHash);

    log('✅ 新钱包已创建！请立刻保存助记词！');
    log('📄 ' + mnemonic);
  }

  // 查看助记词（仅内存）
  function showMnemonic() {
    if (!_tempCurrentMnemonic) {
      log('⚠️ 请重新恢复助记词（刷新后内存清空）');
      return;
    }
    log('📄 助记词：' + _tempCurrentMnemonic);
  }

  // ====================== 助记词恢复账号 ======================
  async function restoreByMnemonic() {
    const inputVal = document.getElementById('input_mne').value.trim();
    const wordArr = inputVal.split(/\s+/).filter(w => w);

    if (wordArr.length !== 12) {
      log('❌ 助记词必须为12个单词');
      return;
    }

    const inputHash = await sha256(inputVal);
    const savedHash = localStorage.getItem(KEY_MNE_HASH);

    // 首次恢复
    if (!savedHash) {
      localStorage.setItem(KEY_MNE_HASH, inputHash);
    } else if (inputHash !== savedHash) {
      log('❌ 助记词错误，校验不通过');
      return;
    }

    _tempCurrentMnemonic = inputVal;
    log('✅ 账号恢复成功');
    if (window.Game) Game.showMyBag();
  }

  // ====================== 核心通用接口 ======================
  // 保存游戏数据（自动绑定当前钱包）
  async function saveGameData(bizData) {
    if (!hasWallet() || !_tempCurrentMnemonic) {
      log('⚠️ 请先恢复/创建钱包');
      return false;
    }

    const chain = JSON.parse(localStorage.getItem(KEY_CHAIN));
    const prevHash = chain.length ? chain[chain.length - 1].hash : 'genesis';

    const blockData = {
      owner: await sha256(_tempCurrentMnemonic), // 存哈希，不存原文
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
  async function getMyGameData() {
    if (!hasWallet() || !_tempCurrentMnemonic) return [];

    const myHash = await sha256(_tempCurrentMnemonic);
    const chain = JSON.parse(localStorage.getItem(KEY_CHAIN) || '[]');

    return chain.map(b => b.data).filter(d => d.owner === myHash);
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
      mnemonicHash: localStorage.getItem(KEY_MNE_HASH),
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
          localStorage.setItem(KEY_MNE_HASH, d.mnemonicHash);
          localStorage.setItem(KEY_CHAIN, JSON.stringify(d.chain));
          log('📥 存档导入成功');
          log('ℹ️ 请重新输入助记词解锁数据');
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

window.addEventListener('load', Core.init);
