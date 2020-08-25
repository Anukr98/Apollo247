import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import React from 'react';
import { readableParam } from 'helpers/commonHelpers';
import { clientRoutes } from 'helpers/clientRoutes';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    BookAppointentCard: {
      padding: 15,
      position: 'relative',
    },
    BookAppointentCardSection: {
      backgroundColor: '#fff',
      fontSize: 13,
      fontWeight: 500,
      lineHeight: '17px',
      color: '#01475B',
      marginBottom: 10,
      padding: 17,
      borderRadius: 14,
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        textAlign: 'center',
        background: '#F6F6F6',
      },
    },
    bookAppointmentBtn: {
      fontSize: 13,
      lineHeight: '24px',
      color: '#FCB716',
      fontWeight: 'bold',
      minWidth: 160,
      padding: 0,
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        margin: '5px 0',
        display: 'block',
        textAlign: 'center',
        width: '100%',
      },
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
  };
});
interface bookappointmentCardProps {
  doctorName: string;
  doctorId: string;
}

export const BookAppointmentCard: React.FC<bookappointmentCardProps> = (props) => {
  const classes = useStyles({});
  const { doctorName, doctorId } = props;
  return (
    <div className={classes.BookAppointentCard}>
      <div className={classes.BookAppointentCardSection}>
        <span>
          You can no longer send a message to the doctor. Book a new appointment for consulting with
          Dr. {doctorName} again.
        </span>
        <Link to={clientRoutes.doctorDetails(readableParam(doctorName || ''), doctorId)}>
          <AphButton className={classes.bookAppointmentBtn}>BOOK APPOINTMENT</AphButton>
        </Link>
      </div>
    </div>
  );
};
