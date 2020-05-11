import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Typography, Divider } from '@material-ui/core';
import React from 'react';
import { useQuery } from 'react-apollo-hooks';
import { GET_PATIENTS } from 'graphql/profiles';
import { LocalHospital } from '@material-ui/icons';
import { GetPatients } from 'graphql/types/GetPatients';

const useStyles = makeStyles((theme: Theme) => {
  return {
    patientsList: {
      display: 'flex',
      flexDirection: 'column',
      color: 'black',
    },
    patient: {
      padding: theme.spacing(2),
    },
  };
});

export interface PatientsListProps {}

export const PatientsList: React.FC<PatientsListProps> = (props) => {
  const classes = useStyles({});
  const { data, error, loading } = useQuery<GetPatients>(GET_PATIENTS);
  if (loading) return <CircularProgress />;
  if (error) return <div>Error loading patients :(</div>;
  if (data && data.getPatients)
    return (
      <div className={classes.patientsList} data-cypress="PatientsList">
        <Typography variant="h3">Patients List</Typography>
        {data.getPatients.patients.map((pat) => (
          <div key={pat.id} className={classes.patient}>
            <LocalHospital />
            {pat.firstName} {pat.lastName} ({pat.mobileNumber})
          </div>
        ))}
        <Divider />
        <Typography variant="h5">Raw respones from API</Typography>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  return <div className={classes.patientsList}></div>;
};
