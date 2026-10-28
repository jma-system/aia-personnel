/* Bloc Clair / Nuit : préférence isolée, aucune lecture/écriture des fiches. */
(() => {
  const KEY = 'aia-preference-theme';
  const root = document.documentElement;
  const header = document.querySelector('header');
  if (!header || document.getElementById('aia-theme-toggle')) return;
  let theme = 'light';
  try { if (localStorage.getItem(KEY) === 'dark') theme = 'dark'; } catch { /* mode clair utilisable */ }
  const button = document.createElement('button');
  button.id = 'aia-theme-toggle';
  button.type = 'button';
  button.className = 'small no-print';
  button.setAttribute('aria-label', 'Mode Nuit');
  function apply() {
    root.dataset.aiaTheme = theme;
    button.textContent = theme === 'dark' ? '☾ Nuit' : '☀ Clair';
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.title = theme === 'dark' ? 'Passer au mode Clair' : 'Passer au mode Nuit';
  }
  button.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    apply();
    try { localStorage.setItem(KEY, theme); }
    catch { if (typeof message === 'function') message('Thème appliqué. Ce navigateur ne permet pas de mémoriser le choix.'); }
  });
  header.append(button);
  apply();
})();
