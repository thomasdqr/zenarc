# ZenArc Tab Manager

A Firefox extension for Zen Browser that automatically closes tabs after a configurable time period, replicating Arc Browser's intelligent tab management behavior.

[![Firefox Add-ons](https://img.shields.io/badge/Firefox-Add--ons-FF7139?style=flat-square&logo=firefox)](https://addons.mozilla.org/firefox/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg?style=flat-square)](https://github.com/yourusername/zenarc-tab-manager)

> **Note**: This extension is specifically designed for Zen Browser but works with any Firefox-based browser.

## Features

- **Configurable Auto-Close**: Choose between 6, 12, 18, or 24 hours
- **Pinned Tab Protection**: Pinned tabs are never automatically closed
- **Activity-Based Reset**: Tab timers reset when you interact with them
- **Persistent Timers**: Tabs maintain their close times across browser sessions
- **Clean Interface**: Simple, efficient design with no distractions
- **Easy Configuration**: Intuitive popup interface for all settings
- **Reliable Storage**: Your preferences are saved and synced

## Installation

### From Firefox Add-ons Store (Recommended)

1. Visit the [Firefox Add-ons page](https://addons.mozilla.org/firefox/) (coming soon)
2. Click "Add to Firefox"
3. Confirm the installation
4. The extension icon will appear in your toolbar

### From Source (Development)

1. Clone this repository: `git clone https://github.com/yourusername/zenarc-tab-manager.git`
2. Open Zen Browser (or Firefox)
3. Navigate to `about:debugging`
4. Click "This Firefox" in the sidebar
5. Click "Load Temporary Add-on"
6. Select the `manifest.json` file from the extension directory

## Usage

1. **Access Settings**: Click the ZenArc extension icon in your toolbar
2. **Choose Timeout**: Select your preferred auto-close time (6, 12, 18, or 24 hours)
3. **Toggle On/Off**: Use the switch to enable or disable auto-closing
4. **Monitor Activity**: View the number of active timers in the popup

### How It Works

- When you open a new tab, a timer starts based on your configured timeout
- If you switch to a tab, the timer resets (giving you a full timeout period again)
- Pinned tabs are completely ignored and will never be auto-closed
- When a timer expires, the tab is automatically closed
- **Persistent Timers**: Timer information is saved to storage, so tabs maintain their scheduled close times even after browser restarts
- **Cross-Session Persistence**: If you open a tab at 10 AM with a 12-hour timeout, then close and reopen the browser at 10 PM, that tab will be immediately closed as its time has expired

## Technical Details

### Files Structure

```
zenarc/
├── manifest.json          # Extension configuration
├── background.js          # Core tab management logic
├── popup.html            # Settings popup interface
├── popup.css             # UI styling
├── popup.js              # Popup interaction logic
├── icons/                # Extension icons (you need to add these)
└── README.md             # This file
```

### Permissions

The extension requires these permissions:
- `tabs`: To manage and close tabs
- `storage`: To save your preferences and persistent timer data
- `activeTab`: To detect tab activity

### Storage

The extension uses two types of storage:
- **Sync Storage**: User preferences (timeout settings, debug mode) that sync across devices
- **Local Storage**: Persistent timer data (tab close times) that remain local to the device

### Browser Compatibility

- **Primary Target**: Zen Browser (Firefox-based)
- **Also Compatible**: Firefox 57+
- **Manifest Version**: 2 (Firefox WebExtensions)

## Privacy

This extension:
- ✅ Only operates locally on your device
- ✅ Stores settings and timer data in your browser's storage
- ✅ Does not collect or transmit any data
- ✅ Does not access tab content or URLs
- ✅ Timer data is stored locally and never shared
- ✅ Is completely open source

## Development

### Building

No build process required - this is a pure WebExtension that runs directly from source.

### Testing

1. Load the extension in development mode
2. Open several tabs and check the "Active timers" count
3. Test different timeout settings
4. Verify pinned tabs are not affected
5. Test the enable/disable toggle
6. Test persistence by closing and reopening the browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/zenarc-tab-manager.git`
3. Make your changes
4. Test the extension in Zen Browser
5. Submit a pull request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/zenarc-tab-manager/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide as much detail as possible including browser version and extension version

## Inspiration

This extension replicates Arc Browser's automatic tab cleanup feature for Zen Browser users who want a cleaner browsing experience without manual tab management.

## Privacy Policy

ZenArc Tab Manager respects your privacy:
- No data is collected or transmitted
- All settings and timer data are stored locally in your browser
- The extension does not access tab content or URLs
- No analytics or tracking of any kind

---

Made with ❤️ for the Zen Browser community
