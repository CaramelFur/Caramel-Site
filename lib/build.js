const fs = require('fs');
const eleventySassPlugin = require('eleventy-sass');
const syntaxHighlightPlugin = require("@11ty/eleventy-plugin-syntaxhighlight");
const htmlmin = require('html-minifier');
const md_lazy_loading = require('markdown-it-image-lazy-loading');
const esbuild = require('esbuild');

module.exports = function (eleventyConfig) {
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
  eleventyConfig.amendLibrary('md', (mdLib) =>
    mdLib.use(md_lazy_loading, {
      decoding: true,
    }),
  );

  // minify html
  eleventyConfig.addTransform('htmlmin', function (content) {
    if (!this.outputPath || !this.outputPath.endsWith('.html')) return content;
    let minified = htmlmin.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
    });
    return minified;
  });

  // minify js files
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
};
