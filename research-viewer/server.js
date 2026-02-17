const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://vcwkgxwnzayxhysfjeqw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Middleware
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}
app.use(express.json());

// ===== API ROUTES (MUST BE BEFORE CATCH-ALL) =====

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', supabaseConfigured: !!supabaseKey });
});

// API: Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    if (!supabase) {
      return res.json([]);
    }

    const { data: projects, error } = await supabase
      .from('research_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!projects || projects.length === 0) {
      return res.json([]);
    }

    // For each project, fetch its documents
    const projectsWithDocs = await Promise.all(
      projects.map(async (project) => {
        const { data: docs } = await supabase
          .from('research_documents')
          .select('doc_name, doc_file')
          .eq('project_id', project.project_id)
          .order('created_at', { ascending: false });

        return {
          id: project.project_id,
          name: project.project_name,
          overview: marked(project.overview || ''),
          docCount: docs ? docs.length : 0,
          docs: (docs || []).map(d => ({
            name: d.doc_name,
            file: d.doc_file,
            path: `${project.project_id}/${d.doc_file}`
          })),
        };
      })
    );

    res.json(projectsWithDocs);
  } catch (error) {
    console.error('Error reading projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get project details
app.get('/api/projects/:projectId', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { data: project, error } = await supabase
      .from('research_projects')
      .select('*')
      .eq('project_id', req.params.projectId)
      .single();

    if (error || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { data: docs } = await supabase
      .from('research_documents')
      .select('doc_name, doc_file')
      .eq('project_id', req.params.projectId)
      .order('created_at', { ascending: false });

    res.json({
      id: project.project_id,
      name: project.project_name,
      overview: marked(project.overview || ''),
      docs: (docs || []).map(d => ({
        name: d.doc_name,
        file: d.doc_file,
        path: `${project.project_id}/${d.doc_file}`
      })),
    });
  } catch (error) {
    console.error('Error reading project:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get document content
app.get('/api/documents/:projectId/*', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const docFile = req.params[0] + '.md';
    const { data: doc, error } = await supabase
      .from('research_documents')
      .select('content, doc_name')
      .eq('project_id', req.params.projectId)
      .eq('doc_file', docFile)
      .single();

    if (error || !doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const html = marked(doc.content || '');
    res.json({
      name: doc.doc_name,
      content: html,
      raw: doc.content,
      path: `${req.params.projectId}/${docFile}`,
    });
  } catch (error) {
    console.error('Error reading document:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Download document (Markdown)
app.get('/api/download/:projectId/*', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const docFile = req.params[0] + '.md';
    const { data: doc, error } = await supabase
      .from('research_documents')
      .select('content, doc_name')
      .eq('project_id', req.params.projectId)
      .eq('doc_file', docFile)
      .single();

    if (error || !doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const fileName = doc.doc_name + '.md';
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'text/markdown');
    res.send(doc.content);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== CATCH-ALL ROUTE (MUST BE LAST) =====

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ message: 'Research Viewer running' });
  }
});

// Export for Vercel
module.exports = app;
