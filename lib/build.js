import * as dotenv from 'dotenv';
dotenv.config();

import syntaxHighlightPlugin from '@11ty/eleventy-plugin-syntaxhighlight';
import eleventySassPlugin from 'eleventy-sass';
import fs from 'fs';
import encryptPlugin from './plugins/encrypt.js';
import htmlImagePlugin from './plugins/htmlImages.js';
import htmlMinifyPlugin from './plugins/htmlMinify.js';
import jsBundlePlugin from './plugins/jsBundle.js';

/**
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 * */
export default function (eleventyConfig) {
  try {
    fs.rmSync('./dist', { recursive: true });
  } catch (e) {}

  // process only md
  eleventyConfig.setTemplateFormats(['md', 'hbs', 'js']);

  // use permalinks for posts/**/*.md being /posts/:title
  eleventyConfig.addCollection('posts', (collection) =>
    collection.getFilteredByGlob('site/posts/**/*').reverse(),
  );

  // add handlerbars helpers
  eleventyConfig.addShortcode(
    'makeISO',
    (date) => new Date(date).toISOString().split('T')[0],
  );
  eleventyConfig.addShortcode('buildyear', () => `${new Date().getFullYear()}`);

  // copy all non-processable files to dist
  eleventyConfig.addPassthroughCopy('site/**.txt');
  eleventyConfig.addPassthroughCopy('site/**.webmanifest');
  eleventyConfig.addPassthroughCopy('site/fonts');
  eleventyConfig.addPassthroughCopy('site/image');
  eleventyConfig.addPassthroughCopy('site/files');
  eleventyConfig.addPassthroughCopy('site/docs');

  // watch font updates
  eleventyConfig.addWatchTarget('site/fonts');

  // add scss processing
  eleventyConfig.addPlugin(eleventySassPlugin, {
    sass: {
      style: 'compressed',
      sourceMap: false,
      loadPaths: ['./'],
    },
  });

  // Add syntax highlighting
  eleventyConfig.addPlugin(syntaxHighlightPlugin);
  eleventyConfig.addPlugin(htmlImagePlugin);
  eleventyConfig.addPlugin(htmlMinifyPlugin);
  eleventyConfig.addPlugin(encryptPlugin);
  eleventyConfig.addPlugin(jsBundlePlugin);

  // Configure elventy root to ./site
  return {
    dir: {
      input: 'site',
      output: 'dist',
      layouts: '../layouts',
      data: '../data',
    },
  };
}
