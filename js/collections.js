/**
 * Collections Page Interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  const collectionCards = document.querySelectorAll(".collection-card");

  if (window.gsap && collectionCards.length > 0) {
    gsap.from(".collection-card", {
      opacity: 0,
      y: 30,
      stagger: 0.12,
      duration: 0.6,
      ease: "power2.out"
    });
  }

  collectionCards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      const img = card.querySelector(".collection-card-bg");
      if (img && window.gsap) {
        gsap.to(img, { scale: 1.05, duration: 0.5, ease: "power1.out" });
      }
    });

    card.addEventListener("mouseleave", () => {
      const img = card.querySelector(".collection-card-bg");
      if (img && window.gsap) {
        gsap.to(img, { scale: 1, duration: 0.5, ease: "power1.out" });
      }
    });
  });
});
