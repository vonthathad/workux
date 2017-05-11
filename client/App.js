/**
 * Root Component
 */
import React from 'react';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import IntlWrapper from './modules/Intl/IntlWrapper';
import ReactGA from 'react-ga';
import { analyticChannel } from './modules/Intl/IntlReducer';
ReactGA.initialize(analyticChannel);
// Import Routes
import routes from './routes';

// Base stylesheet
require('./main.css');
function logPageView() {
  ReactGA.set({ page: window.location.pathname + window.location.search });
  ReactGA.pageview(window.location.pathname + window.location.search);
}
export default function App(props) {
  return (
    <Provider store={props.store}>
      <IntlWrapper>
        <Router history={browserHistory} onUpdate={logPageView}>
          {routes}
        </Router>
      </IntlWrapper>
    </Provider>
  );
}

App.propTypes = {
  store: React.PropTypes.object.isRequired,
};
