import { makeStyles } from '@material-ui/styles';
import HeadsetMicIcon from '@material-ui/icons/HeadsetMic';
import React from 'react';

const useStyles = makeStyles(() => {
  return {
    testCall: {
      display: 'inline-flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      lineHeight: 1,
      fontSize: 13,
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#fc9916',
      padding: '10px 0',
    },
    testCallIcon: {
      marginRight: 10,
    },
  };
});

export const TestCall: React.FC = () => {
  const classes = useStyles();

  return (
    <a
      href="https://tokbox.com/developer/tools/precall/"
      target="_blank"
      className={classes.testCall}
    >
      <HeadsetMicIcon className={classes.testCallIcon} />
      <span>Test Audio/Video</span>
    </a>
  );
};
