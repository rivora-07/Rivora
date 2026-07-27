/* ============================================================
   editor.js — Rivora Image Editor
   
   VERSION 2 CHANGES:
   - Stricter image validation (MIME type + extension)
   - First-time tooltip overlay (UX improvement)
   - aria-valuenow updates on sliders (accessibility)
   - Canvas described with aria-describedby
   ============================================================ */

/* ---------- Allowed image types ---------- */
/*
   We check BOTH the file extension AND the MIME type.
   A bad actor could rename a .exe file to .jpg.
   Checking the MIME type (set by the browser) is more reliable.
*/
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
]);

const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'
]);

/* ---------- Editor State ---------- */
let state = {
  brightness:  0,
  contrast:    0,
  saturation:  0,
  blur:        0,
  rotation:    0,
  flipX:       false,
  flipY:       false,
};

let history      = [];
let historyIndex = -1;
const MAX_HISTORY = 30;

let sourceImage        = null;
let canvas, ctx;
let currentChallengeId = '';

/* ============================================================
   initEditor
   ============================================================ */
function initEditor() {
  canvas = document.getElementById('editor-canvas');
  ctx    = canvas.getContext('2d');

  /* Wire up accessibility description for the canvas */
  canvas.setAttribute('aria-describedby', 'canvas-desc');

  /* Read URL params */
  const params = new URLSearchParams(window.location.search);
  currentChallengeId = params.get('challenge') || '';

  if (currentChallengeId && typeof getChallengeById === 'function') {
    const challenge = getChallengeById(currentChallengeId);
    if (challenge) showChallengePrompt(challenge);
  }

  setupFileUpload();
  setupSliders();
  setupToolButtons();
  setupActionButtons();
  pushHistory();

  /* Show first-time tooltip if user hasn't seen it */
  maybeShowEditorTooltip();
}

/* ============================================================
   validateImageFile
   
   Checks that a file is a real image before loading it.
   Returns an error message string, or null if valid.
   
   @param {File} file
   @returns {string|null}
   ============================================================ */
function validateImageFile(file) {
  /* Check MIME type */
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return 'That file type isn\'t supported. Please use a JPG, PNG, WebP, or GIF image.';
  }

  /* Check extension */
  const extension = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return 'Please choose an image file (JPG, PNG, WebP, or GIF).';
  }

  /* Check file size — 20MB max */
  const maxBytes = 20 * 1024 * 1024; /* 20MB */
  if (file.size > maxBytes) {
    return 'That image is too large (max 20MB). Try a smaller photo!';
  }

  return null; /* null = no error = valid */
}

/* ============================================================
   setupFileUpload
   ============================================================ */
function setupFileUpload() {
  const input    = document.getElementById('file-input');
  const dropZone = document.getElementById('canvas-container');

  if (input) {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const error = validateImageFile(file);
      if (error) {
        showToast(error);
        input.value = ''; /* clear the input so they can try again */
        return;
      }

      loadImageFile(file);
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');

      const file = e.dataTransfer.files[0];
      if (!file) return;

      const error = validateImageFile(file);
      if (error) {
        showToast(error);
        return;
      }

      loadImageFile(file);
    });
  }
}

/* ============================================================
   loadImageFile
   ============================================================ */
function loadImageFile(file) {
  /* Show a loading indicator */
  showToast('Loading your image... 🖼', 1500);

  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();

    img.onload = () => {
      sourceImage = img;

      const maxWidth = 1200;
      const scale    = Math.min(1, maxWidth / img.width);
      canvas.width   = img.width  * scale;
      canvas.height  = img.height * scale;

      /* Update canvas accessibility description */
      const desc = document.getElementById('canvas-desc');
      if (desc) desc.textContent = `Editing: ${file.name}`;

      const prompt = document.getElementById('upload-prompt');
      if (prompt) prompt.style.display = 'none';
      canvas.style.display = 'block';

      enableControls();
      redraw();
      pushHistory();

      /* Update Pixel's message now that image is loaded */
      if (typeof setPixelMessage === 'function') {
        setPixelMessage('Looking good! Try the sliders to see what happens. 🎨');
      }
    };

    img.onerror = () => {
      showToast('Hmm, that image couldn\'t be loaded. Try a different one!');
    };

    img.src = e.target.result;
  };

  reader.onerror = () => {
    showToast('Couldn\'t read that file. Try again!');
  };

  reader.readAsDataURL(file);
}

/* ============================================================
   redraw
   ============================================================ */
function redraw() {
  if (!sourceImage) return;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Center, rotate, flip */
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((state.rotation * Math.PI) / 180);
  ctx.scale(
    state.flipX ? -1 : 1,
    state.flipY ? -1 : 1
  );

  ctx.drawImage(
    sourceImage,
    -canvas.width  / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );

  ctx.restore();
  applyCanvasFilters();
}

/* ============================================================
   applyCanvasFilters
   ============================================================ */
function applyCanvasFilters() {
  canvas.style.filter = [
    `brightness(${1 + state.brightness / 100})`,
    `contrast(${1 + state.contrast / 100})`,
    `saturate(${Math.max(0, 1 + state.saturation / 100)})`,
    `blur(${state.blur}px)`
  ].join(' ');
}

/* ============================================================
   setupSliders
   ============================================================ */
function setupSliders() {
  const sliders = [
    { id: 'slider-brightness', prop: 'brightness', valueId: 'val-brightness' },
    { id: 'slider-contrast',   prop: 'contrast',   valueId: 'val-contrast'   },
    { id: 'slider-saturation', prop: 'saturation', valueId: 'val-saturation' },
    { id: 'slider-blur',       prop: 'blur',       valueId: 'val-blur'       }
  ];

  sliders.forEach(({ id, prop, valueId }) => {
    const slider  = document.getElementById(id);
    const valueEl = document.getElementById(valueId);

    if (!slider) return;

    slider.addEventListener('input', () => {
      const val    = parseFloat(slider.value);
      state[prop]  = val;

      /* Update display value */
      if (valueEl) valueEl.textContent = val;

      /* Update ARIA value for screen readers */
      slider.setAttribute('aria-valuenow', val);

      redraw();
    });

    slider.addEventListener('change', pushHistory);
  });
}

/* ============================================================
   setupToolButtons
   ============================================================ */
function setupToolButtons() {
  document.getElementById('btn-rotate-left')?.addEventListener('click', () => {
    state.rotation = (state.rotation - 90 + 360) % 360;
    redraw();
    pushHistory();
  });

  document.getElementById('btn-rotate-right')?.addEventListener('click', () => {
    state.rotation = (state.rotation + 90) % 360;
    redraw();
    pushHistory();
  });

  document.getElementById('btn-flip-h')?.addEventListener('click', () => {
    state.flipX = !state.flipX;
    redraw();
    pushHistory();
  });

  document.getElementById('btn-flip-v')?.addEventListener('click', () => {
    state.flipY = !state.flipY;
    redraw();
    pushHistory();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    resetState();
    syncSlidersToState();
    redraw();
    pushHistory();
    showToast('Back to the original! ✨');
  });
}

/* ============================================================
   setupActionButtons
   ============================================================ */
function setupActionButtons() {
  document.getElementById('btn-undo')?.addEventListener('click', undo);
  document.getElementById('btn-redo')?.addEventListener('click', redo);
  document.getElementById('btn-save')?.addEventListener('click', handleSave);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
      e.preventDefault();
      redo();
    }
  });
}

/* ============================================================
   Undo / Redo
   ============================================================ */
function pushHistory() {
  history      = history.slice(0, historyIndex + 1);
  history.push(JSON.parse(JSON.stringify(state)));

  if (history.length > MAX_HISTORY) {
    history.shift();
  } else {
    historyIndex++;
  }

  updateUndoRedoButtons();
}

function undo() {
  if (historyIndex <= 0) { showToast('Nothing to undo!'); return; }
  historyIndex--;
  state = JSON.parse(JSON.stringify(history[historyIndex]));
  syncSlidersToState();
  redraw();
  updateUndoRedoButtons();
}

function redo() {
  if (historyIndex >= history.length - 1) { showToast('Nothing to redo!'); return; }
  historyIndex++;
  state = JSON.parse(JSON.stringify(history[historyIndex]));
  syncSlidersToState();
  redraw();
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('btn-undo');
  const redoBtn = document.getElementById('btn-redo');
  if (undoBtn) undoBtn.disabled = historyIndex <= 0;
  if (redoBtn) redoBtn.disabled = historyIndex >= history.length - 1;
}

/* ============================================================
   handleSave
   ============================================================ */
function handleSave() {
  if (!sourceImage) {
    showToast('Upload an image first! 🖼');
    return;
  }

  /*
     Use a simple inline prompt for V1.
     In V2 this should be a proper modal with a text input.
  */
  const name = prompt(
    'Give your creation a name!\n(Press OK to use the default)',
    'My Island Creation'
  );

  /* User pressed Cancel */
  if (name === null) return;

  /* Export canvas with baked-in filters */
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width  = canvas.width;
  exportCanvas.height = canvas.height;
  const exportCtx = exportCanvas.getContext('2d');

  exportCtx.filter = canvas.style.filter;
  exportCtx.save();
  exportCtx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
  exportCtx.rotate((state.rotation * Math.PI) / 180);
  exportCtx.scale(state.flipX ? -1 : 1, state.flipY ? -1 : 1);
  exportCtx.drawImage(
    sourceImage,
    -exportCanvas.width  / 2,
    -exportCanvas.height / 2,
    exportCanvas.width,
    exportCanvas.height
  );
  exportCtx.restore();

  const imageData = exportCanvas.toDataURL('image/png');

  /* Save via storage.js */
  const saved = typeof saveCreation === 'function'
    ? saveCreation(name, imageData, currentChallengeId)
    : null;

  if (saved) {
    window.location.href = `completion.html?name=${encodeURIComponent(name)}`;
  } else {
    /* saveCreation already showed a toast if it failed */
    console.warn('Rivora: Save returned null — storage may be unavailable.');
  }
}

/* ============================================================
   maybeShowEditorTooltip
   
   Shows a one-time "how to use the editor" overlay.
   After the child dismisses it, we remember the dismissal
   in localStorage so it never shows again.
   
   UX PRINCIPLE: First-time guidance should be brief,
   dismissable, and never appear more than once.
   ============================================================ */
function maybeShowEditorTooltip() {
  const TOOLTIP_KEY = 'rivora_editor_tooltip_seen';

  /* If they've already seen it, skip */
  try {
    if (localStorage.getItem(TOOLTIP_KEY)) return;
  } catch (e) {
    return; /* private browsing — skip tooltip */
  }

  /* Build tooltip overlay */
  const overlay = document.createElement('div');
  overlay.id        = 'editor-tooltip';
  overlay.className = 'editor-tooltip-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'How to use the editor');

  overlay.innerHTML = `
    <div class="editor-tooltip-panel">
      <div class="editor-tooltip-pixel" aria-hidden="true">🐦</div>
      <h2 class="editor-tooltip-title">Welcome to the Editor!</h2>
      <ul class="editor-tooltip-list">
        <li>📷 <strong>Upload a photo</strong> to get started</li>
        <li>☀️ <strong>Move the sliders</strong> to change how it looks</li>
        <li>↺ <strong>Rotate and flip</strong> your image</li>
        <li>↩ <strong>Undo</strong> anything with Ctrl+Z</li>
        <li>🎉 Hit <strong>Save & Finish</strong> when you're done!</li>
      </ul>
      <button
        id="tooltip-dismiss"
        class="btn btn-primary"
        style="margin-top: 24px; width: 100%;"
        aria-label="Got it, start editing"
      >
        Got it! Let's create 🎨
      </button>
    </div>
    <div class="editor-tooltip-backdrop"></div>
  `;

  document.body.appendChild(overlay);

  /* Move focus to the dismiss button for keyboard users */
  setTimeout(() => {
    document.getElementById('tooltip-dismiss')?.focus();
  }, 100);

  /* Dismiss handler */
  document.getElementById('tooltip-dismiss')?.addEventListener('click', () => {
    overlay.remove();
    try {
      localStorage.setItem(TOOLTIP_KEY, '1');
    } catch (e) { /* private browsing — that's fine */ }
  });

  /* Inject tooltip CSS */
  injectTooltipStyles();
}

/* ============================================================
   injectTooltipStyles
   Injects CSS for the tooltip inline — keeps it self-contained.
   ============================================================ */
function injectTooltipStyles() {
  if (document.getElementById('editor-tooltip-styles')) return;

  const style = document.createElement('style');
  style.id = 'editor-tooltip-styles';
  style.textContent = `
    .editor-tooltip-overlay {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .editor-tooltip-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: -1;
    }

    .editor-tooltip-panel {
      background: #ffffff;
      border-radius: 24px;
      padding: 32px;
      max-width: 420px;
      width: 100%;
      text-align: center;
      animation: slideUp 300ms ease both;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    .editor-tooltip-pixel {
      font-size: 3rem;
      margin-bottom: 12px;
    }

    .editor-tooltip-title {
      font-family: 'Fredoka One', cursive;
      font-size: 1.4rem;
      color: #2c3e50;
      margin-bottom: 20px;
    }

    .editor-tooltip-list {
      list-style: none;
      padding: 0;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .editor-tooltip-list li {
      background: #d6eaf8;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.95rem;
      color: #2c3e50;
    }
  `;
  document.head.appendChild(style);
}

/* ============================================================
   Helpers
   ============================================================ */

function resetState() {
  state = {
    brightness: 0, contrast: 0, saturation: 0,
    blur: 0, rotation: 0, flipX: false, flipY: false
  };
}

function syncSlidersToState() {
  [
    { id: 'slider-brightness', prop: 'brightness', valueId: 'val-brightness' },
    { id: 'slider-contrast',   prop: 'contrast',   valueId: 'val-contrast'   },
    { id: 'slider-saturation', prop: 'saturation', valueId: 'val-saturation' },
    { id: 'slider-blur',       prop: 'blur',       valueId: 'val-blur'       }
  ].forEach(({ id, prop, valueId }) => {
    const slider  = document.getElementById(id);
    const valueEl = document.getElementById(valueId);
    if (slider)  {
      slider.value = state[prop];
      slider.setAttribute('aria-valuenow', state[prop]);
    }
    if (valueEl) valueEl.textContent = state[prop];
  });
}

function enableControls() {
  const panel   = document.getElementById('controls-panel');
  const actions = document.getElementById('editor-actions');
  if (panel)   { panel.style.opacity = '1';   panel.style.pointerEvents = 'auto'; }
  if (actions) { actions.style.opacity = '1'; actions.style.pointerEvents = 'auto'; }
}

function showChallengePrompt(challenge) {
  const el = document.getElementById('challenge-prompt');
  if (!el) return;
  el.innerHTML = `
    <span aria-hidden="true">${challenge.emoji}</span>
    <div>
      <strong>${challenge.title}</strong>
      <p>${challenge.description}</p>
    </div>
  `;
  el.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', initEditor);