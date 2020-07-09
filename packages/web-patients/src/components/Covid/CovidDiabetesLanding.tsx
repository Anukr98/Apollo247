import React from 'react';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Header } from 'components/Header';

const useStyles = makeStyles((theme: Theme) => {
  return {
    cdLanding: {},
  };
});
export const CovidDiabetesLanding: React.FC = (props: any) => {
  const classes = useStyles({});
  const isDesktopOnly = useMediaQuery('(min-width:768px)');
  return <div className={classes.cdLanding}>{isDesktopOnly ? <Header /> : ''}</div>;
};
