import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import * as prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
loadLanguages();

import Metalsmith from 'metalsmith';
import layouts from '@metalsmith/layouts';
import markdown from '@metalsmith/markdown';
import permalinks from '@metalsmith/permalinks';

import sass from 'metalsmith-sass';
import metal_prism from 'metalsmith-prism';
import inline_css from 'metalsmith-inline-css';

Metalsmith(__dirname)
  .metadata({
    sitename: 'Rubikscraft',
    author: 'Rubikscraft',
    siteurl: 'https://rubikscraft.nl/',
    description: 'A Developer',
    social_description: 'A Developer',
    social_image: '/image/profile.png',
  })
  .source('./site')
  .destination('./dist')
  .clean(true)
  .use(
    sass({
      outputDir: 'css',
      includePaths: ['scss'],
    }),
  )
  .use(markdown())
  .use(
    permalinks({
      relative: false,
    }),
  )
  .use(
    metal_prism({
      lineNumbers: true,
    }),
  )
  .use(
    layouts({
      engine: 'handlebars',
      default: 'layout.hbs',
      pattern: '**/*.html',
    }),
  )
  .use(inline_css())
  .build(function (err) {
    if (err) throw err;
    console.log('Build finished!');
  });
