// ZenArc Tab Manager - Popup Script
// Handles UI interactions and communication with background script

class PopupManager {
  constructor() {
    this.timeOptions = document.querySelectorAll('.time-option');
    this.enableToggle = document.getElementById('enableToggle');
    this.statusIndicator = document.getElementById('statusIndicator');
    this.statusText = document.getElementById('statusText');
    this.activeTimers = document.getElementById('activeTimers');
    this.saveIndicator = document.getElementById('saveIndicator');
    
    this.init();
  }
  
  async init() {
    // Load current status and settings
    await this.loadStatus();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Time option selection
    this.timeOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const hours = parseInt(e.currentTarget.dataset.hours);
        this.selectTimeOption(hours);
        this.updateSettings({ autoCloseHours: hours });
      });
    });
    
    // Enable/disable toggle
    this.enableToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      this.updateStatusIndicator(enabled);
      this.updateSettings({ enabled });
    });
  }
  
  async loadStatus() {
    try {
      const response = await browser.runtime.sendMessage({ action: 'getStatus' });
      
      if (response) {
        // Update UI with current settings
        this.selectTimeOption(response.autoCloseHours);
        this.enableToggle.checked = response.enabled;
        this.updateStatusIndicator(response.enabled);
        this.activeTimers.textContent = response.activeTimers;
      }
    } catch (error) {
      console.error('Failed to load status:', error);
      this.showError('Failed to load settings');
    }
  }
  
  selectTimeOption(hours) {
    // Remove active class from all options
    this.timeOptions.forEach(option => {
      option.classList.remove('active');
    });
    
    // Add active class to selected option
    const selectedOption = document.querySelector(`[data-hours="${hours}"]`);
    if (selectedOption) {
      selectedOption.classList.add('active');
    }
  }
  
  updateStatusIndicator(enabled) {
    const statusDot = this.statusIndicator.querySelector('.status-dot');
    
    if (enabled) {
      statusDot.classList.remove('inactive');
      this.statusText.textContent = 'Active';
    } else {
      statusDot.classList.add('inactive');
      this.statusText.textContent = 'Disabled';
    }
  }
  
  async updateSettings(settings) {
    try {
      const response = await browser.runtime.sendMessage({
        action: 'updateSettings',
        settings: settings
      });
      
      if (response && response.success) {
        this.showSaveIndicator();
        // Refresh status to get updated timer count
        setTimeout(() => this.refreshStatus(), 100);
      } else {
        this.showError('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      this.showError('Failed to save settings');
    }
  }
  
  async refreshStatus() {
    try {
      const response = await browser.runtime.sendMessage({ action: 'getStatus' });
      if (response) {
        this.activeTimers.textContent = response.activeTimers;
      }
    } catch (error) {
      console.error('Failed to refresh status:', error);
    }
  }
  
  showSaveIndicator() {
    this.saveIndicator.classList.add('show');
    setTimeout(() => {
      this.saveIndicator.classList.remove('show');
    }, 2000);
  }
  
  showError(message) {
    // Create a temporary error indicator
    const errorIndicator = document.createElement('div');
    errorIndicator.className = 'save-indicator';
    errorIndicator.style.background = '#dc3545';
    errorIndicator.textContent = message;
    
    const footer = document.querySelector('.footer');
    footer.appendChild(errorIndicator);
    
    // Show error
    setTimeout(() => {
      errorIndicator.classList.add('show');
    }, 10);
    
    // Hide and remove error
    setTimeout(() => {
      errorIndicator.classList.remove('show');
      setTimeout(() => {
        if (errorIndicator.parentNode) {
          errorIndicator.parentNode.removeChild(errorIndicator);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.close();
  }
});