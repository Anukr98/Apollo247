import React, { Fragment } from 'react';
import { Typography, List, ListItem, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const data = [
  {
    Fever: ['Since: Last 2 days', 'How often: Nights', 'Severity: High, 102˚F'],
  },
  {
    'Cough & Cold': [
      'Since: Last 1 week',
      'How often: All day, even while sleeping',
      'Severity: Spots of blood in flem',
    ],
  },
  { Nausea: ['Since: Last 2 days', 'How often: After food', 'Severity: Mild'] },
];

const useStyles = makeStyles(() => ({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flex: 1,
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    borderRadius: '5px',
  },
  listItem: {
    display: 'flex',
    flexFlow: 'column',
    padding: '4px 0 0 12px',
    '& h6': {
      fontSize: 12,
      color: '#01475b',
      fontWeight: 'normal',
    },
    '& h3': {
      fontSize: 14,
      color: '#01475b',
      fontWeight: 500,
    },
  },
  symtomHeading: {
    margin: '5px 0 0 0',
    '& span': {
      fontSize: 14,
      color: '#01475b',
      fontWeight: 500,
    },
  },
  symtomContent: {
    padding: '0 0 0 10px',
    '& div': {
      margin: 0,
    },
    '& p': {
      '& span': {
        fontSize: 12,
        color: '#01475b',
        fontWeight: 'normal',
      },
    },
  },
  symtomList: {
    padding: '0 0 10px 0',
    '& ul': {
      padding: 0,
    },
  },
}));

export const Symptoms: React.FC = () => {
  const classes = useStyles();

  return (
    <Typography className={classes.container} component="div">
      <List className={classes.symtomList}>
        {data.map((item, idx) => (
          <ListItem key={idx} alignItems="flex-start" className={classes.listItem}>
            <ListItemText className={classes.symtomHeading} primary={Object.keys(item)[0]} />
            <Fragment>
              <List>
                {!!item &&
                  !!Object.values(item).length &&
                  Object.values(item)[0]!.map((text, iidx) => (
                    <ListItem key={iidx} alignItems="flex-start" className={classes.symtomContent}>
                      <ListItemText
                        secondary={
                          <Fragment>
                            <Typography component="span">{text}</Typography>
                          </Fragment>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </Fragment>
          </ListItem>
        ))}
      </List>
    </Typography>
  );
};
