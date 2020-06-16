import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      padding: 20,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      marginTop: 20,
      fontSize: 14,
      lineHeight: '23px',
      '& h3': {
        margin: 0,
        color: '#01667c',
        fontSize: 16,
        fontWeight: 600,
      },
      '& ul': {
        paddingLeft: 20,
      },
    },
    readMore: {
      fontSize: 16,
      fontWeight: 500,
      color: '#fcb716',
      textTransform: 'uppercase',
    },
  });
});

export const BookBest: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <h3>Book Best Family Physicians</h3>
      <p>A family physician, more commonly referred as a family doctor, specialises on providing comprehensive medical care to each member of the family, regardless of age and gender. Since a family doctor is trained on treating almost all kinds of diseases and across various parts of the body, he/she is also often known as a primary care physician.</p>
      <h3>You can consult a family doctor if</h3>
      <ul>
        <li>Any one of your family members is suffering from a medical condition</li>
        <li>You are unsure about the condition or which doctor to consult</li>
      </ul>
      <Link className={classes.readMore} to="#">Read More</Link>
    </div>
  );
};

