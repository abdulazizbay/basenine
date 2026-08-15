console.log("Home frontend javascript file");

(function () {
  // Subtle one-time entrance animation only — no continuous motion,
  // keeping the admin screen calm and professional.

  var cards = document.querySelectorAll(".dash-card");
  var welcomePanel = document.getElementById("welcomePanel");

  if (cards.length) {
    anime({
      targets: cards,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 420,
      delay: anime.stagger(60),
      easing: "easeOutQuad",
    });
  }

  if (welcomePanel) {
    anime({
      targets: welcomePanel,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 450,
      easing: "easeOutQuad",
    });
  }
})();
