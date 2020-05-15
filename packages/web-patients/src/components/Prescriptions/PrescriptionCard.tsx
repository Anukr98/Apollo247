import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton, AphLinearProgress } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 10,
      display: 'flex',
      marginBottom: 10,
    },
    prescriptionGroup: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      width: 'calc(100% - 44px)',
    },
    closeBtn: {
      marginLeft: 'auto',
      paddingLeft: 20,
      '& button': {
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    imgThumb: {
      paddingRight: 14,
      '& img': {
        maxWidth: 30,
        verticalAlign: 'middle',
      },
    },
    fileInfo: {
      width: 'calc(90% - 44px)',
    },
    progressRoot: {
      height: 2,
      marginTop: 5,
    },
  };
});

interface PrescriptionCardProps {
  imageUrl: string;
  fileName: string;
  removePrescription: (fileName: string) => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = (props) => {
  const classes = useStyles({});
  const [completed, setCompleted] = React.useState(0);

  useEffect(() => {
    function progress() {
      setCompleted((oldCompleted) => {
        if (oldCompleted === 100) {
          /* this will stop animation once the progress bar reaches 100 */
          return oldCompleted;
        }
        const diff = Math.random() * 10;
        return Math.min(oldCompleted + diff, 100);
      });
    }
    const timer = setInterval(progress, 500);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={classes.root}>
      <div className={classes.prescriptionGroup}>
        <div className={classes.imgThumb}>
          <img src={props.imageUrl} alt="" />
        </div>
        <div className={classes.fileInfo}>
          <a href={props.imageUrl} target="_blank" title="Download Document">
            {props.fileName}
          </a>
          <AphLinearProgress
            color="secondary"
            variant="determinate"
            className={classes.progressRoot}
            value={completed}
          />
        </div>
      </div>
      <div className={classes.closeBtn}>
        <AphButton
          onClick={() => {
            props.removePrescription(props.fileName);
          }}
        >
          <img src={require('images/ic_cross_onorange_small.svg')} alt="Remove Document" />
        </AphButton>
      </div>
    </div>
  );
};
