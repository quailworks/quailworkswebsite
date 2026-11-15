// The contact form. Sends in the background and thanks the visitor on the page.
// If the background send fails for any reason, it hands over to the ordinary send,
// and Formspree takes it from there. Without this script the form posts the ordinary way.
(() => {
  const form = document.getElementById("contact-form");
  const button = document.getElementById("contact-submit");
  const status = document.getElementById("contact-status");
  if (!form || !button || !status || !window.fetch || !window.FormData) return;

  const label = button.textContent;
  let sending = false;

  const restore = () => {
    sending = false;
    button.disabled = false;
    button.textContent = label;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    sending = true;
    button.disabled = true;
    button.textContent = "Sending...";

    let sent = false;
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      sent = response.ok && (await response.json()).ok === true;
    } catch {
      sent = false; // a network failure, or an answer that is not JSON
    }

    // Restored either way: Firefox keeps a disabled button disabled across a reload.
    restore();
    if (!sent) {
      HTMLFormElement.prototype.submit.call(form); // the browser posts it, as without this script
      return;
    }
    form.hidden = true;
    status.textContent = "Thanks. We’ll be in touch.";
    status.hidden = false;
    status.tabIndex = -1;
    status.focus();
  });
})();
