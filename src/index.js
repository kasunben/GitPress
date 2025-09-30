require('dotenv').config();
const express = require('express');
const path = require('path');
const GitManager = require('./services/gitManager');
const FileManager = require('./services/fileManager');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Configuration from environment variables
const config = {
  port: process.env.PORT || 3333,
  repoUrl: process.env.GIT_REPO_URL,
  branch: process.env.GIT_BRANCH || 'main',
  blogDir: process.env.BLOG_DIR || 'blog',
  userName: process.env.GIT_USER_NAME || 'GitPress Bot',
  userEmail: process.env.GIT_USER_EMAIL || 'bot@example.com',
  authToken: process.env.GIT_AUTH_TOKEN
};

// Validate required configuration
if (!config.repoUrl) {
  console.error('Error: GIT_REPO_URL is required in .env file');
  process.exit(1);
}

// Initialize services
const gitManager = new GitManager({
  repoUrl: config.repoUrl,
  branch: config.branch,
  userName: config.userName,
  userEmail: config.userEmail,
  authToken: config.authToken
});

let fileManager;

// Initialize and start server
async function start() {
  try {
    console.log('Initializing GitPress...');
    
    // Initialize Git repository
    await gitManager.initialize();
    
    // Initialize file manager with the cloned repo path
    const localPath = gitManager.getLocalPath();
    fileManager = new FileManager(localPath, config.blogDir);
    
    // Register API routes after initialization
    app.use('/api', apiRoutes(fileManager, gitManager));
    
    // Start server
    app.listen(config.port, () => {
      console.log(`✨ GitPress is running on http://localhost:${config.port}`);
      console.log(`📁 Managing files in: ${config.blogDir}`);
      console.log(`🔗 Connected to: ${config.repoUrl}`);
    });
  } catch (error) {
    console.error('Failed to start GitPress:', error.message);
    process.exit(1);
  }
}

start();
