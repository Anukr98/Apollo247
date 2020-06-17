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
      position: 'absolute',
      '& button': {
        padding: '0 10px 0 0 !important',
      },
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
      <TwitterShareButton url={props.url} title={props.title}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <WhatsappShareButton url={props.url} title={props.title}>
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <FacebookShareButton
        //    url={props.url}
        url={
          'https://www.apollo247.com/covid19/article/what-safety-precautions-should-employees-returning-work-after-lockdown-take'
        }
        title={props.title}
      >
        <FacebookIcon size={32} round />
      </FacebookShareButton>
    </div>
  );
};
