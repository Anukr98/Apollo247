import React, { Fragment, useContext } from 'react';
import { Typography, List, ListItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';

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
    width: '100%',
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
  mainContainer: {
    display: 'inline-block',
    width: '100%',
  },
  drugAllergies: {
    width: '45%',
    display: 'inline-block',
    paddingRight: 10,
  },
  dietAllergies: {
    width: '45%',
    display: 'inline-block',
    float: 'right',
  },
}));

export const LifeStyle: React.FC = () => {
  const classes = useStyles();
  const { loading, patientDetails } = useContext(CaseSheetContext);
  return loading && !patientDetails ? (
    <div></div>
  ) : (
    <Typography component="div" className={classes.mainContainer}>
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
              <Typography className={classes.mainContainer} component="div">
                <Typography component="h5" variant="h5" className={classes.header}>
                  Patient’s Past Medical History
                </Typography>
                <Typography component="div" className={classes.content}>
                  <List>
                    {patientDetails!.familyHistory!.map(
                      (item, idx) =>
                        item!.description!.length > 0 &&
                        idx === patientDetails!.familyHistory!.length - 1 && (
                          <ListItem key={idx}>
                            <Fragment>
                              <Typography component="p" className={classes.textContent}>
                                She has been on BP medication for the past 1 year
                              </Typography>
                            </Fragment>
                          </ListItem>
                        )
                    )}
                  </List>
                </Typography>
              </Typography>
            )}
          {patientDetails &&
            patientDetails!.lifeStyle &&
            patientDetails!.lifeStyle !== null &&
            patientDetails!.lifeStyle.length > 0 && (
              <Typography component="div">
                <Typography component="h5" variant="h5" className={classes.header}>
                  Patient’s Past Surgical History
                </Typography>
                <Typography component="div" className={classes.content}>
                  <List>
                    {patientDetails!.lifeStyle!.map(
                      (item, idx) =>
                        item!.description!.length > 0 &&
                        idx === patientDetails!.lifeStyle!.length - 1 && (
                          <ListItem key={idx}>
                            <Fragment>
                              <Typography component="p" className={classes.textContent}>
                                She has been on BP medication for the past 1 year
                              </Typography>
                            </Fragment>
                          </ListItem>
                        )
                    )}
                  </List>
                </Typography>
              </Typography>
            )}
          <Typography component="div" className={classes.drugAllergies}>
            <Typography component="h5" variant="h5" className={classes.header}>
              Drug Allergies
            </Typography>
            <Typography component="div" className={classes.content}>
              <List>
                <ListItem>
                  <Fragment>
                    <Typography component="p" className={classes.textContent}>
                      None
                    </Typography>
                  </Fragment>
                </ListItem>
              </List>
            </Typography>
          </Typography>
          <Typography component="div" className={classes.dietAllergies}>
            <Typography component="h5" variant="h5" className={classes.header}>
              Diet Allergies/Restrictions
            </Typography>
            <Typography component="div" className={classes.content}>
              <List>
                <ListItem>
                  <Fragment>
                    <Typography component="p" className={classes.textContent}>
                      None
                    </Typography>
                  </Fragment>
                </ListItem>
              </List>
            </Typography>
          </Typography>
          <Typography component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Lifestyle & Habits
            </Typography>
            <Typography component="div" className={classes.content}>
              <List>
                <ListItem>
                  <Fragment>
                    <Typography component="p" className={classes.textContent}>
                      Patient doesn’t smoke, recovered from chickenpox 6 months ago + occupational
                      history
                    </Typography>
                  </Fragment>
                </ListItem>
              </List>
            </Typography>
          </Typography>
          <Typography component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Menstual History*
            </Typography>
            <Typography component="div" className={classes.content}>
              <List>
                <ListItem>
                  <Fragment>
                    <Typography component="p" className={classes.textContent}>
                      Regular cycles; Last period was on 16th Sep
                    </Typography>
                  </Fragment>
                </ListItem>
              </List>
            </Typography>
          </Typography>
          <Typography component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Patient’s Family Medical History
            </Typography>
            <Typography component="div" className={classes.content}>
              <List>
                <ListItem>
                  <Fragment>
                    <Typography component="p" className={classes.textContent}>
                      <p>Father: Cardiac patient </p>
                      <p>Mother: Severely diabetic </p>
                    </Typography>
                  </Fragment>
                </ListItem>
              </List>
            </Typography>
          </Typography>
        </div>
      ) : (
        <span>No data Found</span>
      )}
      {/* {data.map((item, idx) => (
        <Typography key={idx} className={classes.column} component="div">
          <Typography component="h5" variant="h5" className={classes.header}>
            {Object.keys(item)[0]}
          </Typography>
          <Typography component="div" className={classes.content}>
            <List>
              {!!Object.values(item).length &&
                Object.values(item).map((text, i) => (
                  <ListItem key={i}>
                    <Fragment>
                      <Typography component="p" className={classes.textContent}>
                        {text}
                      </Typography>
                    </Fragment>
                  </ListItem>
                ))}
            </List>
          </Typography>
        </Typography>
      ))} */}
    </Typography>
  );
};
