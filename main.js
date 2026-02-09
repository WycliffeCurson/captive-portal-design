document.addEventListener("DOMContentLoaded", () => {

  /* ======================
     PLANS SLIDER
  ====================== */
  const planTabs = document.querySelectorAll(".plans-nav .tab");
  const plansTrack = document.querySelector(".plans-track");

  planTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      planTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      plansTrack.style.transform = `translateX(-${index * 100}%)`;
    });
  });

  /* ======================
     MODAL OPEN / CLOSE
  ====================== */
  const modal = document.getElementById("modal");
  const openBtn = document.getElementById("openModal");
  const overlay = modal.querySelector(".modal-overlay");

  openBtn.addEventListener("click", () => {
    modal.classList.add("open");

    // reset modal slider
    modalTabs.forEach(t => t.classList.remove("active"));
    modalTabs[0].classList.add("active");
    modalTrack.style.transform = "translateX(0)";
  });

  overlay.addEventListener("click", () => {
    modal.classList.remove("open");
  });

  /* ======================
     MODAL SLIDER
  ====================== */
  const modalTabs = modal.querySelectorAll(".modal-tab");
  const modalTrack = modal.querySelector(".modal-track");

  modalTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      modalTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      modalTrack.style.transform = `translateX(-${index * 100}%)`;
    });
  });

  /* ======================
   PAYMENT MODAL
====================== */

  const paymentModal = document.getElementById("paymentModal");
  const paymentOverlay = paymentModal.querySelector(".modal-overlay");
  const selectedPlanText = document.getElementById("selectedPlan");

  const planCards = document.querySelectorAll(
    ".individual-card, .shared-card, .family-card"
  );

  planCards.forEach(card => {
    card.addEventListener("click", () => {
      const planName = card.textContent;

      selectedPlanText.textContent = `Plan: ${planName}`;

      modal.classList.remove("open"); // close auth modal

      paymentModal.classList.add("open");
    });
  });

  paymentOverlay.addEventListener("click", () => {
    paymentModal.classList.remove("open");
  });

  document.getElementById("payNow").addEventListener("click", () => {
    const phone = document.getElementById("phoneNumber").value;

    if (!phone) {
      alert("Please enter your phone number");
      return;
    }

    alert(`Payment request sent to ${phone}`);
    paymentModal.classList.remove("open");
  });
  


});
