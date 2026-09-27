/* North Hills Brief signup bridge.
   A form marked data-kit-form="FORM_ID" sends its email address to that Kit
   form first, then posts to Netlify Forms as before, so Netlify keeps a backup
   copy of every signup. If Kit does not answer within four seconds, the
   Netlify post goes ahead anyway. Fred chose the form IDs, 27 Sep 2026. */
(function () {
  var forms = document.querySelectorAll('form[data-kit-form]');
  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (ev) {
      if (form.dataset.kitSent === 'yes') return;
      if (form.dataset.kitPending === 'yes') { ev.preventDefault(); return; }
      var id = form.getAttribute('data-kit-form');
      var email = form.querySelector('input[type="email"]');
      var honeypot = form.querySelector('input[name="bot-field"]');
      if (!id || !email || !email.value || (honeypot && honeypot.value)) return;
      ev.preventDefault();
      form.dataset.kitPending = 'yes';
      var button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      var finished = false;
      var finish = function () {
        if (finished) return;
        finished = true;
        form.dataset.kitSent = 'yes';
        if (button) button.disabled = false;
        if (typeof form.requestSubmit === 'function') form.requestSubmit(); else form.submit();
      };
      var timer = setTimeout(finish, 4000);
      var body = new FormData();
      body.append('email_address', email.value);
      fetch('https://app.kit.com/forms/' + id + '/subscriptions', {
        method: 'POST',
        body: body,
        headers: { Accept: 'application/json' },
        keepalive: true
      }).then(function () { clearTimeout(timer); finish(); }, function () { clearTimeout(timer); finish(); });
    });
  });
})();
