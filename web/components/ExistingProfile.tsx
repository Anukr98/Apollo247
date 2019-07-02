import React, { useState } from 'react';
import { Theme } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AppButton } from 'components/ui/AppButton';
import { AppSelectField } from 'components/ui/AppSelectField';
import { PatientSignIn_patientSignIn_patients } from 'graphql/types/PatientSignIn'; // eslint-disable-line camelcase
import _camelCase from 'lodash/camelCase';
import { Relation } from 'graphql/types/globalTypes';
import { useLoggedInPatients } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    signUpBar: {
      display: 'flex',
    },
    mascotCircle: {
      marginLeft: 'auto',
      cursor: 'pointer',
      position: 'fixed',
      bottom: 10,
      right: 15,
      '& img': {
        maxWidth: 72,
        maxHeight: 72,
      },
    },
    signUpPop: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        borderRadius: 0,
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    formControl: {
      marginBottom: 20,
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: theme.palette.secondary.dark,
      },
    },
    actions: {
      padding: 20,
    },
    btnGroup: {
      paddingTop: 7,
      '& button': {
        width: '100%',
        color: '#00b38e',
        backgroundColor: theme.palette.common.white,
        fontSize: 16,
        fontWeight: 500,
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    customScrollBar: {
      height: '65vh',
      overflow: 'auto',
      [theme.breakpoints.down('xs')]: {
        height: '75vh',
      },
    },
    signinGroup: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    formGroup: {
      paddingTop: 30,
    },
    profileBox: {
      borderRadius: 5,
      backgroundColor: '#f7f8f5',
      padding: 20,
      marginBottom: 10,
    },
    boxHeader: {
      display: 'flex',
      borderBottom: '1px solid rgba(1,71,91,0.3)',
      paddingBottom: 10,
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.secondary.dark,
    },
    userId: {
      marginLeft: 'auto',
    },
    boxContent: {
      paddingTop: 15,
    },
    userName: {
      fontSize: 16,
      fontWeight: 500,
      color: theme.palette.secondary.light,
    },
    userInfo: {
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.secondary.light,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
  });
});

interface PatientProfileProps {
  patient: PatientSignIn_patientSignIn_patients;
  number: number;
  onUpdatePatient: (patient: PatientSignIn_patientSignIn_patients) => void;
}
const PatientProfile: React.FC<PatientProfileProps> = (props) => {
  const classes = useStyles();
  const { patient, number } = props;
  const [patientRelation, setPatientRelation] = React.useState<Relation | null>(patient.relation);
  return (
    <div className={classes.profileBox}>
      <div className={classes.boxHeader}>
        <div>{number}.</div>
        <div className={classes.userId}>{patient.uhid}</div>
      </div>
      <div className={classes.boxContent}>
        <div className={classes.userName}>{patient.firstName}</div>
        <div className={classes.userInfo}>
          {_camelCase(patient.sex || '')}
          {_camelCase(patient.dateOfBirth || '')}
        </div>
        <AppSelectField
          value={patientRelation}
          onChange={(e) => {
            const updatedRelation = e.currentTarget.value as Relation;
            setPatientRelation(updatedRelation);
            const updatedPatient = { ...patient, relation: updatedRelation };
            props.onUpdatePatient(updatedPatient);
          }}
        >
          {Object.values(Relation).map((relation) => (
            <MenuItem value={relation} classes={{ selected: classes.menuSelected }} key={relation}>
              {relation}
            </MenuItem>
          ))}
        </AppSelectField>
      </div>
    </div>
  );
};

const isPatientInvalid = (patient: PatientSignIn_patientSignIn_patients) =>
  patient.relation == null;

export interface ExistingProfileProps {}
export const ExistingProfile: React.FC<ExistingProfileProps> = (props) => {
  const classes = useStyles();
  const [patients, setPatients] = useState(useLoggedInPatients());
  const disabled = !!(patients && patients.some(isPatientInvalid));

  return (
    <div className={classes.signUpBar}>
      <div className={classes.signUpPop}>
        <div className={classes.mascotIcon}>
          <img src={require('images/ic_mascot.png')} alt="" />
        </div>
        <div className={classes.customScrollBar}>
          <div className={classes.signinGroup}>
            <Typography variant="h2">
              welcome
              <br /> to apollo 24/7
            </Typography>
            {patients && patients.length > 1 ? (
              <p>
                We have found {patients ? patients.length : 0} accounts registered with this mobile
                number. Please tell us who is who? :)
              </p>
            ) : null}
            <div className={classes.formGroup}>
              {patients &&
                patients.map((p, i) => (
                  <PatientProfile
                    patient={p}
                    number={i + 1}
                    onUpdatePatient={(updatedPatient) => {
                      const newPatients = patients.map((patient) =>
                        patient.id === updatedPatient.id ? updatedPatient : patient
                      );
                      setPatients(newPatients);
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
        <div className={classes.actions}>
          <AppButton disabled={disabled} fullWidth variant="contained" color="primary">
            Submit
          </AppButton>
        </div>
      </div>
    </div>
  );
};
