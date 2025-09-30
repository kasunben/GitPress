const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');

class GitManager {
  constructor(config) {
    this.repoUrl = config.repoUrl;
    this.branch = config.branch;
    this.userName = config.userName;
    this.userEmail = config.userEmail;
    this.authToken = config.authToken;
    this.localPath = path.join(process.cwd(), 'data');
    this.git = null;
  }

  async initialize() {
    try {
      const exists = await this.checkIfRepoExists();
      
      if (!exists) {
        console.log('Cloning repository for the first time...');
        await this.cloneRepo();
      } else {
        console.log('Repository exists, pulling latest changes...');
        await this.pullLatest();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize repository:', error.message);
      throw error;
    }
  }

  async checkIfRepoExists() {
    try {
      await fs.access(path.join(this.localPath, '.git'));
      return true;
    } catch {
      return false;
    }
  }

  async cloneRepo() {
    // Create data directory if it doesn't exist
    await fs.mkdir(this.localPath, { recursive: true });
    
    // Build authenticated URL
    const authUrl = this.buildAuthUrl();
    
    // Clone the repository
    await simpleGit().clone(authUrl, this.localPath, ['--branch', this.branch]);
    
    // Configure git
    this.git = simpleGit(this.localPath);
    await this.git.addConfig('user.name', this.userName);
    await this.git.addConfig('user.email', this.userEmail);
  }

  async pullLatest() {
    this.git = simpleGit(this.localPath);
    await this.git.addConfig('user.name', this.userName);
    await this.git.addConfig('user.email', this.userEmail);
    await this.git.pull('origin', this.branch);
  }

  async publish(commitMessage = 'Update from GitPress') {
    if (!this.git) {
      this.git = simpleGit(this.localPath);
    }

    // Stage all changes
    await this.git.add('.');
    
    // Check if there are changes to commit
    const status = await this.git.status();
    if (status.files.length === 0) {
      return { success: true, message: 'No changes to publish' };
    }

    // Commit changes
    await this.git.commit(commitMessage);
    
    // Push to remote
    const authUrl = this.buildAuthUrl();
    await this.git.push(authUrl, this.branch);
    
    return { success: true, message: 'Changes published successfully' };
  }

  buildAuthUrl() {
    if (!this.authToken) {
      return this.repoUrl;
    }
    
    // Convert https://github.com/user/repo.git to https://token@github.com/user/repo.git
    const url = new URL(this.repoUrl);
    url.username = this.authToken;
    return url.toString();
  }

  getLocalPath() {
    return this.localPath;
  }
}

module.exports = GitManager;
