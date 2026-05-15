# Swathi Resuma

A professional portfolio website for Swathi Kanakavalli, built as a single-page web experience with a polished dark purple theme.

## Overview

This portfolio highlights:

- Professional summary and core strengths
- Experience at Tata Consultancy Services
- BFSI domain exposure
- Tools and technologies such as ServiceNow, Control-M, Jenkins, Informatica, SQL, Excel, and Power BI
- A contact section with a persistent message board

## Features

- Responsive one-page layout
- Dark purple and black visual theme
- Filterable portfolio section
- Local file-backed contact messages
- Delete support for posted messages

## Project Structure

- `index.html` - Main portfolio page
- `assets/css/style.css` - Site styling
- `assets/js/script.js` - Frontend interactions
- `assets/data/messages.json` - Persisted contact messages
- `server.py` - Local Python server with message APIs

## Run Locally

1. Open the project folder in a terminal
2. Start the local server:

```bash
python server.py
```

3. Open the site in your browser:

```text
http://127.0.0.1:8765/index.html
```

## Notes

- Contact form submissions are stored locally in `assets/data/messages.json`
- Deleting a posted message removes it from the same file
- This repository is intended for local portfolio use and GitHub hosting of the codebase
