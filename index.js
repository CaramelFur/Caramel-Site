import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import sass from 'metalsmith-sass';
import markdown from '@metalsmith/markdown';
import permalinks from '@metalsmith/permalinks';

Metalsmith(__dirname)
  .metadata({
    sitename: 'Rubikscraft',
    siteurl: 'https://rubikscraft.nl/',
    description: 'A Developer',
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
    layouts({
      engine: 'handlebars',
      default: 'layout.hbs',
      pattern: '**/*.html',
    }),
  )
  .build(function (err) {
    if (err) throw err;
    console.log('Build finished!');
  });
