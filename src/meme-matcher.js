// Meme matcher: matches detected gestures to meme config with debounce
import { MEME_MAP, DEFAULT_MEME } from './config.js';

const DEBOUNCE_MS = 1500;
let currentMemeId = null;
let pendingMemeId = null;
let pendingTimer = null;
let memeStartTime = 0;

export function matchMeme(detectedIds) {
  // Priority: return the first matched meme from config order
  let matchedId = null;
  if (detectedIds.length > 0) {
    for (const entry of MEME_MAP) {
      if (detectedIds.includes(entry.id)) {
        matchedId = entry.id;
        break;
      }
    }
  }

  // Debounce: same gesture must persist for DEBOUNCE_MS before switching
  if (matchedId !== currentMemeId) {
    if (matchedId !== pendingMemeId) {
      clearTimeout(pendingTimer);
      pendingMemeId = matchedId;
      pendingTimer = setTimeout(() => {
        currentMemeId = pendingMemeId;
        memeStartTime = Date.now();
        pendingMemeId = null;
      }, DEBOUNCE_MS);
    }
  } else {
    clearTimeout(pendingTimer);
    pendingMemeId = null;
  }

  // Return current stable meme
  if (currentMemeId) {
    const entry = MEME_MAP.find(e => e.id === currentMemeId);
    return entry || DEFAULT_MEME;
  }
  return DEFAULT_MEME;
}

export function getCurrentMemeId() {
  return currentMemeId;
}
