import { PoseLandmarker, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';
const POSE_MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker/float16/latest/pose_landmarker.task';
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

let poseLandmarker = null;
let faceLandmarker = null;
let vision = null;

async function createLandmarker(Cls, modelPath, delegate) {
  try {
    return await Cls.createFromOptions(vision, {
      baseOptions: { modelAssetPath: modelPath, delegate },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  } catch (e) {
    if (delegate === 'GPU') {
      console.warn(`GPU failed for ${Cls.name}, falling back to CPU:`, e.message);
      return await Cls.createFromOptions(vision, {
        baseOptions: { modelAssetPath: modelPath, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    }
    throw e;
  }
}

async function createFaceLandmarker(modelPath, delegate) {
  try {
    return await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: modelPath, delegate },
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputFaceBlendshapes: false,
    });
  } catch (e) {
    if (delegate === 'GPU') {
      console.warn(`GPU failed for FaceLandmarker, falling back to CPU:`, e.message);
      return await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: modelPath, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: false,
      });
    }
    throw e;
  }
}

export async function initDetectors() {
  vision = await FilesetResolver.forVisionTasks(WASM_BASE);

  [poseLandmarker, faceLandmarker] = await Promise.all([
    createLandmarker(PoseLandmarker, POSE_MODEL, 'GPU'),
    createFaceLandmarker(FACE_MODEL, 'GPU'),
  ]);

  return { poseLandmarker, faceLandmarker };
}

export function detectPose(videoEl, timestamp) {
  if (!poseLandmarker) return null;
  const result = poseLandmarker.detectForVideo(videoEl, timestamp);
  if (result.landmarks && result.landmarks.length > 0) {
    return result.landmarks[0];
  }
  return null;
}

export function detectFace(videoEl, timestamp) {
  if (!faceLandmarker) return null;
  const result = faceLandmarker.detectForVideo(videoEl, timestamp);
  if (result.faceLandmarks && result.faceLandmarks.length > 0) {
    return result.faceLandmarks[0];
  }
  return null;
}

export function closeDetectors() {
  if (poseLandmarker) { poseLandmarker.close(); poseLandmarker = null; }
  if (faceLandmarker) { faceLandmarker.close(); faceLandmarker = null; }
}
