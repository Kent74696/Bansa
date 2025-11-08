// Mobile menu toggle example (optional)
// Defensive, uses standard quotes and correct casing
const navToggle = document.querySelector(".nav-toggle");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const navList = document.querySelector("nav ul");
    if (navList) navList.classList.toggle("open");
  });
}

// Modal close handlers (close on click of close button, OK button, overlay click, or Escape)
document.addEventListener("click", (e) => {
  const modal = document.getElementById("joinModal");
  if (!modal || !modal.classList.contains("open")) return;
  const target = e.target;
  if (
    target.classList &&
    (target.classList.contains("modal-close") ||
      target.classList.contains("modal-ok"))
  ) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
  // click on overlay (outside modal-content)
  if (target === modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("joinModal");
    if (modal && modal.classList.contains("open")) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  }
});

// Close nav when clicking outside (for small-screen dropdown)
document.addEventListener("click", (e) => {
  const navList = document.querySelector("nav ul");
  const toggle = document.querySelector(".nav-toggle");
  if (!navList || !toggle) return;
  const isOpen = navList.classList.contains("open");
  if (!isOpen) return;
  // if click is inside nav or toggle, ignore
  if (navList.contains(e.target) || toggle.contains(e.target)) return;
  navList.classList.remove("open");
});

// Close nav with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const navList = document.querySelector("nav ul");
    if (navList && navList.classList.contains("open"))
      navList.classList.remove("open");
  }
});

// Quick join form handler: prefers a JSON POST to a configured endpoint (e.g. Formspree).
// If no endpoint is configured the handler falls back to opening the user's email client via mailto.
const quickJoinForm = document.getElementById("quickJoinForm");
if (quickJoinForm) {
  quickJoinForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const name = document.getElementById("q-name").value.trim();
    const email = document.getElementById("q-email").value.trim();
    const institution = document.getElementById("q-institution").value.trim();
    const msgEl = document.getElementById("quickJoinMsg");
    if (!name || !email) {
      if (msgEl) {
        msgEl.style.display = "block";
        msgEl.textContent = "Please enter your name and email.";
      }
      return;
    }

    const endpoint =
      quickJoinForm.dataset.endpoint && quickJoinForm.dataset.endpoint.trim();

    if (endpoint) {
      // Try to POST JSON to the provided endpoint (Formspree accepts JSON with Accept: application/json)
      try {
        // button + loader handling
        const submitBtn =
          quickJoinForm.querySelector("#quickJoinSubmit") ||
          quickJoinForm.querySelector('button[type="submit"]');
        const btnText = submitBtn ? submitBtn.querySelector(".btn-text") : null;
        const btnLoader = submitBtn ? submitBtn.querySelector(".loader") : null;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add("disabled");
        }
        if (btnText) btnText.textContent = "Sending...";
        if (btnLoader) btnLoader.style.display = "inline-block";

        // Use FormData (multipart/form-data) for maximum compatibility with Formspree
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("institution", institution);

        const res = await fetch(endpoint, {
          method: "POST",
          // let the browser set Content-Type for FormData (includes boundary)
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });

        if (res.ok) {
          // Show inline modal success if present, otherwise show small message
          quickJoinForm.reset();
          const modal = document.getElementById("joinModal");
          if (modal) {
            modal.classList.add("open");
            modal.setAttribute("aria-hidden", "false");
            const modalMsg = modal.querySelector(".modal-message");
            if (modalMsg) {
              modalMsg.textContent =
                "Thanks — your request was sent. We'll be in touch soon.";
            }
          } else if (msgEl) {
            msgEl.style.display = "block";
            msgEl.textContent =
              "Thanks — your request was sent. We'll be in touch soon.";
          }
          // restore button state
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("disabled");
          }
          if (btnText) btnText.textContent = "Send request";
          if (btnLoader) btnLoader.style.display = "none";
        } else {
          // non-2xx
          const text = await res.text();
          if (msgEl) {
            msgEl.style.display = "block";
            msgEl.textContent =
              "Submission failed (server error). Falling back to email client.";
          }
          // restore button state on error
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("disabled");
          }
          if (btnText) btnText.textContent = "Send request";
          if (btnLoader) btnLoader.style.display = "none";
          // fallback to mailto
          const subject = encodeURIComponent("Join BANSA request");
          const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\nInstitution: ${institution}\n\nPlease contact me about joining BANSA.`
          );
          window.location.href = `mailto:info@bansa.org?subject=${subject}&body=${body}`;
        }
      } catch (err) {
        if (msgEl) {
          msgEl.style.display = "block";
          msgEl.textContent =
            "Network error — opening your email client as a fallback.";
        }
        // restore button state on network error
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("disabled");
        }
        if (btnText) btnText.textContent = "Send request";
        if (btnLoader) btnLoader.style.display = "none";
        const subject = encodeURIComponent("Join BANSA request");
        const body = encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\nInstitution: ${institution}\n\nPlease contact me about joining BANSA.`
        );
        window.location.href = `mailto:info@bansa.org?subject=${subject}&body=${body}`;
      }
    } else {
      // No endpoint configured: fallback to mailto behaviour
      const subject = encodeURIComponent("Join BANSA request");
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nInstitution: ${institution}\n\nPlease contact me about joining BANSA.`
      );
      const mailto = `mailto:info@bansa.org?subject=${subject}&body=${body}`;
      if (msgEl) {
        msgEl.style.display = "block";
        msgEl.textContent = "Opening your email client to send the request...";
      }
      window.location.href = mailto;
    }
  });
}
