// 모든 처리는 브라우저 안에서만 이뤄집니다. 영상은 서버로 전송되지 않습니다.

const uploadArea = document.getElementById("uploadArea");
const videoInput = document.getElementById("videoInput");
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

const startRange = document.getElementById("startRange");
const endRange = document.getElementById("endRange");
const startLabel = document.getElementById("startLabel");
const endLabel = document.getElementById("endLabel");

const widthSelect = document.getElementById("widthSelect");
const fpsSelect = document.getElementById("fpsSelect");

const convertBtn = document.getElementById("convertBtn");
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");

const result = document.getElementById("result");
const resultImg = document.getElementById("resultImg");
const downloadLink = document.getElementById("downloadLink");
const resetBtn = document.getElementById("resetBtn");

const MAX_CLIP_SECONDS = 10;
let currentObjectUrl = null;

videoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  loadVideo(file);
});

// 드래그앤드롭 지원
["dragover", "drop"].forEach((evt) =>
  uploadArea.addEventListener(evt, (e) => e.preventDefault())
);
uploadArea.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) loadVideo(file);
});

function loadVideo(file) {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = URL.createObjectURL(file);
  preview.src = currentObjectUrl;

  preview.onloadedmetadata = () => {
    const duration = preview.duration;
    startRange.max = duration;
    endRange.max = duration;
    startRange.value = 0;
    endRange.value = Math.min(duration, MAX_CLIP_SECONDS);
    updateLabels();

    uploadArea.hidden = true;
    editor.hidden = false;
    result.hidden = true;
  };
}

function updateLabels() {
  startLabel.textContent = `${parseFloat(startRange.value).toFixed(1)}s`;
  endLabel.textContent = `${parseFloat(endRange.value).toFixed(1)}s`;
}

startRange.addEventListener("input", () => {
  if (parseFloat(startRange.value) >= parseFloat(endRange.value)) {
    startRange.value = Math.max(0, parseFloat(endRange.value) - 0.1);
  }
  updateLabels();
  preview.currentTime = parseFloat(startRange.value);
});

endRange.addEventListener("input", () => {
  if (parseFloat(endRange.value) <= parseFloat(startRange.value)) {
    endRange.value = parseFloat(startRange.value) + 0.1;
  }
  updateLabels();
  preview.currentTime = parseFloat(endRange.value);
});

resetBtn.addEventListener("click", () => {
  uploadArea.hidden = false;
  editor.hidden = true;
  result.hidden = true;
  videoInput.value = "";
});

convertBtn.addEventListener("click", async () => {
  const start = parseFloat(startRange.value);
  const end = parseFloat(endRange.value);
  const fps = parseInt(fpsSelect.value, 10);
  const targetWidth = parseInt(widthSelect.value, 10);

  if (end - start <= 0) {
    alert("구간 길이가 0보다 커야 해요.");
    return;
  }
  if (end - start > MAX_CLIP_SECONDS + 0.5) {
    alert(`구간은 최대 ${MAX_CLIP_SECONDS}초까지만 지원해요.`);
    return;
  }

  convertBtn.disabled = true;
  progressWrap.hidden = false;
  result.hidden = true;
  setProgress(0, "프레임 추출 중...");

  try {
    const blob = await convertToGif(preview, start, end, fps, targetWidth);
    const url = URL.createObjectURL(blob);
    resultImg.src = url;
    downloadLink.href = url;
    progressWrap.hidden = true;
    result.hidden = false;
  } catch (err) {
    console.error(err);
    alert("변환 중 문제가 발생했어요. 다른 영상으로 시도해보세요.");
    progressWrap.hidden = true;
  } finally {
    convertBtn.disabled = false;
  }
});

function setProgress(ratio, label) {
  const pct = Math.round(ratio * 100);
  progressBar.value = pct;
  progressLabel.textContent = label || `${pct}%`;
}

function seekTo(video, time) {
  return new Promise((resolve) => {
    function onSeeked() {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    }
    video.addEventListener("seeked", onSeeked);
    video.currentTime = time;
  });
}

async function convertToGif(video, start, end, fps, targetWidth) {
  const aspect = video.videoHeight / video.videoWidth;
  const width = targetWidth;
  const height = Math.round(targetWidth * aspect);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const gif = new GIF({
    workers: 2,
    quality: 10,
    width,
    height,
    workerScript: "assets/js/gif.worker.js",
  });

  const frameDelayMs = Math.round(1000 / fps);
  const totalFrames = Math.max(1, Math.round((end - start) * fps));

  for (let i = 0; i < totalFrames; i++) {
    const t = start + i / fps;
    await seekTo(video, Math.min(t, end));
    ctx.drawImage(video, 0, 0, width, height);
    gif.addFrame(ctx, { copy: true, delay: frameDelayMs });
    setProgress((i / totalFrames) * 0.6, `프레임 추출 중... (${i + 1}/${totalFrames})`);
  }

  return new Promise((resolve, reject) => {
    gif.on("progress", (p) => {
      setProgress(0.6 + p * 0.4, `GIF 인코딩 중... ${Math.round(p * 100)}%`);
    });
    gif.on("finished", (blob) => resolve(blob));
    try {
      gif.render();
    } catch (e) {
      reject(e);
    }
  });
}
