import React, { Fragment } from 'react';
import { Typography, List, ListItem, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const data = [
  {
    since: 'Last 2 days',
    disease: 'Fever',
    howOften: 'Nights',
    Severity: 'High, 102˚F',
    //Fever: ['Since: Last 2 days', 'How often: Nights', 'Severity: High, 102˚F'],
  },
  {
    disease: 'Cough & Cold',
    since: 'Since: Last 1 days',
    howOften: 'All day, even while sleeping',
    Severity: 'Spots of blood in flem',
    // CoughCold: [
    //   'Since: Last 1 week',
    //   'How often: All day, even while sleeping',
    //   'Severity: Spots of blood in flem',
    // ],
  },
  {
    disease: 'Nausea',
    since: 'Since: Last 2 days',
    howOften: 'After food',
    Severity: 'Mild',
    //Nausea: ['Since: Last 2 days', 'How often: After food', 'Severity: Mild'] },
  },
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
            {/* {Object.keys(item)[0]} */}
            <ListItemText className={classes.symtomHeading} primary={item.disease} />
            <Fragment>
              <List>
                {item.since && (
                  <ListItem alignItems="flex-start" className={classes.symtomContent}>
                    <ListItemText
                      secondary={
                        <Fragment>
                          <Typography component="span">Since: {item.since}</Typography>
                        </Fragment>
                      }
                    />
                  </ListItem>
                )}
                {item.howOften && (
                  <ListItem alignItems="flex-start" className={classes.symtomContent}>
                    <ListItemText
                      secondary={
                        <Fragment>
                          <Typography component="span">How Often : {item.howOften}</Typography>
                        </Fragment>
                      }
                    />
                  </ListItem>
                )}
                {item.Severity && (
                  <ListItem alignItems="flex-start" className={classes.symtomContent}>
                    <ListItemText
                      secondary={
                        <Fragment>
                          <Typography component="span">Severity: {item.Severity}</Typography>
                        </Fragment>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Fragment>
          </ListItem>
        ))}
      </List>
    </Typography>
  );
};
