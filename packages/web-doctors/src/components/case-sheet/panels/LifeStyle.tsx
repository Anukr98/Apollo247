import React, { Fragment } from 'react';
import { Typography, List, ListItem, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'wrap',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    width: '49%',
    marginRight: '1%',
  },
  content: {
    borderRadius: '5px',
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  textContent: {
    color: '#01475b',
  },
  header: {
    color: '#02475b',
    opacity: 0.6,
  },
}));

const data = [
  {
    'Family History': ['Father: Cardiac patient', 'Mother: Severe diabetes', 'Married, No kids'],
  },
  {
    'Lifestyle & Habits': ['Patient doesn’t smoke, She recovered from chickenpox 6 months ago'],
  },
  {
    Allergies: ['Paracetamol, Dairy, Dust'],
  },
];

export const LifeStyle: React.FC = () => {
  const classes = useStyles();

  return (
    <Typography component="div" className={classes.container}>
      {data.map((item, idx) => (
        <Typography className={classes.column} component="div">
          <Typography component="h5" variant="h5" className={classes.header}>
            {Object.keys(item)[0]}
          </Typography>
          <Typography component="div" className={classes.content}>
            <List>
              {!!Object.values(item).length &&
                Object.values(item).map((text) => (
                  <ListItem>
                    <ListItemText
                      secondary={
                        <Fragment>
                          <Typography component="p" className={classes.textContent}>
                            {text}
                          </Typography>
                        </Fragment>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          </Typography>
        </Typography>
      ))}
    </Typography>
  );
};
