/* ============================================================
   editor.js — Rivora Image Editor
   
   FIXES:
   - Works in both Challenge mode and Free Create mode
   - Free Create: no challenge prompt, saves directly
   - Better error messages
   - All links use ./ prefix
   ============================================================ */

var ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
var ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

var state = {
  brightness: 0, contrast: 0, saturation: 0,
  blur: 0, rotation: 0, flipX: false, flipY: false
};

var history = [];
var historyIndex = -1;
var MAX_HISTORY = 30;
var sourceImage = null;
var canvas, ctx;
var currentChallengeId = '';

function initEditor() {
  canvas = document.getElementById('editor-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  var params = new URLSearchParams(window.location.search);
  currentChallengeId = params.get('challenge') || '';

  if (currentChallengeId && typeof getChallengeById === 'function') {
    var challenge = getChallengeById(currentChallengeId);
    if (challenge) showChallengePrompt(challenge);
  }

  setupFileUpload();
  setupSliders();
  setupToolButtons();
  setupActionButtons();
  pushHistory();
  maybeShowEditorTooltip();
}

function validateImageFile(file) {
  if (ALLOWED_MIME_TYPES.indexOf(file.type) === -1) {
    return 'That file type isn\'t supported. Please use JPG, PNG, WebP, or GIF.';
  }
  var ext = file.name.split('.').pop().toLowerCase();
  if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
    return 'Please choose an image file (JPG, PNG, WebP, or GIF).';
  }
  if (file.size > 20 * 1024 * 1024) {
    return 'That image is too large (max 20MB). Try a smaller photo!';
  }
  return null;
}

function setupFileUpload() {
  var input = document.getElementById('file-input');
  var dropZone = document.getElementById('canvas-container');

  if (input) {
    input.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var error = validateImageFile(file);
      if (error) { showToast(error); input.value = ''; return; }
      loadImageFile(file);
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', function(e) {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', function() {
      dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', function(e) {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      var file = e.dataTransfer.files[0];
      if (!file) return;
      var error = validateImageFile(file);
      if (error) { showToast(error); return; }
      loadImageFile(file);
    });
  }
}

function loadImageFile(file) {
  showToast('Loading your image... 🖼', 1500);
  var reader = new FileReader();

  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      sourceImage = img;
      var maxW = 1200;
      var scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      var desc = document.getElementById('canvas-desc');
      if (desc) desc.textContent = 'Editing: ' + file.name;

      var prompt = document.getElementById('upload-prompt');
      if (prompt) prompt.style.display = 'none';
      canvas.style.display = 'block';

      enableControls();
      redraw();
      pushHistory();

      if (typeof setPixelMessage === 'function') {
        setPixelMessage('Looking good! Try the sliders to see what happens. 🎨');
      }
    };
    img.onerror = function() { showToast('Couldn\'t load that image. Try a different one!'); };
    img.src = e.target.result;
  };
  reader.onerror = function() { showToast('Couldn\'t read that file. Try again!'); };
  reader.readAsDataURL(file);
}

function redraw() {
  if (!sourceImage) return;
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(state.rotation * Math.PI / 180);
  ctx.scale(state.flipX ? -1 : 1, state.flipY ? -1 : 1);
  ctx.drawImage(sourceImage, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
  ctx.restore();
  applyCanvasFilters();
}

function applyCanvasFilters() {
  canvas.style.filter =
    'brightness(' + (1 + state.brightness / 100) + ') ' +
    'contrast(' + (1 + state.contrast / 100) + ') ' +
    'saturate(' + Math.max(0, 1 + state.saturation / 100) + ') ' +
    'blur(' + state.blur + 'px)';
}

function setupSliders() {
  var sliders = [
    { id: 'slider-brightness', prop: 'brightness', vid: 'val-brightness' },
    { id: 'slider-contrast', prop: 'contrast', vid: 'val-contrast' },
    { id: 'slider-saturation', prop: 'saturation', vid: 'val-saturation' },
    { id: 'slider-blur', prop: 'blur', vid: 'val-blur' }
  ];
  sliders.forEach(function(s) {
    var el = document.getElementById(s.id);
    var vEl = document.getElementById(s.vid);
    if (!el) return;
    el.addEventListener('input', function() {
      var val = parseFloat(el.value);
      state[s.prop] = val;
      if (vEl) vEl.textContent = val;
      el.setAttribute('aria-valuenow', val);
      redraw();
    });
    el.addEventListener('change', pushHistory);
  });
}

function setupToolButtons() {
  var rl = document.getElementById('btn-rotate-left');
  var rr = document.getElementById('btn-rotate-right');
  var fh = document.getElementById('btn-flip-h');
  var fv = document.getElementById('btn-flip-v');
  var rs = document.getElementById('btn-reset');

  if (rl) rl.addEventListener('click', function() { state.rotation = (state.rotation - 90 + 360) % 360; redraw(); pushHistory(); });
  if (rr) rr.addEventListener('click', function() { state.rotation = (state.rotation + 90) % 360; redraw(); pushHistory(); });
  if (fh) fh.addEventListener('click', function() { state.flipX = !state.flipX; redraw(); pushHistory(); });
  if (fv) fv.addEventListener('click', function() { state.flipY = !state.flipY; redraw(); pushHistory(); });
  if (rs) rs.addEventListener('click', function() { resetState(); syncSliders(); redraw(); pushHistory(); showToast('Reset! ✨'); });
}

function setupActionButtons() {
  var undo = document.getElementById('btn-undo');
  var redo = document.getElementById('btn-redo');
  var save = document.getElementById('btn-save');

  if (undo) undo.addEventListener('click', doUndo);
  if (redo) redo.addEventListener('click', doRedo);
  if (save) save.addEventListener('click', handleSave);

  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); doUndo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); doRedo(); }
  });
}

function pushHistory() {
  history = history.slice(0, historyIndex + 1);
  history.push(JSON.parse(JSON.stringify(state)));
  if (history.length > MAX_HISTORY) { history.shift(); }
  else { historyIndex++; }
  updateUndoRedo();
}

function doUndo() {
  if (historyIndex <= 0) { showToast('Nothing to undo!'); return; }
  historyIndex--;
  state = JSON.parse(JSON.stringify(history[historyIndex]));
  syncSliders(); redraw(); updateUndoRedo();
}

function doRedo() {
  if (historyIndex >= history.length - 1) { showToast('Nothing to redo!'); return; }
  historyIndex++;
  state = JSON.parse(JSON.stringify(history[historyIndex]));
  syncSliders(); redraw(); updateUndoRedo();
}

function updateUndoRedo() {
  var u = document.getElementById('btn-undo');
  var r = document.getElementById('btn-redo');
  if (u) u.disabled = historyIndex <= 0;
  if (r) r.disabled = historyIndex >= history.length - 1;
}

function handleSave() {
  if (!sourceImage) { showToast('Upload an image first! 🖼'); return; }

  var name = prompt('Give your creation a name!', 'My Creation');
  if (name === null) return;

  var exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  var exportCtx = exportCanvas.getContext('2d');
  exportCtx.filter = canvas.style.filter;
  exportCtx.save();
  exportCtx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
  exportCtx.rotate(state.rotation * Math.PI / 180);
  exportCtx.scale(state.flipX ? -1 : 1, state.flipY ? -1 : 1);
  exportCtx.drawImage(sourceImage, -exportCanvas.width / 2, -exportCanvas.height / 2, exportCanvas.width, exportCanvas.height);
  exportCtx.restore();

  var imageData = exportCanvas.toDataURL('image/png');

  if (typeof saveCreation === 'function') {
    var saved = saveCreation(name, imageData, currentChallengeId);
    if (saved) {
      window.location.href = './completion.html?name=' + encodeURIComponent(name);
    }
  }
}

function resetState() {
  state = { brightness: 0, contrast: 0, saturation: 0, blur: 0, rotation: 0, flipX: false, flipY: false };
}

function syncSliders() {
  var map = [
    { id: 'slider-brightness', prop: 'brightness', vid: 'val-brightness' },
    { id: 'slider-contrast', prop: 'contrast', vid: 'val-contrast' },
    { id: 'slider-saturation', prop: 'saturation', vid: 'val-saturation' },
    { id: 'slider-blur', prop: 'blur', vid: 'val-blur' }
  ];
  map.forEach(function(m) {
    var s = document.getElementById(m.id);
    var v = document.getElementById(m.vid);
    if (s) { s.value = state[m.prop]; s.setAttribute('aria-valuenow', state[m.prop]); }
    if (v) v.textContent = state[m.prop];
  });
}

function enableControls() {
  var p = document.getElementById('controls-panel');
  var a = document.getElementById('editor-actions');
  if (p) { p.style.opacity = '1'; p.style.pointerEvents = 'auto'; }
  if (a) { a.style.opacity = '1'; a.style.pointerEvents = 'auto'; }
}

function showChallengePrompt(challenge) {
  var el = document.getElementById('challenge-prompt');
  if (!el) return;
  el.innerHTML = '<span aria-hidden="true">' + challenge.emoji + '</span>' +
    '<div><strong>' + challenge.title + '</strong>' +
    '<p>' + challenge.description + '</p></div>';
  el.style.display = 'flex';
}

function maybeShowEditorTooltip() {
  var KEY = 'rivora_editor_tooltip_seen';
  try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }

  var overlay = document.createElement('div');
  overlay.id = 'editor-tooltip';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;';

  overlay.innerHTML =
    '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:-1;"></div>' +
    '<div style="background:#fff;border-radius:24px;padding:28px;max-width:380px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.15);animation:slideUp 300ms ease both;">' +
      '<div style="font-size:2.5rem;margin-bottom:10px;">🐰</div>' +
      '<h2 style="font-family:Unbounded,cursive;font-size:1.2rem;margin-bottom:16px;">Welcome to the Editor!</h2>' +
      '<ul style="list-style:none;padding:0;text-align:left;display:flex;flex-direction:column;gap:8px;">' +
        '<li style="background:#eef4ff;padding:8px 12px;border-radius:10px;font-size:0.88rem;">📷 <strong>Upload a photo</strong> to start</li>' +
        '<li style="background:#f0e6ff;padding:8px 12px;border-radius:10px;font-size:0.88rem;">☀️ <strong>Move sliders</strong> to change the look</li>' +
        '<li style="background:#ffe8f0;padding:8px 12px;border-radius:10px;font-size:0.88rem;">↺ <strong>Rotate and flip</strong> your image</li>' +
        '<li style="background:#eef4ff;padding:8px 12px;border-radius:10px;font-size:0.88rem;">↩ <strong>Undo</strong> with Ctrl+Z</li>' +
        '<li style="background:#f0e6ff;padding:8px 12px;border-radius:10px;font-size:0.88rem;">🎉 Hit <strong>Save & Finish</strong> when done!</li>' +
      '</ul>' +
      '<button id="tooltip-dismiss" style="margin-top:18px;width:100%;padding:12px;border:none;border-radius:9999px;background:linear-gradient(135deg,#6ba3ff,#8b5cf6);color:#fff;font-family:Unbounded,cursive;font-size:1rem;font-weight:700;cursor:pointer;">Got it! 🎨</button>' +
    '</div>';

  document.body.appendChild(overlay);

  setTimeout(function() {
    var btn = document.getElementById('tooltip-dismiss');
    if (btn) btn.focus();
  }, 100);

  document.getElementById('tooltip-dismiss').addEventListener('click', function() {
    overlay.remove();
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  });
}

document.addEventListener('DOMContentLoaded', initEditor);