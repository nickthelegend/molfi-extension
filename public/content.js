(function() {
  console.log("[Molfi] Protocol detector loaded");

  function detectProtocol() {
    const url = window.location.href;
    let protocol = null;
    let data = {};
    
    if (url.includes('uniswap.org')) {
      protocol = 'Uniswap';
      // Try to find tokens from the URL or DOM
      const match = url.match(/outputCurrency=([^&]+)/);
      if (match) data.targetToken = match[1];
    }
    else if (url.includes('aave.com')) {
      protocol = 'Aave';
    }
    else if (url.includes('polymarket.com')) {
      protocol = 'Polymarket';
    }

    if (protocol) {
      console.log(`[Molfi] Detected ${protocol}`);
      chrome.runtime.sendMessage({ 
        type: 'PROTOCOL_DETECTED', 
        protocol,
        url,
        data
      }).catch(err => {
        // Ignore errors if extension context is invalidated
      });
    }
  }

  // Initial detection
  detectProtocol();
  
  // Observe for URL changes in SPAs
  let lastUrl = location.href; 
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      detectProtocol();
    }
  }).observe(document, {subtree: true, childList: true});

})();
