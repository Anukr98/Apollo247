import React, { useState, useEffect } from 'react';
import { Theme, CircularProgress, FormHelperText } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AphButton, AphSelect } from '@aph/web-ui-components';
import { Relation } from 'graphql/types/globalTypes';
import { Mutation } from 'react-apollo';
import { UpdatePatientVariables, UpdatePatient } from 'graphql/types/UpdatePatient';
import { UPDATE_PATIENT } from 'graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import _capitalize from 'lodash/capitalize';
import _sortBy from 'lodash/sortBy';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
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
    errorText: {
      fontSize: 12,
      fontWeight: 500,
      color: '#890000',
      marginTop: 10,
      lineHeight: 2,
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
    menuItemHide: {
      display: 'none',
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      marginLeft: -30,
      '& ul': {
        padding: '10px 20px',
        '& li': {
          fontSize: 16,
          fontWeight: 500,
          color: '#01475b',
          minHeight: 'auto',
          paddingLeft: 0,
          paddingRight: 0,
          borderBottom: '1px solid rgba(1,71,91,0.2)',
          textTransform: 'capitalize',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
  });
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;

interface PatientProfileProps {
  patient: Patient;
  number: number;
  onUpdatePatient: (patient: Patient) => void;
}
const PatientProfile: React.FC<PatientProfileProps> = (props) => {
  const relationOrderMap = {
    [Relation.ME]: 0,
    [Relation.MOTHER]: 1,
    [Relation.FATHER]: 2,
    [Relation.SISTER]: 3,
    [Relation.BROTHER]: 4,
    [Relation.WIFE]: 5,
    [Relation.HUSBAND]: 6,
    [Relation.COUSIN]: 7,
    [Relation.OTHER]: 8,
  };

  const allRelations = Object.values(Relation);
  const orderedRelations = _sortBy(allRelations, (rel: Relation) =>
    relationOrderMap[rel] != null ? relationOrderMap[rel] : 99
  );

  const classes = useStyles();
  const { patient, number } = props;

  const [selectedRelation, setSelectedRelation] = React.useState<Relation | ''>(
    patient.relation || ''
  );

  useEffect(() => {
    //By default selectedRelation 1 st profile should be ME when there is an empty input
    if (number === 1 && selectedRelation === '') {
      setSelectedRelation(Relation.ME);
    }
  }, [number, selectedRelation]);

  return (
    <div className={classes.profileBox} data-cypress="PatientProfile">
      <div className={classes.boxHeader}>
        <div>{number}.</div>
        <div className={classes.userId}>{patient.uhid}</div>
      </div>
      <div className={classes.boxContent}>
        <div className={classes.userName}>{_capitalize(patient.firstName || '')}</div>
        <div className={classes.userInfo}>
          {_capitalize(patient.gender || '')}
          {(patient.dateOfBirth || '').toString()}
        </div>
        <AphSelect
          value={selectedRelation}
          onChange={(e) => {
            const updatedRelation = e.target.value as Relation;
            setSelectedRelation(updatedRelation);
            const updatedPatient = { ...patient, relation: updatedRelation };
            props.onUpdatePatient(updatedPatient);
          }}
          MenuProps={{
            classes: { paper: classes.menuPopover },
            anchorOrigin: {
              vertical: 'center',
              horizontal: 'right',
            },
          }}
        >
          <MenuItem className={classes.menuItemHide} disabled>
            Relation
          </MenuItem>
          {orderedRelations.map((relationOption) => (
            <MenuItem
              selected={relationOption === selectedRelation}
              value={relationOption}
              classes={{ selected: classes.menuSelected }}
              key={relationOption}
            >
              {_capitalize(relationOption)}
            </MenuItem>
          ))}
        </AphSelect>
      </div>
    </div>
  );
};

const isPatientInvalid = (patient: Patient) => patient.relation == null;

export interface ExistingProfileProps {
  patients: NonNullable<Patient[]>;
  onComplete: () => void;
}
export const ExistingProfile: React.FC<ExistingProfileProps> = (props) => {
  const classes = useStyles();
  const [patients, setPatients] = useState(props.patients);
  const [loading, setLoading] = useState(false);
  const disabled = patients.some(isPatientInvalid);
  const [Message, setMessage] = useState<string>('');
  const validMessage = '';
  let isOK = false;
  return (
    <div className={classes.signUpPop} data-cypress="ExistingProfile">
      <div className={classes.mascotIcon}>
        <img src={require('images/ic_mascot.png')} alt="" />
      </div>
      <div className={classes.customScrollBar}>
        <div className={classes.signinGroup}>
          <Typography variant="h2">
            welcome
            <br /> to apollo 24/7
          </Typography>

          {patients.length === 0 ? null : (
            <p>
              We have found {patients.length} {patients.length > 1 ? 'accounts ' : 'account '}
              registered with this mobile number. Please tell us who is who? :)
            </p>
          )}
          <FormHelperText component="div" className={classes.errorText}>
            {Message}
          </FormHelperText>

          <div className={classes.formGroup}>
            {patients &&
              patients.map((p, i) => (
                <PatientProfile
                  key={p.id}
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
        <Mutation<UpdatePatient, UpdatePatientVariables> mutation={UPDATE_PATIENT}>
          {(mutate) => (
            <AphButton
              type="submit"
              onClick={() => {
                let count = 0;
                patients.map((patient, i) => {
                  patients[i].relation === 'ME' ? (count = count + 1) : '';
                });
                if (count > 1) {
                  setMessage('Relation can be set as Me for only 1 profile');
                  isOK = true;
                } else if (count === 0) {
                  setMessage('There should be 1 profile with relation set as Me');
                  isOK = true;
                } else {
                  setMessage(validMessage);
                  isOK = false;
                }
                if (isOK == false) {
                  const updatePatientPromises = patients.map((patient) => {
                    return mutate({
                      variables: {
                        patientInput: {
                          id: patient.id,
                          relation: patient.relation,
                        },
                      },
                    });
                  });
                  setLoading(true);
                  Promise.all(updatePatientPromises)
                    .then(() => props.onComplete())
                    .catch(() => window.alert('Something went wrong :('))
                    .finally(() => setLoading(false));
                }
              }}
              disabled={disabled}
              fullWidth
              variant="contained"
              color="primary"
            >
              {loading ? <CircularProgress size={22} color="secondary" /> : 'Submit'}
            </AphButton>
          )}
        </Mutation>
      </div>
    </div>
  );
};
