import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../');

import * as prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
loadLanguages();

import Metalsmith from 'metalsmith';
import layouts from '@metalsmith/layouts';
import markdown from '@metalsmith/markdown';
import permalinks from '@metalsmith/permalinks';
import collections from '@metalsmith/collections';

import sass from 'metalsmith-sass';
import metal_prism from 'metalsmith-prism';

Metalsmith(root)
  .metadata({
    sitename: 'Rubikscraft',
    author: 'Rubikscraft',
    siteurl: 'https://rubikscraft.nl/',
    description: 'A Developer',
    social_description: 'A Developer',
    social_image: '/image/profile.png',

    buildyear: new Date().getFullYear(),
  })
  .source('./site')
  .destination('./dist')
  .clean(true)
  .use(
    collections({
      posts: {
        pattern: 'posts/**/*.md',
        sortBy: 'date',
        reverse: true,
      },
    }),
  )
  .use(
    sass({
      outputDir: 'css',
      includePaths: ['scss'],
    }),
  )
  .use(markdown())
  .use(
    permalinks({
      indexFile: 'index.html',
      relative: false,
      linksets: [
        {
          match: { collection: 'posts' },
          pattern: 'posts/:title',
          unique: true,
        },
      ],
    }),
  )
  .use(metal_prism())
  .use(
    layouts({
      engine: 'handlebars',
      default: 'main.hbs',
      pattern: '**/*.html',
    }),
  )
  .build(function (err) {
    if (err) throw err;
    console.log('Build finished!');
  });
