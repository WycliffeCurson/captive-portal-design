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

});
