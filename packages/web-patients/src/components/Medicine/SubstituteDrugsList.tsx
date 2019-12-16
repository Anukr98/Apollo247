import React from 'react';
import { CircularProgress, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { MedicineProductDetails, MedicineProduct } from '../../helpers/MedicineApiCalls';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: 288,
      padding: '6px 0 6px 16px',
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
      },
    },
    rightArrow: {
      position: 'absolute',
      right: 0,
      top: 8,
    },
    name: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
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
  setSubstitute: (substitute: MedicineProduct) => void;
  setIsSubDrugsPopoverOpen: (subDrugsPopoverOpen: boolean) => void;
};

export const SubstituteDrugsList: React.FC<SubstituteDrugsListProps> = (props) => {
  const classes = useStyles({});
  console.log(props.data);
  return (
    <div className={classes.root}>
      {!props.data && <CircularProgress />}
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(40vh'}>
        <ul>
          {props.data &&
            props.data.map((substitute) => (
              <li
                onClick={() => {
                  props.setSubstitute(substitute);
                  props.setIsSubDrugsPopoverOpen(false);
                }}
              >
                <div className={classes.name}>{substitute.name}</div>
                <div className={classes.price}>Rs. {substitute.price}</div>
                <div className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </div>
              </li>
            ))}
        </ul>
      </Scrollbars>
    </div>
  );
};
