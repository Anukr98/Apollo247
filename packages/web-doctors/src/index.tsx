import '@aph/universal/dist/global';
import 'unfetch/polyfill';

import { AppContainer } from 'components/AppContainer';
import React from 'react';
import ReactDOM from 'react-dom';
import bugsnag from '@bugsnag/js';
import bugsnagReact from '@bugsnag/plugin-react';
const bugsnagClient = bugsnag({
  apiKey: `${process.env.BUGSNAG_API_KEY}`,
  // notifyReleaseStages: ['local', 'development', 'production', 'staging'],
  releaseStage: `${process.env.NODE_ENV}`,
  autoBreadcrumbs: true,
  autoCaptureSessions: true,
  autoNotify: true,
});
bugsnagClient.use(bugsnagReact, React);
const ErrorBoundary = bugsnagClient.getPlugin('react');
bugsnagClient.notify(new Error('Test error'));
ReactDOM.render(
  <ErrorBoundary>
    <AppContainer />
  </ErrorBoundary>,
  document.getElementById('root')
);
