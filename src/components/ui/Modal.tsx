import { HTMLAttributes, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const dialogs: HTMLElement[] = [];
let savedOverflow = '';
const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Portal dialogs outside animated/transformed page containers. */
export default function Modal({ onClose, children, ...props }: HTMLAttributes<HTMLDivElement> & { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useLayoutEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    if (!dialogs.length) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    dialogs.push(dialog);
    const controls = () => [...dialog.querySelectorAll<HTMLElement>(focusable)].filter(el => el.getClientRects().length && !el.closest('[inert]'));
    (controls()[0] ?? dialog).focus();
    const keydown = (event: KeyboardEvent) => {
      if (dialogs[dialogs.length - 1] !== dialog) return;
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key === 'Tab') {
        const items = controls();
        const first = items[0] ?? dialog;
        const last = items[items.length - 1] ?? dialog;
        if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    const containFocus = (event: FocusEvent) => {
      if (dialogs[dialogs.length - 1] === dialog && !dialog.contains(event.target as Node)) (controls()[0] ?? dialog).focus();
    };
    document.addEventListener('keydown', keydown);
    document.addEventListener('focusin', containFocus);
    return () => {
      dialogs.splice(dialogs.indexOf(dialog), 1);
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('focusin', containFocus);
      if (!dialogs.length) document.body.style.overflow = savedOverflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(<div {...props} ref={ref} role="dialog" aria-modal="true" tabIndex={-1}>{children}</div>, document.body);
}
