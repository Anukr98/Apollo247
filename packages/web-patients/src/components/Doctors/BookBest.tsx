import React, { useState } from 'react';
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
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
      },
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
interface BookBestProps {
  faqData: any;
  specialityName: string;
}

export const BookBest: React.FC<BookBestProps> = (props) => {
  const classes = useStyles({});
  const [remainInFaqData, setRemainInFaqData] = useState<boolean>(false);
  const { faqData, specialityName } = props;
  return faqData && faqData.consultReasons ? (
    <div className={classes.root}>
      <h3>{specialityName}</h3>
      <p>{faqData.about}</p>
      <h3>You can consult a {faqData.title} if</h3>
      <ul>
        {faqData.consultReasons.map((item: any, index: number) => {
          if (!remainInFaqData) {
            return index < 2 && <li key={index}>{item}</li>;
          } else {
            return <li key={index}>{item}</li>;
          }
        })}
      </ul>
      {!remainInFaqData && (
        <Link
          className={classes.readMore}
          to="#"
          onClick={() => {
            setRemainInFaqData(true);
          }}
        >
          Read More
        </Link>
      )}
    </div>
  ) : null;
};
