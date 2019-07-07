import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import Select, { SelectProps } from '@material-ui/core/Select';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    selectInputRoot: {
      paddingTop: 10,
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e',
      },
      '&:hover': {
        '&:before': {
          borderBottom: '2px solid #00b38e',
        },
        '&:after': {
          borderBottom: '2px solid #00b38e',
        },
      },
      '&:focus': {
        '&:before': {
          borderBottom: '2px solid #00b38e',
        },
        '&:after': {
          borderBottom: '2px solid #00b38e',
        },
      },
    },
    selectMenuRoot: {
      '& svg': {
        color: '#00b38e',
      },
    },
    selectMenuItem: {
      backgroundColor: 'transparent',
      fontSize: 16,
      fontWeight: 500,
      color: theme.palette.secondary.light,
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      '& ul': {
        padding: '10px 20px',
        '& li': {
          fontSize: 16,
          fontWeight: 500,
          color: '#01475b',
          minHeight: 'auto',
          paddingLeft: 0,
          paddingRight: 0,
          borderBottom: '1px solid rgba(1,71,91,0.2)',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
  });
});

export const AphSelect: React.FC<SelectProps> = (props) => {
  const classes = useStyles({});
  return (
    <Select
      fullWidth
      autoWidth
      classes={{ root: classes.selectMenuRoot, selectMenu: classes.selectMenuItem }}
      MenuProps={{ classes: { paper: classes.menuPopover } }}
      className={classes.selectInputRoot}
      {...props}
    >
      {props.children}
    </Select>
  );
};
