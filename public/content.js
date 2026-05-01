console.log("[Molfi] Content script active");

function extractQuestion() {
  // Polymarket question is usually in an H1 or a specific large text element
  const questionElement = document.querySelector('h1');
  if (questionElement) {
    const question = questionElement.innerText.trim();
    if (question) {
      console.log("[Molfi] Found Question:", question);
      chrome.runtime.sendMessage({
        type: "POLYMARKET_DETECTED",
        question: question,
        url: window.location.href
      });
    }
  }
}

// SPA URL change detection
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (location.href.includes("polymarket.com/event/")) {
      setTimeout(extractQuestion, 2000); // Wait for load
    }
  }
}, 1000);

if (location.href.includes("polymarket.com/event/")) {
  setTimeout(extractQuestion, 2000);
}
