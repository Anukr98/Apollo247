import React, { useState, useEffect } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';
import { makeStyles } from '@material-ui/styles';

interface Props {
  month?: number;
  classes?: string;
  onChange?: SelectInputProps['onChange'];
}
const useStyles = makeStyles({
  monthList: {
    width: '17%',
    display: 'inline-block',
    textAlign: 'center',
    paddingTop: '18px',
    paddingBottom: '22px',
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
});
export const MonthList: React.FC<Props> = (props) => {
  const classes = useStyles();
  const [month, setMonth] = useState(props.month);

  useEffect(() => {
    setMonth(props.month);
  }, [props.month]);

  return (
    <div className={classes.monthList}>
      <Select className={classes.monthListPopup} value={month} onChange={props.onChange}>
        <MenuItem className={classes.monthListItem} value={0}>
          January
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={1}>
          February
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={2}>
          March
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={3}>
          April
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={4}>
          May
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={5}>
          June
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={6}>
          July
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={7}>
          August
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={8}>
          September
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={9}>
          October
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={10}>
          November
        </MenuItem>
        <MenuItem className={classes.monthListItem} value={11}>
          December
        </MenuItem>
      </Select>
    </div>
  );
};
