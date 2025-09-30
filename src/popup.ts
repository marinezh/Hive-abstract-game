const popupRules = document.querySelector("#popup-rules") as HTMLDivElement;
const closeRules = document.querySelector("#close-rules") as HTMLSpanElement;
const showRules = document.querySelector("#show-rules") as HTMLButtonElement;

// Show popup
if (showRules) {
  showRules.addEventListener("click", () => {
    popupRules.classList.remove("hidden");
  });
}

// Hide popup when X clicked
if (closeRules) {
  closeRules.addEventListener("click", () => {
    popupRules.classList.add("hidden");
  });
}

// Hide popup when clicking outside content
if (popupRules) {
  popupRules.addEventListener("click", (e) => {
    if (e.target === popupRules) {
      popupRules.classList.add("hidden");
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  let overlay = document.getElementById("popup-overlay");
  if (overlay) {
    overlay.classList.add("hidden");
    overlay.innerHTML = ""; // Clear any content
  }
});

export function showWinnerPopup(winner: "White" | "Black") {
  // Get or create the overlay
  let overlay = document.getElementById("popup-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "popup-overlay";
    overlay.className = "hidden";
    document.body.appendChild(overlay);
  }
  overlay.classList.remove("hidden");

  // Create the popup box
  overlay.innerHTML = `
    <div class="popup">
      <h2>${winner} wins!</h2>
      <span id="close-popup">&times;</span>
    </div>
  `;

  // Attach close handler using event delegation
  overlay.onclick = (e) => {
    const target = e.target as HTMLElement;
    if (target && target.id === "close-popup") {
      overlay.classList.add("hidden");
      window.location.reload(); // Reloads the page and starts a new game
    }
  };
}

// Optionally, you can add a function to hide the popup
export function hideWinnerPopup() {
  const overlay = document.getElementById("popup-overlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }
}