import React, { useState, useEffect } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';

interface Props {
  month?: number,
  classes?: string,
  onChange?: SelectInputProps['onChange']
}

export const MonthList: React.FC<Props> = (props) => {
  const [month, setMonth] = useState(props.month);

  useEffect(() => {
    setMonth(props.month);
  }, [props.month]);

  return (
    <div className={props.classes}>
      <Select
        value={month}
        onChange={props.onChange}
      >
        <MenuItem value={0}>January</MenuItem>
        <MenuItem value={1}>February</MenuItem>
        <MenuItem value={2}>March</MenuItem>
        <MenuItem value={3}>April</MenuItem>
        <MenuItem value={4}>May</MenuItem>
        <MenuItem value={5}>June</MenuItem>
        <MenuItem value={6}>July</MenuItem>
        <MenuItem value={7}>August</MenuItem>
        <MenuItem value={8}>September</MenuItem>
        <MenuItem value={9}>October</MenuItem>
        <MenuItem value={10}>November</MenuItem>
        <MenuItem value={11}>December</MenuItem>
      </Select>
    </div>
  )
}
