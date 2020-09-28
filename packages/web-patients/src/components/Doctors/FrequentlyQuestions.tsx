import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      padding: 20,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      marginTop: 20,
      fontSize: 14,
      lineHeight: '23px',
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
      },
    },
    panelRoot: {
      marginBottom: '0px !important',
      marginTop: '0 !important',
      boxShadow: 'none',
      width: '100%',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      borderRadius: '0 !important',
      '&:before': {
        display: 'none',
      },
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    panelHeader: {
      padding: 0,
    },
    summaryContent: {
      margin: 0,
      display: 'block',
    },
    expandIcon: {
      padding: 0,
      margin: 0,
    },
    panelExpanded: {
      minHeight: 'auto !important',
      margin: '0 !important',
    },
    panelDetails: {
      padding: 0,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      paddingBottom: 16,
    },
    panelHeading: {
      margin: 0,
      fontSize: 14,
      fontWeight: 600,
    },
  });
});
interface FrequentlyQuestionsProps {
  faqData: any;
}

export const FrequentlyQuestions: React.FC<FrequentlyQuestionsProps> = (props) => {
  const classes = useStyles({});
  const { faqData } = props;
  return faqData ? (
    <div className={classes.root}>
      <h2>Frequently asked questions</h2>
      {faqData.map((fq: any, idx: number) => (
        <ExpansionPanel key={fq.id} className={classes.panelRoot}>
          <ExpansionPanelSummary
            expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
            key={fq.id}
            classes={{
              root: classes.panelHeader,
              content: classes.summaryContent,
              expandIcon: classes.expandIcon,
              expanded: classes.panelExpanded,
            }}
          >
            <Typography className={classes.panelHeading} component={idx <= 9 ? 'h2' : 'h3'}>
              {fq.faqQuestion}
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.panelDetails}>
            {fq.faqAnswer}
          </ExpansionPanelDetails>
        </ExpansionPanel>
      ))}
    </div>
  ) : null;
};
