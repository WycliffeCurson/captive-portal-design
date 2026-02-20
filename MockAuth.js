/* =======================================================
   mockAuth.js — SPEED.NET Captive Portal
   Mock authentication layer simulating:
     - MikroTik credential login
     - Voucher redemption (RADIUS-style)
     - Receipt / transaction verification
     - M-Pesa STK push payment flow
   
   Integration note:
     Replace each MOCK_* section's resolve/reject calls
     with your actual fetch() calls to the MikroTik API,
     RADIUS server, or Centipede billing endpoints.
   ======================================================= */

"use strict";

/* -------------------------------------------------------
   MOCK DATA STORES
   In production:
     - MOCK_USERS      → MikroTik / RADIUS user database
     - MOCK_VOUCHERS   → Hotspot voucher pool
     - MOCK_RECEIPTS   → Centipede billing records
------------------------------------------------------- */

const MOCK_USERS = [
  { username: "demo", password: "1234", session: "8h", status: "active" },
  { username: "testuser", password: "pass123", session: "24h", status: "active" },
  { username: "expired", password: "exp999", session: "0", status: "expired" },
];

const MOCK_VOUCHERS = [
  { code: "SPEED-1234", plan: "4 hours", status: "unused" },
  { code: "SPEED-5678", plan: "24 hours", status: "unused" },
  { code: "SPEED-USED", plan: "1 hour", status: "used" },
  { code: "SPEED-9999", plan: "1 week", status: "unused" },
];

const MOCK_RECEIPTS = [
  { receipt: "RCP001", plan: "Individual – 1 hour – Ksh 10", phone: "0712345678", status: "verified" },
  { receipt: "RCP002", plan: "Family – 1 month – Ksh 900", phone: "0798765432", status: "verified" },
  { receipt: "RCP003", plan: "Shared – 24 hours – Ksh 80", phone: "0711000111", status: "pending" },
];

/* Simulate STK push success rate (80% success in mock) */
const MPESA_SUCCESS_RATE = 0.8;


/* =======================================================
   TOAST NOTIFICATION SYSTEM
   Replaces alert() with styled, non-blocking toasts.
   Types: "success" | "error" | "info" | "loading"
======================================================= */

(function injectToastStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #toast-container {
      position: fixed;
      top: 1.25rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      pointer-events: none;
      width: 90%;
      max-width: 360px;
    }

    .toast {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.6rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      box-shadow: 0 4px 18px rgba(0,0,0,0.25);
      opacity: 0;
      transform: translateY(-10px);
      transition: opacity 0.25s ease, transform 0.25s ease;
      pointer-events: auto;
    }

    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    .toast.hide {
      opacity: 0;
      transform: translateY(-10px);
    }

    .toast-success { background: #16a34a; }
    .toast-error   { background: #dc2626; }
    .toast-info    { background: #6a00ff; }
    .toast-loading { background: #374151; }

    .toast-icon { font-size: 1rem; flex-shrink: 0; }

    /* Spinner for loading toast */
    .toast-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Inline field feedback */
    .field-error {
      font-size: 0.75rem;
      color: #dc2626;
      margin-top: -0.5rem;
      margin-bottom: 0.5rem;
      padding-left: 0.25rem;
    }

    /* Button loading state */
    .modal-connect.loading {
      opacity: 0.7;
      pointer-events: none;
      position: relative;
    }
  `;
  document.head.appendChild(style);
})();

const toastContainer = (() => {
  const el = document.createElement("div");
  el.id = "toast-container";
  document.body.appendChild(el);
  return el;
})();

/**
 * Show a toast notification.
 * @param {string} message
 * @param {"success"|"error"|"info"|"loading"} type
 * @param {number} duration  ms before auto-dismiss (0 = manual)
 * @returns {HTMLElement} toast element (so caller can dismiss it)
 */
function showToast(message, type = "info", duration = 3500) {
  const icons = { success: "✓", error: "✕", info: "ℹ", loading: null };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  if (type === "loading") {
    const spinner = document.createElement("div");
    spinner.className = "toast-spinner";
    toast.appendChild(spinner);
  } else {
    const icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.textContent = icons[type];
    toast.appendChild(icon);
  }

  const text = document.createElement("span");
  text.textContent = message;
  toast.appendChild(text);

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  function dismiss() {
    toast.classList.add("hide");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }

  if (duration > 0) setTimeout(dismiss, duration);

  toast.dismiss = dismiss;
  return toast;
}

/** Remove inline field errors in a panel */
function clearFieldErrors(panel) {
  panel.querySelectorAll(".field-error").forEach(el => el.remove());
}

/** Show inline error below an input */
function showFieldError(input, message) {
  const existing = input.nextElementSibling;
  if (existing && existing.classList.contains("field-error")) existing.remove();
  const err = document.createElement("div");
  err.className = "field-error";
  err.textContent = message;
  input.insertAdjacentElement("afterend", err);
}

/** Set button to loading/normal state */
function setButtonLoading(btn, isLoading, label = "Connect") {
  btn.classList.toggle("loading", isLoading);
  btn.textContent = isLoading ? "Please wait…" : label;
}


/* =======================================================
   MOCK API CALLS
   Each returns a Promise simulating async server calls.
   Replace these with real fetch() calls in production.
======================================================= */

/**
 * MOCK: MikroTik / RADIUS credential login
 * Production: POST /login to MikroTik Hotspot or RADIUS auth endpoint
 */
function mockLoginAPI(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(
        u => u.username === username && u.password === password
      );
      if (!user) {
        reject({ code: "INVALID_CREDENTIALS", message: "Wrong username or password." });
      } else if (user.status === "expired") {
        reject({ code: "ACCOUNT_EXPIRED", message: "Your account has expired. Please purchase a new plan." });
      } else {
        resolve({ username: user.username, session: user.session });
      }
    }, 1200); /* simulated network delay */
  });
}

/**
 * MOCK: Voucher redemption
 * Production: POST to RADIUS / MikroTik voucher activation endpoint
 */
function mockVoucherAPI(code) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const voucher = MOCK_VOUCHERS.find(v => v.code === code.toUpperCase());
      if (!voucher) {
        reject({ code: "INVALID_VOUCHER", message: "Voucher code not found. Check and try again." });
      } else if (voucher.status === "used") {
        reject({ code: "VOUCHER_USED", message: "This voucher has already been redeemed." });
      } else {
        voucher.status = "used"; /* mark as used in mock store */
        resolve({ plan: voucher.plan });
      }
    }, 1000);
  });
}

/**
 * MOCK: Receipt / transaction verification
 * Production: GET from Centipede billing API by receipt number
 */
function mockReceiptAPI(receiptNo) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const record = MOCK_RECEIPTS.find(r => r.receipt === receiptNo.toUpperCase());
      if (!record) {
        reject({ code: "NOT_FOUND", message: "Receipt not found. Double-check the number." });
      } else if (record.status === "pending") {
        reject({ code: "PENDING", message: "Payment still processing. Try again in a moment." });
      } else {
        resolve({ plan: record.plan, phone: record.phone });
      }
    }, 900);
  });
}

/**
 * MOCK: M-Pesa STK push
 * Production: POST to Centipede / Daraja API STK push endpoint
 * Returns a pending state then simulates callback
 */
function mockMpesaSTK(phone, planName) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      /* Simulate Safaricom callback (success / timeout) */
      const success = Math.random() < MPESA_SUCCESS_RATE;
      if (success) {
        const receiptNo = "RCP" + Math.random().toString(36).substring(2, 8).toUpperCase();
        resolve({ phone, plan: planName, receipt: receiptNo });
      } else {
        reject({ code: "STK_TIMEOUT", message: "Payment request timed out or was cancelled. Please try again." });
      }
    }, 3500); /* simulates the STK push wait time */
  });
}


/* =======================================================
   PHONE NUMBER VALIDATION (Kenyan format)
======================================================= */
function validateKenyanPhone(phone) {
  const cleaned = phone.replace(/\s+/g, "");
  /* Accepts: 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX */
  return /^(?:0[17]\d{8}|(?:\+?254)[17]\d{8})$/.test(cleaned);
}

function normalizePhone(phone) {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("+254")) return cleaned;
  if (cleaned.startsWith("254")) return "+" + cleaned;
  if (cleaned.startsWith("0")) return "+254" + cleaned.slice(1);
  return cleaned;
}


/* =======================================================
   AUTH HANDLERS
   Wired to modal panels after DOM is ready.
======================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("modal");

  /* ---- Grab panels ---- */
  const panels = modal.querySelectorAll(".modal-panel");
  const loginPanel = panels[0];
  const voucherPanel = panels[1];
  const receiptPanel = panels[2];

  /* ---- LOGIN ---- */
  const loginBtn = loginPanel.querySelector(".modal-connect");
  const usernameInput = loginPanel.querySelector("input[type='text']");
  const passwordInput = loginPanel.querySelector("input[type='password']");

  loginBtn.addEventListener("click", async () => {
    clearFieldErrors(loginPanel);

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    /* Client-side validation */
    let hasError = false;
    if (!username) { showFieldError(usernameInput, "Username is required."); hasError = true; }
    if (!password) { showFieldError(passwordInput, "Password is required."); hasError = true; }
    if (hasError) return;

    setButtonLoading(loginBtn, true, "Connect");
    const loading = showToast("Authenticating…", "loading", 0);

    try {
      const result = await mockLoginAPI(username, password);
      loading.dismiss();
      modal.classList.remove("open");
      usernameInput.value = "";
      passwordInput.value = "";
      showToast(`Welcome back, ${result.username}! Connected for ${result.session}.`, "success", 5000);
      /* 
        INTEGRATION POINT:
        After real login success, MikroTik hotspot will redirect
        the browser via: window.location.href = loginUrl;
        That redirect is handled by MikroTik's login.html variables.
      */
    } catch (err) {
      loading.dismiss();
      showToast(err.message, "error");
      if (err.code === "INVALID_CREDENTIALS") {
        showFieldError(passwordInput, "Incorrect username or password.");
      }
    } finally {
      setButtonLoading(loginBtn, false, "Connect");
    }
  });

  /* Allow Enter key on login inputs */
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") loginBtn.click();
    });
  });


  /* ---- VOUCHER ---- */
  const voucherBtn = voucherPanel.querySelector(".modal-connect");
  const voucherInput = voucherPanel.querySelector("input");

  voucherBtn.addEventListener("click", async () => {
    clearFieldErrors(voucherPanel);
    const code = voucherInput.value.trim();

    if (!code) {
      showFieldError(voucherInput, "Please enter a voucher code.");
      return;
    }

    setButtonLoading(voucherBtn, true, "Redeem");
    const loading = showToast("Validating voucher…", "loading", 0);

    try {
      const result = await mockVoucherAPI(code);
      loading.dismiss();
      modal.classList.remove("open");
      voucherInput.value = "";
      showToast(`Voucher redeemed! Plan: ${result.plan}. Enjoy your session.`, "success", 6000);
      /* INTEGRATION POINT: trigger MikroTik login with voucher as password */
    } catch (err) {
      loading.dismiss();
      showToast(err.message, "error");
      showFieldError(voucherInput, err.message);
    } finally {
      setButtonLoading(voucherBtn, false, "Redeem");
    }
  });

  voucherInput.addEventListener("keydown", e => {
    if (e.key === "Enter") voucherBtn.click();
  });


  /* ---- RECEIPT ---- */
  const receiptBtn = receiptPanel.querySelector(".modal-connect");
  const receiptInput = receiptPanel.querySelector("input");

  receiptBtn.addEventListener("click", async () => {
    clearFieldErrors(receiptPanel);
    const receiptNo = receiptInput.value.trim();

    if (!receiptNo) {
      showFieldError(receiptInput, "Please enter your receipt number.");
      return;
    }

    setButtonLoading(receiptBtn, true, "Verify");
    const loading = showToast("Verifying receipt…", "loading", 0);

    try {
      const result = await mockReceiptAPI(receiptNo);
      loading.dismiss();
      modal.classList.remove("open");
      receiptInput.value = "";
      showToast(`Verified! Plan: ${result.plan}. Connecting you now.`, "success", 6000);
      /* INTEGRATION POINT: activate session via Centipede billing API */
    } catch (err) {
      loading.dismiss();
      showToast(err.message, "error");
      showFieldError(receiptInput, err.message);
    } finally {
      setButtonLoading(receiptBtn, false, "Verify");
    }
  });

  receiptInput.addEventListener("keydown", e => {
    if (e.key === "Enter") receiptBtn.click();
  });


  /* ---- PAYMENT (M-Pesa STK Push) ---- */
  const paymentModal = document.getElementById("paymentModal");
  const phoneInput = document.getElementById("phoneNumber");
  const payNowBtn = document.getElementById("payNow");
  const selectedPlanEl = document.getElementById("selectedPlan");

  /* Clear phone field & errors when payment modal opens */
  const observer = new MutationObserver(() => {
    if (paymentModal.classList.contains("open")) {
      phoneInput.value = "";
      clearFieldErrors(paymentModal.querySelector(".modal-panel"));
    }
  });
  observer.observe(paymentModal, { attributes: true, attributeFilter: ["class"] });

  payNowBtn.addEventListener("click", async () => {
    clearFieldErrors(paymentModal.querySelector(".modal-panel"));

    const phone = phoneInput.value.trim();
    const planName = selectedPlanEl.textContent.replace("Plan: ", "").trim();

    /* Validate phone */
    if (!phone) {
      showFieldError(phoneInput, "Phone number is required.");
      return;
    }
    if (!validateKenyanPhone(phone)) {
      showFieldError(phoneInput, "Enter a valid Kenyan number e.g. 0712 345 678");
      return;
    }

    const normalized = normalizePhone(phone);

    setButtonLoading(payNowBtn, true, "Pay Now");
    paymentModal.classList.remove("open");

    const loading = showToast(
      `STK push sent to ${normalized}. Check your phone and enter M-Pesa PIN…`,
      "loading",
      0
    );

    try {
      const result = await mockMpesaSTK(normalized, planName);
      loading.dismiss();
      showToast(
        `Payment successful! Receipt: ${result.receipt}. Your session is now active.`,
        "success",
        7000
      );
      /* 
        INTEGRATION POINT (Centipede + MikroTik):
        1. Centipede receives M-Pesa callback → creates user/voucher
        2. Poll or webhook: GET /session-status?receipt={result.receipt}
        3. On confirmed → redirect to MikroTik login URL with credentials
      */
    } catch (err) {
      loading.dismiss();
      showToast(err.message, "error", 5000);
      /* Re-open payment modal so user can retry */
      setTimeout(() => paymentModal.classList.add("open"), 400);
    } finally {
      setButtonLoading(payNowBtn, false, "Pay Now");
    }
  });

  phoneInput.addEventListener("keydown", e => {
    if (e.key === "Enter") payNowBtn.click();
  });

});