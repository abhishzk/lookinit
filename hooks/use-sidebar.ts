import { useState, useCallback } from 'react';

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    console.log('Sidebar opened'); // Debugging log
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    console.log('Sidebar closed'); // Debugging log
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    console.log('Sidebar toggled'); // Debugging log
    setIsOpen((prev) => !prev);
  }, []);

  return { isOpen, open, close, toggle };
}
