import { useEffect } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollLock';

/**
 * Custom hook to lock body scrolling when a modal or dialog is open.
 * Uses reference counting so multiple open modals cleanly share lock state.
 *
 * @param isLocked Whether the body scroll should currently be locked.
 */
export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [isLocked]);
}
