class LocalStorageInspector {
    constructor() {
        this.currentDomain = '';
        this.storageData = {};
        this.isJsonFormatted = {};
        this.currentlyEditing = null;
        this.init();
    }

    async init() {
        await this.loadCurrentTabStorage();
        this.bindEvents();
    }

    async loadCurrentTabStorage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            this.currentDomain = new URL(tab.url).hostname;
            document.getElementById('domainInfo').textContent = `Local Storage - ${this.currentDomain}`;
            
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: getLocalStorageData
            });

            if (results && results[0] && results[0].result) {
                this.storageData = results[0].result;
                this.renderStorageData();
            } else {
                this.showEmptyState('No local storage data found');
            }
        } catch (error) {
            console.error('Error loading storage:', error);
            this.showEmptyState('Error loading local storage data');
        }
    }

    renderStorageData() {
        const storageContent = document.getElementById('storageContent');
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        const filteredData = this.filterData(searchTerm);
        const items = Object.entries(filteredData);

        if (items.length === 0) {
            this.showEmptyState(
                searchTerm ? 'No items match your search' : 'No local storage data found'
            );
            return;
        }

        let html = '';
        
        items.forEach(([key, value]) => {
            const isJson = this.isJsonFormatted[key] || false;
            const displayValue = isJson ? this.formatJson(value) : this.escapeHtml(value);
            const isEditing = this.currentlyEditing === key;
            
            if (isEditing) {
                // Show edit mode
                html += `
                    <div class="storage-item editing" data-key="${this.escapeHtml(key)}">
                        <div class="key">
                            Key: ${this.escapeHtml(key)}
                        </div>
                        <div class="value-editor" data-key="${this.escapeHtml(key)}">
                            <textarea class="value-edit" data-key="${this.escapeHtml(key)}">${this.unescapeHtml(value)}</textarea>
                            <div class="edit-hint">Click outside to save • Ctrl+Enter to save • Escape to cancel</div>
                        </div>
                    </div>
                `;
            } else {
                // Show read-only mode
                html += `
                    <div class="storage-item" data-key="${this.escapeHtml(key)}">
                        <div class="key">
                            Key: ${this.escapeHtml(key)}
                            <button class="json-toggle" data-key="${this.escapeHtml(key)}">
                                ${isJson ? 'Raw' : 'JSON'}
                            </button>
                        </div>
                        <div class="value" data-key="${this.escapeHtml(key)}">
                            ${displayValue}
                        </div>
                        <div class="actions">
                            <button class="btn btn-danger btn-sm delete-btn" data-key="${this.escapeHtml(key)}">Delete</button>
                            <button class="btn btn-primary btn-sm copy-value-btn" data-key="${this.escapeHtml(key)}">Copy Value</button>
                            <button class="btn btn-primary btn-sm copy-key-btn" data-key="${this.escapeHtml(key)}">Copy Key</button>
                        </div>
                    </div>
                `;
            }
        });

        storageContent.innerHTML = html;
        
        // Re-bind event listeners after rendering
        this.bindItemEvents();
        this.updateStats();
    }

    bindItemEvents() {
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.target.getAttribute('data-key');
                this.deleteItem(key);
            });
        });

        // Copy Value buttons
        document.querySelectorAll('.copy-value-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.target.getAttribute('data-key');
                this.copyValue(key);
            });
        });

        // Copy Key buttons
        document.querySelectorAll('.copy-key-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.target.getAttribute('data-key');
                this.copyKey(key);
            });
        });

        // JSON toggle buttons
        document.querySelectorAll('.json-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.target.getAttribute('data-key');
                this.toggleJsonFormat(key);
            });
        });

        // Double-click on value for editing
        document.querySelectorAll('.value').forEach(valueElement => {
            valueElement.addEventListener('dblclick', (e) => {
                const key = e.target.getAttribute('data-key');
                this.enableEditMode(key);
            });
        });

        // Setup click outside handler for existing edit boxes
        this.setupClickOutsideHandler();
    }

    enableEditMode(key) {
        this.currentlyEditing = key;
        this.renderStorageData();
        
        // Focus the textarea after a small delay to ensure it's rendered
        setTimeout(() => {
            const textarea = document.querySelector(`.value-edit[data-key="${key}"]`);
            if (textarea) {
                textarea.focus();
                textarea.select();
                
                // Setup keyboard events
                textarea.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                        this.saveEdit(key, textarea.value);
                    } else if (e.key === 'Escape') {
                        this.cancelEdit();
                    }
                });

                // Setup click outside handler
                this.setupClickOutsideHandler();
            }
        }, 50);
    }

    setupClickOutsideHandler() {
        // Remove existing handler
        document.removeEventListener('click', this.clickOutsideHandler);
        
        // Add new handler
        this.clickOutsideHandler = (e) => {
            const isEditBox = e.target.closest('.value-editor');
            const isEditing = this.currentlyEditing !== null;
            
            if (isEditing && !isEditBox) {
                // Clicked outside edit box, save changes
                const textarea = document.querySelector(`.value-edit[data-key="${this.currentlyEditing}"]`);
                if (textarea) {
                    this.saveEdit(this.currentlyEditing, textarea.value);
                }
            }
        };
        
        document.addEventListener('click', this.clickOutsideHandler);
    }

    async saveEdit(key, newValue) {
        if (this.currentlyEditing !== key) return;
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: setStorageItem,
                args: [key, newValue]
            });

            if (results && results[0] && results[0].result) {
                // Update local data
                this.storageData[key] = newValue;
                this.currentlyEditing = null;
                
                // Show success message
                this.showMessage(`Item "${key}" updated successfully`);
                
                // Re-render the storage data to show the updated value
                this.renderStorageData();
            }
        } catch (error) {
            console.error('Error updating item:', error);
            this.showMessage('Error updating item');
            this.cancelEdit();
        }
    }

    cancelEdit() {
        this.currentlyEditing = null;
        this.renderStorageData();
    }

    filterData(searchTerm) {
        if (!searchTerm) return this.storageData;

        const filtered = {};
        Object.entries(this.storageData).forEach(([key, value]) => {
            if (key.toLowerCase().includes(searchTerm) || 
                value.toLowerCase().includes(searchTerm)) {
                filtered[key] = value;
            }
        });
        return filtered;
    }

    formatJson(value) {
        try {
            const parsed = JSON.parse(value);
            return this.escapeHtml(JSON.stringify(parsed, null, 2));
        } catch (e) {
            return this.escapeHtml(value);
        }
    }

    toggleJsonFormat(key) {
        this.isJsonFormatted[key] = !this.isJsonFormatted[key];
        this.renderStorageData();
    }

    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return unsafe.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\n/g, "<br>")
            .replace(/ /g, "&nbsp;")
            .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
    }

    unescapeHtml(safe) {
        if (safe === null || safe === undefined) return '';
        return safe.toString()
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/<br>/g, "\n")
            .replace(/&nbsp;/g, " ");
    }

    updateStats() {
        const stats = document.getElementById('statsInfo');
        const totalItems = Object.keys(this.storageData).length;
        const totalSize = new Blob([JSON.stringify(this.storageData)]).size;
        
        stats.innerHTML = `
            Total items: ${totalItems} | 
            Approximate size: ${this.formatBytes(totalSize)} |
            Domain: ${this.currentDomain}
        `;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    bindEvents() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.currentlyEditing = null; // Cancel any ongoing edits
            this.loadCurrentTabStorage();
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear ALL local storage for this domain? This action cannot be undone.')) {
                this.currentlyEditing = null; // Cancel any ongoing edits
                this.clearAllStorage();
            }
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('searchInput').addEventListener('input', () => {
            this.currentlyEditing = null; // Cancel any ongoing edits when searching
            this.renderStorageData();
        });
    }

    async clearAllStorage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: clearLocalStorage
            });

            if (results && results[0] && results[0].result) {
                this.storageData = {};
                this.renderStorageData();
                this.showMessage('All local storage cleared successfully');
            }
        } catch (error) {
            console.error('Error clearing storage:', error);
            this.showMessage('Error clearing local storage');
        }
    }

    async deleteItem(key) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: deleteStorageItem,
                args: [key]
            });

            if (results && results[0] && results[0].result) {
                // Remove from local data and re-render
                delete this.storageData[key];
                this.renderStorageData();
                this.showMessage(`Item "${key}" deleted successfully`);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            this.showMessage('Error deleting item');
        }
    }

    copyValue(key) {
        const value = this.storageData[key];
        navigator.clipboard.writeText(value).then(() => {
            this.showMessage('Value copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy value:', err);
            this.showMessage('Failed to copy value');
        });
    }

    copyKey(key) {
        navigator.clipboard.writeText(key).then(() => {
            this.showMessage('Key copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy key:', err);
            this.showMessage('Failed to copy key');
        });
    }

    exportData() {
        const dataStr = JSON.stringify(this.storageData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `local-storage-${this.currentDomain}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        this.showMessage('Data exported successfully!');
    }

    showEmptyState(message) {
        const storageContent = document.getElementById('storageContent');
        storageContent.innerHTML = `<div class="empty-state">${message}</div>`;
        this.updateStats();
    }

    showMessage(message) {
        // Simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}

// Functions to be executed in the page context
function getLocalStorageData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    return data;
}

function clearLocalStorage() {
    localStorage.clear();
    return true;
}

function deleteStorageItem(key) {
    localStorage.removeItem(key);
    return true;
}

function setStorageItem(key, value) {
    localStorage.setItem(key, value);
    return true;
}

// Initialize the inspector when the popup loads
document.addEventListener('DOMContentLoaded', () => {
    window.inspector = new LocalStorageInspector();
});