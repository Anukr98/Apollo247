import React, { useState, useEffect } from 'react';
import { Theme, CircularProgress } from '@material-ui/core';
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
import FormHelperText from '@material-ui/core/FormHelperText';
import { format, parseISO } from 'date-fns';
import { useAllCurrentPatients } from 'hooks/authHooks';

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
    placeholder: {
      opacity: 0.3,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
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
      '& ul': {
        padding: '10px 20px',
        maxHeight: '65vh',
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
          '&:first-child': {
            borderBottom: 'none',
            padding: 0,
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
    [Relation.COUSIN]: 5,
    [Relation.WIFE]: 6,
    [Relation.HUSBAND]: 7,
    [Relation.OTHER]: 8,
    [Relation.SON]: 9,
    [Relation.GRANDSON]: 10,
    [Relation.GRANDMOTHER]: 11,
    [Relation.GRANDFATHER]: 12,
    [Relation.GRANDDAUGHTER]: 13,
    [Relation.DAUGHTER]: 14,
  };

  const allRelations = Object.values(Relation);
  const orderedRelations = _sortBy(allRelations, (rel: Relation) =>
    relationOrderMap[rel] != null ? relationOrderMap[rel] : 99
  );

  const classes = useStyles();
  const { patient, number } = props;

  const [selectedRelation, setSelectedRelation] = React.useState<Relation | ''>(
    patient.relation || (number === 1 ? Relation.ME : '')
  );

  useEffect(() => {
    if (number === 1 && !patient.relation) {
      const updatedPatient = { ...patient, relation: Relation.ME };
      props.onUpdatePatient(updatedPatient);
    }
  }, [number, patient]);

  // const placeholderClass = selectedRelation ? 'classes.placeholder' : '';

  return (
    <div className={classes.profileBox} data-cypress="PatientProfile">
      <div className={classes.boxHeader}>
        <div>{number}.</div>
        <div className={classes.userId}>{patient.uhid}</div>
      </div>
      <div className={classes.boxContent}>
        <div className={classes.userName}>{_capitalize(patient.firstName || '')}</div>
        <div className={classes.userInfo}>
          {`${_capitalize(patient.gender || '')} ${patient.gender && patient.dateOfBirth ? '|' : ''}
          ${(patient.dateOfBirth && format(parseISO(patient.dateOfBirth), 'dd MMMM yyyy')) || ''}`}
        </div>
        <AphSelect
          value={selectedRelation ? _capitalize(selectedRelation) : 'Relation'}
          onChange={(e) => {
            const updatedRelation = e.target.value as Relation;
            setSelectedRelation(updatedRelation);
            const updatedPatient = { ...patient, relation: updatedRelation };
            props.onUpdatePatient(updatedPatient);
          }}
          native={false}
          displayEmpty={true}
          renderValue={(value) => `${value}`}
          MenuProps={{
            classes: { paper: classes.menuPopover },
            anchorOrigin: {
              vertical: 'center',
              horizontal: 'right',
            },
            transformOrigin: {
              vertical: 'center',
              horizontal: 'right',
            },
          }}
        >
          <MenuItem value={selectedRelation} disabled></MenuItem>
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
  const loneUser = patients.length === 1 && patients[0].relation !== 'ME';
  if (loneUser) patients[0].relation = Relation.ME;
  // const onePrimaryUser = patients.filter((x) => x.relation === Relation.ME).length === 1;
  const onePrimaryUser = true;
  const multiplePrimaryUsers = patients.filter((x) => x.relation === Relation.ME).length > 1;
  const { setCurrentPatientId } = useAllCurrentPatients();

  // const noPrimaryUsers = patients.filter((x) => x.relation === Relation.ME).length < 1;
  // const disabled = patients.some(isPatientInvalid);

  // console.log(patients, 'patients....');

  // let primaryUserErrorMessage;
  let primaryUserErrorMessage = '';
  if (multiplePrimaryUsers)
    primaryUserErrorMessage = 'Relation can be set as Me for only 1 profile';
  // else if (noPrimaryUsers)
  //   primaryUserErrorMessage = 'There should be 1 profile with relation set as Me';
  const disabled = patients.some(isPatientInvalid) || primaryUserErrorMessage.length > 0;

  return (
    <div className={classes.signUpPop} data-cypress="ExistingProfile">
      <div className={classes.mascotIcon}>
        <img src={require('images/ic-mascot.png')} alt="" />
      </div>
      <div className={classes.customScrollBar}>
        <div className={classes.signinGroup}>
          <Typography variant="h2">
            welcome
            <br /> to apollo 24/7
          </Typography>
          {patients.length > 1 ? (
            <p>
              We have found {patients.length} accounts registered with this mobile number. Please
              tell us who is who? :)
            </p>
          ) : null}
          {primaryUserErrorMessage && (
            <FormHelperText component="div" error={true}>
              {primaryUserErrorMessage}
            </FormHelperText>
          )}
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
                  .then(() => {
                    const mePatientId = patients.filter((x) => x.relation === Relation.ME);
                    if (
                      mePatientId &&
                      mePatientId.length > 0 &&
                      mePatientId[0] &&
                      mePatientId[0].id !== ''
                    ) {
                      setCurrentPatientId(mePatientId[0].id);
                    }
                    props.onComplete();
                  })
                  .catch(() => window.alert('Something went wrong :('))
                  .finally(() => setLoading(false));
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
