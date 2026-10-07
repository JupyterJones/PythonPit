// ==============================================================================
// PYTHON PIT // TACTILE CODE EDITOR & STEP-LINE TRACER
// ==============================================================================

export class CodeEditor {
  constructor(containerEl, onChange) {
    this.container = containerEl;
    this.onChange = onChange || (() => {});
    this.activeLine = null;
    this.errorLine = null;

    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="editor-wrapper">
        <div class="editor-gutter" id="editor-gutter"></div>
        <div class="editor-highlight-overlay" id="editor-overlay"></div>
        <textarea id="editor-textarea" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>
      </div>
    `;

    this.gutter = this.container.querySelector('#editor-gutter');
    this.overlay = this.container.querySelector('#editor-overlay');
    this.textarea = this.container.querySelector('#editor-textarea');

    // Sync scrolling
    this.textarea.addEventListener('scroll', () => {
      this.gutter.scrollTop = this.textarea.scrollTop;
      this.overlay.scrollTop = this.textarea.scrollTop;
    });

    // Content input
    this.textarea.addEventListener('input', () => {
      this.updateGutter();
      this.onChange(this.textarea.value);
    });

    // Python-friendly keyboard shortcuts (Tabs & Indents)
    this.textarea.addEventListener('keydown', (e) => this.handleKeyDown(e));

    this.updateGutter();
  }

  handleKeyDown(e) {
    const ta = this.textarea;

    // Tab & Shift-Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;

      if (!e.shiftKey) {
        // Insert 4 spaces
        ta.value = ta.value.substring(0, start) + '    ' + ta.value.substring(end);
        ta.selectionStart = ta.selectionEnd = start + 4;
      } else {
        // Dedent current line
        const before = ta.value.substring(0, start);
        const lineStart = before.lastIndexOf('\n') + 1;
        const line = ta.value.substring(lineStart, start);
        if (line.startsWith('    ')) {
          ta.value = ta.value.substring(0, lineStart) + line.substring(4) + ta.value.substring(start);
          ta.selectionStart = ta.selectionEnd = Math.max(lineStart, start - 4);
        }
      }
      this.updateGutter();
      this.onChange(ta.value);
      return;
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      const start = ta.selectionStart;
      const before = ta.value.substring(0, start);
      const lineStart = before.lastIndexOf('\n') + 1;
      const currentLine = before.substring(lineStart);
      const match = currentLine.match(/^(\s*)/);
      let indent = match ? match[1] : '';

      // If line ended with ':', add 4 extra spaces for Python block!
      if (currentLine.trim().endsWith(':')) {
        indent += '    ';
      }

      if (indent.length > 0) {
        e.preventDefault();
        ta.value = ta.value.substring(0, start) + '\n' + indent + ta.value.substring(ta.selectionEnd);
        ta.selectionStart = ta.selectionEnd = start + 1 + indent.length;
        this.updateGutter();
        this.onChange(ta.value);
      }
    }
  }

  getValue() {
    return this.textarea.value;
  }

  setValue(code) {
    this.textarea.value = code;
    this.updateGutter();
    this.clearHighlight();
    this.onChange(code);
  }

  updateGutter() {
    const lines = this.textarea.value.split('\n');
    let gutterHTML = '';
    for (let i = 1; i <= lines.length; i++) {
      let cls = 'gutter-num';
      if (this.activeLine === i) cls += ' active';
      if (this.errorLine === i) cls += ' error';
      gutterHTML += `<div class="${cls}">${i}</div>`;
    }
    this.gutter.innerHTML = gutterHTML;
  }

  highlightLine(lineno) {
    this.activeLine = lineno;
    this.updateGutter();

    if (!lineno) {
      this.overlay.innerHTML = '';
      return;
    }

    const lineHeight = 21; // Match monospace line height
    const top = (lineno - 1) * lineHeight;
    this.overlay.innerHTML = `
      <div class="line-highlight-bar" style="top: ${top}px; height: ${lineHeight}px;">
        <span class="step-indicator">▶ STEP</span>
      </div>
    `;

    // Auto scroll if executing line goes below view
    const viewTop = this.textarea.scrollTop;
    const viewBottom = viewTop + this.textarea.clientHeight;
    if (top < viewTop || top > viewBottom - lineHeight * 2) {
      this.textarea.scrollTop = Math.max(0, top - 60);
    }
  }

  setErrorLine(lineno) {
    this.errorLine = lineno;
    this.updateGutter();
  }

  clearHighlight() {
    this.activeLine = null;
    this.errorLine = null;
    this.overlay.innerHTML = '';
    this.updateGutter();
  }
}
