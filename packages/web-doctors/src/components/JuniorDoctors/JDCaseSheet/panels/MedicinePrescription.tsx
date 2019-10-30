import React, { useState, useEffect, useContext } from 'react';
import {
  Theme,
  makeStyles,
  Paper,
  FormHelperText,
  Modal,
  MenuItem,
  createStyles,
  CircularProgress,
} from '@material-ui/core';
import { AphTextField, AphButton, AphDialogTitle, AphSelect } from '@aph/web-ui-components';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { isEmpty, trim, deburr } from 'lodash';
import axios from 'axios';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import _uniqueId from 'lodash/uniqueId';
import Scrollbars from 'react-custom-scrollbars';

const apiDetails = {
  url: process.env.PHARMACY_MED_SEARCH_URL,
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
};

interface OptionType {
  label: string;
  sku: string;
}

let suggestions: OptionType[] = [];

function renderInputComponent(inputProps: any) {
  const { classes, inputRef = () => { }, ref, ...other } = inputProps;

  return (
    <AphTextField
      placeholder="Search"
      fullWidth
      InputProps={{
        inputRef: (node: any) => {
          ref(node);
          inputRef(node);
        },
        classes: {
          root: classes.inputRoot,
        },
      }}
      {...other}
    />
  );
}

function renderSuggestion(
  suggestion: OptionType,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const matches = match(suggestion.label, query);
  const parts = parse(suggestion.label, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      {parts.map((part) => (
        <span key={part.text} style={{ fontWeight: part.highlight ? 500 : 400, whiteSpace: 'pre' }}>
          {part.text}
        </span>
      ))}
      <img src={require('images/ic-add.svg')} alt="" />
    </MenuItem>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: 0,
    },
    sectionGroup: {
      padding: 0,
    },
    sectionTitle: {
      color: '#02475b',
      opacity: 0.6,
      fontSize: 14,
      fontWeight: 500,
      letterSpacing: 0.02,
      paddingBottom: 5,
    },
    sectionBody: {
      '& >div:last-child': {
        marginBottom: 6,
      },
    },
    addBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      padding: 0,
      marginTop: 12,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        marginRight: 8,
      },
    },
    darkGreenaddBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      position: 'absolute',
      top: 20,
      right: 20,
      padding: 0,
      minWidth: 'auto',
      '&:hover': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    },
    medicineBox: {
      borderRadius: 5,
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      padding: 12,
      display: 'flex',
      marginTop: 6,
      marginBottom: 12,
    },
    medicineName: {
      fontSize: 14,
      fontWeight: 600,
      color: '#02475b',
      wordBreak: 'break-word',
    },
    medicineInfo: {
      fontSize: 12,
      fontWeight: 'normal',
      letterSpacing: 0.02,
      lineHeight: 1.17,
      color: '#02475b',
    },
    actionGroup: {
      marginLeft: 'auto',
      display: 'flex',
      '& button': {
        boxShadow: 'none',
        borderRadius: 0,
        backgroundColor: 'transparent',
        padding: 0,
        marginLeft: 12,
        minWidth: 'auto',
      },
    },
    medicinePopup: {
      width: 480,
      margin: '30px auto 0 auto',
      boxShadow: 'none',
      '&:focus': {
        outline: 'none',
      },
    },
    dialogTitle: {
      '& h6': {
        fontSize: 13,
        color: '#01475b',
        fontWeight: 600,
        textAlign: 'center',
      },
    },
    dialogClose: {
      position: 'absolute',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      padding: 0,
      right: 0,
      top: -5,
      minWidth: 'auto',
    },
    searchFrom: {
      padding: 0,
      position: 'relative',
    },
    loaderDiv: {
      textAlign: 'center',
      margin: 'auto',
      paddingTop: 20,
    },
    dialogContent: {
      padding: 20,
      position: 'relative',
      '& h6': {
        fontSize: 14,
        fontWeight: 500,
        color: 'rgba(2, 71, 91, 0.6)',
        marginBottom: 10,
        marginTop: 0,
        lineHeight: 'normal',
      },
    },
    autoSuggestBox: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 10,
      '& >div:first-child': {
        padding: 20,
        paddingBottom: 0,
      },
      '& input': {
        paddingRight: 30,
      },
    },
    searchpopup: {
      boxShadow: 'none',
      '& ul': {
        padding: 0,
        margin: 0,
        '& li': {
          padding: 0,
          listStyleType: 'none',
          position: 'relative',
          '&:after': {
            content: '""',
            height: 1,
            left: 20,
            right: 20,
            bottom: 0,
            position: 'absolute',
            backgroundColor: 'rgba(2, 71, 91, 0.15)',
          },
          '& >div': {
            padding: '10px 66px 10px 20px',
            fontSize: 18,
            fontWeight: 500,
            color: '#02475b',
            '&:hover': {
              backgroundColor: '#f0f4f5 !important',
            },
            '&:focus': {
              backgroundColor: '#f0f4f5 !important',
            },
            '& span:nth-child(2)': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
            '& img': {
              position: 'absolute',
              right: 20,
              display: 'none',
            },
          },
          '&:last-child': {
            '&:after': {
              display: 'none',
            },
          },
          '&:hover': {
            '& >div': {
              '& img': {
                display: 'block',
              },
            },
          },
        },
      },
    },
    addNewMedicine: {
      padding: 20,
      color: '#02475b',
      fontSize: 16,
    },
    inputRoot: {
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e',
      },
      '& input': {
        fontSize: 18,
        fontWeight: 500,
        color: '#02475b',
        paddingTop: 0,
      },
      '&:hover': {
        '&:before': {
          borderBottom: '2px solid #00b38e !important',
        },
        '&:after': {
          borderBottom: '2px solid #00b38e !important',
        },
      },
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
    dialogActions: {
      padding: '16px 20px',
      boxShadow: '0 -5px 20px 0 rgba(128, 128, 128, 0.2)',
      position: 'relative',
      textAlign: 'right',
      fontSize: 14,
      fontWeight: 600,
      '& button': {
        borderRadius: 10,
        minwidth: 130,
        padding: '8px 20px',
        fontSize: 14,
        fontWeight: 600,
      },
    },
    updateBtn: {
      backgroundColor: '#fc9916 !important',
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
    popupHeading: {
      '& h6': {
        fontSize: 13,
        color: '#01475b',
        fontWeight: 600,
        textAlign: 'left',
      },
    },
    numberTablets: {
      fontSize: 16,
      color: '#02475b',
      fontWeight: 500,
      marginBottom: 20,
      '& button': {
        border: '1px solid #00b38e',
        padding: '5px 13px',
        fontSize: 12,
        fontWeight: 'normal',
        borderRadius: 14,
        marginRight: 15,
        color: '#00b38e',
        backgroundColor: '#fff',
        boxShadow: 'none',
        textTransform: 'none',
        minWidth: 'auto',
        lineHeight: '12px',
        '&:focus': {
          outline: 'none',
        },
      },
    },
    tabletcontent: {
      margin: '0 10px',
      position: 'relative',
      top: -5,
    },
    activeBtn: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
      fontWeight: 600,
      cursor: 'pointer',
    },
    helpText: {
      paddingLeft: 0,
      paddingRight: 20,
      paddingBottom: 10,
    },
    selectedMedicine: {
      paddingLeft: 35,
      paddingRight: 35,
      wordBreak: 'break-word',
    },
    colGroup: {
      display: 'flex',
      '& >div:first-child': {
        paddingRight: 20,
      },
      '& >div:last-child': {
        paddingLeft: 20,
      },
    },
    divCol: {
      marginBottom: 20,
      width: '50%',
    },
    tobeTakenGroup: {
      '& button:last-child': {
        marginRight: 0,
      },
    },
    noPadding: {
      paddingBottom: 0,
    },
    menuPaper: {
      width: 200,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.8)',
      marginTop: 34,
      '& ul': {
        padding: 0,
        '& li': {
          minHeight: 'auto',
          color: '#02475b',
          fontSize: 16,
          fontWeight: 500,
          '&:hover': {
            backgroundColor: '#fff',
          },
        },
      },
    },
    menuSelected: {
      backgroundColor: '#f0f4f5 !important',
      color: '#02475b !important',
      fontWeight: 'bold',
    },
    unitsSelect: {
      marginTop: -7,
    },
  })
);

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
interface MedicineObjectArr {
  medicineConsumptionDurationInDays: string;
  medicineDosage: any;
  medicineInstructions: string;
  medicineTimings: [];
  medicineToBeTaken: [];
  medicineName: string;
  id: string;
}
interface errorObject {
  daySlotErr: boolean;
  tobeTakenErr: boolean;
  durationErr: boolean;
  dosageErr: boolean;
}

let cancel: any;

export const MedicinePrescription: React.FC = () => {
  const classes = useStyles();
  const {
    medicinePrescription: selectedMedicinesArr,
    setMedicinePrescription: setSelectedMedicinesArr,
  } = useContext(CaseSheetContextJrd);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [showDosage, setShowDosage] = React.useState<boolean>(false);
  const [idx, setIdx] = React.useState();
  const [isUpdate, setIsUpdate] = React.useState(false);
  const [medicineInstruction, setMedicineInstruction] = React.useState<string>('');
  const [errorState, setErrorState] = React.useState<errorObject>({
    daySlotErr: false,
    tobeTakenErr: false,
    durationErr: false,
    dosageErr: false,
  });
  const { caseSheetEdit } = useContext(CaseSheetContextJrd);
  const [consumptionDuration, setConsumptionDuration] = React.useState<string>('');
  const [tabletsCount, setTabletsCount] = React.useState<number>(1);
  const [medicineUnit, setMedicineUnit] = React.useState<string>('TABLET');
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

  const [loading, setLoading] = useState<boolean>(false);

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
  const [selectedMedicines, setSelectedMedicines] = React.useState<MedicineObject[]>([]);

  const [searchInput, setSearchInput] = useState('');
  const [isSuggestionFetched, setIsSuggestionFetched] = useState(true);
  const [medicine, setMedicine] = useState('');

  function getSuggestions(value: string) {
    return suggestions;
  }
  const fetchMedicines = async (value: any) => {
    const CancelToken = axios.CancelToken;
    cancel && cancel();
    setLoading(true);
    const FinalSearchdata: any = [];
    await axios
      .post(
        apiDetails.url,
        { params: value },
        {
          headers: {
            Authorization: apiDetails.authToken,
            Accept: '*/*',
          },
          cancelToken: new CancelToken(function executor(c) {
            // An executor function receives a cancel function as a parameter
            cancel = c;
          }),
        }
      )
      .then((result) => {
        const medicines = result.data.products ? result.data.products : [];
        medicines.forEach((res: any) => {
          const data = { label: '', sku: '' };
          data.label = res.name;
          data.sku = res.sku;
          FinalSearchdata.push(data);
        });
        suggestions = FinalSearchdata;
        setSearchInput(value);
        setLoading(false);
        if (FinalSearchdata.length === 0) {
          setIsSuggestionFetched(false);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (error.toString().includes('404')) {
          setIsSuggestionFetched(false);
          setLoading(false);
        }
      });
    setLoading(false);
  };
  const deletemedicine = (idx: any) => {
    selectedMedicines.splice(idx, 1);
    setSelectedMedicines(selectedMedicines);
    selectedMedicinesArr!.splice(idx, 1);
    setSelectedMedicinesArr(selectedMedicinesArr);
    const sum = idx + Math.random();
    setIdx(sum);
  };
  const updateMedicine = (idx: any) => {
    const slots = toBeTakenSlots.map((slot: SlotsObject) => {
      selectedMedicinesArr![idx].medicineToBeTaken!.map((selectedSlot: any) => {
        const selectedValue = selectedSlot.replace('_', '');
        if (selectedValue.toLowerCase() === slot.id) {
          slot.selected = true;
        }
      });
      return slot;
    });
    setToBeTakenSlots(slots);

    const dayslots = daySlots.map((slot: SlotsObject) => {
      selectedMedicinesArr![idx].medicineTimings!.map((selectedSlot: any) => {
        if (selectedSlot.toLowerCase() === slot.id) {
          slot.selected = true;
        }
      });
      return slot;
    });
    setDaySlots(dayslots);

    setMedicineInstruction(selectedMedicinesArr![idx].medicineInstructions!);
    setConsumptionDuration(selectedMedicinesArr![idx].medicineConsumptionDurationInDays!);
    setTabletsCount(Number(selectedMedicinesArr![idx].medicineDosage!));
    setMedicineUnit(selectedMedicinesArr![idx].medicineUnit!);
    setSelectedValue(selectedMedicinesArr![idx].medicineName!);
    setSelectedId(selectedMedicinesArr![idx].id!);
    setIsDialogOpen(true);
    setShowDosage(true);
    setIsUpdate(true);
    setIdx(idx);
  };
  useEffect(() => {
    if (idx >= 0) {
      console.log(11111111111111);
      setSelectedMedicines(selectedMedicines);
      setSelectedMedicinesArr(selectedMedicinesArr);
    }
  }, [selectedMedicines, idx, selectedMedicinesArr]);
  function getSuggestionValue(suggestion: OptionType) {
    return suggestion.label;
  }
  useEffect(() => {
    if (selectedMedicinesArr && selectedMedicinesArr!.length) {
      // console.log(selectedMedicinesArr, selectedMedicinesArr.length);
      selectedMedicinesArr!.forEach((res: any) => {
        const inputParamsArr: any = {
          medicineConsumptionDurationInDays: res.medicineConsumptionDurationInDays,
          medicineDosage: String(res.medicineDosage),
          medicineInstructions: res.medicineInstructions,
          medicineTimings: res.medicineTimings,
          medicineToBeTaken: res.medicineToBeTaken,
          medicineName: res.medicineName,
          id: res.id,
          medicineUnit: res.medicineUnit,
        };
        const inputParams: any = {
          id: res.medicineName.trim(),
          value: res.medicineName,
          name: res.medicineName,
          times: res.medicineTimings.length,
          daySlots: res.medicineTimings.join(' , ').toLowerCase(),
          duration: `${Number(res.medicineConsumptionDurationInDays)} days ${toBeTaken(
            res.medicineToBeTaken
          )
            .join(',')
            .toLowerCase()}`,
          selected: true,
          medicineUnit: res.medicineUnit,
        };
        // const xArr = selectedMedicinesArr;
        // xArr!.push(inputParamsArr);
        // setSelectedMedicinesArr(xArr);
        const x = selectedMedicines;
        x!.push(inputParams);
        setSelectedMedicines(x);
      });
    }
  }, [selectedMedicinesArr]);
  useEffect(() => {
    if (searchInput.length > 2) {
      setSuggestions(getSuggestions(searchInput));
    }
  }, [searchInput]);

  const daySlotsToggleAction = (slotId: string) => {
    const slots = daySlots.map((slot: SlotsObject) => {
      if (slotId === slot.id) {
        slot.selected = !slot.selected;
      }
      return slot;
    });
    setDaySlots(slots);
  };
  const toBeTaken = (value: any) => {
    const arry: any = [];
    value.map((slot: any) => {
      const x = slot.replace('_', ' ').toLowerCase();
      arry.push(x);
    });
    return arry;
  };
  const toBeTakenSlotsToggleAction = (slotId: string) => {
    const slots = toBeTakenSlots.map((slot: SlotsObject) => {
      if (slotId === slot.id) {
        slot.selected = !slot.selected;
      }
      return slot;
    });
    setToBeTakenSlots(slots);
  };
  // console.log(selectedMedicines);
  const selectedMedicinesHtml = selectedMedicinesArr!.map(
    (_medicine: any | null, index: number) => {
      const medicine = _medicine!;
      const duration = `${Number(medicine.medicineConsumptionDurationInDays)} days`;
      const whenString =
        medicine.medicineToBeTaken.length > 0
          ? toBeTaken(medicine.medicineToBeTaken)
            .join(', ')
            .toLowerCase()
          : '';
      const unitHtml =
        medicine!.medicineUnit && medicine!.medicineUnit !== 'NA'
          ? medicine.medicineUnit.toLowerCase()
          : 'times';
      const timesString =
        medicine.medicineTimings.length > 0
          ? '(' + medicine.medicineTimings.join(' , ').toLowerCase() + ')'
          : '';
      const dosageCount = medicine.medicineTimings.length > 0 ? parseInt(medicine.medicineDosage) * medicine.medicineTimings.length : medicine.medicineDosage;
      return (
        <div key={index} className={classes.medicineBox}>
          <div key={_uniqueId('med_id_')}>
            <div className={classes.medicineName}>{medicine.medicineName}</div>
            <div className={classes.medicineInfo}>
              {/*medicine.medicineTimings.length*/}
              {dosageCount} {unitHtml} a day {timesString.length > 0 && timesString} for{' '}
              {duration} {whenString.length > 0 && whenString}
            </div>
          </div>
          <div className={classes.actionGroup}>
            <AphButton key={_uniqueId('ok_')} onClick={() => updateMedicine(index)}>
              <img src={caseSheetEdit && require('images/round_edit_24_px.svg')} alt="" />
            </AphButton>
            <AphButton key={_uniqueId('cancel_')} onClick={() => deletemedicine(index)}>
              <img src={caseSheetEdit ? require('images/ic_cancel_green.svg') : ''} alt="" />
            </AphButton>
          </div>
        </div>
      );
    }
  );
  const daySlotsHtml = daySlots.map((_daySlotitem: SlotsObject | null, index: number) => {
    const daySlotitem = _daySlotitem!;
    return (
      <AphButton
        key={daySlotitem.id}
        className={daySlotitem.selected ? classes.activeBtn : ''}
        onClick={() => {
          daySlotsToggleAction(daySlotitem.id);
        }}
      >
        {daySlotitem.value}
      </AphButton>
    );
  });
  const addUpdateMedicines = () => {
    const toBeTakenSlotsArr: any = [];
    const daySlotsArr: any = [];
    const isTobeTakenSelected = toBeTakenSlots.filter((slot: SlotsObject) => {
      if (slot.selected) {
        toBeTakenSlotsArr.push(slot.value.toUpperCase().replace(' ', '_'));
      }
      return slot.selected !== false;
    });
    const daySlotsSelected = daySlots.filter((slot: SlotsObject) => {
      if (slot.selected) {
        daySlotsArr.push(slot.value.toUpperCase());
      }
      return slot.selected !== false;
    });
    if ((tabletsCount && isNaN(Number(tabletsCount))) || Number(tabletsCount) < 1) {
      setErrorState({
        ...errorState,
        tobeTakenErr: false,
        daySlotErr: false,
        durationErr: false,
        dosageErr: true,
      });
    } /* else if (daySlotsSelected.length === 0) {
      setErrorState({
        ...errorState,
        daySlotErr: true,
        tobeTakenErr: false,
        durationErr: false,
        dosageErr: false,
      });
    }*/ else if (
      isEmpty(trim(consumptionDuration)) ||
      isNaN(Number(consumptionDuration)) ||
      Number(consumptionDuration) < 1
    ) {
      setErrorState({
        ...errorState,
        durationErr: true,
        daySlotErr: false,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (isTobeTakenSelected.length === 0) {
      setErrorState({
        ...errorState,
        tobeTakenErr: true,
        daySlotErr: false,
        durationErr: false,
        dosageErr: false,
      });
    } else {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: false,
        tobeTakenErr: false,
        dosageErr: false,
      });
      const inputParamsArr: any = {
        medicineConsumptionDurationInDays: consumptionDuration,
        medicineDosage: String(tabletsCount),
        medicineInstructions: medicineInstruction,
        medicineTimings: daySlotsArr,
        medicineToBeTaken: toBeTakenSlotsArr,
        medicineName: selectedValue,
        id: selectedId,
        medicineUnit: medicineUnit,
      };
      console.log(selectedValue);

      const inputParams: any = {
        id: selectedId,
        value: selectedValue,
        name: selectedValue,
        times: daySlotsSelected.length,
        daySlots: `${daySlotsArr.join(',').toLowerCase()}`,
        duration: `${consumptionDuration} day(s) ${toBeTaken(toBeTakenSlotsArr).join(',')}`,
        selected: true,
        medicineUnit: medicineUnit,
      };
      if (isUpdate) {
        const xArr = selectedMedicinesArr;
        xArr!.splice(idx, 1, inputParamsArr);
        setSelectedMedicinesArr(xArr);
        const x = selectedMedicines;
        x.splice(idx, 1, inputParams);
        setSelectedMedicines(x);
      } else {
        const xArr = selectedMedicinesArr;
        xArr!.push(inputParamsArr);
        setSelectedMedicinesArr(xArr);
        const x = selectedMedicines;
        x.push(inputParams);
        setSelectedMedicines(x);
      }
      console.log(selectedMedicines);
      setIsDialogOpen(false);
      setIsUpdate(false);
      setShowDosage(false);
      const slots = toBeTakenSlots.map((slot: SlotsObject) => {
        slot.selected = false;
        return slot;
      });
      setToBeTakenSlots(slots);

      const dayslots = daySlots.map((slot: SlotsObject) => {
        slot.selected = false;
        return slot;
      });
      setDaySlots(dayslots);
      setMedicineInstruction('');
      setConsumptionDuration('');
      setTabletsCount(1);
      setSelectedValue('');
      setSelectedId('');
      setMedicineUnit('TABLET');
    }
  };

  const tobeTakenHtml = toBeTakenSlots.map((_tobeTakenitem: SlotsObject | null, index: number) => {
    const tobeTakenitem = _tobeTakenitem!;
    return (
      <AphButton
        key={tobeTakenitem.id}
        className={tobeTakenitem.selected ? classes.activeBtn : ''}
        onClick={() => {
          toBeTakenSlotsToggleAction(tobeTakenitem.id);
        }}
      >
        {tobeTakenitem.value}
      </AphButton>
    );
  });

  const [state, setState] = React.useState({
    single: '',
    popper: '',
  });
  const [stateSuggestions, setSuggestions] = React.useState<OptionType[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>('');

  const handleSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleChange = (name: keyof typeof state) => (
    event: React.ChangeEvent<{}>,
    { newValue }: Autosuggest.ChangeEvent
  ) => {
    setLoading(false);
    setMedicine(newValue);
    if (newValue.length > 2) {
      fetchMedicines(newValue);
    }
    setState({
      ...state,
      [name]: newValue,
    });
  };

  const autosuggestProps = {
    renderInputComponent,
    suggestions: stateSuggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
  };

  return (
    <div className={classes.root}>
      <div className={classes.sectionGroup}>
        <div className={classes.sectionTitle}>Medicines</div>
        <div className={classes.sectionBody}>{selectedMedicinesHtml}</div>
        {caseSheetEdit && (
          <AphButton
            color="primary"
            classes={{ root: classes.addBtn }}
            onClick={() => setIsDialogOpen(true)}
          >
            <img src={require('images/ic_dark_plus.svg')} alt="" /> Add Medicine
          </AphButton>
        )}
      </div>
      <Modal
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.medicinePopup}>
          <AphDialogTitle className={!showDosage ? classes.popupHeading : classes.dialogTitle}>
            {showDosage && (
              <div className={classes.backArrow} onClick={() => setShowDosage(false)}>
                <img src={require('images/ic_back.svg')} alt="" />
              </div>
            )}
            {showDosage ? (
              <div className={classes.selectedMedicine}>{selectedValue.toUpperCase()}</div>
            ) : (
                'ADD MEDICINE'
              )}
            <AphButton className={classes.dialogClose}>
              <img
                src={require('images/ic_cross.svg')}
                alt=""
                onClick={() => {
                  setIsDialogOpen(false);
                  setShowDosage(false);
                }}
              />
            </AphButton>
          </AphDialogTitle>
          <div className={classes.shadowHide}>
            {!showDosage ? (
              <div className={classes.searchFrom}>
                <Autosuggest
                  onSuggestionSelected={(e, { suggestion }) => {
                    setState({
                      single: '',
                      popper: '',
                    });
                    setShowDosage(true);
                    setSelectedValue(suggestion.label);
                    setSelectedId(suggestion.sku);
                    setMedicine('');
                    setLoading(false);
                  }}
                  {...autosuggestProps}
                  inputProps={{
                    classes,
                    color: 'primary',
                    id: 'react-autosuggest-simple',
                    placeholder: 'Search',
                    value: state.single,

                    onChange: handleChange('single'),
                  }}
                  theme={{
                    container: classes.autoSuggestBox,
                  }}
                  renderSuggestionsContainer={(options) => (
                    <Scrollbars autoHide={true} style={{ height: 'calc(45vh' }}>
                      <Paper {...options.containerProps} square className={classes.searchpopup}>
                        {options.children}
                        {loading ? (
                          <div className={classes.loaderDiv}>
                            <CircularProgress />
                          </div>
                        ) : null}
                      </Paper>
                    </Scrollbars>
                  )}
                />
                {medicine.length > 2 && !loading && (
                  <AphButton
                    className={classes.darkGreenaddBtn}
                    onClick={() => {
                      setState({
                        single: '',
                        popper: '',
                      });
                      setShowDosage(true);
                      setSelectedValue(medicine);
                      setSelectedId('');
                      setLoading(false);
                      setMedicine('');
                    }}
                  >
                    <img src={require('images/ic_add_circle.svg')} alt="" />
                  </AphButton>
                )}
              </div>
            ) : (
                <div>
                  <Scrollbars autoHide={true} style={{ height: 'calc(45vh' }}>
                    <div className={classes.dialogContent}>
                      <div className={classes.sectionGroup}>
                        <div className={classes.colGroup}>
                          <div className={classes.divCol}>
                            <div className={`${classes.sectionTitle} ${classes.noPadding}`}>
                              Dosage*
                          </div>
                            <AphTextField
                              inputProps={{ maxLength: 6 }}
                              value={tabletsCount}
                              onChange={(event: any) => {
                                setTabletsCount(event.target.value);
                              }}
                            />
                            {errorState.dosageErr && (
                              <FormHelperText
                                className={classes.helpText}
                                component="div"
                                error={errorState.durationErr}
                              >
                                Please Enter Dosage(Number only)
                            </FormHelperText>
                            )}
                          </div>
                          <div className={classes.divCol}>
                            <div className={`${classes.sectionTitle} ${classes.noPadding}`}>
                              Units*
                          </div>
                            <div className={classes.unitsSelect}>
                              <AphSelect
                                value={medicineUnit}
                                MenuProps={{
                                  classes: {
                                    paper: classes.menuPaper,
                                  },
                                  anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                  },
                                  transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'right',
                                  },
                                }}
                                onChange={(e: any) => {
                                  setMedicineUnit(e.target.value as string);
                                }}
                              >
                                <MenuItem value="TABLET" classes={{ selected: classes.menuSelected }}>
                                  tablet
                              </MenuItem>
                                <MenuItem
                                  value="CAPSULE"
                                  classes={{ selected: classes.menuSelected }}
                                >
                                  capsule
                              </MenuItem>
                                <MenuItem value="ML" classes={{ selected: classes.menuSelected }}>
                                  ml
                              </MenuItem>
                                <MenuItem value="DROPS" classes={{ selected: classes.menuSelected }}>
                                  drops
                              </MenuItem>
                                <MenuItem value="NA" classes={{ selected: classes.menuSelected }}>
                                  NA
                              </MenuItem>
                              </AphSelect>
                            </div>
                          </div>
                        </div>
                        {/**
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
                      **/}
                      </div>
                      <div className={classes.sectionGroup}>
                        <div className={classes.colGroup}>
                          <div className={classes.divCol}>
                            <div className={`${classes.sectionTitle} ${classes.noPadding}`}>
                              Duration of Consumption*
                          </div>
                            <AphTextField
                              placeholder=""
                              inputProps={{ maxLength: 6 }}
                              value={consumptionDuration}
                              onChange={(event: any) => {
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
                                Please Enter Duration in days(Number only)
                            </FormHelperText>
                            )}
                          </div>
                          <div className={classes.divCol}>
                            <div className={classes.sectionTitle}>To be taken</div>
                            <div className={`${classes.numberTablets} ${classes.tobeTakenGroup}`}>
                              {tobeTakenHtml}
                            </div>
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
                        </div>
                      </div>
                      <div className={classes.sectionGroup}>
                        <div className={classes.sectionTitle}>Time of the Day*</div>
                        <div className={classes.numberTablets}>{daySlotsHtml}</div>
                        {errorState.daySlotErr && (
                          <FormHelperText
                            className={classes.helpText}
                            component="div"
                            error={errorState.daySlotErr}
                          >
                            Please select time of the Day.
                        </FormHelperText>
                        )}
                      </div>
                      <div className={classes.sectionGroup}>
                        <div className={`${classes.sectionTitle} ${classes.noPadding}`}>
                          Instructions (if any)
                      </div>
                        <div className={classes.numberTablets}>
                          <AphTextField
                            value={medicineInstruction}
                            onChange={(event: any) => {
                              setMedicineInstruction(event.target.value);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Scrollbars>
                  <div className={classes.dialogActions}>
                    <AphButton
                      className={classes.cancelBtn}
                      color="primary"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setShowDosage(false);
                      }}
                    >
                      Cancel
                  </AphButton>
                    {isUpdate ? (
                      <AphButton
                        color="primary"
                        onClick={() => {
                          addUpdateMedicines();
                        }}
                      >
                        Update Medicine
                    </AphButton>
                    ) : (
                        <AphButton
                          color="primary"
                          className={classes.updateBtn}
                          onClick={() => {
                            addUpdateMedicines();
                          }}
                        >
                          Add Medicine
                    </AphButton>
                      )}
                  </div>
                </div>
              )}
          </div>
        </Paper>
      </Modal>
    </div>
  );
};
