class GitPress {
    constructor() {
        this.posts = [];
        this.currentEditingFile = null;
        this.deleteCallback = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPosts();
    }

    setupEventListeners() {
        document.getElementById('newPostBtn').addEventListener('click', () => this.showEditor());
        document.getElementById('publishBtn').addEventListener('click', () => this.publish());
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadPosts());
        document.getElementById('saveBtn').addEventListener('click', () => this.savePost());
        document.getElementById('cancelBtn').addEventListener('click', () => this.hideEditor());
        document.getElementById('modalConfirm').addEventListener('click', () => this.confirmModal());
        document.getElementById('modalCancel').addEventListener('click', () => this.hideModal());
    }

    async loadPosts() {
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            
            if (data.success) {
                this.posts = data.files;
                this.renderPosts();
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            this.showToast('Failed to load posts', 'error');
        }
    }

    renderPosts() {
        const postList = document.getElementById('postList');
        
        if (this.posts.length === 0) {
            postList.innerHTML = '<p class="loading">No posts yet. Create your first post!</p>';
            return;
        }

        postList.innerHTML = this.posts.map(post => `
            <div class="post-item">
                <div class="post-info" onclick="app.editPost('${post.filename}')">
                    <div class="post-filename">${post.filename}</div>
                    <div class="post-meta">
                        Modified: ${new Date(post.modified).toLocaleString()}
                        · ${this.formatFileSize(post.size)}
                    </div>
                </div>
                <div class="post-actions">
                    <button class="btn btn-primary" onclick="app.editPost('${post.filename}')">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="app.deletePost('${post.filename}')">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    showEditor(filename = null, content = '') {
        document.getElementById('postList').classList.add('hidden');
        document.getElementById('editor').classList.remove('hidden');
        
        const filenameInput = document.getElementById('filenameInput');
        const contentInput = document.getElementById('contentInput');
        
        if (filename) {
            filenameInput.value = filename;
            filenameInput.disabled = true;
            this.currentEditingFile = filename;
        } else {
            filenameInput.value = '';
            filenameInput.disabled = false;
            this.currentEditingFile = null;
        }
        
        contentInput.value = content;
        contentInput.focus();
    }

    hideEditor() {
        document.getElementById('editor').classList.add('hidden');
        document.getElementById('postList').classList.remove('hidden');
        this.currentEditingFile = null;
    }

    async editPost(filename) {
        try {
            const response = await fetch(`/api/posts/${encodeURIComponent(filename)}`);
            const data = await response.json();
            
            if (data.success) {
                this.showEditor(filename, data.content);
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            this.showToast('Failed to load post', 'error');
        }
    }

    async savePost() {
        const filename = document.getElementById('filenameInput').value.trim();
        const content = document.getElementById('contentInput').value;
        
        if (!filename) {
            this.showToast('Filename is required', 'error');
            return;
        }
        
        if (!content) {
            this.showToast('Content is required', 'error');
            return;
        }

        try {
            let response;
            
            if (this.currentEditingFile) {
                // Update existing post
                response = await fetch(`/api/posts/${encodeURIComponent(this.currentEditingFile)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content })
                });
            } else {
                // Create new post
                response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename, content })
                });
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Post saved successfully!', 'success');
                this.hideEditor();
                this.loadPosts();
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            this.showToast('Failed to save post', 'error');
        }
    }

    deletePost(filename) {
        this.deleteCallback = async () => {
            try {
                const response = await fetch(`/api/posts/${encodeURIComponent(filename)}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.showToast('Post deleted successfully!', 'success');
                    this.loadPosts();
                } else {
                    this.showToast(data.error, 'error');
                }
            } catch (error) {
                this.showToast('Failed to delete post', 'error');
            }
        };
        
        this.showModal(`Are you sure you want to delete "${filename}"?`);
    }

    async publish() {
        const message = prompt('Enter commit message (optional):', 'Update from GitPress');
        
        if (message === null) return; // User cancelled
        
        try {
            const response = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message || 'Update from GitPress' })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast(data.message, 'success');
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            this.showToast('Failed to publish changes', 'error');
        }
    }

    showModal(message) {
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('modal').classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('modal').classList.add('hidden');
        this.deleteCallback = null;
    }

    confirmModal() {
        if (this.deleteCallback) {
            this.deleteCallback();
        }
        this.hideModal();
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

// Initialize the app
const app = new GitPress();
