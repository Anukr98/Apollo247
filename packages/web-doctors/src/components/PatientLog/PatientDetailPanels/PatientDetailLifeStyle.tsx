import React, { Fragment, useContext } from 'react';
import { Typography, List, ListItem, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { GetCaseSheet_getCaseSheet_patientDetails } from 'graphql/types/GetCaseSheet';
import { Gender } from 'graphql/types/globalTypes';
import { isEmpty } from 'lodash';

const useStyles = makeStyles((theme: Theme) => ({
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
  historyList: {
    fontSize: 15,
    fontWeight: 500,
    color: '#01475b !important',
    padding: 12,
  },
  drugAllergies: {
    width: '45%',
    display: 'inline-block',
    paddingRight: 10,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      paddingRight: 0,
    },
  },
  dietAllergies: {
    width: '45%',
    display: 'inline-block',
    float: 'right',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      paddingRight: 0,
    },
  },
}));

interface LifeStyleProps {
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | null;
}

export const PatientDetailLifeStyle: React.FC<LifeStyleProps> = (props) => {
  const classes = useStyles({});
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
              Patient's Past Medical History
            </Typography>
            <Typography component="div" className={classes.content}>
              <div className={classes.historyList}>
                {patientDetails &&
                patientDetails.patientMedicalHistory &&
                patientDetails.patientMedicalHistory.pastMedicalHistory
                  ? patientDetails &&
                    patientDetails.patientMedicalHistory &&
                    patientDetails.patientMedicalHistory.pastMedicalHistory
                  : 'None'}
              </div>
            </Typography>
          </Typography>
        }
        <Typography className={classes.fullRow} component="div">
          <Typography component="h5" variant="h5" className={classes.header}>
            Medication History*
          </Typography>
          <Typography component="div" className={classes.content}>
            <div className={classes.historyList}>
              {patientDetails &&
              patientDetails.patientMedicalHistory &&
              patientDetails.patientMedicalHistory.medicationHistory
                ? patientDetails &&
                  patientDetails.patientMedicalHistory &&
                  patientDetails.patientMedicalHistory.medicationHistory
                : 'None'}
            </div>
          </Typography>
        </Typography>
        {
          <Typography className={classes.fullRow} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Patient's Past Surgical History
            </Typography>
            <Typography component="div" className={classes.content}>
              <div className={classes.historyList}>
                {patientDetails &&
                patientDetails.patientMedicalHistory &&
                patientDetails.patientMedicalHistory.pastSurgicalHistory
                  ? patientDetails &&
                    patientDetails.patientMedicalHistory &&
                    patientDetails.patientMedicalHistory.pastSurgicalHistory
                  : 'None'}
              </div>
            </Typography>
          </Typography>
        }
        {
          <Typography className={classes.drugAllergies} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Drug Allergies
            </Typography>
            <Typography component="div" className={classes.content}>
              <div className={classes.historyList}>
                {patientDetails &&
                patientDetails.patientMedicalHistory &&
                patientDetails.patientMedicalHistory.drugAllergies
                  ? patientDetails &&
                    patientDetails.patientMedicalHistory &&
                    patientDetails.patientMedicalHistory.drugAllergies
                  : 'None'}
              </div>
            </Typography>
          </Typography>
        }
        {
          <Typography className={classes.dietAllergies} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Diet Allergies/Restrictions
            </Typography>
            <Typography component="div" className={classes.content}>
              <div className={classes.historyList}>
                {patientDetails &&
                patientDetails.patientMedicalHistory &&
                patientDetails.patientMedicalHistory.dietAllergies
                  ? patientDetails &&
                    patientDetails.patientMedicalHistory &&
                    patientDetails.patientMedicalHistory.dietAllergies
                  : 'None'}
              </div>
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

        {patientDetails &&
          patientDetails!.lifeStyle &&
          patientDetails!.lifeStyle !== null &&
          patientDetails!.lifeStyle.length > 0 && (
            <Typography component="div">
              <Typography component="h5" variant="h5" className={classes.header}>
                Environmental & Occupational History
              </Typography>
              <Typography component="div" className={classes.content}>
                <List>
                  {patientDetails!.lifeStyle!.map((item, idx) => (
                    <ListItem key={idx}>
                      <Fragment>
                        <Typography component="p" className={classes.textContent}>
                          {item!.occupationHistory}
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
                          {!isEmpty(item!.relation) && `${item!.relation}: `}
                          {item!.description}
                        </Typography>
                      </Fragment>
                    </ListItem>
                  ))}
                </List>
              </Typography>
            </Typography>
          )}
      </div>
    </Typography>
  );
};
