import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import markdown from '@metalsmith/markdown';
import permalinks from '@metalsmith/permalinks';

Metalsmith(__dirname)
  .metadata({
    sitename: 'Rubikscraft',
    siteurl: 'https://rubikscraft.nl/',
    description: 'Hello there',
  })
  .source('./site')
  .destination('./dist')
  .clean(true)
  .use(markdown())
  .use(
    permalinks({
      pattern: ':title',
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
