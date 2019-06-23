import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Typography, Divider } from '@material-ui/core';
import React from 'react';
import { useQuery } from 'react-apollo-hooks';
import { GetDoctors } from 'graphql/types/GetDoctors';
import { GET_DOCTORS } from 'graphql/profiles';
import { LocalHospital } from '@material-ui/icons';
import { clientRoutes } from 'helpers/clientRoutes';
import { apiRoutes } from 'helpers/apiRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    doctorsList: {
      display: 'flex',
      flexDirection: 'column',
    },
    doctor: {
      padding: theme.spacing(2),
    },
  };
});

export interface DoctorsListProps {}

export const DoctorsList: React.FC<DoctorsListProps> = (props) => {
  const classes = useStyles();
  const { data, error, loading } = useQuery<GetDoctors>(GET_DOCTORS);
  if (loading) return <CircularProgress />;
  if (error) return <div>Error loading doctors :(</div>;
  if (data && data.doctors)
    return (
      <div className={classes.doctorsList}>
        <Typography variant="h3">Doctors List</Typography>
        {data.doctors.map((doc) => (
          <div key={doc.id} className={classes.doctor}>
            <LocalHospital />
            {doc.firstName} {doc.lastName} ({doc.email})
          </div>
        ))}
        <Divider />
        <Typography variant="h5">Raw respones from API</Typography>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  return <div className={classes.doctorsList}></div>;
};
