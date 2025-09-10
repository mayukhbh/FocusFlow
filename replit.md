# Focus Mode - Distraction Blocker Chrome Extension

## Overview

Focus Mode is a Chrome browser extension designed to enhance productivity by hiding distracting elements on YouTube and Reddit. The extension provides a toggleable "Research Mode" that selectively hides content like related videos, comments, ads, and promotional content to help users maintain focus during research sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Extension Architecture
The extension follows the Chrome Extension Manifest V3 architecture with a service worker-based background script. It consists of three main components:

- **Background Script** (`background.js`): Handles extension lifecycle, storage management, and tab navigation events
- **Content Scripts** (`content.js`): Injected into YouTube and Reddit pages to manipulate DOM elements
- **Popup Interface** (`popup.html`, `popup.js`, `popup.css`): Provides user interface for toggling research mode

### State Management
The extension uses Chrome's sync storage API to persist user preferences across browser sessions and devices. The primary state is a boolean `researchMode` flag that determines whether distracting elements should be hidden.

### DOM Manipulation Strategy
The content script uses CSS selector-based element hiding rather than removing elements entirely. This approach:
- Preserves page functionality
- Allows for easy toggling without page reload
- Minimizes potential conflicts with site updates

### Site-Specific Targeting
The extension targets specific elements on each platform:
- **YouTube**: Related videos, comments, ads, shorts, and suggested content
- **Reddit**: Promoted posts, sidebar ads, trending content, and premium banners

### Message Passing
Communication between components uses Chrome's message passing API:
- Background script communicates with content scripts for state changes
- Popup communicates with both background and content scripts for real-time updates

## External Dependencies

### Chrome Extensions API
- **Storage API**: For persisting user preferences across sessions
- **Tabs API**: For detecting tab updates and sending messages to content scripts
- **Runtime API**: For extension lifecycle management
- **Action API**: For popup interface integration

### Browser Permissions
- `storage`: Required for saving user preferences
- `activeTab`: Required for interacting with current tab content
- Host permissions for `*.youtube.com` and `*.reddit.com`

### Web Standards
- **CSS Selectors**: For targeting specific DOM elements on target sites
- **DOM Manipulation**: For hiding/showing elements without breaking page functionality
- **Modern JavaScript**: ES6+ features including async/await and destructuring