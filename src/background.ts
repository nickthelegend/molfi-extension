/**
 * Molfi Background Service Worker
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Molfi] Extension installed");
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'QUICK_RESEARCH_AND_TRADE') {
    console.log("[Molfi] Quick research triggered for:", message.marketQuestion);
    
    // Get the user's wallet address from storage (set by the popup/app)
    chrome.storage.local.get(['walletAddress'], async (result) => {
      const walletAddress = result.walletAddress;
      if (!walletAddress) {
        console.error("[Molfi] No wallet address found in storage");
        sendResponse({ success: false, error: "Please connect your wallet in the Molfi extension" });
        return;
      }

      try {
        const response = await fetch('http://localhost:3002/api/research/quick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: walletAddress,
            marketQuestion: message.marketQuestion,
            marketId: message.marketId
          })
        });
        const json = await response.json();
        sendResponse(json);
      } catch (error) {
        console.error("[Molfi] Quick research API error:", error);
        sendResponse({ success: false, error: "API connection failed" });
      }
    });

    return true; // Keep channel open for async response
  }

  if (message.type === 'START_RESEARCH') {
    console.log("[Molfi] Starting research for:", message.marketQuestion);
    
    // Open the side panel
    // Note: chrome.sidePanel.open is available in Chrome 116+
    if (chrome.sidePanel) {
      chrome.sidePanel.open({ tabId: sender.tab?.id });
    }

    // You could also store the pending research in storage for the side panel to pick up
    chrome.storage.local.set({ 
      pendingResearch: {
        question: message.marketQuestion,
        url: message.url,
        timestamp: Date.now()
      }
    });
  }
});
