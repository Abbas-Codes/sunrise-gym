const animatedElements = document.querySelectorAll(".scroll");

function handleScroll() {
  const screenHeight = window.innerHeight;

  // Divide screen into 5 equal parts
  const partHeight = screenHeight / 5;

  // Part 4 starting position
  const triggerPoint = partHeight * 4;

  animatedElements.forEach((element) => {
    const elementPosition = element.getBoundingClientRect().top;

    if (elementPosition <= triggerPoint) {
      element.classList.add("show");
    }
  });
}

window.addEventListener("scroll", handleScroll);

// Run once when page loads
handleScroll();