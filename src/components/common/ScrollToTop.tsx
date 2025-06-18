import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();

  useLayoutEffect(() => {
    // Scroll to top of the window/page
    window.scrollTo(0, 0);

    // Also try to scroll the main content area if it exists
    const content = document.getElementById('sub-main-content');
    if (content) {
      content.scrollTo(0, 0);
    }
  }, [location.pathname, location.search]); // include query changes too

  return null;
}
