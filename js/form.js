// The contact form. Sends in the background and thanks the visitor on the page.
// If the background send fails for any reason, or has no answer in 12 seconds, it hands over
// to the ordinary send, and Formspree takes it from there. Without this script the form posts
// the ordinary way.
(() => {
  const form = document.getElementById("contact-form");
  const button = document.getElementById("contact-submit");
  const status = document.getElementById("contact-status");
  if (!form || !button || !status || !window.fetch || !window.FormData || !window.AbortController) return;

  const label = button.textContent;
  const WAIT = 12000; // ms to wait for the background send before handing over
  let sending = false;

  const restore = () => {
    sending = false;
    button.disabled = false;
    button.textContent = label;
    button.style.minWidth = "";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    sending = true;
    // Held at its exact width, so the button does not narrow when its label changes.
    button.style.minWidth = button.getBoundingClientRect().width + "px";
    button.disabled = true;
    button.textContent = "Sending...";

    let sent = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WAIT);
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      sent = response.ok && (await response.json()).ok === true;
    } catch {
      sent = false; // a network failure, an answer that is not JSON, or no answer in time
    }
    clearTimeout(timer);

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
