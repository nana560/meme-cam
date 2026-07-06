// Camera module: manages webcam stream and video element
let stream = null;
let videoEl = null;

export async function startCamera() {
  videoEl = document.getElementById('camera-video');
  if (!videoEl) throw new Error('Video element not found');

  const constraints = {
    video: {
      facingMode: 'user',
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
    audio: false,
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoEl.srcObject = stream;
    await videoEl.play();
    return videoEl;
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('摄像头权限被拒绝，请在浏览器设置中允许摄像头访问');
    } else if (err.name === 'NotFoundError') {
      throw new Error('未检测到摄像头设备');
    }
    throw new Error(`摄像头启动失败: ${err.message}`);
  }
}

export function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  if (videoEl) {
    videoEl.srcObject = null;
  }
}

export function getVideoElement() {
  return videoEl;
}
