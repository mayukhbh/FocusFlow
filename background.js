// Background script for Focus Mode extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Focus Mode extension installed');
  
  // Set default state
  chrome.storage.sync.set({
    researchMode: false
  });
});

// Handle extension icon click (optional - popup handles most interactions)
chrome.action.onClicked.addListener(async (tab) => {
  // This would only fire if no popup is defined
  // Since we have a popup, this is just a fallback
  try {
    if (tab.url.includes('youtube.com') || tab.url.includes('reddit.com')) {
      // Toggle research mode
      const result = await chrome.storage.sync.get(['researchMode']);
      const newState = !(result.researchMode || false);
      
      await chrome.storage.sync.set({ researchMode: newState });
      
      // Send message to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'toggleResearchMode',
        enabled: newState
      });
    }
  } catch (error) {
    console.error('Error in background script:', error);
  }
});

// Listen for tab updates to re-apply research mode on navigation
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('youtube.com') || tab.url.includes('reddit.com')) {
      try {
        const result = await chrome.storage.sync.get(['researchMode']);
        if (result.researchMode) {
          // Small delay to ensure content script is loaded
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, {
              action: 'toggleResearchMode',
              enabled: true
            }).catch(error => {
              // Ignore errors - content script might not be ready yet
              console.log('Content script not ready yet:', error);
            });
          }, 1000);
        }
      } catch (error) {
        console.error('Error handling tab update:', error);
      }
    }
  }
});