// Adds a small bar (language, hide/show, copy) above each highlighted code block.
// A first line of "@collapsed" (in any comment style) starts the block hidden.
//
// Keys off pre.shiki-code, which is the one class every highlighted block has.
// The language label comes from the block's data-language attribute.
(function () {
  var marker = /^\s*(\/\/|#|--|<!--)\s*@collapsed\s*(-->)?\s*$/;

  document.querySelectorAll('.post-body pre.shiki-code').forEach(function (pre) {
    var code = pre.querySelector('code');
    if (!code) return;

    var collapsed = false;
    var first = code.firstElementChild;

    if (first && first.classList.contains('line')) {
      if (marker.test(first.textContent || '')) {
        first.remove();
        collapsed = true;
      }
    } else if (marker.test((code.textContent || '').split('\n')[0])) {
      code.textContent = code.textContent.replace(/^[^\n]*\n?/, '');
      collapsed = true;
    }

    var wrap = document.createElement('figure');
    wrap.className = 'code-block';
    pre.replaceWith(wrap);
    wrap.appendChild(pre);

    var bar = document.createElement('figcaption');
    bar.className = 'code-block-bar';

    var lang = document.createElement('span');
    lang.className = 'code-block-lang';
    lang.textContent = pre.dataset.language || 'code';

    var actions = document.createElement('span');
    actions.className = 'code-block-actions';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    var toggleLabel = function () {
      toggle.textContent = pre.hidden ? 'show' : 'hide';
    };
    toggle.addEventListener('click', function () {
      pre.hidden = !pre.hidden;
      toggleLabel();
    });

    var copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = 'copy';
    copy.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        copy.textContent = 'copied';
        setTimeout(function () { copy.textContent = 'copy'; }, 1500);
      } catch (_) {
        copy.textContent = 'failed';
      }
    });

    actions.append(toggle, copy);
    bar.append(lang, actions);
    wrap.prepend(bar);

    pre.hidden = collapsed;
    toggleLabel();
  });
})();