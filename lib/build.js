import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../');

import loadLanguages from 'prismjs/components/index.js';
loadLanguages();

import collections from '@metalsmith/collections';
import excerpts from '@metalsmith/excerpts';
import layouts from '@metalsmith/layouts';
import markdown from '@metalsmith/markdown';
import permalinks from '@metalsmith/permalinks';
import Metalsmith from 'metalsmith';

import feed from 'metalsmith-feed';
import metal_prism from 'metalsmith-prism';
import sass from 'metalsmith-sass';

Metalsmith(root)
  // Configure base settings
  .metadata({
    site: {
      name: 'Rubikscraft',
      author: 'Rubikscraft',
      url: 'https://rubikscraft.nl/',
      description: 'A Developer',
    },
    social_description: 'A Developer',
    social_image: '/image/profile.png',

    styles: ['/css/main.css', '/fonts/opensans.css'],
    buildyear: new Date().getFullYear(),
  })
  .source('./site')
  .destination('./dist')
  .clean(true)
  // Create posts collection
  .ignore(['**/*.draft.md'])
  .use(
    collections({
      posts: {
        pattern: ['posts/**/*.md'],
        sortBy: 'date',
        reverse: true,
      },
    }),
  )
  // Converting markdown
  .use(markdown())
  // Linking to posts
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
  // Html styling
  .use(
    sass({
      outputDir: 'css',
      includePaths: ['scss'],
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
  // Rss feed
  .use(
    collections({
      htmlPosts: {
        pattern: ['posts/*/**/*.html'],
        sortBy: 'date',
        reverse: true,
      },
    }),
  )
  .use(excerpts())
  .use(feed({ collection: 'htmlPosts' }))
  // Build
  .build(function (err) {
    if (err) throw err;
    console.log('Build finished!');
  });
