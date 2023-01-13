import domSerializer from 'dom-serializer';
import domHandler from 'domhandler';
import * as domUtils from 'domutils';
import * as htmlParser from 'htmlparser2';
import probe from './easyImageProbe.js';

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
  const { lazy, title, size, basePath } = options;
  
  const figure = {
    type: 'tag',
    name: 'figure',
    attribs: {},
    children: [img],
  };

  if (title && img.attribs.title) {
    const titleP = {
      type: 'tag',
      name: 'p',
      attribs: {},
      children: [
        {
          type: 'text',
          data: img.attribs.title,
        },
      ],
    };

    figure.children.push(titleP);
  }

  domUtils.replaceElement(img, figure);

  const src = img.attribs.src;
  if (lazy) {
    img.attribs.loading = 'lazy';
  }
  if (size) {
    try {
      console.log(`[11ty] Getting size of image ${src}`);
      const { width, height } = await probe(src, { basePath });
      img.attribs.width = width.toString();
      img.attribs.height = height.toString();
    } catch (e) {
      console.warn(`Could not get size of image ${src}`);
    }
  }
}

export default async (html, mdOptions) => {
  // parse html to dom
  const dom = await getDom(html);

  const imagePromises = domUtils
    .findAll((elem) => elem.name === 'img', dom)
    .map((image) => processImage(image, mdOptions));
  await Promise.all(imagePromises);

  const serialized = domSerializer(dom);

  return serialized;
};
