import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import Select, { SelectProps } from '@material-ui/core/Select';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    selectInputRoot: {
      '&:before': {
        borderBottom: 'none !important',
      },
      '&:after': {
        borderBottom: 'none !important',
      },
      '& svg': {
        color: '#00b38e',
      },
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
      marginLeft: -18,
      '& ul': {
        padding: '0 10px',
        '& li': {
          minHeight: 'auto',
          paddingLeft: 0,
          paddingRight: 0,
          borderBottom: '1px solid rgba(1,71,91,0.2)',
          textTransform: 'capitalize',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
  });
});

const AphCustomDropdown: React.FC<SelectProps> = (props) => {
  const classes = useStyles({});
  return (
    <Select
      autoWidth
      className={classes.selectInputRoot}
      MenuProps={{
        classes: { paper: classes.menuPopover },
        getContentAnchorEl: null,
        anchorOrigin: {
          vertical: 'center',
          horizontal: 'right',
        },
        transformOrigin: {
          vertical: 'center',
          horizontal: 'left',
        },
      }}
      {...props}
    >
      {props.children}
    </Select>
  );
};

export default AphCustomDropdown;
