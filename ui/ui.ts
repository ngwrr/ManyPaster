// ManyPaster - UI Code
// Runs in iframe

// Inject styles
const style = document.createElement('style');
style.textContent = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  padding: 16px;
  background: #fff;
  color: #333;
}

.container {
  display: flex;
  gap: 16px;
  height: 100%;
  min-height: 280px;
}

/* Left column - textarea */
.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

textarea {
  flex: 1;
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  resize: none;
  background: #fafafa;
}

textarea:focus {
  outline: none;
  border-color: #18a0fb;
  background: #fff;
}

textarea::placeholder {
  color: #999;
}

.textarea-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.copy-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: #f0f0f0;
  color: #666;
  transition: all 0.15s;
}

.copy-btn:hover {
  background: #e4e4e4;
  color: #333;
}

.line-counter {
  font-size: 12px;
  color: #999;
}

/* Right column - options */
.right-column {
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

/* Sort order toggle */
.sort-order {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.sort-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.sort-btn:first-child {
  border-right: 1px solid #e0e0e0;
}

.sort-btn.active {
  background: #f0f7ff;
}

.sort-btn:hover:not(.active) {
  background: #f5f5f5;
}

.sort-btn svg {
  width: 24px;
  height: 24px;
  stroke: #666;
  stroke-width: 2;
  fill: none;
}

.sort-btn.active svg {
  stroke: #18a0fb;
}

/* Options */
.options {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #18a0fb;
  flex-shrink: 0;
}

.option label {
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.option-desc {
  font-size: 11px;
  color: #888;
  line-height: 1.4;
  margin-left: 24px;
}

.option input[type="text"] {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
  margin-top: 6px;
}

.option input[type="text"]:focus {
  outline: none;
  border-color: #18a0fb;
}

.option input[type="text"]:disabled {
  background: #f5f5f5;
  color: #999;
}

/* Buttons */
.buttons {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-outline {
  background: #fff;
  border: 1px solid #18a0fb;
  color: #18a0fb;
}

.btn-outline:hover {
  background: #f0f7ff;
}

.btn-primary {
  background: #18a0fb;
  border: none;
  color: #fff;
}

.btn-primary:hover {
  background: #0d8de5;
}

/* Status */
.status {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.2s;
  pointer-events: none;
}

.status.visible {
  opacity: 1;
  transform: translateY(0);
}

.status.success {
  background: #e8f8f0;
  color: #1bc47d;
}

.status.error {
  background: #fef0ed;
  color: #f24822;
}
`;
document.head.appendChild(style);

// Inject HTML
document.body.innerHTML = `
<div class="container">
  <div class="left-column">
    <textarea 
      id="textarea" 
      placeholder="Enter your data to paste..."
    ></textarea>
    <div class="textarea-footer">
      <button id="copy-btn" class="copy-btn">Copy selected</button>
      <span id="line-counter" class="line-counter">0 lines</span>
    </div>
  </div>

  <div class="right-column">
    <div class="sort-order">
      <button id="sort-row" class="sort-btn active" title="Row by row (Z-pattern)">
        <svg viewBox="0 0 24 24">
          <path d="M4 6h16M4 6l3-3M4 6l3 3"/>
          <path d="M20 12H4M20 12l-3-3M20 12l-3 3"/>
          <path d="M4 18h16M4 18l3-3M4 18l3 3"/>
        </svg>
      </button>
      <button id="sort-col" class="sort-btn" title="Column by column (N-pattern)">
        <svg viewBox="0 0 24 24">
          <path d="M6 4v16M6 4l-3 3M6 4l3 3"/>
          <path d="M12 20V4M12 20l-3-3M12 20l3-3"/>
          <path d="M18 4v16M18 4l-3 3M18 4l3 3"/>
        </svg>
      </button>
    </div>

    <div class="options">
      <div class="option">
        <div class="option-row">
          <input type="checkbox" id="loop">
          <label for="loop">Loop data pasting</label>
        </div>
        <div class="option-desc">If enabled, data will be inserted cyclically.</div>
      </div>

      <div class="option">
        <div class="option-row">
          <input type="checkbox" id="reverse">
          <label for="reverse">Reverse order</label>
        </div>
        <div class="option-desc">Paste lines in reverse order.</div>
      </div>

      <div class="option">
        <div class="option-row">
          <input type="checkbox" id="ignore">
          <label for="ignore">Ignore symbols</label>
        </div>
        <div class="option-desc">Enter characters to ignore when pasting.</div>
        <input type="text" id="ignore-input" placeholder="e.g. $, #, @" disabled>
      </div>
    </div>

    <div class="buttons">
      <button id="paste-btn" class="btn btn-primary">Paste data</button>
    </div>
  </div>
</div>

<div id="status" class="status"></div>
`;

// Elements
const textarea = document.getElementById('textarea') as HTMLTextAreaElement;
const lineCounter = document.getElementById('line-counter') as HTMLSpanElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const pasteBtn = document.getElementById('paste-btn') as HTMLButtonElement;
const sortRowBtn = document.getElementById('sort-row') as HTMLButtonElement;
const sortColBtn = document.getElementById('sort-col') as HTMLButtonElement;
const loopCheckbox = document.getElementById('loop') as HTMLInputElement;
const reverseCheckbox = document.getElementById('reverse') as HTMLInputElement;
const ignoreCheckbox = document.getElementById('ignore') as HTMLInputElement;
const ignoreInput = document.getElementById('ignore-input') as HTMLInputElement;
const statusEl = document.getElementById('status') as HTMLDivElement;

let sortOrder: 'row' | 'column' = 'row';

// Update line counter
function updateLineCounter(): void {
  const text = textarea.value;
  const lines = text.split('\n').filter(line => line.length > 0);
  const count = lines.length;
  lineCounter.textContent = count === 1 ? '1 line' : count + ' lines';
}

textarea.addEventListener('input', updateLineCounter);
updateLineCounter();

// Sort order toggle
sortRowBtn.addEventListener('click', () => {
  sortOrder = 'row';
  sortRowBtn.classList.add('active');
  sortColBtn.classList.remove('active');
  saveSettings();
});

sortColBtn.addEventListener('click', () => {
  sortOrder = 'column';
  sortColBtn.classList.add('active');
  sortRowBtn.classList.remove('active');
  saveSettings();
});

// Save settings on change
function saveSettings(): void {
  const settings = {
    sortOrder,
    loop: loopCheckbox.checked,
    reverse: reverseCheckbox.checked,
    ignoreEnabled: ignoreCheckbox.checked,
    ignoreSymbols: ignoreInput.value,
  };
  parent.postMessage({ pluginMessage: { type: 'SAVE_SETTINGS', settings } }, '*');
}

loopCheckbox.addEventListener('change', saveSettings);
reverseCheckbox.addEventListener('change', saveSettings);
ignoreCheckbox.addEventListener('change', () => {
  ignoreInput.disabled = !ignoreCheckbox.checked;
  saveSettings();
});
ignoreInput.addEventListener('input', saveSettings);

// Copy Selected button
copyBtn.addEventListener('click', () => {
  parent.postMessage({ pluginMessage: { type: 'COPY_SELECTED' } }, '*');
});

// Paste button
pasteBtn.addEventListener('click', () => {
  const text = textarea.value;
  const lines = text.split('\n').filter(line => line.length > 0);

  const options = {
    sortOrder,
    loop: loopCheckbox.checked,
    reverse: reverseCheckbox.checked,
    ignoreEnabled: ignoreCheckbox.checked,
    ignoreSymbols: ignoreInput.value,
  };

  parent.postMessage({ pluginMessage: { type: 'PASTE', lines, options } }, '*');
});

// Handle messages from plugin
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  switch (msg.type) {
    case 'LOAD_SETTINGS':
      sortOrder = msg.settings.sortOrder || 'row';
      if (sortOrder === 'column') {
        sortColBtn.classList.add('active');
        sortRowBtn.classList.remove('active');
      } else {
        sortRowBtn.classList.add('active');
        sortColBtn.classList.remove('active');
      }
      loopCheckbox.checked = msg.settings.loop || false;
      reverseCheckbox.checked = msg.settings.reverse || false;
      ignoreCheckbox.checked = msg.settings.ignoreEnabled || false;
      ignoreInput.value = msg.settings.ignoreSymbols || '';
      ignoreInput.disabled = !ignoreCheckbox.checked;
      break;

    case 'COPY_RESULT':
      textarea.value = msg.texts.join('\n');
      updateLineCounter();
      showStatus('Copied ' + msg.texts.length + ' items');
      break;

    case 'PASTE_RESULT':
      showStatus('Pasted ' + msg.count + ' items');
      break;

    case 'ERROR':
      showStatus(msg.message, true);
      break;
  }
};

function showStatus(message: string, isError = false): void {
  statusEl.textContent = message;
  statusEl.className = 'status visible ' + (isError ? 'error' : 'success');
  
  setTimeout(() => {
    statusEl.classList.remove('visible');
  }, 2500);
}
