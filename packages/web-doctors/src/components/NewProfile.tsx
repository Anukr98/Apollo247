import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import React from 'react';

import { useCurrentPatient } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    formControl: {
      marginBottom: 20,
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: theme.palette.secondary.dark,
      },
    },
  });
});

export interface NewProfileProps {
  popupHandler: (popup: boolean) => void;
  showSuccess: (popup: boolean) => void;
}

export const NewProfile: React.FC<NewProfileProps> = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.formControl}>hgfhdgshfgjsdgfjhgsdjfgjsdhgfjgsdhfgsdhgjhfgdhsghj</div>
  );
};
