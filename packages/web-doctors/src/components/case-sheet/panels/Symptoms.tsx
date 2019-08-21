import React, { Fragment } from 'react';
import { Typography, List, ListItem, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const data = [
  {
    'Fever': ['Since: Last 2 days', 'How often: Nights', 'Severity: High, 102˚F'],
  },
  {
    'Cough & Cold': ['Since: Last 1 week', 'How often: All day, even while sleeping', 'Severity: Spots of blood in flem'],
  },
  { 'Nausea': ['Since: Last 2 days', 'How often: After food', 'Severity: Mild'] }
];

const useStyles = makeStyles(() => ({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flex: 1,
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    borderRadius: '5px'
  }
}));

export const Symptoms: React.FC = () => {
  const classes = useStyles();

  return (
    <Typography
      className={classes.container}
      component="div"
    >
      <List>
        {data.map((item, idx) => (
          <ListItem key={idx} alignItems="flex-start">
            <ListItemText
              primary={Object.keys(item)[0]}
              secondary={
                <Fragment>
                  <List>
                    {!!item &&
                      !!Object.values(item).length &&
                      Object.values(item)[0]!.map((text, iidx) => (
                        <ListItem key={iidx} alignItems="flex-start">
                          <ListItemText
                            secondary={
                              <Fragment>
                                <Typography>{text}</Typography>
                              </Fragment>
                            }
                          />
                        </ListItem>
                      ))}
                  </List>
                </Fragment>
              }
            />
          </ListItem>
        ))}
      </List>
    </Typography>
  );
};
