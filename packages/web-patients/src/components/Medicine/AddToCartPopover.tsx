import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    actions: {
      padding: '10px 20px 20px 20px',
      display: 'flex',
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    viewCartBtn: {
      fontSize: 13,
      color: '#fc9916',
      fontWeight: 'bold',
      textAlign: 'right',
      marginLeft: 'auto',
      textTransform: 'uppercase',
    },
  };
});

interface AddToCarProps {
  cartProps: (value: boolean) => void;
}

export const AddToCartPopover: React.FC<AddToCarProps> = (props) => {
  const classes = useStyles({});
  const [showPopup, setShowPopup] = React.useState<boolean>(true);

  return showPopup ? (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">hi there! :)</Typography>
        <p>Your medicines have been added to your cart.</p>
      </div>
      <div className={classes.actions}>
        <AphButton
          className={classes.viewCartBtn}
          onClick={() => {
            if (document.getElementById('cartId')) {
              document.getElementById('cartId')!.click();
            }
            setShowPopup(false);
            props.cartProps(false);
          }}
        >
          View Cart
        </AphButton>
      </div>
    </div>
  ) : null;
};
