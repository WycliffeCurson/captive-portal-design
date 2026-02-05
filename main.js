const tabs = document.querySelectorAll(".tab");
const track = document.querySelector(".plans-track");

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    // active tab
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    // slide panels
    track.style.transform = `translateX(-${index * 100}%)`;
  });
});