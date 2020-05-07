import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Card, CardMedia, CardContent, Typography, CircularProgress } from '@material-ui/core';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { Gender } from 'graphql/types/globalTypes';
import { GetCaseSheet_getCaseSheet_patientDetails } from 'graphql/types/GetCaseSheet';

const useStyles = makeStyles((theme: Theme) => {
  return {
    userCard: {
      display: 'flex',
      backgroundColor: '#f0f4f5',
      borderRadius: 5,
      '& span': {
        borderRight: '1px solid rgba(2, 71, 91, 0.1)',
        padding: '16px 8px',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 500,
        color: '#02475b',
        width: '30%',
        '& div': {
          color: '#02475b !important',
        },
        '&:last-child': {
          borderRight: 'none',
          width: '40%',
        },
        '& h4': {
          color: '#0087ba',
          fontSize: 20,
          fontWeight: 700,
          marginTop: 5,
          marginBottom: 5,
        },
      },
    },
    loading: {
      position: 'absolute',
      left: '20%',
      top: '30%',
    },
  };
});

interface PatientDetailsProps {
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | null;
  consultscount: String;
}
export const PatientDetailsUserCard: React.FC<PatientDetailsProps> = (props) => {
  const classes = useStyles({});
  const { loading } = useContext(CaseSheetContext);
  const userCardStrip = [];
  const { patientDetails, consultscount } = props;
  if (
    patientDetails! &&
    patientDetails!.dateOfBirth &&
    patientDetails!.dateOfBirth !== null &&
    patientDetails!.dateOfBirth !== ''
  ) {
    userCardStrip.push(
      Math.abs(
        new Date(Date.now()).getUTCFullYear() -
          new Date(patientDetails!.dateOfBirth).getUTCFullYear()
      ).toString()
    );
  }
  if (patientDetails && patientDetails!.gender && patientDetails!.gender !== null) {
    if (patientDetails!.gender === Gender.FEMALE) {
      userCardStrip.push('F');
    }
    if (patientDetails!.gender === Gender.MALE) {
      userCardStrip.push('M');
    }
    if (patientDetails!.gender === Gender.OTHER) {
      userCardStrip.push('O');
    }
  }
  if (
    patientDetails &&
    patientDetails!.patientAddress &&
    patientDetails.patientAddress !== null &&
    patientDetails.patientAddress.length > 0 &&
    patientDetails!.patientAddress[0]!.city !== ''
  ) {
    userCardStrip.push(patientDetails!.patientAddress[0]!.city);
  }
  const photoUrl =
    patientDetails && patientDetails!.photoUrl && patientDetails!.photoUrl !== null
      ? patientDetails!.photoUrl
      : require('images/no_person_icon.svg');
  return loading && !patientDetails ? (
    <CircularProgress className={classes.loading} />
  ) : (
    <Card>
      <CardMedia
        component="img"
        image={photoUrl}
        title={`${patientDetails!.firstName} ${patientDetails!.lastName}`}
      />
      <CardContent>
        {patientDetails &&
          patientDetails!.firstName &&
          patientDetails!.firstName !== '' &&
          patientDetails!.lastName &&
          patientDetails!.lastName !== '' && (
            <Typography gutterBottom variant="h4" component="h2">
              {patientDetails!.firstName + ' ' + patientDetails!.lastName}
            </Typography>
          )}
        <Typography variant="h5" color="textSecondary" component="h5">
          {userCardStrip.join(', ')}
        </Typography>
        <div className={classes.userCard}>
          <span>
            <h4>N/A</h4>
            <div>REVENUE</div>
          </span>
          <span>
            <h4>{consultscount}</h4>
            <div>CONSULTS</div>
          </span>
          <span>
            <h4>N/A</h4>
            <div>PRESCRIPTIONS</div>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
