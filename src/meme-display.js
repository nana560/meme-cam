// Meme display module: renders UI, skeleton overlay, and download functionality
import { MEME_MAP, DEFAULT_MEME } from './config.js';

let canvasCtx = null;
let lastSkeletonPose = null;

export function initDisplay() {
  const canvas = document.getElementById('overlay-canvas');
  canvasCtx = canvas.getContext('2d');
}

export function updateSkeletonOverlay(poseLandmarks, faceLandmarks, videoEl) {
  if (!canvasCtx) return;
  const canvas = canvasCtx.canvas;
  canvas.width = videoEl.videoWidth || 640;
  canvas.height = videoEl.videoHeight || 480;
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  if (poseLandmarks) {
    lastSkeletonPose = poseLandmarks;
    drawPoseSkeleton(poseLandmarks);
  }
  if (faceLandmarks) {
    drawFaceMesh(faceLandmarks);
  }
}

function drawPoseSkeleton(landmarks) {
  const ctx = canvasCtx;
  const w = ctx.canvas.width, h = ctx.canvas.height;

  // Connections for skeleton
  const connections = [
    [11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],
    [0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],[9,10],
  ];

  ctx.strokeStyle = 'rgba(0, 255, 136, 0.7)';
  ctx.lineWidth = 2;
  for (const [a, b] of connections) {
    const pA = landmarks[a], pB = landmarks[b];
    if (pA.visibility > 0.5 && pB.visibility > 0.5) {
      ctx.beginPath();
      ctx.moveTo(pA.x * w, pA.y * h);
      ctx.lineTo(pB.x * w, pB.y * h);
      ctx.stroke();
    }
  }

  // Draw keypoints
  ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
  for (const p of landmarks) {
    if (p.visibility > 0.5) {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawFaceMesh(landmarks) {
  const ctx = canvasCtx;
  const w = ctx.canvas.width, h = ctx.canvas.height;

  // Draw eye and mouth contours lightly
  ctx.strokeStyle = 'rgba(255, 100, 180, 0.5)';
  ctx.lineWidth = 1;

  // Left eye
  const lePoints = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
  drawContour(lePoints, landmarks, w, h);

  // Right eye
  const rePoints = [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382];
  drawContour(rePoints, landmarks, w, h);

  // Lips
  const lipPoints = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
  drawContour(lipPoints, landmarks, w, h);
}

function drawContour(indices, landmarks, w, h) {
  const ctx = canvasCtx;
  ctx.beginPath();
  const first = landmarks[indices[0]];
  ctx.moveTo(first.x * w, first.y * h);
  for (let i = 1; i < indices.length; i++) {
    const p = landmarks[indices[i]];
    ctx.lineTo(p.x * w, p.y * h);
  }
  ctx.closePath();
  ctx.stroke();
}

export function updateMemeDisplay(matchedMeme) {
  const imgEl = document.getElementById('meme-image');
  const nameEl = document.getElementById('meme-name');
  const categoryEl = document.getElementById('meme-category');

  if (!imgEl || !nameEl) return;

  const meme = matchedMeme || DEFAULT_MEME;
  imgEl.src = meme.meme;
  imgEl.alt = meme.name;
  nameEl.textContent = meme.name;
  if (categoryEl) categoryEl.textContent = meme.category;
}

export function downloadMeme() {
  const imgEl = document.getElementById('meme-image');
  if (!imgEl || !imgEl.src) return;

  // Create a composite image: meme + watermark
  const canvas = document.createElement('canvas');
  canvas.width = imgEl.naturalWidth || 400;
  canvas.height = imgEl.naturalHeight || 400;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

  // Add watermark
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '14px sans-serif';
  ctx.fillText('MemeCam', 10, canvas.height - 10);

  const link = document.createElement('a');
  link.download = `meme-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
