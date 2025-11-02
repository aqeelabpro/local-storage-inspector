# Local Storage Inspector Chrome Extension

A powerful and intuitive Chrome extension for inspecting, editing, and managing local storage data of any website. Built with developers and power users in mind, featuring a clean UI with inline editing.

![Local Storage Inspector](https://img.shields.io/badge/Chrome-Extension-brightgreen) ![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

### 🔍 **Easy Inspection**
- Automatically detects and displays local storage for the current website
- No configuration needed - just click the extension icon
- Real-time updates with refresh capability

### **Clean Interface**
- **JSON Formatting**: Automatically detects and formats JSON values
- **Toggle Views**: Switch between raw and formatted JSON with one click
- **Search**: Quickly find specific keys or values across all storage items

### **Intuitive Editing**
- **Double-click to Edit**: Simply double-click any value to edit it inline
- **Click Outside to Save**: Click anywhere outside the edit box to save changes
- **Rich Text Editor**: Resizable textarea with proper code editing

### 🛠️ **Powerful Management**
- **Delete Items**: Remove individual storage items
- **Clear All**: Wipe all local storage for the current domain
- **Copy Functionality**: Copy keys or values to clipboard
- **Export Data**: Download all local storage as JSON file
- **Size Statistics**: View total items and storage size

### **Privacy Focused**
- Requires only `activeTab` permission
- Works only on the current website
- No data collection or external communications

## Installation

### Manual Installation (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/aqeelabpro/local-storage-inspector.git
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **"Developer mode"** in the top right corner
   - Click **"Load unpacked"**
   - Select the extension directory containing the manifest file

3. **Start Using**
   - The extension icon will appear in your toolbar
   - Visit any website and click the icon to inspect its local storage

## Usage

### Basic Inspection
1. Navigate to any website
2. Click the Local Storage Inspector extension icon
3. View all local storage key-value pairs in a clean, organized interface

### Editing Values
1. **Double-click** any value to enter edit mode
2. Modify the value in the textarea
3. **Save** by:
   - Clicking anywhere outside the edit box
   - Pressing `Ctrl + Enter`
4. **Cancel** by pressing `Escape`

### Managing Storage
- **Search**: Use the search box to filter keys and values
- **Delete**: Click the "Delete" button next to any item
- **Clear All**: Use "Clear All" to remove all storage (with confirmation)
- **Export**: Download all data as JSON with the "Export" button
- **Copy**: Use "Copy Value" or "Copy Key" buttons for quick copying

### JSON Features
- **Auto-formatting**: JSON values are automatically detected and formatted

## Development

### Project Structure
```
local-storage-inspector/
├── manifest.json          # Extension configuration
├── popup.html            # Main UI interface
├── popup.js              # Core functionality
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Technical Details
- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: Only `activeTab` and `scripting` for security
- **UI Framework**: Pure HTML/CSS/JavaScript
- **Icons**: Included in multiple sizes for Chrome compatibility

### Building from Source
No build process required! The extension uses vanilla JavaScript and can be loaded directly.

## Permissions

This extension requires the following permissions:

- `activeTab`: To access the current website's local storage
- `scripting`: To execute scripts in the page context

**No sensitive permissions required** - the extension cannot access your browsing history, passwords, or other personal data.

## Contributing

I welcome contributions! Here's how you can help:

1. **Report Bugs**: Open an issue with detailed description
2. **Suggest Features**: Share your ideas for improvements
3. **Submit Pull Requests**: 
   - Fork the repository
   - Create a feature branch
   - Make your changes
   - Submit a pull request

### Development Setup
```bash
git clone https://github.com/aqeelabpro/local-storage-inspector.git
cd local-storage-inspector
```

## Troubleshooting

### Common Issues

**Extension doesn't load:**
- Ensure you're using Chrome version 88 or newer
- Check that "Developer mode" is enabled
- Verify all files are in the correct directory

**No data shown:**
- The website may not use local storage
- Try refreshing the page and extension
- Check browser console for errors (F12)

**Editing doesn't work:**
- Ensure the website allows local storage modifications
- Some websites may have read-only storage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/aqeelabpro/local-storage-inspector/issues)
3. Create a new issue with details about your problem

## Changelog

### v1.0.0
- Initial release
- Local storage inspection and editing
- JSON formatting and toggle
- Export and management features

---

**Happy Developing!** 🚀

If you find this extension useful, please consider giving it a ⭐ on GitHub!
