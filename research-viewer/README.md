# 📚 Research Viewer

A clean, modern web interface for browsing and viewing research documents organized by project.

## Features

- 📂 **Project Organization** — View all research projects in one place
- 📖 **Document Reader** — Read markdown documents with nice formatting
- 🎨 **Beautiful UI** — Clean, modern design with sidebar navigation
- ⬇️ **Download Support** — Download individual markdown files
- 🔍 **Responsive** — Works on desktop, tablet, and mobile
- 📱 **Single Page App** — Smooth navigation without page reloads

## Getting Started

### Installation

```bash
cd /root/.openclaw/workspace/research-viewer
npm install
```

### Running the Server

```bash
npm start
# Server runs on http://localhost:3000
```

### Project Structure

```
research-viewer/
├── server.js          # Express.js backend
├── package.json       # Dependencies
├── public/
│   ├── index.html     # HTML shell
│   ├── app.js         # Frontend logic
│   └── styles.css     # Styling
└── README.md          # This file
```

## How It Works

The viewer scans `/root/.openclaw/workspace/research/` for project directories and their markdown files.

### Project Organization

Each project directory should contain:
- `INDEX.md` — Project overview (shown in project details view)
- `*.md` files — Individual research documents

Example structure:
```
research/
├── project-impact/
│   ├── INDEX.md
│   ├── GATE-1_HANDHOLDING_BRIEF.md
│   ├── EXTERNAL_RESEARCH_FINDINGS.md
│   └── ...more documents...
├── another-project/
│   ├── INDEX.md
│   └── ...more documents...
```

## API Endpoints

The backend provides these REST endpoints:

- `GET /api/projects` — List all projects
- `GET /api/projects/:projectId` — Get project details
- `GET /api/documents/:projectId/*` — Get document content (rendered as HTML)
- `GET /api/download/:projectId/*` — Download document as .md file

## Usage Tips

1. **Start with Projects Overview** — Click any project card to explore
2. **Read Documents** — Click any document card to open and read
3. **Download** — Use the download button to save markdown files
4. **Back Navigation** — Use "← Back" buttons to navigate

## Customization

### Add a New Project

1. Create a directory under `/root/.openclaw/workspace/research/your-project-name/`
2. Add `INDEX.md` with project overview
3. Add `.md` files for documents
4. Refresh the browser — project appears automatically

### Styling

Modify `public/styles.css` to change colors, fonts, or layout:

```css
:root {
  --primary: #0066cc;           /* Main color */
  --text-dark: #1a1a1a;         /* Text color */
  --background: #fafafa;         /* Background */
  /* ...more variables */
}
```

## Troubleshooting

### "Projects not loading"
- Check that research directories exist: `ls /root/.openclaw/workspace/research/`
- Check server logs: `tail -f /tmp/research-viewer.log`
- Ensure port 3000 is not in use: `lsof -i :3000`

### "Document not rendering"
- Ensure markdown files end with `.md`
- Check file paths in API errors
- Verify markdown syntax is valid

### "Download not working"
- Check browser console for errors (F12)
- Ensure file exists: `ls -la /root/.openclaw/workspace/research/project-name/file.md`

## Browser Support

Works on all modern browsers:
- Chrome/Chromium
- Firefox
- Safari
- Edge

## License

Internal use only.
