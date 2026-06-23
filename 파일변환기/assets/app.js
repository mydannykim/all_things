import * as pdfjsLib from './js/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./js/pdf.worker.min.mjs', import.meta.url).href;

const { PDFDocument } = window.PDFLib;

// ── 탭 전환 ──────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── 드래그앤드롭 공통 ─────────────────────────────────────────────────────────
function enableDrop(dropEl, inputEl, onFiles) {
  dropEl.addEventListener('dragover', e => { e.preventDefault(); dropEl.classList.add('drag-over'); });
  dropEl.addEventListener('dragleave', () => dropEl.classList.remove('drag-over'));
  dropEl.addEventListener('drop', e => {
    e.preventDefault();
    dropEl.classList.remove('drag-over');
    onFiles([...e.dataTransfer.files]);
  });
  inputEl.addEventListener('change', () => onFiles([...inputEl.files]));
}

function setProgress(barId, pctId, wrapId, val) {
  document.getElementById(barId).value = val;
  document.getElementById(pctId).textContent = val + '%';
  if (wrapId) document.getElementById(wrapId).hidden = val <= 0 || val > 100;
}

function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return url;
}

// ── 1. 이미지 → PDF ───────────────────────────────────────────────────────────
let img2pdfFiles = [];

enableDrop(
  document.getElementById('img2pdf-drop'),
  document.getElementById('img2pdf-input'),
  files => {
    img2pdfFiles = files.filter(f => f.type === 'image/jpeg' || f.type === 'image/png');
    const list = document.getElementById('img2pdf-list');
    list.innerHTML = img2pdfFiles.map(f => `<li><span>${f.name}</span><span>${(f.size/1024).toFixed(0)} KB</span></li>`).join('');
    document.getElementById('img2pdf-btn').disabled = img2pdfFiles.length === 0;
    document.getElementById('img2pdf-result').hidden = true;
  }
);

document.getElementById('img2pdf-btn').addEventListener('click', async () => {
  const btn = document.getElementById('img2pdf-btn');
  btn.disabled = true;
  document.getElementById('img2pdf-progress').hidden = false;

  try {
    const pdfDoc = await PDFDocument.create();
    for (let i = 0; i < img2pdfFiles.length; i++) {
      setProgress('img2pdf-bar', 'img2pdf-pct', null, Math.round((i / img2pdfFiles.length) * 90));
      const bytes = await img2pdfFiles[i].arrayBuffer();
      const image = img2pdfFiles[i].type === 'image/jpeg'
        ? await pdfDoc.embedJpg(bytes)
        : await pdfDoc.embedPng(bytes);
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    setProgress('img2pdf-bar', 'img2pdf-pct', null, 95);
    const pdfBytes = await pdfDoc.save();
    setProgress('img2pdf-bar', 'img2pdf-pct', null, 100);

    const url = downloadBytes(pdfBytes, 'images.pdf');
    const link = document.getElementById('img2pdf-link');
    link.href = url;
    document.getElementById('img2pdf-result').hidden = false;
  } catch (e) {
    alert('변환 중 오류가 발생했습니다: ' + e.message);
  } finally {
    btn.disabled = false;
  }
});

// ── 2. PDF → 이미지 ───────────────────────────────────────────────────────────
let pdf2imgFile = null;

enableDrop(
  document.getElementById('pdf2img-drop'),
  document.getElementById('pdf2img-input'),
  files => {
    pdf2imgFile = files.find(f => f.type === 'application/pdf') || null;
    document.getElementById('pdf2img-name').textContent = pdf2imgFile ? pdf2imgFile.name : '';
    document.getElementById('pdf2img-btn').disabled = !pdf2imgFile;
    document.getElementById('pdf2img-result').hidden = true;
    document.getElementById('pdf2img-result').innerHTML = '';
  }
);

document.getElementById('pdf2img-btn').addEventListener('click', async () => {
  const btn = document.getElementById('pdf2img-btn');
  btn.disabled = true;
  document.getElementById('pdf2img-progress').hidden = false;

  try {
    const scale = parseFloat(document.getElementById('pdf2img-scale').value);
    const bytes = await pdf2imgFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise;
    const total = pdf.numPages;

    const resultEl = document.getElementById('pdf2img-result');
    resultEl.innerHTML = '<div class="img-grid" id="pdf2img-grid"></div><div class="multi-links" id="pdf2img-links"></div>';
    resultEl.hidden = false;
    const grid = document.getElementById('pdf2img-grid');
    const links = document.getElementById('pdf2img-links');

    for (let i = 1; i <= total; i++) {
      setProgress('pdf2img-bar', 'pdf2img-pct', null, Math.round(((i - 1) / total) * 100));
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

      const dataUrl = canvas.toDataURL('image/png');
      const filename = `page-${String(i).padStart(3, '0')}.png`;

      grid.insertAdjacentHTML('beforeend', `
        <a href="${dataUrl}" download="${filename}">
          <img src="${dataUrl}" alt="페이지 ${i}" />
          <span>페이지 ${i}</span>
        </a>
      `);
      links.insertAdjacentHTML('beforeend', `<a class="download-btn" href="${dataUrl}" download="${filename}">페이지 ${i} 다운로드</a>`);
    }

    setProgress('pdf2img-bar', 'pdf2img-pct', null, 100);
  } catch (e) {
    alert('변환 중 오류가 발생했습니다: ' + e.message);
  } finally {
    btn.disabled = false;
  }
});

// ── 3. PDF 합치기 ─────────────────────────────────────────────────────────────
let mergeFiles = [];

enableDrop(
  document.getElementById('merge-drop'),
  document.getElementById('merge-input'),
  files => {
    mergeFiles = files.filter(f => f.type === 'application/pdf');
    const list = document.getElementById('merge-list');
    list.innerHTML = mergeFiles.map(f => `<li><span>${f.name}</span><span>${(f.size/1024).toFixed(0)} KB</span></li>`).join('');
    document.getElementById('merge-btn').disabled = mergeFiles.length < 2;
    document.getElementById('merge-result').hidden = true;
  }
);

document.getElementById('merge-btn').addEventListener('click', async () => {
  const btn = document.getElementById('merge-btn');
  btn.disabled = true;
  document.getElementById('merge-progress').hidden = false;

  try {
    const merged = await PDFDocument.create();
    for (let i = 0; i < mergeFiles.length; i++) {
      setProgress('merge-bar', 'merge-pct', null, Math.round((i / mergeFiles.length) * 90));
      const bytes = await mergeFiles[i].arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }

    setProgress('merge-bar', 'merge-pct', null, 95);
    const pdfBytes = await merged.save();
    setProgress('merge-bar', 'merge-pct', null, 100);

    const url = downloadBytes(pdfBytes, 'merged.pdf');
    const link = document.getElementById('merge-link');
    link.href = url;
    document.getElementById('merge-result').hidden = false;
  } catch (e) {
    alert('합치기 중 오류가 발생했습니다: ' + e.message);
  } finally {
    btn.disabled = false;
  }
});

// ── 4. PDF 분할 ───────────────────────────────────────────────────────────────
let splitFile = null;
let splitPageCount = 0;

enableDrop(
  document.getElementById('split-drop'),
  document.getElementById('split-input'),
  async files => {
    splitFile = files.find(f => f.type === 'application/pdf') || null;
    if (!splitFile) return;

    document.getElementById('split-name').textContent = splitFile.name;
    try {
      const bytes = await splitFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      splitPageCount = pdf.getPageCount();
      document.getElementById('split-page-info').textContent = `총 ${splitPageCount}페이지`;
      document.getElementById('split-options').hidden = false;
      document.getElementById('split-btn').disabled = false;
      document.getElementById('split-result').hidden = true;
      document.getElementById('split-result').innerHTML = '';
    } catch (e) {
      alert('PDF를 읽는 중 오류가 발생했습니다: ' + e.message);
    }
  }
);

function parseRanges(input, maxPage) {
  const parts = input.split(',').map(s => s.trim()).filter(Boolean);
  const ranges = [];
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      if (isNaN(a) || isNaN(b) || a < 1 || b > maxPage || a > b) return null;
      ranges.push([a, b]);
    } else {
      const n = Number(part);
      if (isNaN(n) || n < 1 || n > maxPage) return null;
      ranges.push([n, n]);
    }
  }
  return ranges.length ? ranges : null;
}

document.getElementById('split-btn').addEventListener('click', async () => {
  const btn = document.getElementById('split-btn');
  const rangeInput = document.getElementById('split-range').value.trim();
  const ranges = parseRanges(rangeInput, splitPageCount);

  if (!ranges) {
    alert(`올바른 형식으로 입력하세요. 예: 1-3, 5, 7-9\n(페이지 범위: 1 ~ ${splitPageCount})`);
    return;
  }

  btn.disabled = true;
  document.getElementById('split-progress').hidden = false;

  try {
    const bytes = await splitFile.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const resultEl = document.getElementById('split-result');
    resultEl.innerHTML = '<div class="multi-links" id="split-links"></div>';
    resultEl.hidden = false;
    const linksEl = document.getElementById('split-links');

    for (let i = 0; i < ranges.length; i++) {
      setProgress('split-bar', 'split-pct', null, Math.round((i / ranges.length) * 100));
      const [start, end] = ranges[i];
      const newDoc = await PDFDocument.create();
      const indices = Array.from({ length: end - start + 1 }, (_, k) => start - 1 + k);
      const pages = await newDoc.copyPages(src, indices);
      pages.forEach(p => newDoc.addPage(p));
      const pdfBytes = await newDoc.save();

      const filename = ranges.length === 1
        ? `split_p${start}-p${end}.pdf`
        : `split_${i + 1}_p${start}-p${end}.pdf`;
      const url = downloadBytes(pdfBytes, filename);
      linksEl.insertAdjacentHTML('beforeend', `<a class="download-btn" href="${url}" download="${filename}">p${start}~p${end} 다운로드</a>`);
    }

    setProgress('split-bar', 'split-pct', null, 100);
  } catch (e) {
    alert('분할 중 오류가 발생했습니다: ' + e.message);
  } finally {
    btn.disabled = false;
  }
});
