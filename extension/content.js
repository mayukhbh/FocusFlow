// Content script for Focus Mode extension
(function() {
  'use strict';

  let researchModeEnabled = false;

  // YouTube selectors for distracting elements
  const youtubeSelectors = [
    '#related',                    // Related videos sidebar
    '#comments',                   // Comments section
    '#secondary',                  // Entire secondary column (related videos)
    '#shorts-container',           // YouTube Shorts
    '[data-testid="shorts"]',      // Shorts alternative selector
    '.ytd-compact-video-renderer', // Related video thumbnails
    '.ytd-video-secondary-info-renderer', // Video info that might be distracting
    '#masthead-ad',                // Header ads
    '.ytd-display-ad-renderer',    // Display ads
    '#player-ads',                 // Video player ads container
    '.ytp-suggested-action',       // Suggested actions overlay
    '.ytp-cards-button',           // Info cards button
    '.ytp-ce-element',             // End screen elements
    '#end-screen',                 // End screen
    '.ytd-watch-next-secondary-results-renderer .ytd-compact-video-renderer:nth-child(n+6)' // Limit related videos
  ];

  // Reddit selectors for distracting elements  
  const redditSelectors = [
    '[data-testid="popular-posts"]',     // Popular posts sidebar
    '[data-testid="trending-posts"]',    // Trending posts
    '.promotedlink',                     // Promoted/sponsored posts
    '[data-promoted="true"]',            // Alternative promoted posts selector
    '.premium-banner',                   // Premium upgrade banners
    '.SidebarAd',                        // Sidebar advertisements
    '.native-ad',                        // Native advertising
    '[data-click-id="promoted"]',        // Promoted content
    '.sidebar-trending',                 // Trending in sidebar
    '.subreddit-suggestions',            // Subreddit suggestions
    '.recommended-communities',          // Recommended communities
    '.sidebar .widget:has([href*="premium"])', // Premium widgets
    '.crosspost-preview',                // Cross-post previews that might distract
    '.awardings-bar'                     // Awards that might be distracting
  ];

  // Initialize extension
  init();

  async function init() {
    // Load saved state
    try {
      const result = await chrome.storage.sync.get(['researchMode']);
      researchModeEnabled = result.researchMode || false;
      
      if (researchModeEnabled) {
        hideDistractingElements();
      }
    } catch (error) {
      console.error('Focus Mode: Error loading settings:', error);
    }

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleResearchMode') {
        researchModeEnabled = request.enabled;
        if (researchModeEnabled) {
          hideDistractingElements();
        } else {
          showDistractingElements();
        }
        sendResponse({ success: true });
      }
    });

    // Watch for dynamic content changes
    observePageChanges();
  }

  function hideDistractingElements() {
    const currentSite = getCurrentSite();
    let selectors = [];

    if (currentSite === 'youtube') {
      selectors = youtubeSelectors;
    } else if (currentSite === 'reddit') {
      selectors = redditSelectors;
    }

    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element && !element.hasAttribute('data-focus-mode-hidden')) {
            element.style.setProperty('display', 'none', 'important');
            element.setAttribute('data-focus-mode-hidden', 'true');
          }
        });
      } catch (error) {
        console.warn('Focus Mode: Error hiding element with selector:', selector, error);
      }
    });

    // Add visual indicator that research mode is active
    addResearchModeIndicator();
  }

  function showDistractingElements() {
    const hiddenElements = document.querySelectorAll('[data-focus-mode-hidden="true"]');
    hiddenElements.forEach(element => {
      element.style.removeProperty('display');
      element.removeAttribute('data-focus-mode-hidden');
    });

    // Remove research mode indicator
    removeResearchModeIndicator();
  }

  function addResearchModeIndicator() {
    // Remove existing indicator first
    removeResearchModeIndicator();

    const indicator = document.createElement('div');
    indicator.id = 'focus-mode-indicator';
    indicator.innerHTML = '🎯 Research Mode Active';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
      pointer-events: none;
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(indicator);
    
    // Fade in effect
    setTimeout(() => {
      indicator.style.opacity = '0.9';
    }, 100);
  }

  function removeResearchModeIndicator() {
    const existing = document.getElementById('focus-mode-indicator');
    if (existing) {
      existing.remove();
    }
  }

  function getCurrentSite() {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.includes('youtube.com')) {
      return 'youtube';
    } else if (hostname.includes('reddit.com')) {
      return 'reddit';
    }
    return null;
  }

  function observePageChanges() {
    // Create observer to watch for dynamic content
    const observer = new MutationObserver((mutations) => {
      if (researchModeEnabled) {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldUpdate = true;
          }
        });
        
        if (shouldUpdate) {
          // Debounce the hiding function to avoid excessive calls
          clearTimeout(window.focusModeTimeout);
          window.focusModeTimeout = setTimeout(() => {
            hideDistractingElements();
          }, 500);
        }
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Handle page navigation for SPAs
  let currentUrl = window.location.href;
  new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      if (researchModeEnabled) {
        setTimeout(() => {
          hideDistractingElements();
        }, 1000); // Wait for page to load
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

})();