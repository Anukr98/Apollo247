import { Theme, CircularProgress, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useEffect } from 'react';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { AddressCard } from 'components/MyAccount/AddressCard';
import Scrollbars from 'react-custom-scrollbars';
import { AddNewAddress } from 'components/Locations/AddNewAddress';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import {
  GetPatientAddressList,
  GetPatientAddressListVariables,
} from 'graphql/types/GetPatientAddressList';
import { GET_PATIENT_ADDRESS_LIST } from 'graphql/profiles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { MascotWithMessage } from '../MascotWithMessage';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 5,
      padding: '15px 5px 0 5px',
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
        boxShadow: 'none',
        backgroundColor: 'transparent',
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    sectionBody: {
      paddingBottom: 20,
      paddingRight: 15,
      paddingLeft: 15,
      paddingTop: 5,
    },
    bottomActions: {
      padding: 20,
      textAlign: 'center',
      '& button': {
        minWidth: 240,
      },
    },
    scrollBars: {
      height: 'calc(100vh - 250px) !important',
      [theme.breakpoints.down('xs')]: {
        height: '100% !important',
        '& >div:nth-child(2)': {
          display: 'none',
        },
        '& >div:nth-child(3)': {
          display: 'none',
        },
      },
    },
    progressBar: {
      textAlign: 'center',
    },
  };
});

interface AddressBookProps {
  patientId: string;
}

export const ManageAddressBook: React.FC<AddressBookProps> = (props) => {
  const classes = useStyles({});
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = React.useState<boolean>(false);
  const [forceRefresh, setForceRefresh] = React.useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);

  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const { data, error, loading, refetch } = useQueryWithSkip<
    GetPatientAddressList,
    GetPatientAddressListVariables
  >(GET_PATIENT_ADDRESS_LIST, {
    variables: {
      patientId: props.patientId,
    },
  });

  useEffect(() => {
    if (forceRefresh) {
      refetch();
      setIsPopoverOpen(true);
    }
  }, [forceRefresh]);

  if (loading)
    return (
      <div className={classes.progressBar}>
        <CircularProgress />
      </div>
    );
  if (error) return <div>Error :(</div>;

  const addresses = (data && data.getPatientAddressList.addressList) || [];

  return (
    <div className={classes.root}>
      <Scrollbars
        autoHide={true}
        className={classes.scrollBars}
        renderView={(props) =>
          isSmallScreen ? <div {...props} style={{ position: 'static' }} /> : <div {...props} />
        }
      >
        <div className={classes.sectionBody}>
          <AddressCard addresses={addresses} />
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        <AphButton onClick={() => setIsAddAddressDialogOpen(true)} color="primary">
          Add New Address
        </AphButton>
      </div>
      <AphDialog open={isAddAddressDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsAddAddressDialogOpen(false)} />
        <AphDialogTitle>Add New Address</AphDialogTitle>
        <AddNewAddress
          setIsAddAddressDialogOpen={setIsAddAddressDialogOpen}
          forceRefresh={(forceRefresh: boolean) => setForceRefresh(forceRefresh)}
        />
      </AphDialog>
      <Popover
        open={isPopoverOpen}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <MascotWithMessage
          messageTitle=""
          message="Address added successfully."
          closeButtonLabel="OK"
          closeMascot={() => {
            setIsPopoverOpen(false);
          }}
        />
      </Popover>
    </div>
  );
};
