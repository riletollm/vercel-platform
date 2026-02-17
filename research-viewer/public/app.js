// Research Viewer App
const app = {
  state: {
    projects: [],
    currentProject: null,
    currentDocument: null
  },

  async init() {
    console.log('🚀 Initializing Research Viewer...');
    await this.loadProjects();
    this.render();
  },

  async loadProjects() {
    try {
      const response = await fetch('/api/projects');
      this.state.projects = await response.json();
      console.log(`✅ Loaded ${this.state.projects.length} projects`);
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      document.getElementById('projectsList').innerHTML = '<div class="loading">Error loading projects</div>';
    }
  },

  render() {
    if (this.state.currentDocument) {
      this.renderDocumentViewer();
    } else if (this.state.currentProject) {
      this.renderProjectDetails();
    } else {
      this.renderProjectsOverview();
    }
  },

  renderProjectsOverview() {
    // Show overview
    document.getElementById('projectsOverview').classList.remove('hidden');
    document.getElementById('projectDetails').classList.add('hidden');
    document.getElementById('documentViewer').classList.add('hidden');

    // Sidebar: list all projects
    const sidebar = document.getElementById('projectsList');
    sidebar.innerHTML = this.state.projects.map(project => `
      <div class="project-item" onclick="app.selectProject('${project.id}')">
        <div class="project-item-name">${project.name}</div>
        <div class="project-item-count">${project.docCount} documents</div>
      </div>
    `).join('');

    // Grid: show all projects
    const grid = document.getElementById('overviewGrid');
    grid.innerHTML = this.state.projects.map(project => `
      <div class="project-card" onclick="app.selectProject('${project.id}')">
        <div class="project-card-title">${project.name}</div>
        <div class="project-card-count">${project.docCount}</div>
        <div class="project-card-label">Documents</div>
      </div>
    `).join('');
  },

  renderProjectDetails() {
    document.getElementById('projectsOverview').classList.add('hidden');
    document.getElementById('projectDetails').classList.remove('hidden');
    document.getElementById('documentViewer').classList.add('hidden');

    const project = this.state.currentProject;
    document.getElementById('projectTitle').textContent = project.name;

    // Render overview with markdown
    const overviewHtml = project.overview || '<em>No overview available</em>';
    document.getElementById('projectOverview').innerHTML = overviewHtml;

    // Sidebar: highlight current project
    const sidebar = document.getElementById('projectsList');
    sidebar.innerHTML = this.state.projects.map(proj => `
      <div class="project-item ${proj.id === project.id ? 'active' : ''}" onclick="app.selectProject('${proj.id}')">
        <div class="project-item-name">${proj.name}</div>
        <div class="project-item-count">${proj.docCount} documents</div>
      </div>
    `).join('');

    // Documents grid
    const grid = document.getElementById('documentsGrid');
    grid.innerHTML = project.docs.map(doc => `
      <div class="doc-card" onclick="app.selectDocument('${project.id}', '${doc.path}')">
        <div class="doc-card-icon">📄</div>
        <div class="doc-card-title">${doc.name}</div>
      </div>
    `).join('');
  },

  async renderDocumentViewer() {
    document.getElementById('projectsOverview').classList.add('hidden');
    document.getElementById('projectDetails').classList.add('hidden');
    document.getElementById('documentViewer').classList.remove('hidden');

    const project = this.state.currentProject;
    const doc = this.state.currentDocument;

    document.getElementById('documentTitle').textContent = doc.name;

    // Sidebar: highlight current project
    const sidebar = document.getElementById('projectsList');
    sidebar.innerHTML = this.state.projects.map(proj => `
      <div class="project-item ${proj.id === project.id ? 'active' : ''}" onclick="app.selectProject('${proj.id}')">
        <div class="project-item-name">${proj.name}</div>
        <div class="project-item-count">${proj.docCount} documents</div>
      </div>
    `).join('');

    // Content
    const contentDiv = document.getElementById('documentContent');
    contentDiv.innerHTML = '<div class="loading">Loading document...</div>';

    try {
      const response = await fetch(`/api/documents/${project.id}/${doc.path.split('/')[1].replace('.md', '')}`);
      const data = await response.json();
      contentDiv.innerHTML = data.content;
    } catch (error) {
      console.error('Error loading document:', error);
      contentDiv.innerHTML = '<div class="loading">Error loading document</div>';
    }
  },

  selectProject(projectId) {
    const project = this.state.projects.find(p => p.id === projectId);
    if (project) {
      this.state.currentProject = project;
      this.state.currentDocument = null;
      this.render();
    }
  },

  selectDocument(projectId, docPath) {
    const project = this.state.projects.find(p => p.id === projectId);
    const doc = project.docs.find(d => d.path === docPath);
    if (doc) {
      this.state.currentProject = project;
      this.state.currentDocument = doc;
      this.render();
    }
  },

  backToProject() {
    this.state.currentDocument = null;
    this.render();
  },

  backToProjects() {
    this.state.currentProject = null;
    this.state.currentDocument = null;
    this.render();
  },

  async downloadDocument(format = 'md') {
    const project = this.state.currentProject;
    const doc = this.state.currentDocument;
    if (!project || !doc) return;

    const docName = doc.path.split('/')[1].replace('.md', '');
    
    if (format === 'md') {
      // Download markdown directly
      window.location.href = `/api/download/${project.id}/${docName}`;
    } else if (format === 'pdf') {
      this.downloadPDF(project.id, docName);
    } else if (format === 'docx') {
      this.downloadDOCX(project.id, docName);
    }
    
    this.closeDownloadMenu();
  },

  async downloadPDF(projectId, docName) {
    try {
      // Fetch the HTML content
      const response = await fetch(`/api/download-pdf/${projectId}/${docName}`);
      const data = await response.json();

      if (response.status !== 200) {
        alert('Error: ' + data.error);
        return;
      }

      // Create styled HTML element
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; line-height: 1.8; color: #333; max-width: 900px; margin: 0 auto; padding: 20px;">
          ${data.html}
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 0.9rem; text-align: center;">
            Generated from Research Viewer • ${new Date().toLocaleDateString()}
          </p>
        </div>
      `;

      const options = {
        margin: 10,
        filename: data.fileName + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  },

  async downloadDOCX(projectId, docName) {
    try {
      // Fetch the markdown content
      const response = await fetch(`/api/download-docx/${projectId}/${docName}`);
      const data = await response.json();

      if (response.status !== 200) {
        alert('Error: ' + data.error);
        return;
      }

      // Parse markdown and create DOCX
      const lines = data.text.split('\n');
      const paragraphs = [];

      lines.forEach((line) => {
        if (line.startsWith('# ')) {
          paragraphs.push(
            new docx.Paragraph({
              text: line.replace(/^# /, ''),
              heading: docx.HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            })
          );
        } else if (line.startsWith('## ')) {
          paragraphs.push(
            new docx.Paragraph({
              text: line.replace(/^## /, ''),
              heading: docx.HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            })
          );
        } else if (line.startsWith('### ')) {
          paragraphs.push(
            new docx.Paragraph({
              text: line.replace(/^### /, ''),
              heading: docx.HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 }
            })
          );
        } else if (line.trim()) {
          paragraphs.push(
            new docx.Paragraph({
              text: line,
              spacing: { line: 360 }
            })
          );
        }
      });

      const doc = new docx.Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      docx.Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.fileName + '.docx';
        link.click();
        window.URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('DOCX generation error:', error);
      alert('Error generating DOCX: ' + error.message);
    }
  },

  toggleDownloadMenu() {
    const menu = document.getElementById('downloadMenu');
    menu.classList.toggle('show');
  },

  closeDownloadMenu() {
    const menu = document.getElementById('downloadMenu');
    menu.classList.remove('show');
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('downloadMenu');
    const dropdown = document.querySelector('.dropdown');
    if (menu && !dropdown.contains(e.target)) {
      menu.classList.remove('show');
    }
  });
});
