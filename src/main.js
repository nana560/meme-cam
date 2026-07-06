// Main entry point: wires all modules together
import { startCamera, stopCamera } from './camera.js';
import { initDetectors, detectPose, detectFace, closeDetectors } from './detector.js';
import { detectGestures, resetGestureStates } from './gesture.js';
import { matchMeme } from './meme-matcher.js';
import { initDisplay, updateSkeletonOverlay, updateMemeDisplay, downloadMeme } from './meme-display.js';

let running = false;
let animFrameId = null;
let statusEl = null;
let loadingEl = null;
let loadingTextEl = null;
let videoEl = null;

async function main() {
  statusEl = document.getElementById('status-text');
  loadingEl = document.getElementById('loading');
  loadingTextEl = document.getElementById('loading-text');
  const downloadBtn = document.getElementById('download-btn');

  try {
    updateLoading('正在启动摄像头...');
    videoEl = await startCamera();

    updateLoading('正在加载AI模型 (约20MB)...');
    await initDetectors();
    initDisplay();

    hideLoading();
    setStatus('就绪 - 试试做动作吧！');
    downloadBtn.addEventListener('click', downloadMeme);

    running = true;
    detectionLoop(videoEl);
  } catch (err) {
    console.error('Initialization error:', err);
    showError(err.message || '初始化失败，请刷新页面重试');
    setStatus(err.message, true);
  }
}

function hideLoading() {
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    loadingEl.style.transition = 'opacity 0.3s';
    setTimeout(() => { loadingEl.style.display = 'none'; }, 300);
  }
}

function showError(msg) {
  if (loadingEl && loadingTextEl) {
    loadingTextEl.textContent = msg;
    loadingTextEl.style.color = '#ff6b6b';
    const existing = loadingEl.querySelector('.retry-btn');
    if (!existing) {
      const btn = document.createElement('button');
      btn.className = 'retry-btn';
      btn.textContent = '重新加载';
      btn.style.cssText = 'margin-top:20px;padding:10px 28px;border:none;border-radius:24px;'
        + 'background:#00ff88;color:#000;font-size:14px;font-weight:600;cursor:pointer;';
      btn.addEventListener('click', () => window.location.reload());
      loadingEl.appendChild(btn);
    }
  }
}

function updateLoading(msg, isError = false) {
  if (loadingTextEl) {
    loadingTextEl.textContent = msg;
    loadingTextEl.style.color = isError ? '#ff6b6b' : '#aaa';
  }
  setStatus(msg, isError);
}

function detectionLoop(videoEl) {
  if (!running) return;

  const timestamp = performance.now();
  const poseLandmarks = detectPose(videoEl, timestamp);
  const faceData = detectFace(videoEl, timestamp);

  updateSkeletonOverlay(poseLandmarks, faceData, videoEl);

  const detectedIds = detectGestures(poseLandmarks, faceData);
  const matchedMeme = matchMeme(detectedIds);
  updateMemeDisplay(matchedMeme);

  animFrameId = requestAnimationFrame(() => detectionLoop(videoEl));
}

function setStatus(msg, isError = false) {
  if (statusEl) {
    statusEl.textContent = msg;
    statusEl.style.color = isError ? '#ff6b6b' : '#aaa';
  }
}

// --- Page lifecycle ---

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    running = false;
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  } else if (videoEl && videoEl.readyState >= 2) {
    running = true;
    resetGestureStates();
    detectionLoop(videoEl);
  }
});

// Clean shutdown
function cleanup() {
  running = false;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  stopCamera();
  closeDetectors();
  resetGestureStates();
}

window.addEventListener('beforeunload', cleanup);

// Start
main();
