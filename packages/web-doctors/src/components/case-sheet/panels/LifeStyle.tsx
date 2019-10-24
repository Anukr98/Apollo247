import React, { Fragment, useContext } from 'react';
import { Typography, List, ListItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { AphTextField, AphButton } from '@aph/web-ui-components';

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
    position: 'relative',
    '& textarea': {
      border: 'none',
      padding: 15,
      fontSize: 15,
      fontWeight: 500,
      paddingRight: 60,
      borderRadius: 0,
    },
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
  boxActions: {
    position: 'absolute',
    right: 12,
    top: 12,
    display: 'flex',
    alignItems: 'center',
    '& button': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      minWidth: 'auto',
      padding: 0,
      marginLeft: 12,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        maxWidth: 20,
        maxHeight: 20,
      },
    },
  },
}));

export const LifeStyle: React.FC = () => {
  const classes = useStyles();
  const { loading, patientDetails } = useContext(CaseSheetContext);
  return loading && !patientDetails ? (
    <div></div>
  ) : (
    <Typography component="div" className={classes.mainContainer}>
      <div>
        <Typography className={classes.mainContainer} component="div">
          <Typography component="h5" variant="h5" className={classes.header}>
            Patient’s Past Medical History
          </Typography>
          <Typography component="div" className={classes.content}>
            {/* <List>
              <ListItem>
                <Fragment>
                  <Typography component="p" className={classes.textContent}>
                    {patientDetails!.patientMedicalHistory!.pastMedicalHistory &&
                    patientDetails!.patientMedicalHistory!.pastMedicalHistory.trim()
                      ? patientDetails!.patientMedicalHistory!.pastMedicalHistory
                      : 'None'}
                  </Typography>
                </Fragment>
              </ListItem>
            </List> */}
            <AphTextField fullWidth multiline />
            <div className={classes.boxActions}>
              <AphButton>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton>
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div>
          </Typography>
        </Typography>

        <Typography component="div">
          <Typography component="h5" variant="h5" className={classes.header}>
            Patient’s Past Surgical History
          </Typography>
          <Typography component="div" className={classes.content}>
            {/* <List>
              <ListItem>
                <Fragment>
                  <Typography component="p" className={classes.textContent}>
                    {patientDetails!.patientMedicalHistory!.pastSurgicalHistory &&
                    patientDetails!.patientMedicalHistory!.pastSurgicalHistory.trim()
                      ? patientDetails!.patientMedicalHistory!.pastSurgicalHistory
                      : 'None'}
                  </Typography>
                </Fragment>
              </ListItem>
            </List> */}
            <AphTextField fullWidth multiline />
            <div className={classes.boxActions}>
              <AphButton>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton>
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div>
          </Typography>
        </Typography>

        <Typography component="div" className={classes.drugAllergies}>
          <Typography component="h5" variant="h5" className={classes.header}>
            Drug Allergies
          </Typography>
          <Typography component="div" className={classes.content}>
            {/* <List>
              <ListItem>
                <Fragment>
                  <Typography component="p" className={classes.textContent}>
                    {patientDetails!.patientMedicalHistory!.drugAllergies &&
                    patientDetails!.patientMedicalHistory!.drugAllergies.trim()
                      ? patientDetails!.patientMedicalHistory!.drugAllergies
                      : 'None'}
                  </Typography>
                </Fragment>
              </ListItem>
            </List> */}
            <AphTextField fullWidth multiline />
            <div className={classes.boxActions}>
              <AphButton>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton>
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div>
          </Typography>
        </Typography>
        <Typography component="div" className={classes.dietAllergies}>
          <Typography component="h5" variant="h5" className={classes.header}>
            Diet Allergies/Restrictions
          </Typography>
          <Typography component="div" className={classes.content}>
            {/* <List>
              <ListItem>
                <Fragment>
                  <Typography component="p" className={classes.textContent}>
                    {patientDetails!.patientMedicalHistory!.dietAllergies &&
                    patientDetails!.patientMedicalHistory!.dietAllergies.trim()
                      ? patientDetails!.patientMedicalHistory!.dietAllergies
                      : 'None'}
                  </Typography>
                </Fragment>
              </ListItem>
            </List> */}
            <AphTextField fullWidth multiline />
            <div className={classes.boxActions}>
              <AphButton>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton>
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div>
          </Typography>
        </Typography>
        {patientDetails && patientDetails!.lifeStyle && patientDetails!.lifeStyle.length > 0 ? (
          <Typography className={classes.mainContainer} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Lifestyle & Habits
            </Typography>
            <Typography component="div" className={classes.content}>
              {/* <List>
                {patientDetails!.lifeStyle!.map(
                  (item, idx) =>
                    item!.description &&
                    item!.description.length > 0 && (
                      <ListItem key={idx}>
                        <Fragment>
                          <Typography component="p" className={classes.textContent}>
                            {item!.description}
                          </Typography>
                        </Fragment>
                      </ListItem>
                    )
                )}
              </List> */}
              <AphTextField fullWidth multiline />
              <div className={classes.boxActions}>
                <AphButton>
                  <img src={require('images/round_edit_24_px.svg')} alt="" />
                </AphButton>
                <AphButton>
                  <img src={require('images/ic_cancel_green.svg')} alt="" />
                </AphButton>
              </div>
            </Typography>
          </Typography>
        ) : (
          <span>No data Found</span>
        )}
        <Typography component="div">
          <Typography component="h5" variant="h5" className={classes.header}>
            Menstual History*
          </Typography>
          <Typography component="div" className={classes.content}>
            {/* <List>
              <ListItem>
                <Fragment>
                  <Typography component="p" className={classes.textContent}>
                    {patientDetails!.patientMedicalHistory!.menstrualHistory &&
                    patientDetails!.patientMedicalHistory!.menstrualHistory.trim()
                      ? patientDetails!.patientMedicalHistory!.menstrualHistory
                      : 'None'}
                  </Typography>
                </Fragment>
              </ListItem>
            </List> */}
            <AphTextField fullWidth multiline />
            <div className={classes.boxActions}>
              <AphButton>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton>
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div>
          </Typography>
        </Typography>

        {patientDetails &&
        patientDetails!.familyHistory &&
        patientDetails!.familyHistory !== null &&
        patientDetails!.familyHistory.length > 0 ? (
          <Typography className={classes.mainContainer} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Patient’s Family Medical History
            </Typography>
            <Typography component="div" className={classes.content}>
              {/* <List>
                {patientDetails!.familyHistory!.map(
                  (item, idx) =>
                    item!.description &&
                    item!.description.length > 0 && (
                      <ListItem key={idx}>
                        <Fragment>
                          <Typography component="p" className={classes.textContent}>
                            {`${item!.relation}:${item!.description}`}
                          </Typography>
                        </Fragment>
                      </ListItem>
                    )
                )}
              </List> */}
              <AphTextField fullWidth multiline />
              <div className={classes.boxActions}>
                <AphButton>
                  <img src={require('images/round_edit_24_px.svg')} alt="" />
                </AphButton>
                <AphButton>
                  <img src={require('images/ic_cancel_green.svg')} alt="" />
                </AphButton>
              </div>
            </Typography>
          </Typography>
        ) : (
          <span>No data Found</span>
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
