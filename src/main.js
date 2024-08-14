import path from 'path';
import Koa from 'koa';
import serveStatic from 'koa-static';
import c2k from 'koa-connect';
import session from 'koa-session';
import { koaBody } from 'koa-body';
import views from '@ladjs/koa-views';
import nunjucks from 'nunjucks';
import humanizeDuration from "humanize-duration";
import { createServer } from 'vite';

import setupRoutes from './routes.js';
import database from './database.js';
let app = new Koa();

// Setup session handling
app.keys = ['very-secret', 'keys'];
app.use(session(app));

const templateDir = path.join(import.meta.dirname, '../frontend/views');
console.log("Template directory: ", templateDir);
// Configure nunjucks for templating
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(templateDir)
);
env.addFilter('tootDuration', function (date) {
  let now = new Date();
  let tootDate = new Date(date);
  let diff = now - tootDate;
  if (diff < 3600 * 1000) {
    return humanizeDuration(diff, { round: true }) + " ago";
  }
  return tootDate.toLocaleString();
});
const render = views(templateDir, {
  extension: 'html',
  options: {
    nunjucksEnv: env
  },
  map: {
    html: 'nunjucks'
  }
});

// Must be used before any router is used
app.use(render)
// OR Expand by app.context
// No order restrictions
// app.context.render = render()

// Use vite
if (process.env.NODE_ENV === 'production') {
  app.use(serveStatic(path.join(import.meta.dirname, '../dist'), '/public'));
} else {
  let viteInstance = await createServer({
    server: {
      middlewareMode: true
    },
    appType: "custom"
  });
  app.use(c2k(viteInstance.middlewares));
}

app.use(koaBody());

app.use(async (ctx, next) => {
  console.log(ctx.method, 'on', ctx.path);
  await next();
});

app.use(async (ctx, next) => {
  if (ctx.database === undefined) {
    ctx.database = await database();
  }
  await next();
});

app.use(async (ctx, next) => {
  if (ctx.session !== undefined && ctx.session.success !== undefined) {
    ctx.state.success = ctx.session.success;
    ctx.session.success = undefined;
  }
  if (ctx.session !== undefined && ctx.session.error !== undefined) {
    ctx.state.error = ctx.session.error;
    ctx.session.error = undefined;
  }
  if (ctx.session !== undefined && ctx.session.user !== undefined) {
    ctx.state.user = ctx.session.user;
  }
  // Attach csrf token to ctx.state
  console.log(ctx.state);
  ctx.state.csrf = ctx.state._csrf;
  await next();
});

setupRoutes(app);

app.listen(process.env.PORT ?? 8000);
