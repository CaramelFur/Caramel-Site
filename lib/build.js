import * as dotenv from 'dotenv';
dotenv.config();

import syntaxHighlightPlugin from '@11ty/eleventy-plugin-syntaxhighlight';
import eleventySassPlugin from 'eleventy-sass';
import esbuild from 'esbuild';
import fs from 'fs';
import greyMatter from 'gray-matter';
import htmlmin from 'html-minifier';
import encryptTransform from './encrypt.js';
import htmlProcessor from './htmlProcessor.js';

/**
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 * */
export default function (eleventyConfig) {
  try {
    fs.rmSync('./dist', { recursive: true });
  } catch (e) {}

  // process only md
  eleventyConfig.setTemplateFormats(['md', 'hbs', 'js']);

  // share frontmatter data
  eleventyConfig.addTransform('share-frontmatter', function (content) {
    if (!this.inputPath || !this.inputPath.endsWith('.md')) return content;
    const inputContent = fs.readFileSync(this.inputPath, 'utf8');
    this.page.data = greyMatter(inputContent).data;
    return content;
  });

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

  // lazy load iamges
  eleventyConfig.addTransform('htmlProcessor', async function (content) {
    if (this.page?.outputFileExtension !== 'html') return content;
    let processed = htmlProcessor(content, {
      lazy: true,
      title: false,
      size: true,
      basePath: './site',
    });
    return processed;
  });

  // minify html
  eleventyConfig.addTransform('htmlmin', function (content) {
    if (this.page?.outputFileExtension !== 'html') return content;
    let minified = htmlmin.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
    });
    return minified;
  });

  // Print front matter data of all md pages
  eleventyConfig.addTransform('encrypt', encryptTransform);

  // esbuild js files
  eleventyConfig.addExtension('js', {
    outputFileExtension: 'js',
    read: false,
    compile: (content, path) => {
      return (data) => {
        delete data.layout;
        const result = esbuild.buildSync({
          entryPoints: [path],
          bundle: true,
          minify: true,
          write: false,
          platform: 'browser',
          target: 'es2015',
        });

        return result.outputFiles[0].text;
      };
    },
  });

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
