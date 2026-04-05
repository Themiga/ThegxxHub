// router.js - Simple client-side router
const Router = (() => {
  const routes = {};
  let currentPath = null;

  function define(path, handler) {
    routes[path] = handler;
  }

  function navigate(path, push = true) {
    if (push && currentPath !== path) {
      history.pushState(null, '', path);
    }
    currentPath = path;
    _dispatch(path);
  }

  function _dispatch(path) {
    // Check exact matches first
    if (routes[path]) {
      routes[path]({});
      return;
    }

    // Check dynamic segments
    for (const pattern of Object.keys(routes)) {
      const match = _match(pattern, path);
      if (match !== null) {
        routes[pattern](match);
        return;
      }
    }

    // 404 fallback
    if (routes['*']) routes['*']({});
  }

  function _match(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  function init() {
    window.addEventListener('popstate', () => {
      currentPath = null;
      _dispatch(window.location.pathname);
    });

    // Intercept all internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('//') || link.target === '_blank') return;
      e.preventDefault();
      navigate(href);
    });
  }

  function getCurrent() { return currentPath; }

  return { define, navigate, init, getCurrent };
})();
