import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Header } from 'components/Header';

const useStyles = makeStyles((theme: Theme) => {
  return {
    kaContainer: {},
    // headerCovid: {
    //   position: 'relative',
    //   [theme.breakpoints.down('xs')]: {
    //     '& header': {
    //       display: 'none',
    //     },
    //     '& >div': {
    //       position: 'static',
    //     },
    //   },
    // },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    kaContent: {},
  };
});

const KnowledgeArticleLanding: React.FC = (props: any) => {
  const classes = useStyles({});
  const [isWebView, setIsWebView] = useState<boolean>(false);
  return (
    <div className={classes.kaContainer}>
      <Header backArrowVisible={true} isWebView={isWebView} />

      <div className={classes.container}>
        <div className={classes.kaContent}></div>
      </div>
    </div>
  );
};

export default KnowledgeArticleLanding;
