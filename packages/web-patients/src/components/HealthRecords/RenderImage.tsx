import React, { useEffect, useState } from 'react';
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
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: 12,
      padding: 40,
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

  return type === 'pdf' ? (
    <div className={classes.prescriptionImage}>
      <a href={activeData.fileUrl}>Download the file</a>
    </div>
  ) : (
    //  </div>
    <div className={classes.prescriptionImage}>
      <img src={activeData.fileUrl} alt="Preview is not available" />
    </div>
  );
};
