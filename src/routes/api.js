const express = require('express');
const router = express.Router();

module.exports = (fileManager, gitManager) => {
  // List all markdown posts
  router.get('/posts', async (req, res) => {
    try {
      const files = await fileManager.listMarkdownFiles();
      res.json({ success: true, files });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get a specific post
  router.get('/posts/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      const content = await fileManager.readFile(filename);
      res.json({ success: true, filename, content });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  });

  // Create a new post
  router.post('/posts', async (req, res) => {
    try {
      const { filename, content } = req.body;
      
      if (!filename || !content) {
        return res.status(400).json({ 
          success: false, 
          error: 'Filename and content are required' 
        });
      }
      
      const finalFilename = await fileManager.createFile(filename, content);
      res.json({ success: true, filename: finalFilename });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Update an existing post
  router.put('/posts/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ 
          success: false, 
          error: 'Content is required' 
        });
      }
      
      await fileManager.updateFile(filename, content);
      res.json({ success: true, filename });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Delete a post
  router.delete('/posts/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      await fileManager.deleteFile(filename);
      res.json({ success: true, filename });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  });

  // Publish changes (commit and push)
  router.post('/publish', async (req, res) => {
    try {
      const { message } = req.body;
      const commitMessage = message || 'Update from GitPress';
      
      const result = await gitManager.publish(commitMessage);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
