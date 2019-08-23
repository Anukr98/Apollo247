import React from 'react';
import { Theme, Typography, makeStyles, Paper, Grid } from '@material-ui/core';
import {
  AphTextField,
  AphButton,
  AphDialog,
  AphDialogTitle,
  AphInput,
} from '@aph/web-ui-components';

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
    position: 'relative',
    '& h5': {
      fontSize: 14,
      color: '#02475b',
      margin: 0,
      fontWeight: 600,
    },
    '& h6': {
      fontSize: 12,
      color: '#02475b',
      margin: 0,
      fontWeight: 'normal',
    },
  },
  activeCard: {
    border: '1px solid #00b38e',
    backgroundColor: '#fff',
  },
  checkImg: {
    position: 'absolute',
    right: 16,
    top: 16,
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
  medicineHeading: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 'normal',
    color: 'rgba(2, 71, 91, 0.6)',
    marginBottom: 12,
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
    boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.2)',
    position: 'relative',
    textAlign: 'right',
    '& button': {
      borderRadius: 10,
      minwidth: 130,
      padding: '8px 20px',
    },
  },
  cancelBtn: {
    fontSize: 14,
    fontWeight: 600,
    color: '#fc9916',
    backgroundColor: 'transparent',
    boxShadow: '0 2px 5px 0 rgba(0,0,0,0.2)',
    border: 'none',
    marginRight: 10,
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#fc9916',
    },
  },
  shadowHide: {
    overflow: 'hidden',
  },
  dialogContent: {
    padding: 20,
    minHeight: 450,
    '& h6': {
      fontSize: 14,
      fontWeight: 500,
      color: 'rgba(2, 71, 91, 0.6)',
      marginBottom: 10,
      marginTop: 0,
    },
  },
  popupHeading: {
    '& h6': {
      fontSize: 13,
      color: '#01475b',
      fontWeight: 600,
      textAlign: 'left',
    },
  },
  popupHeadingCenter: {
    '& h6': {
      fontSize: 13,
      color: '#01475b',
      fontWeight: 600,
      textAlign: 'center',
      marginTop: 5,
    },
  },
  numberTablets: {
    fontSize: 16,
    color: '#02475b',
    fontWeight: 500,
    marginBottom: 20,
    '& button': {
      border: '1px solid #00b38e',
      padding: '5px 10px',
      fontSize: 12,
      fontWeight: 'normal',
      borderRadius: 14,
      marginRight: 15,
      color: '#00b38e',
      backgroundColor: '#fff',
    },
  },
  tabletcontent: {
    margin: '0 10px',
    position: 'relative',
    top: -5,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 140,
    '& input': {
      fontSize: 20,
      color: '#02475b',
      fontWeight: theme.typography.fontWeightMedium,
      paddingTop: 0,
      borderBottom: '2px solid #00b38e',
    },
  },
  activeBtn: {
    backgroundColor: '#00b38e !important',
    color: '#fff !important',
  },
}));

interface DaySlotsObject {
  id: string;
  value: string;
  selected: boolean;
}
export const MedicinePrescription: React.FC = () => {
  const classes = useStyles();
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [showDosage, setShowDosage] = React.useState<boolean>(false);
  const [daySlots, setDaySlots] = React.useState<DaySlotsObject[]>([
    {
      id: 'morning',
      value: 'Morning',
      selected: false,
    },
    {
      id: 'noon',
      value: 'Noon',
      selected: false,
    },
    {
      id: 'evening',
      value: 'Evening',
      selected: false,
    },
    {
      id: 'night',
      value: 'Night',
      selected: false,
    },
  ]);
  const daySlotsToggleAction = (slotId: string) =>{
    const slots = daySlots.map(function(slot:DaySlotsObject) {
      if(slotId === slot.id){
        slot.selected = !slot.selected;
      }
      return slot;
    });
    setDaySlots(slots);
  }
  daySlotsToggleAction('evening');
  return (
    <div className={classes.root}>
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
        <AphDialogTitle className={!showDosage ? classes.popupHeading : classes.popupHeadingCenter}>
          {showDosage && (
            <div className={classes.backArrow} onClick={() => setShowDosage(false)}>
              <img src={require('images/ic_back.svg')} alt="" />
            </div>
          )}
          {showDosage ? 'IBUGESIC PLUS, 1.5% WWA' : 'ADD MEDICINE'}
        </AphDialogTitle>
        <div className={classes.shadowHide}>
          {!showDosage ? (
            <div>
              <div className={classes.dialogContent}>
                <AphTextField placeholder="search" />
                <div>
                  <AphButton color="primary" onClick={() => setShowDosage(true)}>
                    Select Medicine
                  </AphButton>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className={classes.dialogContent}>
                <div>
                  <h6>Dosage</h6>
                  <div className={classes.numberTablets}>
                    <img src={require('images/ic_minus.svg')} alt="" />
                    <span className={classes.tabletcontent}>2 tablets</span>
                    <img src={require('images/ic_plus.svg')} alt="" />
                  </div>
                </div>
                <div>
                  <h6>Time of the Day</h6>
                  <div className={classes.numberTablets}>
                    <button className={classes.activeBtn}>Morning</button>
                    <button>Noon</button>
                    <button>Evening</button>
                    <button>Night</button>
                  </div>
                </div>
                <div>
                  <h6>To be taken</h6>
                  <div className={classes.numberTablets}>
                    <button>After food</button>
                    <button>Before food</button>
                  </div>
                </div>
                <div>
                  <h6>Duration of Consumption</h6>
                  <div className={classes.numberTablets}>
                    <AphTextField placeholder="" />
                  </div>
                </div>
                <div>
                  <h6>Instructions (if any)</h6>
                  <div className={classes.numberTablets}>
                    <AphTextField placeholder="search" />
                  </div>
                </div>
              </div>
              <div className={classes.dialogActions}>
                <AphButton
                  className={classes.cancelBtn}
                  color="primary"
                  onClick={() => setShowDosage(true)}
                >
                  Cancel
                </AphButton>
                <AphButton color="primary" onClick={() => setShowDosage(true)}>
                  Select Medicine
                </AphButton>
              </div>
            </div>
          )}
        </div>
      </AphDialog>
    </div>
  );
};
