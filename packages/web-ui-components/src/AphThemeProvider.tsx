import React from 'react';
import { CssBaseline } from '@material-ui/core';
import {
  ThemeProvider as MuiThemeProvider,
  StylesProvider,
  createGenerateClassName,
} from '@material-ui/styles';
import { ThemeProviderProps } from '@material-ui/styles/ThemeProvider';

const generator = createGenerateClassName({
  seed: `${Math.floor(Math.random() * 1000)}`,
});

const AphThemeProvider: React.FC<ThemeProviderProps<any>> = (props) => {
  const { children, ...themeProviderProps } = props;
  return (
    <StylesProvider generateClassName={generator}>
      <MuiThemeProvider {...themeProviderProps}>
        <CssBaseline />
        {props.children}
      </MuiThemeProvider>
    </StylesProvider>
  );
};

export default AphThemeProvider;
