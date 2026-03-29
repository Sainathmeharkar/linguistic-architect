# Linguistic Architect - Feature Documentation

## Overview
Linguistic Architect is a modern, editorial-focused translation and grammar platform with a sophisticated Material Design 3 interface. Built with React, Vite, and Tailwind CSS, it provides professional-grade translation and language tools.

## ✨ Core Features

### 1. **Document Translation**
- **Real-time Translation**: Uses LibreTranslate API for accurate translations
- **File Upload**: Upload `.txt`, `.doc`, `.docx` files directly
- **Drag & Drop**: Drag files onto the textarea to instantly load content
- **Multi-language Support**: 20+ languages including Chinese, Japanese, Arabic
- **Live Character/Word Count**: Track document size in real-time
- **API Integration**: Leverages free LibreTranslate API (500 char limit for free tier)

### 2. **Camera Translation (Visual Intelligence)**
- **Live Image Translation**: Point camera at signs, documents, and see translations
- **Auto-Detection**: Automatically detects source language
- **Overlay Translations**: AR-style translation overlays on live feed
- **File Import**: Upload images or text files for translation
- **Real-time Results**: Instant translation results in target language

### 3. **Grammar Correction (Refine Architecture)**
- **Advanced Grammar Check**: Uses LanguageTool API for comprehensive grammar analysis
- **Multiple Correction Categories**:
  - Grammar Correction (spelling, grammar)
  - Precision Enhancement (clarity, style)
  - Terminology Sync (consistency, agreement)
- **Detailed Feedback**: Each correction includes hint and explanation
- **Accept/Ignore Options**: Choose which corrections to apply

### 4. **Universal Features**

#### 📋 Copy to Clipboard
- One-click copy with visual feedback
- "Copied!" indicator appears for 2 seconds
- Keyboard shortcut: `Ctrl+Shift+C`

#### 📤 Export Options
- **JSON**: Export with metadata (language, timestamp)
- **Text**: Plain text export
- **CSV**: Comma-separated values for spreadsheet import
- Keyboard shortcut: `Ctrl+E`

#### 📁 File Management
- **Upload**: Click to select or drag-and-drop files
- **Multiple Formats**: `.txt`, `.doc`, `.docx`, `.pdf` supported
- **Auto-load**: Files automatically populate the editor
- **History Tracking**: All uploads logged with timestamp

#### ⭐ Favorites System
- Save frequently used translations
- Quick access to favorite translations
- Persistent storage (survives page refresh)
- Toggle with keyboard or button click

#### 📜 Translation History
- Automatic history tracking of all translations
- Stores up to 20 most recent translations
- Shows source, target language, and timestamp
- Accessible from workspace

#### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Translate/Check Grammar |
| `Ctrl+Shift+C` | Copy result to clipboard |
| `Ctrl+E` | Export translation |
| `Ctrl+S` | Save to history (DocumentTranslation) |

#### 🌙 Theme Toggle
- Dark/Light mode selector
- Persistent preference (survives refresh)
- Smooth transitions between themes
- Located in Settings page

#### ⚙️ Settings Page
- **Appearance**: Theme selection (dark/light)
- **Language Preferences**: Default source/target language
- **Translation Engine**: Choose translation service
- **Behavior Settings**: Auto-save, notifications
- **About Section**: App information and credits
- **Keyboard Shortcuts Reference**: Handy shortcut list

## 🔧 Technical Architecture

### Hooks (Custom React Hooks)
Located in `src/hooks/`:

1. **useClipboard.js**
   - Manages clipboard operations
   - Returns `{copied, copyToClipboard(text)}`
   - Visual feedback state management

2. **useLocalStorage.js**
   - Persists state to browser localStorage
   - Returns `[value, setValue]` like useState
   - Automatic sync to storage on change

3. **useKeyboardShortcuts.js**
   - Registers keyboard event listeners
   - Takes array of `{key, ctrlKey, shiftKey, callback}`
   - Auto cleanup on unmount

### Utilities (API & Export Functions)
Located in `src/utils/`:

1. **apiUtils.js**
   - `translateText(text, sourceLang, targetLang)` - LibreTranslate API
   - `checkGrammar(text, language)` - LanguageTool API
   - `detectLanguage(text)` - Auto-detect language
   - `getSupportedLanguages()` - List of supported languages
   - `cachedTranslate()` - Translation with localStorage caching

2. **exportUtils.js**
   - `exportAsText(data, filename)` - Export as .txt
   - `exportAsJSON(data, filename)` - Export as .json
   - `exportAsCSV(data, filename)` - Export as .csv
   - `exportAsPDF(data, filename)` - PDF export (placeholder)

### Components
Located in `src/components/`:

```
components/
├── layout/
│   ├── TopNavBar.jsx       - Top navigation with page switcher
│   ├── SideNavBar.jsx      - Fixed sidebar with workspace menu
│   └── MainLayout.jsx      - Main layout wrapper
├── shared/
│   ├── Button.jsx          - Reusable button component
│   ├── GlassPanel.jsx      - Glassmorphic panel container
│   └── Icon.jsx            - Material Symbols icon wrapper
└── workspaces/
    ├── DocumentTranslation/
    ├── CameraTranslation/
    ├── GrammarCorrection/
    └── Settings/
```

### Design System
- **Material Design 3** tokens
- **Tailwind CSS** for styling
- **No-Line Philosophy**: Tonal color boundaries instead of hard borders
- **Glassmorphism**: Backdrop blur effects for floating elements
- **Typography**: 
  - Headlines: Manrope (bold, modern)
  - Body/Labels: Inter (clean, readable)

## 🚀 API Integration

### Free APIs Used
1. **LibreTranslate** (https://libretranslate.de/)
   - No API key required
   - 500 character limit per request (free tier)
   - 20+ language support

2. **LanguageTool** (https://languagetool.org/)
   - Free community API
   - Grammar and spell checking
   - 10,000 character limit per request

### API Features
- ✅ Error handling with graceful fallbacks
- ✅ Request caching to reduce API calls
- ✅ Demo mode when APIs unavailable
- ✅ Batch processing for multiple items
- ✅ Language auto-detection

## 📱 Responsive Design
- **Mobile**: Stack layout, collapsible sidebar
- **Tablet**: Single column with sidebar
- **Desktop**: Full multi-column bento grid layout
- Touch-friendly buttons and inputs
- Optimized for all screen sizes

## 🎨 UI Features
- **Bento Grid Layout**: Modern card-based design
- **Floating Glassmorphic Panels**: Semi-transparent UI elements
- **AR-style Overlays**: In camera translation view
- **Animated Scanning Lines**: Visual feedback for real-time processing
- **Icon Integration**: Material Symbols Outlined icons throughout
- **Smooth Transitions**: CSS transitions on all interactive elements

## 🔐 Data Privacy
- All data stored locally in browser (localStorage)
- No user accounts required
- No data sent to servers except translation requests
- Translation cache limited to 100 entries
- Export data only on user action

## 📊 Performance Optimizations
- **Code Splitting**: Lazy-loaded workspace components
- **Caching**: localStorage-based translation cache
- **Debouncing**: Keyboard shortcut debouncing
- **Memoization**: React hook optimization
- **CSS Optimization**: Tailwind CSS purging

## 🛠️ Development Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Build for production
npm build

# Preview production build
npm preview
```

## 📦 Dependencies
- React 19.2.4
- React DOM 19.2.4
- Vite 8.0.3
- Tailwind CSS 3.4.19
- PostCSS 8.5.8

## 🎯 Future Enhancements
- [ ] Undo/Redo functionality
- [ ] Share translations via generated links
- [ ] OCR for image text extraction
- [ ] Real-time collaborative translation
- [ ] Advanced grammar suggestions
- [ ] Translation quality scoring
- [ ] API authentication for higher limits
- [ ] Mobile app version
- [ ] Offline mode with service workers

## 🤝 Contributing
To add new features:
1. Create hooks in `src/hooks/`
2. Add utilities in `src/utils/`
3. Build components in `src/components/`
4. Update Settings page for user preferences
5. Test with keyboard shortcuts and drag-drop

## 📄 License
MIT

## 👨‍💻 Author
Built with ❤️ for precise, architectural translation and grammar correction.
