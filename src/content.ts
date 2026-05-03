/**
 * Molfi Content Script
 * Detects Polymarket events and offers autonomous research.
 */

console.log("[Molfi] Content script loaded");

function injectResearchButton() {
  if (document.getElementById('molfi-research-btn')) return;

  const btn = document.createElement('div');
  btn.id = 'molfi-research-btn';
  btn.innerHTML = `
    <div style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #ad46ff;
      color: white;
      padding: 12px 20px;
      border-radius: 16px;
      font-family: 'Inter', sans-serif;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(173, 70, 255, 0.4);
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 12px;
    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12L2.1 12.1"></path><path d="M12 12l9.9-0.1"></path><path d="M12 12V22"></path></svg>
      Run Swarm Research
    </div>
  `;

  btn.onclick = () => {
    const marketQuestion = document.querySelector('h1')?.innerText || "this market";
    
    // In Polymarket, the ID is often in the data attributes or URL
    // We'll try to extract it from the URL as a fallback
    const marketIdMatch = window.location.href.match(/\/event\/([^/?]+)/);
    const marketId = marketIdMatch ? marketIdMatch[1] : null;

    btn.style.opacity = '0.7';
    btn.innerHTML = 'Analyzing...';
    
    chrome.runtime.sendMessage({ 
      type: 'QUICK_RESEARCH_AND_TRADE', 
      marketQuestion: marketQuestion,
      marketId: marketId,
      url: window.location.href
    }, (response: any) => {
      if (response && response.success) {
        btn.innerHTML = 'Research Sent!';
        setTimeout(() => {
          btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12L2.1 12.1"></path><path d="M12 12l9.9-0.1"></path><path d="M12 12V22"></path></svg>
            Run Swarm Research
          `;
          btn.style.opacity = '1';
        }, 3000);
      }
    });
  };

  document.body.appendChild(btn);
}

// Check if we are on a Polymarket event page
if (window.location.href.includes('polymarket.com/event/')) {
  // Wait for content to load
  setTimeout(injectResearchButton, 2000);
}

// Observe URL changes (Polymarket is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (url.includes('polymarket.com/event/')) {
      setTimeout(injectResearchButton, 1000);
    } else {
      document.getElementById('molfi-research-btn')?.remove();
    }
  }
}).observe(document, {subtree: true, childList: true});
