// Theme toggle. Every page ships exactly one [data-theme-toggle] button, so a
// single querySelector target is correct here.
//
// The class on <html> is resolved before first paint by a tiny inline script in
// each page's <head> (see the "Runs before the body is parsed" comment there) —
// this file only handles the click and the label, which cannot run that early.
(function () {
  var root = document.documentElement;
  var button = document.querySelector('[data-theme-toggle]');
  if (!button) return;

  var label = button.querySelector('[data-theme-label]');
  var chrome = document.querySelector('meta[name="theme-color"]');

  var DARK_BG = '#0a0a0a';
  var LIGHT_BG = '#fafaf9';

  function isDark() {
    return root.classList.contains('latex-dark');
  }

  function sync() {
    var dark = isDark();
    var next = dark ? 'light' : 'dark';

    if (label) label.textContent = next;
    button.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    if (chrome) chrome.setAttribute('content', dark ? DARK_BG : LIGHT_BG);
  }

  button.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';

    root.classList.toggle('latex-dark', next === 'dark');
    root.classList.toggle('latex-light', next === 'light');

    try {
      localStorage.setItem('theme', next);
    } catch (_) {}

    sync();
  });

  sync();
})();