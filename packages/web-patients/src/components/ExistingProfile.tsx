import React, { useState } from 'react';
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
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    menuItemHide: {
      display: 'none',
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
  const onePrimaryUser = patients.filter((x) => x.relation === Relation.ME).length === 1;
  const multiplePrimaryUsers = patients.filter((x) => x.relation === Relation.ME).length > 1;
  const noPrimaryUsers = patients.filter((x) => x.relation === Relation.ME).length < 1;
  const disabled = patients.some(isPatientInvalid) || !onePrimaryUser;
  const needsPrimaryUserError = 'There should be 1 profile with relation set as Me';
  const multiplePrimaryUsersError = 'Relation can be set as Me for only 1 profile';

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
          {patients.length > 1 ? (
            <p>
              We have found {patients.length} accounts registered with this mobile number. Please
              tell us who is who? :)
            </p>
          ) : null}
          {multiplePrimaryUsers ? (
            <FormHelperText component="div" error={true}>
              {multiplePrimaryUsersError}
            </FormHelperText>
          ) : null}
          {noPrimaryUsers ? (
            <FormHelperText component="div" error={true}>
              {needsPrimaryUserError}
            </FormHelperText>
          ) : null}
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
                  .then(() => props.onComplete())
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

// import React, { useState } from 'react';
// import { Theme, CircularProgress } from '@material-ui/core';
// import MenuItem from '@material-ui/core/MenuItem';
// import Typography from '@material-ui/core/Typography';
// import { createStyles, makeStyles } from '@material-ui/styles';
// import { AphButton, AphSelect } from '@aph/web-ui-components';
// import { Relation } from 'graphql/types/globalTypes';
// import { Mutation } from 'react-apollo';
// import { UpdatePatientVariables, UpdatePatient } from 'graphql/types/UpdatePatient';
// import { UPDATE_PATIENT } from 'graphql/profiles';
// import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
// import _capitalize from 'lodash/capitalize';
// import _sortBy from 'lodash/sortBy';

// const useStyles = makeStyles((theme: Theme) => {
//   return createStyles({
//     signUpPop: {
//       width: 368,
//       borderRadius: 10,
//       paddingTop: 36,
//       boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
//       backgroundColor: theme.palette.common.white,
//       [theme.breakpoints.down('xs')]: {
//         width: '100%',
//         borderRadius: 0,
//       },
//       '& p': {
//         fontSize: 17,
//         fontWeight: 500,
//         lineHeight: 1.41,
//         color: theme.palette.secondary.main,
//         marginTop: 20,
//       },
//     },
//     formControl: {
//       marginBottom: 20,
//       '& label': {
//         fontSize: 12,
//         fontWeight: 500,
//         color: theme.palette.secondary.dark,
//       },
//     },
//     actions: {
//       padding: 20,
//     },
//     btnGroup: {
//       paddingTop: 7,
//       '& button': {
//         width: '100%',
//         color: '#00b38e',
//         backgroundColor: theme.palette.common.white,
//         fontSize: 16,
//         fontWeight: 500,
//       },
//     },
//     mascotIcon: {
//       position: 'absolute',
//       right: 12,
//       top: -40,
//       '& img': {
//         maxWidth: 80,
//       },
//     },
//     customScrollBar: {
//       height: '65vh',
//       overflow: 'auto',
//       [theme.breakpoints.down('xs')]: {
//         height: '75vh',
//       },
//     },
//     signinGroup: {
//       padding: 20,
//       paddingTop: 0,
//       paddingBottom: 0,
//     },
//     formGroup: {
//       paddingTop: 30,
//     },
//     profileBox: {
//       borderRadius: 5,
//       backgroundColor: '#f7f8f5',
//       padding: 20,
//       marginBottom: 10,
//     },
//     boxHeader: {
//       display: 'flex',
//       borderBottom: '1px solid rgba(1,71,91,0.3)',
//       paddingBottom: 10,
//       fontSize: 12,
//       fontWeight: 500,
//       color: theme.palette.secondary.dark,
//     },
//     userId: {
//       marginLeft: 'auto',
//     },
//     boxContent: {
//       paddingTop: 15,
//     },
//     userName: {
//       fontSize: 16,
//       fontWeight: 500,
//       color: theme.palette.secondary.light,
//     },
//     userInfo: {
//       fontSize: 12,
//       fontWeight: 500,
//       color: theme.palette.secondary.light,
//     },
//     menuSelected: {
//       backgroundColor: 'transparent !important',
//       color: '#00b38e !important',
//     },
//     menuItemHide: {
//       display: 'none',
//     },
//   });
// });

// type Patient = GetCurrentPatients_getCurrentPatients_patients;

// interface PatientProfileProps {
//   patient: Patient;
//   number: number;
//   onUpdatePatient: (patient: Patient) => void;
// }
// const PatientProfile: React.FC<PatientProfileProps> = (props) => {
//   const relationOrderMap = {
//     [Relation.ME]: 0,
//     [Relation.MOTHER]: 1,
//     [Relation.FATHER]: 2,
//     [Relation.SISTER]: 3,
//     [Relation.BROTHER]: 4,
//     [Relation.WIFE]: 5,
//     [Relation.HUSBAND]: 6,
//     [Relation.COUSIN]: 7,
//     [Relation.OTHER]: 8,
//   };

//   const allRelations = Object.values(Relation);
//   const orderedRelations = _sortBy(allRelations, (rel: Relation) =>
//     relationOrderMap[rel] != null ? relationOrderMap[rel] : 99
//   );

//   const classes = useStyles();
//   const { patient, number } = props;

//   const [selectedRelation, setSelectedRelation] = React.useState<Relation | ''>(
//     patient.relation || ''
//   );
//   return (
//     <div className={classes.profileBox} data-cypress="PatientProfile">
//       <div className={classes.boxHeader}>
//         <div>{number}.</div>
//         <div className={classes.userId}>{patient.uhid}</div>
//       </div>
//       <div className={classes.boxContent}>
//         <div className={classes.userName}>{_capitalize(patient.firstName || '')}</div>
//         <div className={classes.userInfo}>
//           {_capitalize(patient.gender || '')}
//           {(patient.dateOfBirth || '').toString()}
//         </div>
//         <AphSelect
//           value={selectedRelation}
//           onChange={(e) => {
//             const updatedRelation = e.target.value as Relation;
//             setSelectedRelation(updatedRelation);
//             const updatedPatient = { ...patient, relation: updatedRelation };
//             props.onUpdatePatient(updatedPatient);
//           }}
//         >
//           <MenuItem className={classes.menuItemHide} disabled>
//             Relation
//           </MenuItem>
//           {orderedRelations.map((relationOption) => (
//             <MenuItem
//               selected={relationOption === selectedRelation}
//               value={relationOption}
//               classes={{ selected: classes.menuSelected }}
//               key={relationOption}
//             >
//               {_capitalize(relationOption)}
//             </MenuItem>
//           ))}
//         </AphSelect>
//       </div>
//     </div>
//   );
// };

// const isPatientInvalid = (patient: Patient) => patient.relation == null;

// export interface ExistingProfileProps {
//   patients: NonNullable<Patient[]>;
//   onComplete: () => void;
// }
// export const ExistingProfile: React.FC<ExistingProfileProps> = (props) => {
//   const classes = useStyles();
//   const [patients, setPatients] = useState(props.patients);
//   const [loading, setLoading] = useState(false);
//   const onePrimaryUser = patients.filter((x) => x.relation === Relation.ME).length === 1;
//   const multiplePrimaryUsers = patients.filter((x) => x.relation === Relation.ME).length > 1;
//   const noPrimaryUsers = patients.filter((x) => x.relation === Relation.ME).length < 1;
//   const disabled = patients.some(isPatientInvalid) && !onePrimaryUser;

//   const needsPrimaryUserError = 'There should be 1 profile with relation set as Me';
//   const multiplePrimaryUsersError = 'Relation can be set as Me for only 1 profile';

//   return (
//     <div className={classes.signUpPop} data-cypress="ExistingProfile">
//       <div className={classes.mascotIcon}>
//         <img src={require('images/ic_mascot.png')} alt="" />
//       </div>
//       <div className={classes.customScrollBar}>
//         <div className={classes.signinGroup}>
//           <Typography variant="h2">
//             welcome
//             <br /> to apollo 24/7
//           </Typography>
//           {patients.length > 1 ? (
//             <p>
//               We have found {patients.length} accounts registered with this mobile number. Please
//               tell us who is who? :)
//             </p>
//           ) : null}
//           {multiplePrimaryUsers ? <p>{multiplePrimaryUsersError}</p> : null}
//           {noPrimaryUsers ? <p>{needsPrimaryUserError}</p> : null}
//           <div className={classes.formGroup}>
//             {patients &&
//               patients.map((p, i) => (
//                 <PatientProfile
//                   key={p.id}
//                   patient={p}
//                   number={i + 1}
//                   onUpdatePatient={(updatedPatient) => {
//                     const newPatients = patients.map((patient) =>
//                       patient.id === updatedPatient.id ? updatedPatient : patient
//                     );
//                     setPatients(newPatients);
//                   }}
//                 />
//               ))}
//           </div>
//         </div>
//       </div>
//       <div className={classes.actions}>
//         <Mutation<UpdatePatient, UpdatePatientVariables> mutation={UPDATE_PATIENT}>
//           {(mutate) => (
//             <AphButton
//               type="submit"
//               onClick={() => {
//                 const updatePatientPromises = patients.map((patient) => {
//                   return mutate({
//                     variables: {
//                       patientInput: {
//                         id: patient.id,
//                         relation: patient.relation,
//                       },
//                     },
//                   });
//                 });
//                 setLoading(true);
//                 Promise.all(updatePatientPromises)
//                   .then(() => props.onComplete())
//                   .catch(() => window.alert('Something went wrong :('))
//                   .finally(() => setLoading(false));
//               }}
//               disabled={disabled}
//               fullWidth
//               variant="contained"
//               color="primary"
//             >
//               {loading ? <CircularProgress size={22} color="secondary" /> : 'Submit'}
//             </AphButton>
//           )}
//         </Mutation>
//       </div>
//     </div>
//   );
// };
