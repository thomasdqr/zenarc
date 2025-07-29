# Changelog

All notable changes to ZenArc Tab Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-07-29

### Added
- Initial release of ZenArc Tab Manager
- Configurable auto-close timers (6, 12, 18, 24 hours)
- Pinned tab protection - pinned tabs are never closed
- Activity-based timer reset when switching to tabs
- Persistent timers that survive browser restarts
- Arc-inspired clean, flat UI design
- Real-time active timer count display
- Enable/disable toggle for the extension
- Cross-session persistence - tabs maintain close times across browser sessions

### Features
- **Automatic Tab Management**: Tabs are automatically closed after the configured time period
- **Smart Persistence**: If a tab is opened at 10 AM with 12-hour timeout, it will close at 10 PM even if browser is restarted
- **Pinned Tab Safety**: Pinned tabs are completely ignored and never auto-closed
- **Activity Detection**: Tab timers reset when you switch to them, giving full timeout period again
- **Clean Interface**: Minimalist Arc-inspired design with no visual distractions
- **Reliable Storage**: Settings and timer data are safely stored and synced

### Technical Details
- Compatible with Zen Browser (Firefox-based)
- Uses WebExtensions Manifest V2
- Local storage for persistent timer data
- Sync storage for user preferences
- Efficient background script with minimal resource usage

### Privacy
- No data collection or transmission
- All data stored locally in browser
- Open source and transparent
- No access to tab content or URLs