import React from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';

export interface MonthListProps {
  month?: number;
  className?: string;
  onChange?: SelectInputProps['onChange'];
}
const useStyles = makeStyles({
  monthList: {
    width: '15%',
    display: 'inline-block',
    textAlign: 'center',
    padding: '9px 16px 16px 16px',
    marginLeft: '-38px',
    borderRadius: '10px 0 0 10px',
    backgroundColor: '#f7f7f7',
  },
  monthListPopup: {
    color: '#02475b',
    fontSize: 21,
    fontWeight: 600,
    '& div': {
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    '&:after': {
      borderBottom: 'none',
    },
    '&:before': {
      borderBottom: 'none',
      transform: 'scaleX(0)',
    },
    '& svg': {
      color: '#02475b',
    },
    '& button': {
      color: '#02475b',
      right: 10,
    },
  },
  monthListItem: {
    color: '#02475b',
  },
  container: {
    display: 'flex',
    'flex-wrap': 'nowrap',
    'justify-content': 'space-between',
  },
  monthPopup: {
    fontSize: 21,
    display: 'inline-block',
    width: '15%',
  },
  monthArrow: {
    width: 28,
  },
});
export const MonthList: React.FC<MonthListProps> = ({ month, onChange }) => {
  const classes = useStyles();

  return (
    <div className={classes.monthList}>
      <Select
        className={classes.monthListPopup}
        value={month}
        onChange={onChange}
        IconComponent={() => (
          <IconButton aria-label="down arrow">
            <img src={require('images/ic_downarrow.svg')} className={classes.monthArrow} alt="" />
          </IconButton>
        )}
      >
        <MenuItem className={classes.monthListItem} value={0}>
          Jan
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={1}>
          Feb
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={2}>
          Mar
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={3}>
          Apr
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={4}>
          May
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={5}>
          Jun
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={6}>
          Jul
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={7}>
          Aug
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={8}>
          Sep
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={9}>
          Oct
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={10}>
          Nov
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={11}>
          Dec
        </MenuItem>
      </Select>
    </div>
  );
};
