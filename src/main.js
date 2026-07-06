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

async function main() {
  statusEl = document.getElementById('status-text');
  loadingEl = document.getElementById('loading');
  loadingTextEl = document.getElementById('loading-text');
  const downloadBtn = document.getElementById('download-btn');

  try {
    updateLoading('正在启动摄像头...');
    const videoEl = await startCamera();

    updateLoading('正在下载AI姿态模型 (约5MB)...');
    await initDetectors();
    initDisplay();

    updateLoading('就绪！');
    setStatus('就绪 - 试试做动作吧！');
    if (loadingEl) {
      loadingEl.style.opacity = '0';
      loadingEl.style.transition = 'opacity 0.3s';
      setTimeout(() => { loadingEl.style.display = 'none'; }, 300);
    }

    downloadBtn.addEventListener('click', downloadMeme);
    running = true;
    detectionLoop(videoEl);
  } catch (err) {
    updateLoading('初始化失败', true);
    setStatus(err.message, true);
    setTimeout(() => { if (loadingEl) loadingEl.style.display = 'none'; }, 3000);
    console.error('Initialization error:', err);
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
  const faceLandmarks = detectFace(videoEl, timestamp);

  updateSkeletonOverlay(poseLandmarks, faceLandmarks, videoEl);

  const detectedIds = detectGestures(poseLandmarks, faceLandmarks);
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
