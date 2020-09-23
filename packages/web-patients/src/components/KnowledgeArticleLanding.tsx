import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import { Header } from 'components/Header';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme: Theme) => {
  return {
    kaContainer: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    kaContent: {
      background: '#f7f8f5',
      padding: 20,
    },
    expansionContainer: {
      padding: '10px 0',
    },
    expansionPanel: {
      boxShadow: 'none',
      borderBottom: '1px solid rgba(2, 71, 91, .3)',
      borderRadius: '0 !important',
      margin: '0 !important',
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    expansionSummary: {
      minHeight: 'auto !important',
      padding: '16px 20px',
      '& svg': {
        color: '#02475b',
      },
      '& >div': {
        margin: '0 !important',
        padding: '0 !important',
      },
    },
    heading: {
      margin: '0 !important',
      width: '100%',
      fontSize: 18,
      fontWeight: 'bold',
    },
    expansionDetails: {
      '& p': {
        fontSize: 16,
        margin: '0 !important',
        color: '#02475b',
        fontFamily: 'IBM Plex Sans,sans-serif !important',
        '& *': {
          color: '#02475b',
          fontFamily: 'IBM Plex Sans,sans-serif !important',
        },
      },
    },
  };
});

const KnowledgeArticleLanding: React.FC = (props: any) => {
  const classes = useStyles({});
  const [isWebView, setIsWebView] = useState<boolean>(false);
  return (
    <div className={classes.kaContainer}>
      <Header backArrowVisible={true} isWebView={isWebView} />

      <div className={classes.container}>
        <div className={classes.kaContent}>
          <ExpansionPanel className={classes.expansionPanel}>
            <ExpansionPanelSummary
              className={classes.expansionSummary}
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Diabetes Management</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div className={classes.expansionDetails}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris id erat nisl. Donec
                eget diam odio. Curabitur rhoncus, ligula et euismod feugiat, nisl elit congue arcu,
                sit amet mattis tellus nisl non enim. Fusce in feugiat orci. In hac habitasse platea
                dictumst. Aenean tincidunt imperdiet diam.
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel className={classes.expansionPanel}>
            <ExpansionPanelSummary
              className={classes.expansionSummary}
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Heart Health</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div className={classes.expansionDetails}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris id erat nisl. Donec
                eget diam odio. Curabitur rhoncus, ligula et euismod feugiat, nisl elit congue arcu,
                sit amet mattis tellus nisl non enim. Fusce in feugiat orci. In hac habitasse platea
                dictumst. Aenean tincidunt imperdiet diam.
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel className={classes.expansionPanel}>
            <ExpansionPanelSummary
              className={classes.expansionSummary}
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Respiratory Conditions</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div className={classes.expansionDetails}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris id erat nisl. Donec
                eget diam odio. Curabitur rhoncus, ligula et euismod feugiat, nisl elit congue arcu,
                sit amet mattis tellus nisl non enim. Fusce in feugiat orci. In hac habitasse platea
                dictumst. Aenean tincidunt imperdiet diam.
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeArticleLanding;
