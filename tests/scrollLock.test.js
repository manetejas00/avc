import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock DOM environment for Node.js test runner
function setupMockDom() {
  const classListHtml = new Set();
  const classListBody = new Set();

  global.window = {
    innerWidth: 1024
  };

  global.document = {
    documentElement: {
      clientWidth: 1008, // 16px scrollbar
      style: { overflow: '' },
      classList: {
        add: (cls) => classListHtml.add(cls),
        remove: (cls) => classListHtml.delete(cls),
        contains: (cls) => classListHtml.has(cls)
      }
    },
    body: {
      style: { overflow: '', paddingRight: '' },
      classList: {
        add: (cls) => classListBody.add(cls),
        remove: (cls) => classListBody.delete(cls),
        contains: (cls) => classListBody.has(cls)
      }
    }
  };
}

describe('Scroll Lock Utility', async () => {
  setupMockDom();
  const fs = await import('node:fs');
  const path = await import('node:path');
  const rawCode = fs.readFileSync(path.resolve('./src/utils/scrollLock.ts'), 'utf-8');
  // Strip TypeScript type annotations so Node 20 ESM can import dynamically
  const jsCode = rawCode.replace(/: void/g, '');
  const dataUri = `data:text/javascript;base64,${Buffer.from(jsCode).toString('base64')}`;
  const { lockBodyScroll, unlockBodyScroll } = await import(dataUri);

  beforeEach(() => {
    // Reset DOM state
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.documentElement.style.overflow = '';
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
  });

  it('locks body scroll when modal opens', () => {
    lockBodyScroll();
    assert.strictEqual(document.body.style.overflow, 'hidden');
    assert.strictEqual(document.documentElement.style.overflow, 'hidden');
    assert.strictEqual(document.body.classList.contains('modal-open'), true);
    assert.strictEqual(document.documentElement.classList.contains('modal-open'), true);
    assert.strictEqual(document.body.style.paddingRight, '16px'); // Compensates scrollbar

    unlockBodyScroll();
    assert.strictEqual(document.body.style.overflow, '');
    assert.strictEqual(document.documentElement.style.overflow, '');
    assert.strictEqual(document.body.classList.contains('modal-open'), false);
    assert.strictEqual(document.documentElement.classList.contains('modal-open'), false);
    assert.strictEqual(document.body.style.paddingRight, '');
  });

  it('handles nested/stacked modals with reference counting', () => {
    // Open modal 1
    lockBodyScroll();
    assert.strictEqual(document.body.style.overflow, 'hidden');

    // Open modal 2 (e.g. Consultation opened from Service modal)
    lockBodyScroll();
    assert.strictEqual(document.body.style.overflow, 'hidden');

    // Close modal 2
    unlockBodyScroll();
    // Background must STILL be locked because modal 1 is still open!
    assert.strictEqual(document.body.style.overflow, 'hidden');
    assert.strictEqual(document.body.classList.contains('modal-open'), true);

    // Close modal 1
    unlockBodyScroll();
    // Now both are closed, body scroll should be restored
    assert.strictEqual(document.body.style.overflow, '');
    assert.strictEqual(document.body.classList.contains('modal-open'), false);
  });
});
