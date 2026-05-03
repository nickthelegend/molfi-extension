chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PROTOCOL_DETECTED" || message.type === "POLYMARKET_DETECTED") {
    console.log("[Molfi] Signal received:", message.protocol || "Polymarket");
    
    const context = {
      protocol: message.protocol || "Polymarket",
      url: message.url,
      data: message.data || {},
      timestamp: Date.now()
    };

    chrome.storage.local.set({ currentContext: context });

    // Attempt to open the side panel
    if (chrome.sidePanel && sender.tab) {
      chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: 'index.html',
        enabled: true
      });
      chrome.sidePanel.open({ tabId: sender.tab.id }).catch(err => {
        console.log("Sidepanel open failed:", err);
      });
    }
  }
});
