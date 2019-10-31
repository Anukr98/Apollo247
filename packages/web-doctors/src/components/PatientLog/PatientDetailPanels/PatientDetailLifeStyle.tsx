import React, { Fragment, useContext } from 'react';
import { Typography, List, ListItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { GetCaseSheet_getCaseSheet_patientDetails } from 'graphql/types/GetCaseSheet';
import { Gender } from 'graphql/types/globalTypes';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'wrap',
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
  fullRow: {
    width: '100%',
    display: 'block',
  },
}));

interface LifeStyleProps {
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | null;
}

export const PatientDetailLifeStyle: React.FC<LifeStyleProps> = (props) => {
  const classes = useStyles();
  let { loading, patientDetails } = useContext(CaseSheetContext);
  if (patientDetails === null) {
    patientDetails = props.patientDetails;
  }

  return loading && !patientDetails ? (
    <div></div>
  ) : (
    <Typography component="div" className={classes.fullRow}>
      <div>
        {
          <Typography className={classes.fullRow} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Patient’s Past Medical History
            </Typography>
            <Typography component="div" className={classes.content}>
              <ListItem>
                <List>
                  {patientDetails &&
                  patientDetails.patientMedicalHistory &&
                  patientDetails.patientMedicalHistory.pastMedicalHistory
                    ? patientDetails &&
                      patientDetails.patientMedicalHistory &&
                      patientDetails.patientMedicalHistory.pastMedicalHistory
                    : 'None'}
                </List>
              </ListItem>
            </Typography>
          </Typography>
        }
        {
          <Typography className={classes.fullRow} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Patient's Past Surgical History
            </Typography>
            <Typography component="div" className={classes.content}>
              <ListItem>
                <List>
                  {patientDetails &&
                  patientDetails.patientMedicalHistory &&
                  patientDetails.patientMedicalHistory.pastSurgicalHistory
                    ? patientDetails &&
                      patientDetails.patientMedicalHistory &&
                      patientDetails.patientMedicalHistory.pastSurgicalHistory
                    : 'None'}
                </List>
              </ListItem>
            </Typography>
          </Typography>
        }
        {
          <Typography className={classes.fullRow} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Drug Allergies
            </Typography>
            <Typography component="div" className={classes.content}>
              <ListItem>
                <List>
                  {patientDetails &&
                  patientDetails.patientMedicalHistory &&
                  patientDetails.patientMedicalHistory.drugAllergies
                    ? patientDetails &&
                      patientDetails.patientMedicalHistory &&
                      patientDetails.patientMedicalHistory.drugAllergies
                    : 'None'}
                </List>
              </ListItem>
            </Typography>
          </Typography>
        }
        {
          <Typography className={classes.fullRow} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Diet Allergies/Restrictions
            </Typography>
            <Typography component="div" className={classes.content}>
              <ListItem>
                <List>
                  {patientDetails &&
                  patientDetails.patientMedicalHistory &&
                  patientDetails.patientMedicalHistory.dietAllergies
                    ? patientDetails &&
                      patientDetails.patientMedicalHistory &&
                      patientDetails.patientMedicalHistory.dietAllergies
                    : 'None'}
                </List>
              </ListItem>
            </Typography>
          </Typography>
        }

        {patientDetails &&
          patientDetails!.lifeStyle &&
          patientDetails!.lifeStyle !== null &&
          patientDetails!.lifeStyle.length > 0 && (
            <Typography component="div">
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
        {patientDetails && patientDetails.gender === Gender.FEMALE && (
          <Typography className={classes.fullRow} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Menstual History*
            </Typography>
            <Typography component="div" className={classes.content}>
              <ListItem>
                <List>
                  {patientDetails &&
                  patientDetails.patientMedicalHistory &&
                  patientDetails.patientMedicalHistory.menstrualHistory
                    ? patientDetails &&
                      patientDetails.patientMedicalHistory &&
                      patientDetails.patientMedicalHistory.menstrualHistory
                    : 'None'}
                </List>
              </ListItem>
            </Typography>
          </Typography>
        )}
        {patientDetails &&
          patientDetails!.familyHistory &&
          patientDetails!.familyHistory !== null &&
          patientDetails!.familyHistory.length > 0 && (
            <Typography className={classes.fullRow} component="div">
              <Typography component="h5" variant="h5" className={classes.header}>
                Patient's Family Medical History
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
      </div>

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
