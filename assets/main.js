const tabCards = document.querySelectorAll(".tab-card");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.2 }
);

tabCards.forEach((card) => observer.observe(card));

const assistantButtons = document.querySelectorAll("[data-assistant-action]");
const statusLine = document.querySelector(".assistant-status");

assistantButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (statusLine) {
      statusLine.textContent = button.dataset.assistantAction;
    }
  });
});
