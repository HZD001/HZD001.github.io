# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a countdown timer web application for work time management with lunch break tracking and overtime calculation. It's a pure JavaScript static website with no framework dependencies.

## Development Commands

### Local Development
```bash
# Start development server
npm run dev
# or
python3 -m http.server 8000

# Access at http://localhost:8000
```

### Build for Production
```bash
# Build minified/obfuscated version
npm run build
```

The build process uses `build.js` to:
- Compress CSS (removes comments, whitespace)
- Minify and obfuscate JavaScript (removes comments, minifies whitespace, obfuscates variable names)
- Minify HTML (removes comments, compresses whitespace)
- Output goes to root directory, source files stay in `src/`

## Architecture

### Module Structure
The application follows a modular architecture with four core modules in `src/js/`:

1. **Utils** (`utils.js`) - Pure utility functions for time formatting and calculations
2. **Config** (`config.js`) - Configuration management with LocalStorage persistence
3. **NotificationManager** (`notification.js`) - Multi-modal notifications (desktop, sound, flash, vibrate, speech)
4. **Timer** (`timer.js`) - Core countdown logic and state management

### Key Design Patterns
- **Module Pattern**: Each module is a singleton object with methods
- **Event-driven**: UI interactions trigger module methods
- **State Persistence**: Timer state and config saved to LocalStorage for recovery
- **Separation of Concerns**: Clear boundaries between modules

### Data Flow
1. `Config` loads settings and timer state from LocalStorage
2. `Timer` initializes with config and manages countdown state
3. `NotificationManager` handles all user notifications based on timer events
4. `Utils` provides time formatting and calculation utilities

### Build Process
- Source files in `src/` are uncompressed and readable
- Production files in root are minified/obfuscated
- Only production files should be committed (`.gitignore` ignores `src/` for deployment)
- Build script preserves essential API names while obfuscating internal variables

### State Management
The application maintains two types of persistent data:
- **Configuration** (`countdown_config`): User settings and preferences
- **Timer State** (`countdown_timer_state`): Current countdown progress, supports recovery after page refresh

Both are stored in LocalStorage and automatically loaded on initialization.

## File Organization

```
src/                    # Development files (not committed)
├── css/style.css      # Main stylesheet
├── js/
│   ├── utils.js       # Time utilities (91 lines)
│   ├── config.js      # Configuration management (161 lines)
│   ├── notification.js # Notification system (274 lines)
│   └── timer.js       # Core timer logic (809 lines)
└── index.html         # Main page

root/                  # Production files (committed)
├── css/style.css      # Minified CSS
├── js/*.js           # Minified and obfuscated JS
└── index.html        # Minified HTML
```

Each module follows the 200-line limit guideline, with only the core Timer module exceeding this due to complex business logic.