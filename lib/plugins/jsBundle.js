import esbuild from 'esbuild';

/**
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 * */
export default function (eleventyConfig) {
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
}
