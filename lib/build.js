const fs = require('fs');
const eleventySass = require('eleventy-sass');
const htmlmin = require('html-minifier');
const md_lazy_loading = require('markdown-it-image-lazy-loading');

module.exports = function (eleventyConfig) {
  try {
    fs.rmSync('./dist', { recursive: true });
  } catch (e) {}

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
  eleventyConfig.addPlugin(eleventySass, {
    sass: {
      style: 'compressed',
      sourceMap: false,
      loadPaths: ['./'],
    },
  });

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
