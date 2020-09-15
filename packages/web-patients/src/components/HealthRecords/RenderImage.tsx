import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';

type RenderImageProps = {
  activeData: any;
  type: string;
};
const useStyles = makeStyles((theme: Theme) => {
  return {
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    prescriptionImage: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      borderRadius: 10,
      marginBottom: 12,
      padding: 20,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        padding: 20,
      },
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
    },
  };
});

export const RenderImage: React.FC<RenderImageProps> = (props) => {
  const classes = useStyles({});
  const { activeData, type } = props;

  return (
    <div className={classes.prescriptionImage}>
      {type === 'pdf' ? (
        <img src={require('images/pdf-file-format-symbol.svg')} width="200" height="130" />
      ) : (
        <img src={activeData.fileUrl} alt="Preview is not available" />
      )}
    </div>
  );
};
