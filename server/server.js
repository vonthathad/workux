import Express from 'express';
// import compression from 'compression';
import mongoose from 'mongoose';
import passport from 'passport';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import serialize from 'serialize-javascript';
// Webpack Requirements
// import webpack from 'webpack';
// import webpackConfig from '../webpack.config.dev';
// import webpackDevMiddleware from 'webpack-dev-middleware';
// import webpackHotMiddleware from 'webpack-hot-middleware';

// Initialize the Express App
const app = new Express();

// Run Webpack dev server in development mode
// if (process.env.NODE_ENV === 'development') {
//   const compiler = webpack(webpackConfig);
//   app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: webpackConfig.output.publicPath }));
//   app.use(webpackHotMiddleware(compiler));
// }

// import posts from './routes/post.routes';
import api from './routes/api.routes';
import oauth from './routes/oauth.routes';
// import dummyData from './dummyData';
import serverConfig from './config';
import mongooseAction from './mongoose';
import passportAction from './passport';


// if (process.env.NODE_ENV === 'development') { app.use(cors()); }
app.use(cors());
app.use(session({
  saveUninitialized: true,
  secret: 'Tuoihoctro',
  resave: true,
}));
app.use(passport.initialize());
app.use(passport.session());
// Apply body Parser and server public assets and routes
// app.use(compression());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(Express.static(path.resolve(__dirname, '../dist')));
app.use(Express.static(path.resolve(__dirname, '../public')));
app.use('/api', api);
app.use('/oauth', oauth);
app.get('*.js', (req, res, next) => {
  const request = req;
  request.url = `${req.url}.gz`;
  res.set('Content-Encoding', 'gzip');
  next();
});
if (process.env.NODE_ENV === 'production') {
  const configureStore = require('../client/store').configureStore;
  const Provider = require('react-redux').Provider;
  const React = require('react');
  const renderToString = require('react-dom/server').renderToString;
  const match = require('react-router').match;
  const RouterContext = require('react-router').RouterContext;
  const Helmet = require('react-helmet');

  // Import required modules
  const routes = require('../client/routes').default;
  const fetchComponentData = require('./util/fetchData').fetchComponentData;

  // Render Initial HTML
  const renderFullPage = (html, initialState) => {
    const head = Helmet.rewind();

    // Import Manifests
    const assetsManifest = process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
    const chunkManifest = process.env.webpackChunkAssets && JSON.parse(process.env.webpackChunkAssets);

    return `
      <!doctype html>
      <html>
        <head>
          <meta name="google-site-verification" content="9A4qGCYa5Tzh36s_jT7EmMPmizE6-5DMimF8BYIr9MY" />
          <meta name="robots" content="index,follow" />
          <meta http-equiv="content-language" content="vi">
          <meta charset="UTF-8">
          <meta property="fb:app_id" content="1559166841054175" />
          <meta property="og:site_name" content="tuoihoctro.co" />
          <base href="/">
          ${head.base.toString()}
          ${head.title.toString()}
          ${head.meta.toString()}
          ${head.link.toString()}
          ${head.script.toString()}
          <meta data-react-helmet="true" name="viewport" content="width=device-width, initial-scale=1">
          <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
        </head>
        <body>

          <div id="root">${html}</div>
           <div id="fb-root"></div>

          <noscript id="deferred-styles">
            <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"/>
             <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"/>
              ${process.env.NODE_ENV === 'production' ? `<link rel='stylesheet' href='${assetsManifest['/app.css']}' />` : ''}
          </noscript>
          <script async >
            var loadDeferredStyles = function() {
              var addStylesNode = document.getElementById("deferred-styles");
              var replacement = document.createElement("div");
              replacement.innerHTML = addStylesNode.textContent;
              document.body.appendChild(replacement)
              addStylesNode.parentElement.removeChild(addStylesNode);
            };
            var raf = requestAnimationFrame || mozRequestAnimationFrame ||
                webkitRequestAnimationFrame || msRequestAnimationFrame;
            if (raf) raf(function() { window.setTimeout(loadDeferredStyles, 0); });
            else window.addEventListener('load', loadDeferredStyles);
          </script>

          <script>
            window.__INITIAL_STATE__ = ${serialize(initialState, { isJSON: true })};
            ${process.env.NODE_ENV === 'production' ?
        `//<![CDATA[
            window.webpackManifest = ${JSON.stringify(chunkManifest)};
            //]]>` : ''}
          </script>

          <script src='${process.env.NODE_ENV === 'production' ? assetsManifest['/vendor.js'] : '/vendor.js'}'></script>
          <script src='${process.env.NODE_ENV === 'production' ? assetsManifest['/app.js'] : '/app.js'}'></script>
          <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
          <script async>
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v2.8&appId=1559166841054175";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
          </script>
        </body>
      </html>
    `;
  };

  const renderError = err => {
    const softTab = '&#32;&#32;&#32;&#32;';
    const errTrace = process.env.NODE_ENV !== 'production' ?
      `:<br><br><pre style="color:red">${softTab}${err.stack.replace(/\n/g, `<br>${softTab}`)}</pre>` : '';
    return renderFullPage(`Server Error${errTrace}`, {});
  };

  // Server Side Rendering based on routes matched by React-router.
  app.use((req, res, next) => {
    match({ routes, location: req.url }, (err, redirectLocation, renderProps) => {
      if (err) {
        return res.status(500).end(renderError(err));
      }

      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      }

      if (!renderProps) {
        return next();
      }

      const store = configureStore();

      return fetchComponentData(store, renderProps.components, renderProps.params)
        .then(() => {
          const initialView = renderToString(
            <Provider store={store}>
              <RouterContext {...renderProps} />
            </Provider>
          );
          const finalState = store.getState();

          res
            .set('Content-Type', 'text/html')
            .status(200)
            .end(renderFullPage(initialView, finalState));
        })
        .catch((error) => next(error));
    });
  });
}
mongooseAction(mongoose, () => {
  // start app
  app.listen(serverConfig.port, (error) => {
    if (!error) {
      console.log(`MERN is running on port: ${serverConfig.port}! Build something amazing!`); // eslint-disable-line
    }
  });
  passportAction(passport);
});


export default app;
