const fs = require('fs');
const path = require('path');

// Enhanced markdown to HTML converter
function markdownToHTML(markdown) {
  let html = markdown;
  
  // Split into lines for better processing
  let lines = html.split('\n');
  let result = [];
  let inList = false;
  let inCodeBlock = false;
  let codeBlockContent = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        result.push(`<pre><code>${codeBlockContent.join('\n')}</code></pre>`);
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(lines[i]);
      continue;
    }
    
    // Headers
    if (line.startsWith('##### ')) {
      result.push(`<h5>${line.substring(6)}</h5>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      result.push(`<h4>${line.substring(5)}</h4>`);
      continue;
    }
    if (line.startsWith('### ')) {
      result.push(`<h3>${line.substring(4)}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      result.push(`<h2>${line.substring(3)}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      result.push(`<h1>${line.substring(2)}</h1>`);
      continue;
    }
    
    // Horizontal rule
    if (line === '---' || line === '***') {
      result.push('<hr>');
      continue;
    }
    
    // Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      let content = line.substring(2);
      // Process inline formatting
      content = processInlineFormatting(content);
      result.push(`<li>${content}</li>`);
      continue;
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
    }
    
    // Empty lines
    if (line === '') {
      result.push('');
      continue;
    }
    
    // Regular paragraphs
    line = processInlineFormatting(line);
    result.push(`<p>${line}</p>`);
  }
  
  // Close any open list
  if (inList) {
    result.push('</ul>');
  }
  
  return result.join('\n');
}

function processInlineFormatting(text) {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Links (basic)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Checkmarks
  text = text.replace(/✅/g, '<span class="checkmark">✓</span>');
  
  return text;
}

const markdownContent = fs.readFileSync(path.join(__dirname, 'FEATURES_CATALOG.md'), 'utf8');

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NgenziRealEstate- Complete Features Catalog</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.7;
            color: #1f2937;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
            font-size: 11pt;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            color: white;
            border: none;
            margin: 0 0 10px 0;
            font-size: 2em;
        }
        
        .header p {
            margin: 5px 0;
            opacity: 0.95;
        }
        
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-top: 35px;
            margin-bottom: 20px;
            page-break-after: avoid;
            font-size: 1.8em;
        }
        
        h2 {
            color: #1e40af;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 15px;
            page-break-after: avoid;
            font-size: 1.5em;
        }
        
        h3 {
            color: #1e3a8a;
            margin-top: 25px;
            margin-bottom: 12px;
            page-break-after: avoid;
            font-size: 1.3em;
        }
        
        h4 {
            color: #1e40af;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        h5 {
            color: #3b82f6;
            margin-top: 15px;
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        p {
            margin: 12px 0;
            text-align: justify;
            line-height: 1.7;
        }
        
        ul {
            margin: 15px 0;
            padding-left: 35px;
        }
        
        li {
            margin: 8px 0;
            line-height: 1.6;
        }
        
        li strong {
            color: #1e40af;
        }
        
        code {
            background-color: #f3f4f6;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Courier New', 'Consolas', monospace;
            font-size: 0.9em;
            color: #dc2626;
        }
        
        pre {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            border-left: 4px solid #2563eb;
            page-break-inside: avoid;
            margin: 20px 0;
        }
        
        pre code {
            background: none;
            padding: 0;
            color: inherit;
            font-size: 0.85em;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background-color: #2563eb;
            color: white;
            font-weight: 600;
        }
        
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        
        .checkmark {
            color: #10b981;
            font-weight: bold;
            font-size: 1.1em;
        }
        
        hr {
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: 30px 0;
        }
        
        a {
            color: #2563eb;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        .section {
            margin: 30px 0;
            page-break-inside: avoid;
        }
        
        .feature-list {
            background: #f8fafc;
            padding: 15px;
            border-left: 4px solid #2563eb;
            margin: 15px 0;
            border-radius: 5px;
        }
        
        footer {
            margin-top: 60px;
            padding-top: 25px;
            border-top: 3px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.95em;
        }
        
        footer p {
            margin: 8px 0;
            text-align: center;
        }
        
        @media print {
            body {
                padding: 0;
                font-size: 10pt;
            }
            
            .header {
                page-break-after: avoid;
            }
            
            h1, h2, h3 {
                page-break-after: avoid;
            }
            
            h1, h2, h3, h4 {
                page-break-inside: avoid;
            }
            
            ul, ol {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>NgenziRealEstate- Complete Features Catalog</h1>
        <p><strong>Real Estate Platform Documentation</strong></p>
        <p>Platform: NgenziRealEstate Real Estate Website</p>
        <p>Backend API: https://myambi.wildjourneysrwanda.com</p>
        <p>Version: 2.0 | Date: January 2026</p>
    </div>
    
    ${markdownToHTML(markdownContent)}
    
    <footer>
        <p><strong>Document Generated:</strong> January 2026</p>
        <p><strong>Platform:</strong> NgenziRealEstateReal Estate Platform</p>
        <p><strong>Purpose:</strong> System Documentation and Feature Catalog</p>
        <p><strong>Backend API:</strong> https://myambi.wildjourneysrwanda.com</p>
    </footer>
</body>
</html>`;

// Save HTML file
fs.writeFileSync(path.join(__dirname, 'FEATURES_CATALOG.html'), htmlTemplate, 'utf8');
console.log('✅ HTML catalog generated: FEATURES_CATALOG.html');
console.log('📄 Instructions to create PDF:');
console.log('   1. Open FEATURES_CATALOG.html in your web browser');
console.log('   2. Press Ctrl+P (or Cmd+P on Mac)');
console.log('   3. Select "Save as PDF" as the destination');
console.log('   4. Click "Save" to generate the PDF file');
console.log('');
console.log('💡 Alternative: Use an online HTML to PDF converter or print to PDF service');
