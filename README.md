# GitPress

GitPress is a **minimal, Git-backed Markdown CMS**.  
The goal is to let non-technical users create, edit, and publish blog posts stored in a GitHub repository, without ever touching Git directly.

---

## 🎯 Scope

- **Self-contained app** that anyone can clone and run.
- **Environment-based configuration**: repo URL, blog directory, credentials.
- **Web-based UI** served on `http://localhost:3333`.
- **Markdown file management**:
  - Explore all `.md` files in the target directory.
  - Read and edit existing posts.
  - Create new posts.
  - Delete posts.
- **Publish action**:
  - Commits all changes.
  - Pushes to the configured Git repository automatically.

That’s it. No extra complexity, no database, no external services.

---

## ⚙️ Requirements

### Core Features
1. **Repo management**
   - Clone the configured repo into a local `data/` directory on first run.
   - On subsequent runs, pull latest changes from the configured branch.

2. **Markdown file operations**
   - List all `.md` files in the configured blog directory.
   - Read and edit file contents.
   - Create new `.md` files.
   - Delete `.md` files.

3. **Publishing**
   - Stage all changes.
   - Commit with a generic message (or user-supplied).
   - Push back to the remote repo/branch.

### Environment Variables (`.env`)
```env
PORT=3333
GIT_REPO_URL=https://github.com/your-org/your-repo.git
GIT_BRANCH=main
BLOG_DIR=src/content/blog
GIT_USER_NAME=GitPress Bot
GIT_USER_EMAIL=bot@example.com
GIT_AUTH_TOKEN=ghp_xxx