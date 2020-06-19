import { setConfig, Config } from "react-hot-loader";
import { hot } from "react-hot-loader/root";
import React, { useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { clientRoutes } from "helpers/clientRoutes";
import { Welcome } from "components/Welcome";
import { AuthProvider } from "components/AuthProvider";
import { useAuth } from "hooks/authHooks";
import { makeStyles } from "@material-ui/styles";
import { Theme, createMuiTheme } from "@material-ui/core";
import { AphThemeProvider, aphTheme } from "@aph/web-ui-components";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { AuthRouted } from "components/AuthRouted";
import { StoragePoc } from "components/StoragePoc";
import Scrollbars from "react-custom-scrollbars";
import { Helmet } from "react-helmet";

import { SbiLandingPage } from "components/Partners/SBI/SbiLandingPage";

const useStyles = makeStyles((theme: Theme) => {
  return {
    app: {
      minHeight: "100vh",
      backgroundImage: "linear-gradient(to bottom, #f0f1ec, #dcdfce)",
      paddingTop: 88,
      [theme.breakpoints.down("xs")]: {
        paddingTop: 72,
      },
      [theme.breakpoints.down(900)]: {
        paddingBottom: 55,
      },
    },
    helpIcon: {
      display: "none",
    },
    noHeaders: {
      [theme.breakpoints.down("xs")]: {
        paddingTop: 0,
      },
    },
  };
});

const App: React.FC = () => {
  const classes = useStyles({});
  const { signInError, isSignedIn } = useAuth();
  const currentPath = window.location.pathname;
  const pageName = window.location.pathname;

  useEffect(() => {
    if (signInError) window.alert("Error signing in :(");
  }, [signInError]);

  return (
    <Scrollbars autoHide={true} autoHeight autoHeightMax={"calc(100vh"}>
      <div className={`${classes.app}`}>
        <Switch>
          <Route exact path={clientRoutes.welcome()} component={Welcome} />
          <Route
            exact
            path={clientRoutes.storagePoc()}
            component={StoragePoc}
          />
          <Route
            exact
            path={clientRoutes.partnerSBI()}
            component={SbiLandingPage}
          />
        </Switch>
      </div>
    </Scrollbars>
  );
};

// @ts-ignore
const theme = createMuiTheme({ ...aphTheme });

const AppContainer: React.FC = () => {
  // TrackJS.install({
  //   token: 'b85489445e5f4b48a0ffe851082f8e37',
  //   application: process.env.NODE_ENV, // for more configuration options, see https://docs.trackjs.com
  // });

  return (
    <BrowserRouter>
      <AuthProvider>
        <AphThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <App />
          </MuiPickersUtilsProvider>
        </AphThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

let HotAppContainer = AppContainer;
if (process.env.NODE_ENV === "local") {
  const rhlConfig = ({ hotHooks: true } as any) as Partial<Config>;
  setConfig(rhlConfig);
  HotAppContainer = hot(AppContainer);
}

export { HotAppContainer as AppContainer };
