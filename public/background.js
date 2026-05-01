chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "POLYMARKET_DETECTED") {
    console.log("[Molfi] Signal received:", message.question);
    
    chrome.storage.local.set({ 
      pendingSwarm: {
        question: message.question,
        marketId: message.url.split('/').pop(),
        timestamp: Date.now()
      }
    });

    // Attempt to open the side panel
    if (chrome.sidePanel && sender.tab) {
      chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: 'index.html',
        enabled: true
      });
      chrome.sidePanel.open({ tabId: sender.tab.id }).catch(err => {
        console.log("Sidepanel open failed, likely needs user gesture or is already open:", err);
      });
    }
  }
});
