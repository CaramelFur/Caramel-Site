const fs = require('fs');
const eleventySass = require('eleventy-sass');
const htmlmin = require('html-minifier');

module.exports = function (eleventyConfig) {
  try {
    fs.rmdirSync('./dist', { recursive: true });
  } catch (e) {}

  // // use permalinks for posts/**/*.md being /posts/:title
  eleventyConfig.addCollection('posts', function (collection) {
    let posts = collection.getFilteredByGlob('site/posts/**/*').reverse();
    // add a yyyy-mm-dd date to each post
    return posts.map((post) => {
      post.data.isodate = post.data.date.toISOString().split('T')[0];
      return post;
    });
  });

  // Add buildyear data
  eleventyConfig.addShortcode('buildyear', () => `${new Date().getFullYear()}`);

  // copy all non-processable files to dist
  eleventyConfig.addPassthroughCopy('site/**.txt');
  eleventyConfig.addPassthroughCopy('site/fonts');
  eleventyConfig.addPassthroughCopy('site/image');

  // add scss processing
  eleventyConfig.addPlugin(eleventySass, {
    sass: {
      style: 'compressed',
      sourceMap: false,
      loadPaths: ['./'],
    },
  });

  // minify html
  eleventyConfig.addTransform('htmlmin', function (content) {
    if (this.outputPath && this.outputPath.endsWith('.html')) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
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
