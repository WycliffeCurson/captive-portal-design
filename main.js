document.addEventListener("DOMContentLoaded", () => {

  const tabs = document.querySelectorAll(".tab");
  const track = document.querySelector(".plans-track");

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      track.style.transform = `translateX(-${index * 100}%)`;
    });
  });

  const modal = document.getElementById("modal");
  const openBtn = document.getElementById("openModal");
  const closeBtn = document.getElementById("closeModal");

  openBtn.addEventListener("click", () => {
    modal.classList.add("open");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
  });

  modal.querySelector(".modal-overlay").addEventListener("click", () => {
    modal.classList.remove("open");
  });

});
