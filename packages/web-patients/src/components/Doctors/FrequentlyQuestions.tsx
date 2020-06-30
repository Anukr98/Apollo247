import React from 'react';
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
      '& h2': {
        margin: 0,
        color: '#01667c',
        fontSize: 16,
        fontWeight: 600,
        lineHeight: '25px',
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
      fontSize: 14,
      padding: '16px 0',
      fontWeight: 600,
      color: '#02475b',
      alignItems: 'flex-start',
      minHeight: 'auto',
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
      {faqData.map((fq: any) => (
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
            {fq.faqQuestion}
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.panelDetails}>
            {fq.faqAnswer}
          </ExpansionPanelDetails>
        </ExpansionPanel>
      ))}
    </div>
  ) : null;
};
