import React, { Fragment, useContext } from 'react';
import { Typography, List, ListItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';

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
    width: '90%',
  },
  textContent: {
    color: '#01475b',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.43,
  },
  header: {
    color: 'rgba(2,71,91,0.6)',
    marginBottom: 8,
    marginTop: 16,
    fontWeight: 500,
  },
}));

export const LifeStyle: React.FC = () => {
  const classes = useStyles();
  const { loading, patientDetails } = useContext(CaseSheetContextJrd);
  return loading && !patientDetails ? (
    <div></div>
  ) : (
    <Typography component="div" className={classes.container}>
      {patientDetails &&
      patientDetails!.familyHistory &&
      patientDetails!.familyHistory.length > 0 &&
      patientDetails!.lifeStyle &&
      patientDetails!.lifeStyle.length > 0 &&
      patientDetails!.allergies &&
      patientDetails!.allergies.length > 0 ? (
        <div>
          {patientDetails &&
            patientDetails!.familyHistory &&
            patientDetails!.familyHistory !== null &&
            patientDetails!.familyHistory.length > 0 && (
              <Typography className={classes.column} component="div">
                <Typography component="h5" variant="h5" className={classes.header}>
                  Family History
                </Typography>
                <Typography component="div" className={classes.content}>
                  <List>
                    {patientDetails!.familyHistory!.map((item, idx) => (
                      <ListItem key={idx}>
                        <Fragment>
                          <Typography component="p" className={classes.textContent}>
                            {item!.relation}: {item!.description}
                          </Typography>
                        </Fragment>
                      </ListItem>
                    ))}
                  </List>
                </Typography>
              </Typography>
            )}
          {patientDetails &&
            patientDetails!.lifeStyle &&
            patientDetails!.lifeStyle !== null &&
            patientDetails!.lifeStyle.length > 0 && (
              <Typography className={classes.column} component="div">
                <Typography component="h5" variant="h5" className={classes.header}>
                  Lifestyle & Habits
                </Typography>
                <Typography component="div" className={classes.content}>
                  <List>
                    {patientDetails!.lifeStyle!.map((item, idx) => (
                      <ListItem key={idx}>
                        <Fragment>
                          <Typography component="p" className={classes.textContent}>
                            {item!.description}
                          </Typography>
                        </Fragment>
                      </ListItem>
                    ))}
                  </List>
                </Typography>
              </Typography>
            )}
          {patientDetails && patientDetails!.allergies && patientDetails!.allergies !== null && (
            <Typography className={classes.column} component="div">
              <Typography component="h5" variant="h5" className={classes.header}>
                Allergies
              </Typography>
              <Typography component="div" className={classes.content}>
                <List>
                  <ListItem>
                    <Fragment>
                      <Typography component="p" className={classes.textContent}>
                        {patientDetails!.allergies}
                      </Typography>
                    </Fragment>
                  </ListItem>
                </List>
              </Typography>
            </Typography>
          )}
        </div>
      ) : (
        <span>No data Found</span>
      )}
    </Typography>
  );
};
