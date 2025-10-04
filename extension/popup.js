// Popup script for Focus Mode extension
document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('researchModeToggle');
  const toggleLabel = document.getElementById('toggleLabel');
  const toggleDescription = document.getElementById('toggleDescription');
  const siteStatus = document.getElementById('siteStatus');

  // Get current tab information
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    updateSiteStatus(tab.url);
  } catch (error) {
    console.error('Error getting current tab:', error);
  }

  // Load saved state
  const result = await chrome.storage.sync.get(['researchMode']);
  const isResearchMode = result.researchMode || false;
  
  toggle.checked = isResearchMode;
  updateToggleUI(isResearchMode);

  // Handle toggle changes
  toggle.addEventListener('change', async (event) => {
    const newState = event.target.checked;
    
    // Save state
    await chrome.storage.sync.set({ researchMode: newState });
    
    // Update UI
    updateToggleUI(newState);
    
    // Send message to content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (isSupportedSite(tab.url)) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'toggleResearchMode',
          enabled: newState
        });
      }
    } catch (error) {
      console.error('Error sending message to content script:', error);
    }
  });

  function updateToggleUI(isEnabled) {
    if (isEnabled) {
      toggleLabel.textContent = 'Research Mode ON';
      toggleDescription.textContent = 'Distractions are hidden';
    } else {
      toggleLabel.textContent = 'Research Mode OFF';
      toggleDescription.textContent = 'Distracting elements are visible';
    }
  }

  function updateSiteStatus(url) {
    if (url.includes('youtube.com')) {
      siteStatus.innerHTML = '<span class="site-icon">📺</span> YouTube - Supported';
    } else if (url.includes('reddit.com')) {
      siteStatus.innerHTML = '<span class="site-icon">📱</span> Reddit - Supported';
    } else {
      siteStatus.innerHTML = '<span class="site-icon">🌐</span> Site not supported';
    }
  }

  function isSupportedSite(url) {
    return url.includes('youtube.com') || url.includes('reddit.com');
  }
});