import htmlmin from 'html-minifier';

/**
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 * */
export default function (eleventyConfig) {
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
}
