// ZenArc Tab Manager - Background Script
// Manages automatic tab closing with configurable timeout

class TabManager {
  constructor() {
    this.tabTimers = new Map(); // tabId -> timer info
    this.settings = {
      autoCloseHours: 12, // default 12 hours
      enabled: true
    };
    
    this.init();
  }
  
  async init() {
    // Load settings from storage
    await this.loadSettings();
    
    // Load persistent timers from storage
    await this.loadPersistentTimers();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize timers for existing tabs
    await this.initializeExistingTabs();
  }
  
  async loadSettings() {
    try {
      const result = await browser.storage.sync.get(['autoCloseHours', 'enabled']);
      this.settings.autoCloseHours = result.autoCloseHours || 12;
      this.settings.enabled = result.enabled !== false; // default to true
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }
  
  async saveSettings() {
    try {
      await browser.storage.sync.set(this.settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
  
  async loadPersistentTimers() {
    try {
      const result = await browser.storage.local.get(['persistentTimers']);
      const persistentTimers = result.persistentTimers || {};
      
      // Get all currently open tabs
      const tabs = await browser.tabs.query({});
      const currentTabIds = new Set(tabs.map(tab => tab.id.toString()));
      
      // Process persistent timers
      for (const [tabIdStr, timerData] of Object.entries(persistentTimers)) {
        const tabId = parseInt(tabIdStr);
        
        if (!currentTabIds.has(tabIdStr)) {
          // Tab no longer exists, skip
          continue;
        }
        
        const now = Date.now();
        const closeTime = timerData.closeTime;
        
        if (now >= closeTime) {
          // Time has passed, close the tab immediately
          console.log(`Persistent timer expired for tab ${tabId}, closing immediately`);
          await this.closeTab(tabId);
        } else {
          // Restore the timer with remaining time
          const remainingTime = closeTime - now;
          console.log(`Restoring timer for tab ${tabId} with ${Math.round(remainingTime/1000)}s remaining`);
          
          const timerId = setTimeout(() => {
            this.closeTab(tabId);
          }, remainingTime);
          
          this.tabTimers.set(tabId, {
            timerId,
            startTime: timerData.startTime,
            timeoutMs: timerData.timeoutMs,
            closeTime: closeTime,
            persistent: true
          });
        }
      }
      
      // Clean up storage for tabs that no longer exist
      await this.cleanupPersistentStorage();
      
    } catch (error) {
      console.error('Failed to load persistent timers:', error);
    }
  }
  
  async savePersistentTimer(tabId, timerInfo) {
    try {
      const result = await browser.storage.local.get(['persistentTimers']);
      const persistentTimers = result.persistentTimers || {};
      
      persistentTimers[tabId.toString()] = {
        startTime: timerInfo.startTime,
        timeoutMs: timerInfo.timeoutMs,
        closeTime: timerInfo.closeTime
      };
      
      await browser.storage.local.set({ persistentTimers });
    } catch (error) {
      console.error('Failed to save persistent timer:', error);
    }
  }
  
  async removePersistentTimer(tabId) {
    try {
      const result = await browser.storage.local.get(['persistentTimers']);
      const persistentTimers = result.persistentTimers || {};
      
      delete persistentTimers[tabId.toString()];
      
      await browser.storage.local.set({ persistentTimers });
    } catch (error) {
      console.error('Failed to remove persistent timer:', error);
    }
  }
  
  async cleanupPersistentStorage() {
    try {
      const result = await browser.storage.local.get(['persistentTimers']);
      const persistentTimers = result.persistentTimers || {};
      
      // Get all currently open tabs
      const tabs = await browser.tabs.query({});
      const currentTabIds = new Set(tabs.map(tab => tab.id.toString()));
      
      // Remove timers for tabs that no longer exist
      let needsUpdate = false;
      for (const tabIdStr of Object.keys(persistentTimers)) {
        if (!currentTabIds.has(tabIdStr)) {
          delete persistentTimers[tabIdStr];
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await browser.storage.local.set({ persistentTimers });
        console.log('Cleaned up persistent storage for closed tabs');
      }
    } catch (error) {
      console.error('Failed to cleanup persistent storage:', error);
    }
  }
  
  setupEventListeners() {
    // Listen for new tabs
    browser.tabs.onCreated.addListener((tab) => {
      if (!tab.pinned) {
        this.startTimer(tab.id);
      }
    });
    
    // Listen for tab updates (pinned status changes)
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.pinned !== undefined) {
        if (changeInfo.pinned) {
          // Tab was pinned, remove timer
          this.clearTimer(tabId);
        } else {
          // Tab was unpinned, start timer
          this.startTimer(tabId);
        }
      }
    });
    
    // Listen for tab activation (reset timer on activity)
    browser.tabs.onActivated.addListener(({ tabId }) => {
      if (this.tabTimers.has(tabId)) {
        this.resetTimer(tabId);
      }
    });
    
    // Clean up timers when tabs are closed
    browser.tabs.onRemoved.addListener((tabId) => {
      this.clearTimer(tabId);
    });
    
    // Listen for settings changes
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        if (changes.autoCloseHours) {
          this.settings.autoCloseHours = changes.autoCloseHours.newValue;
          this.updateAllTimers();
        }
        if (changes.enabled !== undefined) {
          this.settings.enabled = changes.enabled.newValue;
          if (this.settings.enabled) {
            this.initializeExistingTabs();
          } else {
            this.clearAllTimers();
          }
        }
      }
    });
  }
  
  async initializeExistingTabs() {
    if (!this.settings.enabled) return;
    
    try {
      const tabs = await browser.tabs.query({});
      tabs.forEach(tab => {
        if (!tab.pinned && !this.tabTimers.has(tab.id)) {
          // Only start timer if tab doesn't already have one from persistent storage
          this.startTimer(tab.id);
        }
      });
    } catch (error) {
      console.error('Failed to initialize existing tabs:', error);
    }
  }
  
  startTimer(tabId) {
    if (!this.settings.enabled) return;
    
    // Clear existing timer if any
    this.clearTimer(tabId);
    
    // Calculate timeout in milliseconds
    const timeoutMs = this.settings.autoCloseHours * 60 * 60 * 1000; // hours to milliseconds
    
    const startTime = Date.now();
    const closeTime = startTime + timeoutMs;
    
    const timerId = setTimeout(() => {
      this.closeTab(tabId);
    }, timeoutMs);
    
    const timerInfo = {
      timerId,
      startTime,
      timeoutMs,
      closeTime,
      persistent: false
    };
    
    this.tabTimers.set(tabId, timerInfo);
    
    // Save persistent timer to storage
    this.savePersistentTimer(tabId, timerInfo);
  }
  
  resetTimer(tabId) {
    if (this.tabTimers.has(tabId)) {
      this.startTimer(tabId);
    }
  }
  
  clearTimer(tabId) {
    const timerInfo = this.tabTimers.get(tabId);
    if (timerInfo) {
      clearTimeout(timerInfo.timerId);
      this.tabTimers.delete(tabId);
      // Remove from persistent storage
      this.removePersistentTimer(tabId);
    }
  }
  
  clearAllTimers() {
    this.tabTimers.forEach((timerInfo, tabId) => {
      clearTimeout(timerInfo.timerId);
    });
    this.tabTimers.clear();
    
    // Clear all persistent timers
    this.clearAllPersistentTimers();
  }
  
  async clearAllPersistentTimers() {
    try {
      await browser.storage.local.set({ persistentTimers: {} });
      console.log('Cleared all persistent timers');
    } catch (error) {
      console.error('Failed to clear all persistent timers:', error);
    }
  }
  
  updateAllTimers() {
    if (!this.settings.enabled) return;
    
    // Restart all timers with new timeout
    const tabIds = [...this.tabTimers.keys()];
    tabIds.forEach(tabId => {
      this.startTimer(tabId);
    });
  }
  
  async closeTab(tabId) {
    try {
      // Double-check that tab still exists and isn't pinned
      const tab = await browser.tabs.get(tabId);
      if (tab && !tab.pinned) {
        const timeoutDesc = `${this.settings.autoCloseHours} hours`;
        
        // Remove from persistent storage before closing
        await this.removePersistentTimer(tabId);
        
        await browser.tabs.remove(tabId);
        console.log(`Auto-closed tab ${tabId} after ${timeoutDesc}`);
        
        // Clean up in-memory timer
        this.tabTimers.delete(tabId);
      }
    } catch (error) {
      // Tab might already be closed, just clean up
      this.clearTimer(tabId);
    }
  }
  
  // Methods for popup communication
  getStatus() {
    return {
      enabled: this.settings.enabled,
      autoCloseHours: this.settings.autoCloseHours,
      activeTimers: this.tabTimers.size
    };
  }
  
  async updateSettings(newSettings) {
    const oldEnabled = this.settings.enabled;
    
    Object.assign(this.settings, newSettings);
    await this.saveSettings();
    
    // Handle enable/disable toggle
    if (oldEnabled !== this.settings.enabled) {
      if (this.settings.enabled) {
        await this.initializeExistingTabs();
      } else {
        this.clearAllTimers();
      }
    } else if (this.settings.enabled) {
      // Update existing timers if settings changed
      this.updateAllTimers();
    }
  }
}

// Initialize tab manager
const tabManager = new TabManager();

// Handle messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getStatus':
      sendResponse(tabManager.getStatus());
      break;
      
    case 'updateSettings':
      tabManager.updateSettings(request.settings)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Will respond asynchronously
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

console.log('ZenArc Tab Manager background script loaded');