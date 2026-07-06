// Gesture recognition: analyzes landmarks to identify body gestures and facial expressions
import { MEME_MAP } from './config.js';

// Per-entry state for gesture detection
const gestureStates = new Map();

function getState(entryId) {
  if (!gestureStates.has(entryId)) gestureStates.set(entryId, {});
  return gestureStates.get(entryId);
}

// Normalize pose landmarks to relative coordinates for scale/position invariance
function normalizePose(landmarks) {
  if (!landmarks) return null;
  const ls = landmarks[11], rs = landmarks[12];
  const lh = landmarks[23], rh = landmarks[24];
  const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const midHip = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
  const scale = Math.hypot(midShoulder.x - midHip.x, midShoulder.y - midHip.y) || 0.3;

  return landmarks.map(l => ({
    x: (l.x - midShoulder.x) / scale,
    y: (l.y - midShoulder.y) / scale,
    z: l.z / scale,
    visibility: l.visibility || 0,
  }));
}

let prevPose = null;

export function detectGestures(poseLandmarks, faceLandmarks) {
  const results = [];

  // Body gesture detection
  if (poseLandmarks) {
    const kp = normalizePose(poseLandmarks);
    if (kp) {
      for (const entry of MEME_MAP) {
        if (entry.type !== 'pose') continue;
        const state = getState(entry.id);
        if (entry.trigger(kp, prevPose, state)) {
          results.push(entry.id);
        }
      }
      prevPose = kp;
    }
  } else {
    prevPose = null;
  }

  // Facial expression detection
  if (faceLandmarks) {
    const fm = faceLandmarks;
    for (const entry of MEME_MAP) {
      if (entry.type !== 'face') continue;
      if (entry.trigger(fm)) {
        results.push(entry.id);
      }
    }
  }

  return results;
}

export function resetGestureStates() {
  gestureStates.clear();
  prevPose = null;
}
