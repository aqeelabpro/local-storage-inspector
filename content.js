// Content script to interact with page's local storage
class LocalStorageManager {
  constructor() {
    this.setupMessageListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'getLocalStorage':
          this.getLocalStorage(request.domain, sendResponse);
          return true;
        
        case 'clearLocalStorage':
          this.clearLocalStorage(request.domain, sendResponse);
          return true;
        
        case 'deleteStorageItem':
          this.deleteStorageItem(request.domain, request.key, sendResponse);
          return true;
        
        case 'setStorageItem':
          this.setStorageItem(request.domain, request.key, request.value, sendResponse);
          return true;
        
        case 'inspectDomain':
          this.inspectDomain(request.domain, sendResponse);
          return true;
      }
    });
  }

  getLocalStorage(domain, sendResponse) {
    try {
      // For same domain, we can access localStorage directly
      if (this.isSameDomain(domain)) {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          data[key] = localStorage.getItem(key);
        }
        sendResponse({ success: true, data });
      } else {
        // For cross-domain, we'd need a different approach
        // This is a simplified version - in production, you'd need more security measures
        sendResponse({ success: false, error: 'Cross-domain access not implemented' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  clearLocalStorage(domain, sendResponse) {
    try {
      if (this.isSameDomain(domain)) {
        localStorage.clear();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Cross-domain access not implemented' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  deleteStorageItem(domain, key, sendResponse) {
    try {
      if (this.isSameDomain(domain)) {
        localStorage.removeItem(key);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Cross-domain access not implemented' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  setStorageItem(domain, key, value, sendResponse) {
    try {
      if (this.isSameDomain(domain)) {
        localStorage.setItem(key, value);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Cross-domain access not implemented' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  inspectDomain(domain, sendResponse) {
    // Store the inspected domain
    chrome.storage.local.get(['inspectedDomains'], (result) => {
      const domains = result.inspectedDomains || [];
      if (!domains.includes(domain)) {
        domains.push(domain);
        chrome.storage.local.set({ inspectedDomains: domains });
      }
      sendResponse({ success: true });
    });
  }

  isSameDomain(domain) {
    return window.location.hostname === domain || 
           window.location.hostname.includes(domain) ||
           domain.includes(window.location.hostname);
  }
}

// Initialize the local storage manager
new LocalStorageManager();