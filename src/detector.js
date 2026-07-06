import { PoseLandmarker, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_BASE = '/wasm';
const POSE_MODEL = '/models/pose_landmarker_lite.task';
const FACE_MODEL = '/models/face_landmarker.task';

let poseLandmarker = null;
let faceLandmarker = null;
let vision = null;

async function initSingle(modelPath, delegate, createFn) {
  try {
    return await createFn(modelPath, delegate);
  } catch (e) {
    if (delegate === 'GPU') {
      console.warn(`GPU failed, falling back to CPU:`, e.message);
      return await createFn(modelPath, 'CPU');
    }
    throw e;
  }
}

export async function initDetectors() {
  console.log('Loading WASM from', WASM_BASE);
  vision = await FilesetResolver.forVisionTasks(WASM_BASE);
  console.log('WASM loaded, creating detectors...');

  [poseLandmarker, faceLandmarker] = await Promise.all([
    initSingle(POSE_MODEL, 'GPU', (path, delegate) =>
      PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: path, delegate },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })
    ),
    initSingle(FACE_MODEL, 'GPU', (path, delegate) =>
      FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: path, delegate },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false,
      })
    ),
  ]);

  console.log('Detectors ready');
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
    return {
      landmarks: result.faceLandmarks[0],
      blendshapes: result.faceBlendshapes ? result.faceBlendshapes[0] : null,
    };
  }
  return null;
}

export function closeDetectors() {
  if (poseLandmarker) { poseLandmarker.close(); poseLandmarker = null; }
  if (faceLandmarker) { faceLandmarker.close(); faceLandmarker = null; }
}
