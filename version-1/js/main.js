/* =========================================================
   Nexus Co-Living Spaces – main JavaScript
   1. Mobile menu
   2. Accessibility toolbar (text size + high contrast)
   3. Building floors on the home page
   4. Package finder on the packages page
   5. Contact form validation
   ========================================================= */

/* Small helpers for saving settings. localStorage can be blocked
   (e.g. private browsing), so it is wrapped in try/catch. */
function saveSetting(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}
function loadSetting(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

/* ---------- 1. Mobile menu ---------- */
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.getElementById("main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", function () {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    mainNav.classList.toggle("open", !isOpen);
  });

  // Close the menu with the Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && mainNav.classList.contains("open")) {
      navToggle.setAttribute("aria-expanded", "false");
      mainNav.classList.remove("open");
      navToggle.focus();
    }
  });
}

/* ---------- 2. Accessibility toolbar ---------- */
// Changing the root font size scales every rem-based size on the page
const textSizes = { normal: "100%", large: "118%", larger: "136%" };
const sizeButtons = document.querySelectorAll("[data-text-size]");
const contrastButton = document.getElementById("contrast-toggle");

function setTextSize(size) {
  document.documentElement.style.fontSize = textSizes[size];
  sizeButtons.forEach(function (btn) {
    btn.setAttribute("aria-pressed", String(btn.dataset.textSize === size));
  });
  saveSetting("nexus-text-size", size);
}

function setContrast(on) {
  document.body.classList.toggle("high-contrast", on);
  if (contrastButton) contrastButton.setAttribute("aria-pressed", String(on));
  saveSetting("nexus-contrast", on ? "on" : "off");
}

sizeButtons.forEach(function (btn) {
  btn.addEventListener("click", function () { setTextSize(btn.dataset.textSize); });
});
if (contrastButton) {
  contrastButton.addEventListener("click", function () {
    setContrast(!document.body.classList.contains("high-contrast"));
  });
}

// Apply any settings the user chose on a previous page
setTextSize(loadSetting("nexus-text-size") || "normal");
setContrast(loadSetting("nexus-contrast") === "on");

/* ---------- 3. Building floors (home page) ---------- */
const floors = {
  roof: {
    title: "Rooftop garden",
    text: "Plants, shaded seating and a view of the city. Residents use it for morning coffee, quiet reading and our Friday sunset socials."
  },
  gym: {
    title: "Gym and yoga studio",
    text: "Cardio machines, free weights and a separate yoga studio with mats provided. Open 24 hours with your key card."
  },
  rooms: {
    title: "Private rooms and studios",
    text: "Fully furnished private bedrooms and studio apartments with high-speed Wi-Fi, a desk and plenty of storage."
  },
  work: {
    title: "Co-working and study pods",
    text: "Hot desks, meeting rooms and soundproof study pods for calls, exams and deep work."
  },
  lounge: {
    title: "Kitchens, dining and social lounge",
    text: "Large communal kitchens, shared dining tables and a lounge with games and a projector for movie nights."
  },
  lobby: {
    title: "Lobby, laundry and 24/7 security",
    text: "Staffed reception, key-card entry, CCTV, parcel lockers and a laundry room with app-controlled machines."
  }
};

const floorButtons = document.querySelectorAll(".floor-btn");
const floorInfo = document.getElementById("floor-info");

function showFloor(button) {
  const data = floors[button.dataset.floor];
  floorButtons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
  button.setAttribute("aria-pressed", "true");
  floorInfo.innerHTML = "<h3>" + data.title + "</h3><p>" + data.text + "</p>";
}

floorButtons.forEach(function (button) {
  button.addEventListener("click", function () { showFloor(button); });
});

/* ---------- 4. Package finder (packages page) ---------- */
const finderForm = document.getElementById("finder-form");

if (finderForm) {
  const result = document.getElementById("finder-result");

  finderForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const stay = finderForm.querySelector("input[name='stay']:checked");
    const space = finderForm.querySelector("input[name='space']:checked");
    const needs = finderForm.querySelector("input[name='needs']:checked");

    if (!stay || !space || !needs) {
      result.innerHTML = "<p><strong>Answer all three questions</strong> to see a recommendation.</p>";
      return;
    }

    let title, reason, link;

    if (needs.value === "yes") {
      title = "Custom Package";
      reason = "Corporate bookings, very long stays and accessibility requirements are arranged one-to-one with our team, so we can get the details right for you.";
      link = '<a class="btn" href="contact.html?type=custom">Ask about a custom package</a>';
    } else if (stay.value === "short") {
      title = "Short-Term Stay";
      reason = "You can book a furnished room for 1 to 4 weeks with utilities included – ideal while you settle in or travel.";
      link = '<a class="btn" href="contact.html?type=short">Enquire about Short-Term Stay</a>';
    } else if (space.value === "studio") {
      title = "Premium Stay";
      reason = "You get your own studio apartment, weekly cleaning, access to every facility and a monthly community events pass.";
      link = '<a class="btn" href="contact.html?type=premium">Enquire about Premium Stay</a>';
    } else {
      title = "Standard Stay";
      reason = "A private bedroom in a shared apartment keeps costs down while still giving you co-working access and a shared kitchen and lounge.";
      link = '<a class="btn" href="contact.html?type=standard">Enquire about Standard Stay</a>';
    }

    result.innerHTML = "<h3>We recommend: " + title + "</h3><p>" + reason + "</p>" + link;
    result.focus();
  });
}

/* ---------- 5. Contact form validation ---------- */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  // If the user came from a package button, pre-select that package
  const params = new URLSearchParams(window.location.search);
  const typeFromLink = params.get("type");
  if (typeFromLink) {
    const select = document.getElementById("enquiry");
    if (select.querySelector("option[value='" + typeFromLink + "']")) select.value = typeFromLink;
  }

  const summary = document.getElementById("form-summary");
  const success = document.getElementById("form-success");

  // Each rule returns an error message, or "" if the field is fine
  const rules = {
    name: function (v) { return v.trim().length < 2 ? "Enter your full name." : ""; },
    email: function (v) {
      if (v.trim() === "") return "Enter your email address.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter an email address in the format name@example.com.";
    },
    phone: function (v) {
      if (v.trim() === "") return ""; // optional
      return /^[+0-9 ()-]{7,20}$/.test(v.trim()) ? "" : "Enter a phone number using numbers only, for example +65 6123 4567.";
    },
    enquiry: function (v) { return v === "" ? "Choose what your enquiry is about." : ""; },
    message: function (v) { return v.trim().length < 10 ? "Enter a message of at least 10 characters." : ""; }
  };

  function checkField(id) {
    const field = document.getElementById(id);
    const errorBox = document.getElementById(id + "-error");
    const message = rules[id](field.value);
    errorBox.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    return message;
  }

  // Check a field again when the user leaves it
  Object.keys(rules).forEach(function (id) {
    document.getElementById(id).addEventListener("blur", function () { checkField(id); });
  });

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const errors = [];

    Object.keys(rules).forEach(function (id) {
      const msg = checkField(id);
      if (msg) errors.push('<li><a href="#' + id + '">' + msg + "</a></li>");
    });

    if (errors.length > 0) {
      // Show a list of problems at the top and move focus there for screen readers
      summary.hidden = false;
      summary.innerHTML = "<h2>There is a problem</h2><ul>" + errors.join("") + "</ul>";
      success.hidden = true;
      summary.scrollIntoView({ block: "start" });
      summary.focus({ preventScroll: true });
      return;
    }

    // No server in this prototype, so show a confirmation instead of sending
    summary.hidden = true;
    const name = document.getElementById("name").value.trim().split(" ")[0];
    success.hidden = false;
    success.innerHTML = "<h2>Enquiry sent</h2><p>Thanks, " + escapeHtml(name) +
      ". Our team will reply within one working day. A copy has been sent to your email.</p>";
    contactForm.reset();
    success.scrollIntoView({ block: "start" });
    success.focus({ preventScroll: true });
  });
}

// Stops user input being treated as HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
