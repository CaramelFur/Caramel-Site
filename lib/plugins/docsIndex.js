import fs from 'fs';
import path from 'path';

/**
 * Plugin to generate an index for the docs directory
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 */
export default function (eleventyConfig) {
  // Track if we're in watch mode
  let isWatchMode = false;
  
  eleventyConfig.on('eleventy.before', ({ runMode }) => {
    isWatchMode = runMode === 'watch' || runMode === 'serve';
  });

  // Generate docs index before build
  eleventyConfig.on('beforeBuild', () => {
    const docsDir = 'site/docs';
    const itemsMap = new Map(); // Use a map to group by name
    
    try {
      // Read the docs directory
      const entries = fs.readdirSync(docsDir, { withFileTypes: true });
      
      // Process each entry (only one level deep)
      for (const entry of entries) {
        // Skip system files and directories
        if (entry.name.startsWith('.')) continue;
        
        const entryPath = path.join(docsDir, entry.name);
        
        if (entry.isDirectory()) {
          // Check if the directory contains an index.html or other HTML files
          const files = fs.readdirSync(entryPath);
          const htmlFiles = files.filter(file => file.endsWith('.html'));
          
          if (htmlFiles.length > 0) {
            const targetFile = htmlFiles.includes('index.html') ? 'index.html' : htmlFiles[0];
            const itemName = entry.name;
            
            // Store in the map
            itemsMap.set(itemName, {
              name: itemName,
              html: {
                url: `/docs/${encodeURIComponent(entry.name)}/${encodeURIComponent(targetFile)}`,
                type: 'folder'
              }
            });
          }
        } else {
          // Process individual files
          let itemName, itemType;
          
          if (entry.name.endsWith('.html')) {
            itemName = entry.name.replace('.html', '');
            itemType = 'html';
          } else if (entry.name.endsWith('.pdf')) {
            itemName = entry.name.replace('.pdf', '');
            itemType = 'pdf';
          } else {
            // Skip non-html/pdf files
            continue;
          }
          
          // If we already have this item in the map, add this variant to it
          if (itemsMap.has(itemName)) {
            const existingItem = itemsMap.get(itemName);
            existingItem[itemType] = {
              url: `/docs/${encodeURIComponent(entry.name)}`,
              type: itemType
            };
          } else {
            // Create a new item
            const newItem = {
              name: itemName
            };
            newItem[itemType] = {
              url: `/docs/${encodeURIComponent(entry.name)}`,
              type: itemType
            };
            itemsMap.set(itemName, newItem);
          }
        }
      }
      
      // Convert map to array
      const items = Array.from(itemsMap.values());
      
      // Generate markdown content with HTML for links that need data-cold attribute
      const markdown = `---
layout: main.hbs
title: Docs
permalink: /docs/index.html
---

${items.map(item => {
  let link = '';
  const icon = (item.html?.type === 'folder' || item.html?.type === 'html') ? '📁' : '📄';
  
  // Create the main link (prefer HTML version)
  if (item.html) {
    link = `${icon} [${item.name}](${item.html.url})`;
  } else if (item.pdf) {
    // Use HTML for PDF-only links to include data-cold
    link = `${icon} <a href="${item.pdf.url}" data-cold>${item.name}</a>`;
  }
  
  // Add PDF link if available and we already have an HTML link
  if (item.pdf && item.html) {
    // Use HTML for the PDF link to include data-cold
    link += ` - <a href="${item.pdf.url}" data-cold>[PDF]</a>`;
  }
  
  return `- ${link}`;
}).join('\n')}
`;
      
      // Create a temporary markdown file that will be processed by Eleventy
      const tempMdPath = path.join('site', '_docs-index.md');
      fs.writeFileSync(tempMdPath, markdown);
      
      // Only register cleanup in non-watch mode (one-time builds)
      if (!isWatchMode) {
        // Register cleanup function to remove temporary file after build
        eleventyConfig.on('afterBuild', () => {
          try {
            fs.unlinkSync(tempMdPath);
            console.log('Removed temporary _docs-index.md file');
          } catch (err) {
            console.error('Error removing temporary file:', err);
          }
        });
      }
    } catch (err) {
      console.error('Error generating docs index:', err);
    }
  });
  
  // Add a special exit handler for watch mode to clean up when exiting
  if (process.env.NODE_ENV !== 'production') {
    process.on('SIGINT', () => {
      const tempMdPath = path.join('site', '_docs-index.md');
      try {
        if (fs.existsSync(tempMdPath)) {
          fs.unlinkSync(tempMdPath);
          console.log('Cleaned up temporary _docs-index.md file on exit');
        }
      } catch (err) {
        console.error('Error cleaning up temporary file on exit:', err);
      }
      process.exit();
    });
  }
} 