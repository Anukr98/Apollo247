import React, { useState } from 'react';
import { Theme, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphDialogTitle, AphDialog, AphDialogClose, AphButton } from '@aph/web-ui-components';
const useStyles = makeStyles((theme: Theme) => {});

export const KavachLanding: React.FC = (props) => {
  const classes = useStyles({});
  return <div>This is kavach landing</div>;
};
