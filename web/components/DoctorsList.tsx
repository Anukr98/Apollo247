import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import React from 'react';
import { useQuery } from 'react-apollo-hooks';
import { GetDoctors } from 'graphql/types/GetDoctors';
import { GET_DOCTORS } from 'graphql/doctors';
import { LocalHospital } from '@material-ui/icons';

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
        {data.doctors.map((doc) => (
          <div key={doc.id} className={classes.doctor}>
            <LocalHospital />
            {doc.firstName} {doc.lastName} ({doc.email})
          </div>
        ))}
      </div>
    );
  return <div className={classes.doctorsList}></div>;
};
