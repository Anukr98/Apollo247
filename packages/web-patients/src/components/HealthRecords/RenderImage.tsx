import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from 'hooks/authHooks';

type RenderImageProps = {
  activeData: any;
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
  const { data } = props.activeData;

  return data.fileUrl.includes('.pdf') ? (
    <div className={classes.prescriptionImage}>
      <a href={data.fileUrl}>Download the file</a>
    </div>
  ) : (
    <div className={classes.prescriptionImage}>
      <img src={data.fileUrl} alt="Preview is not available" />
    </div>
  );
};
