const probe = require('./easyImageProbe');

const htmlParser = require('htmlparser2');
const domHandler = require('domhandler').default;
const domSerializer = require('dom-serializer').default;
const domUtils = require('domutils');

async function getDom(content) {
  return new Promise((resolve, reject) => {
    const handler = new domHandler((error, dom) => {
      if (error) {
        reject(error);
      } else {
        resolve(dom);
      }
    });
    const parser = new htmlParser.Parser(handler);
    parser.write(content);
    parser.end();
  });
}

async function processImage(img, options) {
  const { lazy, size, basePath } = options;
  const src = img.attribs.src;
  if (lazy) {
    img.attribs.loading = 'lazy';
  }
  if (size) {
    try {
      const { width, height } = await probe(src, { basePath });
      img.attribs.width = width.toString();
      img.attribs.height = height.toString();
    } catch (e) {
      console.warn(`Could not get size of image ${src}`);
    }
  }
}

module.exports = async (html, mdOptions) => {
  // parse html to dom
  const dom = await getDom(html);

  const imagePromises = domUtils
    .findAll((elem) => elem.name === 'img', dom)
    .map((image) => processImage(image, mdOptions));
  await Promise.all(imagePromises);

  const serialized = domSerializer(dom);

  return serialized;

  const defaultImageRenderer = md.renderer.rules.image;

  md.renderer.rules.image = async (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    token.attrSet('loading', 'lazy');

    if (mdOptions && mdOptions.decoding === true) {
      token.attrSet('decoding', 'async');
    }

    // if (mdOptions && mdOptions.size === true) {
    //   const imgSrc = token.attrGet('src');
    //   const dimensions = probe(imgSrc, {
    //     basePath: mdOptions.basePath,
    //   });

    //   token.attrSet('width', dimensions.width);
    //   token.attrSet('height', dimensions.height);
    // }

    //wait 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return defaultImageRenderer(tokens, idx, options, env, self);
  };
};
