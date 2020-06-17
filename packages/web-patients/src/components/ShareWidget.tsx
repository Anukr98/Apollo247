import React, { useState } from 'react';
import { Popover, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import {
  EmailShareButton,
  FacebookShareButton,
  InstapaperShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  TelegramIcon,
} from 'react-share';

const useStyles = makeStyles((theme: Theme) => {
  return {
    shareWidgetContainer: {
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#ffffff',
      position: 'absolute',
      right: 0,
      top: 30,
      padding: 16,
      minWidth: 196,
      '& h3': {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#02475b',
        margin: 0,
        paddingBottom: 20,
        textTransform: 'none',
      },
      '& span': {
        fontWeight: 'normal',
        '&:first-child': {
          paddingRight: 14,
        },
      },
    },
    shareButton: {
      padding: '0 10px 0 0 !important',
      display: 'flex',
      alignItems: 'center',
      fontSize: 16,
      color: '#02475b !important',
      fontWeight: 'normal',
      marginBottom: 20,
      '&:hover': {
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
      },
      '&:focus': {
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
      },
      '&:last-child': {
        marginBottom: 0,
      },
    },
    closeBtn: {
      textAlign: 'right',
      cursor: 'pointer',
    },
  };
});

interface ShareWidgetProps {
  title: string;
  url: string;
}

export const ShareWidget: React.FC<ShareWidgetProps> = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.shareWidgetContainer}>
      <div className={classes.closeBtn}>
        <img src={require('images/ic_cross.svg')} alt="" />
      </div>
      <h3>Share this article</h3>
      <TwitterShareButton className={classes.shareButton} url={props.url} title={props.title}>
        <span><TwitterIcon size={32} round /></span>
        <span>Twitter</span>
      </TwitterShareButton>
      <WhatsappShareButton className={classes.shareButton} url={props.url} title={props.title}>
        <span><WhatsappIcon size={32} round /></span>
        <span>WhatsApp</span>
      </WhatsappShareButton>
      <FacebookShareButton
        className={classes.shareButton}
        url={
          'https://www.apollo247.com/covid19/article/what-safety-precautions-should-employees-returning-work-after-lockdown-take'
        }
        title={props.title}
      >
        <span><FacebookIcon size={32} round /></span>
        <span>Faceboook</span>
      </FacebookShareButton>
    </div>
  );
};
