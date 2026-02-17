const express = require('express');
const path = require('path');
const { marked } = require('marked');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL || 'https://vcwkgxwnzayxhysfjeqw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjd2tneHduemF5eGh5c2ZqZXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDMxNDksImV4cCI6MjA4NjkxOTE0OX0.C9SuxTfSKM8NnPQ_oAn8McVnPIkB71L_evU_nFlBztg';

let supabase = null;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (err) {
  console.error('Failed to initialize Supabase:', err);
}

// Middleware
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', supabaseConfigured: !!supabaseKey });
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    if (!supabase) {
      return res.json([]);
    }

    const { data: projects, error } = await supabase
      .from('research_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!projects || projects.length === 0) {
      return res.json([]);
    }

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
            path: `${project.project_id}/${d.doc_file}`,
          })),
        };
      })
    );

    res.json(projectsWithDocs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project details
app.get('/api/projects/:projectId', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(404).json({ error: 'Not found' });
    }

    const { data: project, error } = await supabase
      .from('research_projects')
      .select('*')
      .eq('project_id', req.params.projectId)
      .single();

    if (error || !project) {
      return res.status(404).json({ error: 'Not found' });
    }

    const { data: docs } = await supabase
      .from('research_documents')
      .select('doc_name, doc_file')
      .eq('project_id', req.params.projectId);

    res.json({
      id: project.project_id,
      name: project.project_name,
      overview: marked(project.overview || ''),
      docs: (docs || []).map(d => ({
        name: d.doc_name,
        file: d.doc_file,
        path: `${project.project_id}/${d.doc_file}`,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get document content
app.get('/api/documents/:projectId/*', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(404).json({ error: 'Not found' });
    }

    const docFile = req.params[0] + '.md';
    const { data: doc, error } = await supabase
      .from('research_documents')
      .select('content, doc_name')
      .eq('project_id', req.params.projectId)
      .eq('doc_file', docFile)
      .single();

    if (error || !doc) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({
      name: doc.doc_name,
      content: marked(doc.content || ''),
      raw: doc.content,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download document
app.get('/api/download/:projectId/*', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(404).json({ error: 'Not found' });
    }

    const docFile = req.params[0] + '.md';
    const { data: doc, error } = await supabase
      .from('research_documents')
      .select('content, doc_name')
      .eq('project_id', req.params.projectId)
      .eq('doc_file', docFile)
      .single();

    if (error || !doc) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${doc.doc_name}.md"`);
    res.setHeader('Content-Type', 'text/markdown');
    res.send(doc.content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export
module.exports = app;
