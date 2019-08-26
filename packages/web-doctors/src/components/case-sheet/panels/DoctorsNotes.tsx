import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { GetJuniorDoctorCaseSheet } from 'graphql/types/GetJuniorDoctorCaseSheet';

const useStyles = makeStyles(() => ({
  container: {
    borderRadius: '5px',
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    color: '#01475b !important',
    padding: '10px 10px 10px 20px',
    fontSize: 14,
    lineHeight: 1.43,
    fontWeight: 'normal',
  },
}));

interface CasesheetInfoProps {
  casesheetInfo: GetJuniorDoctorCaseSheet;
}
export const DoctorsNotes: React.FC<CasesheetInfoProps> = (props) => {
  const classes = useStyles();
  return (
    <Typography component="div" className={classes.container}>
      {props.casesheetInfo.getJuniorDoctorCaseSheet!.caseSheetDetails &&
        props.casesheetInfo.getJuniorDoctorCaseSheet!.caseSheetDetails &&
        props.casesheetInfo.getJuniorDoctorCaseSheet!.caseSheetDetails!.notes &&
        props.casesheetInfo.getJuniorDoctorCaseSheet!.caseSheetDetails!.notes}
    </Typography>
  );
};
