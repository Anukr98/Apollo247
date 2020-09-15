import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useAuth } from 'hooks/authHooks';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fc9916',
  },
}));

const Loader: React.FC = (props) => {
  const classes = useStyles({});
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }
  return null;
};

export default Loader;
