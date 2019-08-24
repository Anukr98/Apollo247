import React from 'react';
import { Theme, makeStyles, Paper, Grid, FormHelperText, Modal, Button } from '@material-ui/core';
import { AphTextField, AphButton, AphDialogTitle } from '@aph/web-ui-components';
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
  medicinePopup: {
    width: 480,
    margin: '30px auto 0 auto',
    boxShadow: 'none',
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
  btnAddDoctor: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    color: theme.palette.action.selected,
    fontSize: 14,
    fontWeight: theme.typography.fontWeightBold,
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
  cross: {
    position: 'absolute',
    right: 0,
    top: -9,
    fontSize: 18,
    color: '#02475b',
  },
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
  helpText: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  medicineDilog: {
    '& .dialogBoxClose': {
      display: 'none !important',
    },
  },
}));

interface SlotsObject {
  id: string;
  value: string;
  selected: boolean;
}
interface MedicineObject {
  id: string;
  value: string;
  name: string;
  times: number;
  daySlots: string;
  duration: string;
  selected: boolean;
}
interface errorObject {
  daySlotErr: boolean;
  tobeTakenErr: boolean;
  durationErr: boolean;
}
export const MedicinePrescription: React.FC = () => {
  const classes = useStyles();
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [showDosage, setShowDosage] = React.useState<boolean>(false);
  const [errorState, setErrorState] = React.useState<errorObject>({
    daySlotErr: false,
    tobeTakenErr: false,
    durationErr: false,
  });
  const [consumptionDuration, setConsumptionDuration] = React.useState<string>('');
  const [tabletsCount, setTabletsCount] = React.useState<number>(1);
  const [daySlots, setDaySlots] = React.useState<SlotsObject[]>([
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
  const [toBeTakenSlots, setToBeTakenSlots] = React.useState<SlotsObject[]>([
    {
      id: 'afterfood',
      value: 'After Food',
      selected: false,
    },
    {
      id: 'beforefood',
      value: 'Before Food',
      selected: false,
    },
  ]);
  const [selectedMedicines, setSelectedMedicines] = React.useState<MedicineObject[]>([
    {
      id: '1',
      value: 'Acetamenophen 1.5% w/w',
      name: 'Acetamenophen 1.5% w/w',
      times: 2,
      daySlots: 'morning, night',
      duration: '1 week',
      selected: false,
    },
    {
      id: '2',
      value: 'Dextromethorphan (generic)',
      name: 'Dextromethorphan (generic)',
      times: 4,
      daySlots: 'morning, afternoon, evening, night',
      duration: '5 days after food',
      selected: true,
    },
  ]);
  const daySlotsToggleAction = (slotId: string) => {
    const slots = daySlots.map(function (slot: SlotsObject) {
      if (slotId === slot.id) {
        slot.selected = !slot.selected;
      }
      return slot;
    });
    setDaySlots(slots);
  };

  const toBeTakenSlotsToggleAction = (slotId: string) => {
    const slots = toBeTakenSlots.map(function (slot: SlotsObject) {
      if (slotId === slot.id) {
        slot.selected = !slot.selected;
      }
      return slot;
    });
    setToBeTakenSlots(slots);
  };
  const selectedMedicinesHtml = selectedMedicines.map(
    (_medicine: MedicineObject | null, index: number) => {
      const medicine = _medicine!;
      return (
        <Paper key={index} className={`${classes.paper} ${classes.activeCard}`}>
          <h5>{medicine.name}</h5>
          <h6>
            {medicine.times} times a day ({medicine.daySlots}) for {medicine.duration}
          </h6>
          <img
            className={classes.checkImg}
            src={
              medicine.selected
                ? require('images/ic_selected.svg')
                : require('images/ic_unselected.svg')
            }
            alt="chkUncheck"
          />
        </Paper>
      );
    }
  );
  const daySlotsHtml = daySlots.map((_daySlotitem: SlotsObject | null, index: number) => {
    const daySlotitem = _daySlotitem!;
    return (
      <button
        key={daySlotitem.id}
        className={daySlotitem.selected ? classes.activeBtn : ''}
        onClick={() => {
          daySlotsToggleAction(daySlotitem.id);
        }}
      >
        {daySlotitem.value}
      </button>
    );
  });
  const addUpdateMedicines = () => {
    const isTobeTakenSelected = toBeTakenSlots.filter(function (slot: SlotsObject) {
      return slot.selected !== false;
    });
    const daySlotsSelected = daySlots.filter(function (slot: SlotsObject) {
      return slot.selected !== false;
    });
    if (daySlotsSelected.length === 0) {
      setErrorState({ ...errorState, daySlotErr: true, tobeTakenErr: false, durationErr: false });
    } else if (isTobeTakenSelected.length === 0) {
      setErrorState({ ...errorState, tobeTakenErr: true, daySlotErr: false, durationErr: false });
    } else if (consumptionDuration === '') {
      setErrorState({ ...errorState, durationErr: true, daySlotErr: false, tobeTakenErr: false });
    } else {
      setErrorState({ ...errorState, durationErr: false, daySlotErr: false, tobeTakenErr: false });
      alert('Api Call to submit action');
      setIsDialogOpen(false);
    }
  };
  const tobeTakenHtml = toBeTakenSlots.map((_tobeTakenitem: SlotsObject | null, index: number) => {
    const tobeTakenitem = _tobeTakenitem!;
    return (
      <button
        key={tobeTakenitem.id}
        className={tobeTakenitem.selected ? classes.activeBtn : ''}
        onClick={() => {
          toBeTakenSlotsToggleAction(tobeTakenitem.id);
        }}
      >
        {tobeTakenitem.value}
      </button>
    );
  });
  return (
    <div className={classes.root}>
      <div className={classes.medicineHeading}>Medicines</div>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          {selectedMedicinesHtml}
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
      <Modal
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.medicinePopup}>
          <AphDialogTitle
            className={!showDosage ? classes.popupHeading : classes.popupHeadingCenter}
          >
            {showDosage && (
              <div className={classes.backArrow} onClick={() => setShowDosage(false)}>
                <img src={require('images/ic_back.svg')} alt="" />
              </div>
            )}
            {showDosage ? 'IBUGESIC PLUS, 1.5% WWA' : 'ADD MEDICINE'}
            <Button className={classes.cross}>
              <img
                src={require('images/ic_cross.svg')}
                alt=""
                onClick={() => setIsDialogOpen(false)}
              />
            </Button>
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
                        <img
                          src={require('images/ic_minus.svg')}
                          alt="removeBtn"
                          onClick={() => {
                            if (tabletsCount > 1) {
                              setTabletsCount(tabletsCount - 1);
                            }
                          }}
                        />
                        <span className={classes.tabletcontent}>{tabletsCount} tablets</span>
                        <img
                          src={require('images/ic_plus.svg')}
                          alt="addbtn"
                          onClick={() => {
                            if (tabletsCount > 0 && tabletsCount < 5) {
                              setTabletsCount(tabletsCount + 1);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h6>Time of the Day</h6>
                      <div className={classes.numberTablets}>{daySlotsHtml}</div>
                      {errorState.daySlotErr && (
                        <FormHelperText
                          className={classes.helpText}
                          component="div"
                          error={errorState.daySlotErr}
                        >
                          Please select to be day slot.
                      </FormHelperText>
                      )}
                    </div>
                    <div>
                      <h6>To be taken</h6>
                      <div className={classes.numberTablets}>{tobeTakenHtml}</div>
                      {errorState.tobeTakenErr && (
                        <FormHelperText
                          className={classes.helpText}
                          component="div"
                          error={errorState.tobeTakenErr}
                        >
                          Please select to be taken.
                      </FormHelperText>
                      )}
                    </div>
                    <div>
                      <h6>Duration of Consumption</h6>
                      <div className={classes.numberTablets}>
                        <AphTextField
                          placeholder=""
                          value={consumptionDuration}
                          onChange={(event) => {
                            setConsumptionDuration(event.target.value);
                          }}
                          error={errorState.durationErr}
                        />
                        {errorState.durationErr && (
                          <FormHelperText
                            className={classes.helpText}
                            component="div"
                            error={errorState.durationErr}
                          >
                            Please Enter something
                        </FormHelperText>
                        )}
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
                      onClick={() => {
                        setIsDialogOpen(false);
                      }}
                    >
                      Cancel
                  </AphButton>
                    <AphButton
                      color="primary"
                      onClick={() => {
                        addUpdateMedicines();
                      }}
                    >
                      Select Medicine
                  </AphButton>
                  </div>
                </div>
              )}
          </div>
        </Paper>
      </Modal>
    </div>
  );
};
