/* =========================================
   EMAILJS CONFIGURATION
========================================= */
const EMAILJS_PUBLIC_KEY = "U4M_W0iXRCPd7lXqD";
const EMAILJS_SERVICE_ID = "service_ew9gjz1";
const EMAILJS_TEMPLATE_ID = "template_g5kwrzq";
const FEEDBACK_TEMPLATE_ID = "template_2emas1m";

const DEFAULT_DEV_EMAIL = "rafaelbatnag.dev@gmail.com";

/* =========================================
   INITIALIZE EMAILJS SAFELY
========================================= */
(function initEmailJS() {
    if (typeof emailjs !== "undefined") {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    } else {
        console.warn("EmailJS SDK is not loaded. Disable Brave Shields or AdBlock if testing locally.");
    }
})();

/* =========================================
   HELPER: GET TARGET EMAIL FROM URL
========================================= */
function getTargetEmail() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipientEmail = urlParams.get("to");
    return recipientEmail ? recipientEmail.trim() : DEFAULT_DEV_EMAIL;
}

/* =========================================
   DOM ELEMENTS
========================================= */
const nextNameBtn = document.getElementById("nextNameBtn");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const submitBtn = document.getElementById("submitBtn");
const feedbackBtn = document.getElementById("feedbackBtn");

/* =========================================
   EVENT LISTENERS
========================================= */
if (nextNameBtn) nextNameBtn.addEventListener("click", submitName);

if (yesBtn) {
    yesBtn.addEventListener("click", (e) => {
        e.preventDefault();
        nextStep(3);
    });
}

if (submitBtn) submitBtn.addEventListener("click", finishSelection);
if (feedbackBtn) feedbackBtn.addEventListener("click", sendFeedback);

/* =========================================
   STEP NAVIGATION
========================================= */
function nextStep(stepNumber) {
    const steps = document.querySelectorAll(".step");

    steps.forEach(step => {
        step.classList.remove("active");
    });

    const nextStepElement = document.getElementById(`step${stepNumber}`);
    if (nextStepElement) {
        nextStepElement.classList.add("active");
    }
}

/* =========================================
   STEP 1: NAME VALIDATION
========================================= */
function submitName(event) {
    if (event) event.preventDefault();

    const nameInput = document
        .getElementById("userName")
        .value
        .trim();

    if (!nameInput) {
        alert("Please enter your name first!");
        return;
    }

    const askNameEl = document.getElementById("askName");
    const displayNameEl = document.getElementById("displayName");

    if (askNameEl) askNameEl.textContent = nameInput;
    if (displayNameEl) displayNameEl.textContent = nameInput;

    nextStep(2);
}

/* =========================================
   NO BUTTON DODGE SYSTEM
========================================= */
function rectRelativeTo(element, containerRect) {
    const rect = element.getBoundingClientRect();

    return {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height
    };
}

let noBtnBusy = false;

function dodgeNoButton(event) {
    if (event) {
        event.preventDefault();
    }

    if (noBtnBusy || !noBtn || !yesBtn) {
        return;
    }

    noBtnBusy = true;

    const container = document.querySelector("#step2 .btn-container");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    if (!noBtn.classList.contains("dodging")) {
        const noRect = rectRelativeTo(noBtn, containerRect);

        noBtn.style.left = `${noRect.left}px`;
        noBtn.style.top = `${noRect.top}px`;
        noBtn.classList.add("dodging");
    }

    const yesRect = rectRelativeTo(yesBtn, containerRect);
    const buttonWidth = noBtn.offsetWidth;
    const buttonHeight = noBtn.offsetHeight;
    const padding = 10;

    const maxX = Math.max(containerRect.width - buttonWidth, 0);
    const maxY = Math.max(containerRect.height - buttonHeight, 0);

    let newLeft;
    let newTop;
    let tries = 0;

    function overlapsYes(left, top) {
        return (
            left < yesRect.left + yesRect.width + padding &&
            left + buttonWidth > yesRect.left - padding &&
            top < yesRect.top + yesRect.height + padding &&
            top + buttonHeight > yesRect.top - padding
        );
    }

    do {
        newLeft = Math.random() * maxX;
        newTop = Math.random() * maxY;
        tries++;
    } while (overlapsYes(newLeft, newTop) && tries < 12);

    noBtn.style.left = `${newLeft}px`;
    noBtn.style.top = `${newTop}px`;

    noBtn.style.pointerEvents = "none";

    setTimeout(() => {
        if (noBtn) noBtn.style.pointerEvents = "";
    }, 150);

    noBtn.classList.remove("dodge-pulse");
    void noBtn.offsetWidth;
    noBtn.classList.add("dodge-pulse");

    setTimeout(() => {
        noBtnBusy = false;
    }, 60);
}

if (noBtn) {
    noBtn.addEventListener("pointerdown", dodgeNoButton, { passive: false });
    noBtn.addEventListener("mouseenter", dodgeNoButton);
}

window.addEventListener("resize", () => {
    if (!noBtn || !noBtn.classList.contains("dodging")) {
        return;
    }

    const container = document.querySelector("#step2 .btn-container");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    const maxX = Math.max(containerRect.width - noBtn.offsetWidth, 0);
    const maxY = Math.max(containerRect.height - noBtn.offsetHeight, 0);

    const currentLeft = parseFloat(noBtn.style.left) || 0;
    const currentTop = parseFloat(noBtn.style.top) || 0;

    noBtn.style.left = `${Math.min(currentLeft, maxX)}px`;
    noBtn.style.top = `${Math.min(currentTop, maxY)}px`;
});

/* =========================================
   FINAL DATE SUBMISSION
========================================= */
async function finishSelection(event) {
    if (event) event.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const date = document.getElementById("datePicker").value;
    const time = document.getElementById("timePicker").value;
    const selectedPlace = document.querySelector('input[name="place"]:checked');
    const selectedActivity = document.querySelector('input[name="activity"]:checked');
    const customActivity = document.getElementById("customActivity").value.trim();

    if (!date) {
        alert("Please select a date!");
        return;
    }

    if (!time) {
        alert("Please select a time!");
        return;
    }

    if (!selectedPlace) {
        alert("Please select a location!");
        return;
    }

    if (!selectedActivity) {
        alert("Please select what you want to do after eating!");
        return;
    }

    let activity;
    if (selectedActivity.value === "Other") {
        if (!customActivity) {
            alert("Please specify your preferred activity!");
            return;
        }
        activity = customActivity;
    } else {
        activity = selectedActivity.value;
    }

    document.getElementById("finalName").textContent = name;
    document.getElementById("summaryDate").textContent = date;
    document.getElementById("summaryTime").textContent = time;
    document.getElementById("summaryPlace").textContent = selectedPlace.value;
    document.getElementById("summaryActivity").textContent = activity;

    const recipientEmail = getTargetEmail();

    const templateParams = {
        target_email: recipientEmail,
        user_name: name,
        date: date,
        time: time,
        location: selectedPlace.value,
        activity: activity
    };

    if (typeof emailjs !== "undefined") {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending... 💌";

        try {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams
            );
            console.log(`Invitation response sent to ${recipientEmail}`);
        } catch (error) {
            console.error("Email sending failed:", error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Choice ❤️";
        }
    }

    nextStep(4);
    celebrate();
}

/* =========================================
   CONFETTI CELEBRATION (FIXED & RELIABLE)
========================================= */
function celebrate() {
    const confettiFunc = window.confetti || (typeof confetti !== "undefined" ? confetti : null);

    if (!confettiFunc) {
        console.warn("Confetti CDN script not found.");
        return;
    }

    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confettiFunc({
            particleCount: 6,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });

        confettiFunc({
            particleCount: 6,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}

/* =========================================
   SEND FEEDBACK
========================================= */
async function sendFeedback(event) {
    if (event) event.preventDefault();

    const feedbackName = document.getElementById("feedbackName").value.trim();
    const feedbackMessage = document.getElementById("feedbackMessage").value.trim();
    const statusDiv = document.getElementById("feedbackStatus");

    if (!feedbackMessage) {
        alert("Please write your feedback first!");
        return;
    }

    const feedbackParams = {
        name: feedbackName || "Anonymous",
        message: feedbackMessage
    };

    feedbackBtn.disabled = true;
    feedbackBtn.textContent = "Sending... 💌";
    if (statusDiv) statusDiv.textContent = "";

    try {
        if (typeof emailjs !== "undefined") {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                FEEDBACK_TEMPLATE_ID,
                feedbackParams
            );

            if (statusDiv) {
                statusDiv.style.color = "#d63384";
                statusDiv.textContent = "Thank you for your feedback! 💖";
            } else {
                alert("Thank you for your feedback! 💖");
            }

            document.getElementById("feedbackName").value = "";
            document.getElementById("feedbackMessage").value = "";
        } else {
            alert("EmailJS is not loaded. Disable Brave Shields if running locally.");
        }
    } catch (error) {
        console.error("Feedback sending failed:", error);
        if (statusDiv) {
            statusDiv.style.color = "red";
            statusDiv.textContent = "Failed to send feedback. Please try again.";
        } else {
            alert("Failed to send feedback: " + (error.text || error.message || "Unknown error"));
        }
    } finally {
        feedbackBtn.disabled = false;
        feedbackBtn.textContent = "Send Feedback 💌";
    }
}