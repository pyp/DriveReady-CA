// Clipboard utility with fallback support
class ClipboardHelper {
    static async copyToClipboard(text) {
        try {
            // Modern clipboard API (requires HTTPS or localhost)
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return { success: true, method: 'modern' };
            }
            
            // Fallback method for non-secure contexts
            return this.fallbackCopyToClipboard(text);
            
        } catch (error) {
            console.error('Clipboard API failed:', error);
            // Try fallback method
            return this.fallbackCopyToClipboard(text);
        }
    }
    
    static fallbackCopyToClipboard(text) {
        try {
            // Create a temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = text;
            
            // Make it invisible
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            
            // Add to DOM
            document.body.appendChild(textArea);
            
            // Select and copy
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            
            // Clean up
            document.body.removeChild(textArea);
            
            if (successful) {
                return { success: true, method: 'fallback' };
            } else {
                throw new Error('execCommand copy failed');
            }
            
        } catch (error) {
            console.error('Fallback clipboard method failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async readFromClipboard() {
        try {
            // Modern clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                const text = await navigator.clipboard.readText();
                return { success: true, text: text, method: 'modern' };
            }
            
            // No fallback for reading (security reasons)
            return { success: false, error: 'Clipboard read not supported in non-secure context' };
            
        } catch (error) {
            console.error('Clipboard read failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    static isClipboardSupported() {
        return !!(navigator.clipboard || document.queryCommandSupported('copy'));
    }
}

// Usage examples:
// ClipboardHelper.copyToClipboard('Hello World').then(result => {
//     if (result.success) {
//         console.log('Copied successfully using', result.method);
//     } else {
//         console.error('Copy failed:', result.error);
//     }
// });

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClipboardHelper;
}
