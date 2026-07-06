// 24 meme mappings: gesture/expression → meme image
// face triggers receive (blendshapes, landmarks) where blendshapes is {categoryName: score}

function avg(a, b) { return (a + b) / 2; }

export const MEME_MAP = [
  // === 身体动作 (Pose-based, 15) ===
  {
    id: 'cover-face', name: '捂脸', type: 'pose',
    trigger: (kp) => {
      const nose = kp[0];
      const lw = kp[15], rw = kp[16];
      return Math.hypot(lw.x - nose.x, lw.y - nose.y) < 0.12 && Math.hypot(rw.x - nose.x, rw.y - nose.y) < 0.12;
    },
    meme: '/memes/panda-cover-face.svg', category: '熊猫头',
  },
  {
    id: 'hands-up', name: '举手投降', type: 'pose',
    trigger: (kp) => {
      const nose = kp[0];
      const lw = kp[15], rw = kp[16];
      return lw.y < nose.y - 0.15 && rw.y < nose.y - 0.15;
    },
    meme: '/memes/panda-hands-up.svg', category: '熊猫头',
  },
  {
    id: 'peace-sign', name: '比耶', type: 'pose',
    trigger: (kp) => {
      const shoulder = kp[12];
      const rw = kp[16];
      return rw.y < shoulder.y - 0.1 && Math.abs(rw.x - shoulder.x) < 0.15;
    },
    meme: '/memes/haaland-smile.svg', category: '哈兰德',
  },
  {
    id: 'squat', name: '蹲下', type: 'pose',
    trigger: (kp) => {
      const lh = kp[23], rh = kp[24];
      const lk = kp[25], rk = kp[26];
      return lh.y > lk.y - 0.03 || rh.y > rk.y - 0.03;
    },
    meme: '/memes/possum-calm.svg', category: '负鼠',
  },
  {
    id: 'head-shake', name: '摇头', type: 'pose',
    trigger: (kp, prevKp, state) => {
      if (!prevKp) return false;
      const dx = kp[0].x - prevKp[0].x;
      if (!state.shakeDirs) state.shakeDirs = [];
      if (state.shakeDirs.length === 0 || Math.sign(dx) !== Math.sign(state.shakeDirs[state.shakeDirs.length - 1])) {
        state.shakeDirs.push(Math.sign(dx));
        if (state.shakeDirs.length > 20) state.shakeDirs.shift();
      }
      const changes = state.shakeDirs.slice(-10).filter((s, i, a) => i > 0 && s !== a[i - 1]).length;
      return changes >= 3;
    },
    meme: '/memes/homelander-shake.svg', category: '黑袍纠察队',
  },
  {
    id: 'head-tilt', name: '歪头', type: 'pose',
    trigger: (kp) => {
      const le = kp[7], re = kp[8];
      const angle = Math.abs(Math.atan2(re.y - le.y, re.x - le.x) * 180 / Math.PI);
      return angle > 20;
    },
    meme: '/memes/huh-cat.svg', category: '猫Meme',
  },
  {
    id: 'jump', name: '跳起来', type: 'pose',
    trigger: (kp, prevKp, state) => {
      if (!state.jumpY) state.jumpY = [];
      state.jumpY.push(kp[0].y);
      if (state.jumpY.length > 10) state.jumpY.shift();
      if (state.jumpY.length < 5) return false;
      return Math.max(...state.jumpY) - Math.min(...state.jumpY) > 0.08;
    },
    meme: '/memes/happy-cat.svg', category: '猫Meme',
  },
  {
    id: 'heart-hands', name: '比心', type: 'pose',
    trigger: (kp) => {
      const lw = kp[15], rw = kp[16];
      const mid = { x: (kp[11].x + kp[12].x) / 2, y: (kp[11].y + kp[12].y) / 2 };
      return Math.hypot(lw.x - mid.x, lw.y - mid.y) < 0.15
        && Math.hypot(rw.x - mid.x, rw.y - mid.y) < 0.15
        && Math.hypot(lw.x - rw.x, lw.y - rw.y) < 0.1;
    },
    meme: '/memes/mooncat-heart.svg', category: '月薪喵',
  },
  {
    id: 'arms-crossed', name: '双手抱胸', type: 'pose',
    trigger: (kp) => {
      const lw = kp[15], rw = kp[16];
      const le = kp[13], re = kp[14];
      return lw.x > re.x + 0.02 && rw.x < le.x - 0.02;
    },
    meme: '/memes/panda-just-this.svg', category: '熊猫头',
  },
  {
    id: 'shrug', name: '摊手', type: 'pose',
    trigger: (kp) => {
      const lw = kp[15], rw = kp[16];
      const ls = kp[11], rs = kp[12];
      return lw.y < ls.y && rw.y < rs.y && Math.abs(lw.x - ls.x) > 0.15 && Math.abs(rw.x - rs.x) > 0.15;
    },
    meme: '/memes/panda-dunno.svg', category: '熊猫头',
  },
  {
    id: 'head-hold', name: '抱头', type: 'pose',
    trigger: (kp) => {
      const le = kp[7], re = kp[8];
      const lw = kp[15], rw = kp[16];
      return Math.hypot(lw.x - le.x, lw.y - le.y) < 0.1 && Math.hypot(rw.x - re.x, rw.y - re.y) < 0.1;
    },
    meme: '/memes/panda-crash.svg', category: '熊猫头',
  },
  {
    id: 'wave', name: '挥手', type: 'pose',
    trigger: (kp, prevKp, state) => {
      if (!prevKp) return false;
      const rw = kp[16], rs = kp[12];
      if (rw.y > rs.y + 0.05) return false;
      if (!state.waveX) state.waveX = [];
      state.waveX.push(rw.x);
      if (state.waveX.length > 15) state.waveX.shift();
      if (state.waveX.length < 8) return false;
      return state.waveX.slice(-8).filter((v, i, a) => i > 0 && Math.abs(v - a[i - 1]) > 0.01).length >= 3;
    },
    meme: '/memes/grass-cow-bye.svg', category: '草地牛',
  },
  {
    id: 'thumbs-up', name: '竖起大拇指', type: 'pose',
    trigger: (kp) => {
      const rs = kp[12], rw = kp[16];
      return rw.y < rs.y - 0.15 && rw.x > rs.x;
    },
    meme: '/memes/haaland-thumbsup.svg', category: '哈兰德',
  },
  {
    id: 'pray-hands', name: '双手合十', type: 'pose',
    trigger: (kp) => {
      const lw = kp[15], rw = kp[16];
      const mid = { x: (kp[11].x + kp[12].x) / 2, y: (kp[11].y + kp[12].y) / 2 };
      const wristDist = Math.hypot(lw.x - rw.x, lw.y - rw.y);
      const toMid = Math.hypot(lw.x - mid.x, lw.y - mid.y);
      return wristDist < 0.04 && toMid < 0.12;
    },
    meme: '/memes/panda-please.svg', category: '熊猫头',
  },
  {
    id: 'point-forward', name: '指屏幕', type: 'pose',
    trigger: (kp) => {
      const rs = kp[12], rw = kp[16];
      return rw.y < rs.y - 0.08 && rw.x < rs.x - 0.05;
    },
    meme: '/memes/genshin-uchiha.svg', category: '原神牛逼',
  },

  // === 面部表情 (Face blendshapes, 9) ===
  {
    id: 'big-laugh', name: '大笑', type: 'face',
    trigger: (bs) => bs.jawOpen > 0.4 && (bs.mouthSmileLeft + bs.mouthSmileRight) / 2 > 0.2,
    meme: '/memes/laughing-dragon.svg', category: '大笑奶龙',
  },
  {
    id: 'surprised', name: '惊讶', type: 'face',
    trigger: (bs) => bs.jawOpen > 0.25 && (bs.eyeWideLeft + bs.eyeWideRight) / 2 > 0.25,
    meme: '/memes/surprised-cat.svg', category: '猫Meme',
  },
  {
    id: 'sad', name: '悲伤', type: 'face',
    trigger: (bs) => (bs.mouthFrownLeft + bs.mouthFrownRight) / 2 > 0.25,
    meme: '/memes/sad-banana-cat.svg', category: '猫Meme',
  },
  {
    id: 'disgust', name: '嫌弃/眯眼', type: 'face',
    trigger: (bs) => (bs.eyeSquintLeft + bs.eyeSquintRight) / 2 > 0.35 && bs.jawOpen < 0.2,
    meme: '/memes/old-man-phone.svg', category: '经典',
  },
  {
    id: 'smile', name: '微笑', type: 'face',
    trigger: (bs) => (bs.mouthSmileLeft + bs.mouthSmileRight) / 2 > 0.25 && bs.jawOpen < 0.15,
    meme: '/memes/doge.svg', category: '经典',
  },
  {
    id: 'poker-face', name: '冷漠/面无表情', type: 'face',
    trigger: (bs) => bs._neutral > 0.9,
    meme: '/memes/capybara.svg', category: '卡皮巴拉',
  },
  {
    id: 'wink', name: '挤眉弄眼/眨眼', type: 'face',
    trigger: (bs) => (bs.eyeBlinkLeft > 0.4 && bs.eyeBlinkRight < 0.1) || (bs.eyeBlinkRight > 0.4 && bs.eyeBlinkLeft < 0.1),
    meme: '/memes/panda-wink.svg', category: '熊猫头',
  },
  {
    id: 'pout', name: '嘟嘴', type: 'face',
    trigger: (bs) => bs.mouthPucker > 0.35,
    meme: '/memes/mooncat-smell.svg', category: '月薪喵',
  },
  {
    id: 'eyes-closed', name: '崩溃/闭眼', type: 'face',
    trigger: (bs) => (bs.eyeBlinkLeft + bs.eyeBlinkRight) / 2 > 0.5,
    meme: '/memes/smile-crash-cat.svg', category: '猫Meme',
  },
];

export const DEFAULT_MEME = {
  id: 'default', name: '等待动作...', type: 'none',
  trigger: () => true,
  meme: '/memes/default-waiting.svg', category: '系统',
};
