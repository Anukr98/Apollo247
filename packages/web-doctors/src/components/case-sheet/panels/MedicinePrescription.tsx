import React from 'react';
import { Theme, Typography, makeStyles, Paper, Grid} from '@material-ui/core';
import {AphTextField, AphButton, AphDialog, AphDialogTitle } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    textAlign: 'left',
    color: theme.palette.text.secondary,
    marginBottom: 12,
    backgroundColor: '#f7f7f7',
    border: '1px solid rgba(2,71,91,0.1)',
    padding: '12px 40px 12px 12px',
    maxWidth: 288,
    borderRadius: 5,
    position:'relative',
    '& h5':{
      fontSize: 14,
      color: '#02475b',
      margin: 0,
      fontWeight: 600,
    },
    '& h6':{
      fontSize: 12,
      color: '#02475b',
      margin: 0,
      fontWeight: 'normal'
    }
  },
  activeCard:{
    border: '1px solid #00b38e',
    backgroundColor: '#fff',
  },
  checkImg:{
    position: 'absolute',
    right: 16,
    top:16,
  },
  // inActiveCard:{
  //   //border: '1px solid black',
  // },
  btnAddDoctor: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    color: theme.palette.action.selected,
    fontSize: 14,
    fontWeight: theme.typography.fontWeightBold,
    // pointerEvents: 'none',
    paddingLeft: 4,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  medicineHeading:{
    fontSize: 14,
    fontWeight: 500,
    lineHeight:'normal',
    color:'rgba(2, 71, 91, 0.6)',
    marginBottom:12,
  },
  backArrow: {
    cursor: 'pointer',
    position: 'absolute',
    left: 0,
    top: -2,
    '& img': {
      verticalAlign: 'middle',
    },
  },
  // dialogBoxClose:{
  //   display: 'none !important',
  // },
  dialogActions: {
    padding: 20,
    paddingTop: 10,
    boxShadow: '0 -5px 20px 0 #ffffff',
    position: 'relative',
    textAlign: 'center',
    '& button': {
      borderRadius: 10,
      width: 288,
    },
  },
  shadowHide: {
    overflow: 'hidden',
  },
  dialogContent: {
    padding: 20,
    minHeight: 450,
    
  },
  popupHeading:{
    '& h6': {
      fontSize:13,
      color: '#01475b',
      fontWeight:600,
      textAlign: 'left',
    },
  },
  popupHeadingCenter:{
    '& h6': {
      fontSize:13,
      color: '#01475b',
      fontWeight:600,
      textAlign: 'center',
    },
  }
}));
export const MedicinePrescription: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [showDosage, setShowDosage] = React.useState<boolean>(false);
  const classes = useStyles();
  // const showDosage = () =>{

  // }
  return <div className={classes.root}>
    <div className={classes.medicineHeading}>Medicines</div>
  <Grid container spacing={1}>
    <Grid item xs={6}>
    <Paper className={`${classes.paper} ${classes.activeCard}`}>
      <h5>Acetamenophen 1.5% w/w</h5>
      <h6>2 times a day (morning, night) for 1 week</h6>
      <img className={classes.checkImg} src={require('images/ic_selected.svg')} alt="" />
    </Paper>
    <Paper className={`${classes.paper}`}>
      <h5>Dextromethorphan (generic)</h5>
      <h6>4 times a day (morning, afternoon, evening, night) for 5 days after food</h6>
      <img className={classes.checkImg} src={require('images/ic_unselected.svg')} alt="" />
    </Paper>
    <AphButton
      variant="contained"
      color="primary"
      classes={{ root: classes.btnAddDoctor }}
      onClick={() => setIsDialogOpen(true)}
    >
      <img src={require('images/ic_add.svg')} alt="" /> ADD Medicine
    </AphButton>
    </Grid>
    <Grid item xs={4}></Grid>
  </Grid>
  <AphDialog open={isDialogOpen} maxWidth="md">
    <AphDialogTitle className={!showDosage ? classes.popupHeading :  classes.popupHeadingCenter}>
    {showDosage && (<div className={classes.backArrow} onClick={() => setShowDosage(false)}>
        <img src={require('images/ic_back.svg')} alt="" />
      </div>)
    }
      {showDosage ? 'IBUGESIC PLUS, 1.5% WWA' : 'ADD MEDICINE'}
    </AphDialogTitle>
    <div className={classes.shadowHide}>
    {!showDosage ? <div>
        <div className={classes.dialogContent}>
          <AphTextField placeholder="search" />
          <div className={classes.dialogActions}>
            <AphButton color="primary" onClick={() => setShowDosage(true)}>Select Medicine</AphButton>
          </div>
        </div>
        
      </div> : <div>
        <div className={classes.dialogContent}>
          <span style={{color: "#ff0000"}}>Second popup</span>
        </div>
      </div>
    }
    </div>
  </AphDialog>
</div>;
};
