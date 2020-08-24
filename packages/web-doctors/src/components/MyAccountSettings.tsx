import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Divider,
  Box,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    ProfileContainer: {
      paddingLeft: 0,
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: 15,
        paddingTop: 0,
      },
      '& h3': {
        lineHeight: '22px',
        padding: '3px 5px 5px 20px',
      },
      '& h4': {
        padding: '5px 5px 5px 0',
        marginLeft: 20,
        borderBottom: 'solid 0.5px rgba(98,22,64,0.2)',
      },
      '& h5': {
        padding: '5px 5px 3px 20px',
        fontWeight: 500,
      },
      '& h6': {
        color: '#658f9b',
        padding: '5px 5px 0 0',
        letterSpacing: '0.3px',
        marginLeft: 20,
        fontWeight: theme.typography.fontWeightMedium,
        '& span': {
          padding: '0 2px',
        },
      },
    },

    helpTxt: {
      color: '#0087ba',
      fontSize: 16,
      lineHeight: 1.38,
      fontWeight: 500,
    },
  };
});

export const MyAccountSettings: React.FC = () => {
  const classes = useStyles({});
  const items = [
    {
      key: 'followUp',
      value: <div>{'Set your patient follow Up days'}</div>,
      //state: symptomsState,
      component: <div></div>,
    },
  ];
  return (
    <div>
      {items.map((item) => (
        <ExpansionPanel
          key={item.key}
          // expanded={item.state}
          //onChange={handlePanelExpansion(item.key)}
          //className={`${classes.expandIcon}`}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h3">{item.value}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>{item.component}</ExpansionPanelDetails>
        </ExpansionPanel>
      ))}
    </div>
  );
};
