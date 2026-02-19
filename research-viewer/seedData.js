const fs = require('fs');
const path = require('path');

// Try to load from files, fall back to embedded data
let visionContent = '';
let readmeContent = '';
let journeyContent = '';
let archContent = '';
let roadmapContent = '';

try {
  visionContent = fs.readFileSync(path.join(__dirname, 'data/VISION.md'), 'utf-8');
} catch (e) {
  visionContent = `# Learning Experience Platform — Product Vision

## Core Thesis

**The disruption isn't becoming a better LMS. It's making the concept of an LMS obsolete because learning management implies learning is something you manage. Real learning is something you do in flow, and you track it as a side effect.**

## POC Target: SSEN Cable Jointer (ST1332)

**Partner:** Scottish and Southern Electric Networks (SSEN)  
**Problem:** Need to accelerate jointer training to support ED2 delivery

See the full documentation for details.`;
}

try {
  readmeContent = fs.readFileSync(path.join(__dirname, 'data/README.md'), 'utf-8');
} catch (e) {
  readmeContent = `# Learning Experience Platform — Project Docs

A disruptive learning platform designed to replace the LMS paradigm.

See other documents for full details.`;
}

try {
  journeyContent = fs.readFileSync(path.join(__dirname, 'data/LEARNER_JOURNEY.md'), 'utf-8');
} catch (e) {
  journeyContent = `# Learner Journey Map — SSEN Cable Jointer

From Day 1 through EPA ready in 12 weeks.

See full document for complete journey.`;
}

try {
  archContent = fs.readFileSync(path.join(__dirname, 'data/ARCHITECTURE.md'), 'utf-8');
} catch (e) {
  archContent = `# Technical Architecture

System design for the platform.`;
}

try {
  roadmapContent = fs.readFileSync(path.join(__dirname, 'data/MVP_ROADMAP.md'), 'utf-8');
} catch (e) {
  roadmapContent = `# MVP Roadmap — 6-Week Build Plan

Build plan for the proof of concept.`;
}

module.exports = {
  project: {
    project_id: 'lms-disruptor',
    project_name: 'LMS Disruptor: Conversational Learning Platform',
    overview: 'A disruptive learning platform designed to replace the LMS paradigm. Building a conversational, mobile-native experience for SSEN Cable Jointer (ST1332) training that reduces time-to-competency from 12-18 weeks to 9-12 weeks. Three integrated layers: TikTok-like app, WhatsApp PA coach, and silent competency engine.'
  },
  documents: [
    {
      doc_name: 'Vision',
      doc_file: 'VISION.md',
      content: visionContent
    },
    {
      doc_name: 'Project Overview',
      doc_file: 'README.md',
      content: readmeContent
    },
    {
      doc_name: 'Learner Journey Map',
      doc_file: 'LEARNER_JOURNEY.md',
      content: journeyContent
    },
    {
      doc_name: 'Technical Architecture',
      doc_file: 'ARCHITECTURE.md',
      content: archContent
    },
    {
      doc_name: 'MVP Roadmap',
      doc_file: 'MVP_ROADMAP.md',
      content: roadmapContent
    }
  ]
};
