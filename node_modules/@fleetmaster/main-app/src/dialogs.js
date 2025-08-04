export function showConfirmationDialog(message, onConfirm, onCancel) {
  // Create dialog overlay
  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'confirm-dialog-title');
  overlay.setAttribute('tabindex', '-1');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  // Create dialog box
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 90%;
    text-align: center;
  `;
  dialog.setAttribute('role', 'document');
  dialog.innerHTML = `
    <p id="confirm-dialog-title" style="margin-bottom: 1.5rem; font-size: 1.1rem; color: #2d3e50;">${message}</p>
    <div style="display: flex; gap: 1rem; justify-content: center;">
      <button id="confirm-yes" style="
        background: #2d3e50;
        color: white;
        border: none;
        padding: 0.5rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      ">Да</button>
      <button id="confirm-no" style="
        background: #e0e0e0;
        color: #2d3e50;
        border: none;
        padding: 0.5rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      ">Нет</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Focus management
  const yesBtn = dialog.querySelector('#confirm-yes');
  const noBtn = dialog.querySelector('#confirm-no');
  yesBtn.focus();
  let lastFocused = document.activeElement;

  // Trap focus inside dialog
  function trapFocus(e) {
    const focusable = [yesBtn, noBtn];
    if (e.key === 'Tab') {
      e.preventDefault();
      const idx = focusable.indexOf(document.activeElement);
      if (e.shiftKey) {
        focusable[(idx - 1 + focusable.length) % focusable.length].focus();
      } else {
        focusable[(idx + 1) % focusable.length].focus();
      }
    }
  }
  dialog.addEventListener('keydown', trapFocus);

  // Add event listeners
  yesBtn.onclick = () => {
    document.body.removeChild(overlay);
    if (lastFocused) lastFocused.focus();
    if (onConfirm) onConfirm();
  };
  noBtn.onclick = () => {
    document.body.removeChild(overlay);
    if (lastFocused) lastFocused.focus();
    if (onCancel) onCancel();
  };
  
  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
      if (lastFocused) lastFocused.focus();
      if (onCancel) onCancel();
    }
  };
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', handleEscape);
      if (lastFocused) lastFocused.focus();
      if (onCancel) onCancel();
    }
  };
  document.addEventListener('keydown', handleEscape);
} 