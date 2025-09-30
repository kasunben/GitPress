# GitPress Usage Guide

## Quick Start

### 1. Setup

```bash
# Clone the repository
git clone https://github.com/kasunben/GitPress.git
cd GitPress

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### 2. Configure Your Repository

Edit the `.env` file with your settings:

```env
PORT=3333
GIT_REPO_URL=https://github.com/your-username/your-blog-repo.git
GIT_BRANCH=main
BLOG_DIR=blog
GIT_USER_NAME=Your Name
GIT_USER_EMAIL=your.email@example.com
GIT_AUTH_TOKEN=your_github_personal_access_token
```

**Important:** To get a GitHub Personal Access Token:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Copy the token to your `.env` file

### 3. Run GitPress

```bash
npm start
```

Open your browser to: `http://localhost:3333`

## Using GitPress

### Creating a New Post

1. Click the **"+ New Post"** button
2. Enter a filename (will automatically add `.md` if missing)
3. Write your Markdown content
4. Click **"💾 Save"**

### Editing a Post

1. Click on any post title or the **"✏️ Edit"** button
2. Modify the content
3. Click **"💾 Save"**

### Deleting a Post

1. Click the **"🗑️ Delete"** button next to any post
2. Confirm the deletion in the modal dialog

### Publishing Changes

1. After creating, editing, or deleting posts, click **"🚀 Publish Changes"**
2. Optionally enter a custom commit message
3. GitPress will commit and push all changes to your repository

### Refreshing the List

Click the **"🔄 Refresh"** button to reload the post list from the repository.

## API Reference

GitPress provides a REST API for programmatic access:

### List All Posts
```bash
GET /api/posts
```

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "filename": "my-post.md",
      "modified": "2025-09-30T21:30:35.000Z",
      "size": 278
    }
  ]
}
```

### Get a Specific Post
```bash
GET /api/posts/:filename
```

**Response:**
```json
{
  "success": true,
  "filename": "my-post.md",
  "content": "# My Post\n\nContent here..."
}
```

### Create a New Post
```bash
POST /api/posts
Content-Type: application/json

{
  "filename": "new-post.md",
  "content": "# New Post\n\nContent..."
}
```

### Update a Post
```bash
PUT /api/posts/:filename
Content-Type: application/json

{
  "content": "# Updated Post\n\nNew content..."
}
```

### Delete a Post
```bash
DELETE /api/posts/:filename
```

### Publish Changes
```bash
POST /api/publish
Content-Type: application/json

{
  "message": "Optional commit message"
}
```

## Tips

- **Markdown Files Only**: GitPress only manages `.md` files
- **Auto-Pull**: GitPress automatically pulls the latest changes when starting
- **Local First**: All changes are made locally in the `data/` directory before publishing
- **Batch Publishing**: Make multiple changes before publishing to create a single commit
- **Security**: The `data/` directory is ignored by Git to prevent conflicts

## Troubleshooting

### Cannot Clone Repository

- Check your `GIT_REPO_URL` is correct
- Ensure your `GIT_AUTH_TOKEN` has the correct permissions
- Verify the repository exists and you have access

### Changes Not Pushing

- Check your `GIT_AUTH_TOKEN` has write permissions
- Ensure you have push access to the repository
- Check the console for error messages

### Port Already in Use

- Change the `PORT` in your `.env` file
- Or stop the process using port 3333

## Architecture

- **Backend**: Node.js + Express
- **Git Operations**: simple-git library
- **Frontend**: Vanilla JavaScript (no framework)
- **Storage**: Git-backed file system
- **Configuration**: Environment variables via dotenv

## License

MIT
