import React from 'react';
import { CircularProgress, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { MedicineProductDetails, MedicineProduct } from '../../helpers/MedicineApiCalls';
import { clientRoutes } from 'helpers/clientRoutes';
import { pharmacyPdpSubstituteTracking } from 'webEngageTracking';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: 288,
      padding: '6px 0 6px 16px',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        padding: 0,
      },
      '& ul': {
        margin: 0,
        padding: 0,
        paddingRight: 16,
        '& li': {
          listStyleType: 'none',
          borderBottom: 'solid 0.5px rgba(2,71,91,0.2)',
          paddingTop: 8,
          paddingBottom: 8,
          paddingRight: 30,
          cursor: 'pointer',
          position: 'relative',
          '&:last-child': {
            border: 'none',
          },
        },
        [theme.breakpoints.down('xs')]: {
          display: 'flex',
          alignItems: 'flex-start',
          padding: '20px 0',
          margin: '0 0 20px',
          '& li': {
            padding: '0 5px',
            border: 'none',
          },
        },
      },
    },
    rightArrow: {
      position: 'absolute',
      right: 0,
      top: 8,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    subMed: {
      [theme.breakpoints.down('xs')]: {
        width: 180,
        background: '#fff',
        borderRadius: 10,
        padding: 12,
      },
    },
    substituteImg: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        width: 40,
        height: 40,
        '& img': {
          width: '100%',
          height: '100%',
        },
      },
    },
    name: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      [theme.breakpoints.down('xs')]: {
        padding: '0 0 5px',
        margin: '0 0 5px',
        borderBottom: '1px solid rgba(1,71,91,0.3)',
      },
    },
    price: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
    },
  };
});

type SubstituteDrugsListProps = {
  data: MedicineProductDetails[] | null;
  setIsSubDrugsPopoverOpen: (subDrugsPopoverOpen: boolean) => void;
};
const apiDetails = {
  imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
};

export const SubstituteDrugsList: React.FC<SubstituteDrugsListProps> = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.root}>
      {!props.data && <CircularProgress />}
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(40vh'}>
        <ul>
          {props.data &&
            props.data.map((substitute) => (
              <li
                onClick={() => {
                  const { url_key, sku, name } = substitute;
                  props.setIsSubDrugsPopoverOpen(false);
                  window.location.href = clientRoutes.medicineDetails(url_key);
                  pharmacyPdpSubstituteTracking({ productId: sku, productName: name });
                }}
              >
                <div className={classes.subMed}>
                  <div className={classes.substituteImg}>
                    <img
                      src={`${apiDetails.imageUrl}${substitute.image}`}
                      alt="Subsitute"
                      title="Substitue Medicine"
                    />
                  </div>
                  <div className={classes.name}>{substitute.name}</div>
                  <div className={classes.price}>Rs. {substitute.price}</div>
                  <div className={classes.rightArrow}>
                    <img
                      src={require('images/ic_arrow_right.svg')}
                      alt="right arrow"
                      title="right arrow"
                    />
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </Scrollbars>
    </div>
  );
};
