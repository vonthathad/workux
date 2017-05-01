import Express from 'express';
import compression from 'compression';
import mongoose from 'mongoose';
import passport from 'passport';
import bodyParser from 'body-parser';
import path from 'path';
import IntlWrapper from '../client/modules/Intl/IntlWrapper';
import createPassport from './passport';
import session from 'express-session';
// Webpack Requirements
import webpack from 'webpack';
import config from '../webpack.config.dev';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

// Initialize the Express App
const app = new Express();

// Run Webpack dev server in development mode
if (process.env.NODE_ENV === 'development') {
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

// React And Redux Setup
import { configureStore } from '../client/store';
import { Provider } from 'react-redux';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import Helmet from 'react-helmet';

// Import required modules
import routes from '../client/routes';
import { fetchComponentData } from './util/fetchData';
import api from './routes/api.routes';
import oauth from './routes/oauth.routes';
import serverConfig from './config';

// Set native promises as mongoose promise
mongoose.Promise = global.Promise;

// MongoDB Connection
mongoose.connect(serverConfig.mongoURL, (error) => {
  if (error) {
    console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line no-console
    throw error;
  } else {
    createPassport();
  }

  // feed some dummy data in DB.
  // dummyData();
});

// Apply body Parser and server public assets and routes
app.use(compression());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(Express.static(path.resolve(__dirname, '../dist')));
app.use(passport.initialize());
app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: 'CROWDBAM',
}));
app.use('/api', api);
app.use('/oauth', oauth);

// Render Initial HTML
const renderFullPage = (html, initialState, appInfo) => {
  const head = Helmet.rewind();

  // Import Manifests
  const assetsManifest = process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
  const chunkManifest = process.env.webpackChunkAssets && JSON.parse(process.env.webpackChunkAssets);

  return `
    <!doctype html>
    <html>
      <head>
        ${head.base.toString()}
        ${head.title.toString()}
        ${head.meta.toString()}
        ${head.link.toString()}
        ${head.script.toString()}
        <meta property="og:title" content="${appInfo.name}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${appInfo.url}" />
        <meta property="og:image:url" content="${appInfo.image}" />
        <meta property="og:image:secure_url" content="${appInfo.image}" />
        <meta property="og:image:width" content="960" />
        <meta property="og:image:height" content="500" />
        <meta property="og:site_name" content="${appInfo.name}" />
        <meta property="og:description" content="${appInfo.description}" />
        <meta property="fb:app_id" content="${appInfo.id}" />
        ${process.env.NODE_ENV === 'production' ? `<link rel='stylesheet' href='${assetsManifest['/app.css']}' />` : ''}
       
        <link rel="shortcut icon" href="http://res.cloudinary.com/hashnode/image/upload/v1455629445/static_imgs/mern/mern-favicon-circle-fill.png" type="image/png" />
      </head>
      <body>
        <div id="root">${html}</div>
        <noscript id="deferred-styles">
          ${process.env.NODE_ENV === 'production' ? `<link rel='stylesheet' href='${assetsManifest['/app.css']}' />` : ''}
          <link href='https://fonts.googleapis.com/css?family=Lato:400,300,700' rel='stylesheet' type='text/css'/>
        </noscript>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
          ${process.env.NODE_ENV === 'production' ?
          `//<![CDATA[
          window.webpackManifest = ${JSON.stringify(chunkManifest)};
          //]]>` : ''}
        </script>
        <script>
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
          window.fbAsyncInit = function() {
            FB.init({
              appId      : '170584416691811',
              xfbml      : true,
              version    : 'v2.7'
            });
            FB.AppEvents.logPageView();
          };

          (function(d, s, id){
             var js, fjs = d.getElementsByTagName(s)[0];
             if (d.getElementById(id)) {return;}
             js = d.createElement(s); js.id = id;
             js.src = "//connect.facebook.net/en_US/sdk.js";
             fjs.parentNode.insertBefore(js, fjs);
           }(document, 'script', 'facebook-jssdk'));
        </script>
        <script defer type='text/javascript' src='https://imasdk.googleapis.com/js/sdkloader/ima3.js'></script>
        <script defer src='${process.env.NODE_ENV === 'production' ? assetsManifest['/vendor.js'] : '/vendor.js'}'></script>
        <script defer src='${process.env.NODE_ENV === 'production' ? assetsManifest['/app.js'] : '/app.js'}'></script>
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
            <IntlWrapper>
              <RouterContext {...renderProps} />
            </IntlWrapper>
          </Provider>
        );
        const finalState = store.getState();
        if (renderProps.location.query && renderProps.location.query.ref && renderProps.location.query.ref === 'share') {
          const gameInfo = {
            id: serverConfig.app.id,
            name: renderProps.location.query.rs_title || serverConfig.app.name,
            description: renderProps.location.query.rs_des || serverConfig.app.description,
            url: serverConfig.server.host + renderProps.location.pathname + renderProps.location.search,
            image: renderProps.location.query.rs_image || serverConfig.app.image,
          };
          res
            .set('Content-Type', 'text/html')
            .status(200)
            .end(renderFullPage(initialView, finalState, gameInfo));
        } else if (finalState.games && finalState.posts.currentGame) {
          const post = finalState.posts.currentGame;
          const url = `${serverConfig.server.host}/game/${post._id}`;
          const thumb = `${serverConfig.server.host}/${post.adsImage}`;
          const gameInfo = {
            id: serverConfig.app.id,
            name: post.title,
            description: post.des,
            url,
            image: thumb,
          };
          res
            .set('Content-Type', 'text/html')
            .status(200)
            .end(renderFullPage(initialView, finalState, gameInfo));
        } else {
          res
            .set('Content-Type', 'text/html')
            .status(200)
            .end(renderFullPage(initialView, finalState, serverConfig.app));
        }
      })
      .catch((error) => next(error));
  });
});

// start app
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`MERN is running on port: ${serverConfig.port}! Build something amazing!`); // eslint-disable-line
  }
});

export default app;
