// Tab switching functionality
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
});

// Share text functionality
async function shareText() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        alert('Please enter some text to share');
        return;
    }

    try {
        const response = await fetch('/api/share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to share text');
        }

        const data = await response.json();
        const shareUrl = `${window.location.origin}/get/${data.key}`;
        
        // Update share options
        document.getElementById('shareLink').value = shareUrl;
        document.getElementById('shareKey').value = data.key;
        
        // Generate QR code
        const qrcodeDiv = document.getElementById('qrcode');
        qrcodeDiv.innerHTML = ''; // Clear previous QR code
        new QRCode(qrcodeDiv, {
            text: shareUrl,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Show share options with a slight delay to ensure DOM is updated
        setTimeout(() => {
            const shareOptions = document.querySelector('.share-options');
            shareOptions.style.display = 'grid';
            shareOptions.style.opacity = '1';
        }, 100);
    } catch (error) {
        alert('Error sharing text: ' + error.message);
    }
}

// Retrieve text functionality
async function retrieveText() {
    const keyInput = document.getElementById('keyInput').value.trim();
    if (!keyInput) {
        alert('Please enter a key or paste a link');
        return;
    }

    // Extract key from URL if a full link was pasted
    const key = keyInput.includes('/get/') 
        ? keyInput.split('/get/')[1].split('?')[0]
        : keyInput;

    try {
        const response = await fetch(`/api/get/${key}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Text not found or expired');
        }

        const data = await response.json();
        document.getElementById('retrievedText').innerHTML = `
            <div class="share-option">
                <h3><i class="fas fa-file-alt"></i> Retrieved Text</h3>
                <textarea readonly>${data.text}</textarea>
                <button onclick="copyToClipboard('retrievedText')" class="copy-btn">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        `;
    } catch (error) {
        alert('Error retrieving text: ' + error.message);
    }
}

// Copy to clipboard functionality
function copyToClipboard(elementId) {
    let element;
    let text;

    if (elementId === 'retrievedText') {
        // For retrieved text, get the textarea inside the result box
        element = document.querySelector('#retrievedText textarea');
        if (!element) return;
        text = element.value;
    } else {
        // For other elements (shareLink, shareKey)
        element = document.getElementById(elementId);
        if (!element) return;
        text = element.value;
    }

    // Copy the text
    navigator.clipboard.writeText(text).then(() => {
        // Find the button that was clicked
        const button = document.querySelector(`button[onclick="copyToClipboard('${elementId}')"]`);
        if (button) {
            // Store original content
            const originalContent = button.innerHTML;
            
            // Update button state
            button.classList.add('copied');
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            // Reset button after 2 seconds
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = originalContent;
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text. Please try again.');
    });
}

// Download QR code
function downloadQR() {
    const qrImage = document.querySelector('#qrcode img');
    if (!qrImage) return;

    const link = document.createElement('a');
    link.download = 'clipboard-qr.png';
    link.href = qrImage.src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Modal functionality
function showPrivacyPolicy() {
    const modal = document.getElementById('privacyModal');
    modal.style.display = 'block';
}

function showTerms() {
    // Implement terms modal
    alert('Terms of Service coming soon!');
}

function showContact() {
    // Implement contact modal
    alert('Contact information coming soon!');
}

// Close modal when clicking the X
document.querySelector('.close').onclick = function() {
    document.getElementById('privacyModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('privacyModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Check if we're on a retrieve page
window.addEventListener('load', () => {
    const path = window.location.pathname;
    if (path.startsWith('/get/')) {
        const key = path.split('/get/')[1];
        document.getElementById('keyInput').value = key;
        retrieveText();
    }
}); 