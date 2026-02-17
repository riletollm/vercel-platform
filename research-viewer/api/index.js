const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const app = express();

// Research directory - point to parent workspace
const RESEARCH_DIR = path.join(__dirname, '../../research') || '/root/.openclaw/workspace/research';

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// API: Get all projects
app.get('/api/projects', (req, res) => {
  try {
    if (!fs.existsSync(RESEARCH_DIR)) {
      return res.json([]);
    }

    const projectDirs = fs.readdirSync(RESEARCH_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const projects = projectDirs.map(projectName => {
      const projectPath = path.join(RESEARCH_DIR, projectName);
      const indexPath = path.join(projectPath, 'INDEX.md');
      
      let overview = '';
      if (fs.existsSync(indexPath)) {
        const rawMarkdown = fs.readFileSync(indexPath, 'utf8');
        const preview = rawMarkdown.split('\n').slice(0, 15).join('\n');
        overview = marked(preview);
      }

      const docs = fs.readdirSync(projectPath)
        .filter(f => f.endsWith('.md'))
        .sort()
        .map(f => ({
          name: f.replace('.md', ''),
          file: f,
          path: `${projectName}/${f}`
        }));

      return {
        id: projectName,
        name: projectName.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
        overview,
        docCount: docs.length,
        docs
      };
    });

    res.json(projects);
  } catch (error) {
    console.error('Error reading projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get project details
app.get('/api/projects/:projectId', (req, res) => {
  try {
    const projectPath = path.join(RESEARCH_DIR, req.params.projectId);
    
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const docs = fs.readdirSync(projectPath)
      .filter(f => f.endsWith('.md'))
      .sort()
      .map(f => ({
        name: f.replace('.md', ''),
        file: f,
        path: `${req.params.projectId}/${f}`
      }));

    const indexPath = path.join(projectPath, 'INDEX.md');
    let overview = '';
    if (fs.existsSync(indexPath)) {
      overview = fs.readFileSync(indexPath, 'utf8');
    }

    res.json({
      id: req.params.projectId,
      name: req.params.projectId.replace(/-/g, ' '),
      overview: marked(overview),
      docs
    });
  } catch (error) {
    console.error('Error reading project:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get document content
app.get('/api/documents/:projectId/*', (req, res) => {
  try {
    const docPath = req.params[0];
    const fullPath = path.join(RESEARCH_DIR, req.params.projectId, docPath + '.md');

    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(RESEARCH_DIR))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const html = marked(content);

    res.json({
      name: path.basename(fullPath, '.md'),
      content: html,
      raw: content,
      path: fullPath
    });
  } catch (error) {
    console.error('Error reading document:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Download document (Markdown)
app.get('/api/download/:projectId/*', (req, res) => {
  try {
    const docPath = req.params[0];
    const fullPath = path.join(RESEARCH_DIR, req.params.projectId, docPath + '.md');

    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(RESEARCH_DIR))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const fileName = path.basename(fullPath);
    res.download(fullPath, fileName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get document as PDF-ready HTML
app.get('/api/download-pdf/:projectId/*', (req, res) => {
  try {
    const docPath = req.params[0];
    const fullPath = path.join(RESEARCH_DIR, req.params.projectId, docPath + '.md');

    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(RESEARCH_DIR))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const markdown = fs.readFileSync(fullPath, 'utf8');
    const html = marked(markdown);
    const fileName = path.basename(fullPath, '.md');

    res.json({
      html,
      fileName,
      title: fileName.replace(/-/g, ' ')
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get document as plain text (for DOCX)
app.get('/api/download-docx/:projectId/*', (req, res) => {
  try {
    const docPath = req.params[0];
    const fullPath = path.join(RESEARCH_DIR, req.params.projectId, docPath + '.md');

    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(RESEARCH_DIR))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const markdown = fs.readFileSync(fullPath, 'utf8');
    const fileName = path.basename(fullPath, '.md');

    res.json({
      text: markdown,
      fileName,
      title: fileName.replace(/-/g, ' ')
    });
  } catch (error) {
    console.error('Error preparing DOCX:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = app;
