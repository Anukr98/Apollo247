import React, { useState, useEffect, useContext } from 'react';
import {
  Theme,
  makeStyles,
  Paper,
  FormHelperText,
  Modal,
  MenuItem,
  Button,
  createStyles,
  CircularProgress,
} from '@material-ui/core';
import { AphTextField, AphButton, AphDialogTitle, AphSelect } from '@aph/web-ui-components';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import axios from 'axios';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import _uniqueId from 'lodash/uniqueId';
import Scrollbars from 'react-custom-scrollbars';

const apiDetails = {
  url: process.env.PHARMACY_MED_SEARCH_URL,
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  medicineDatailsUrl: `${process.env.PHARMACY_MED_PROD_URL}/popcsrchpdp_api.php`,
};

interface OptionType {
  label: string;
  sku: string;
}

let suggestions: OptionType[] = [];

function renderInputComponent(inputProps: any) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <AphTextField
      className={classes.inputContainer}
      autoFocus
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    suggestionsContainer: {
      position: 'relative',
    },
    suggestionPopover: {
      boxShadow: 'none',
      maxHeight: 355,
      overflowY: 'auto',
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      color: '#02475b',
    },
    suggestionsList: {
      margin: 0,
      padding: 0,
      listStyleType: 'none',
      overflow: 'hidden',
      borderRadius: '0 0 0 10px',
    },
    suggestionItem: {
      fontSize: 18,
      fontWeight: 500,
      paddingLeft: 20,
      paddingRight: 7,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      '& >div': {
        borderBottom: '1px solid rgba(2,71,91,0.1)',
        paddingTop: 10,
        paddingBottom: 10,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        position: 'relative',
        paddingRight: 30,
      },
      '&:last-child': {
        '& >div': {
          borderBottom: 'none',
        },
      },
      '& img': {
        position: 'absolute',
        right: 0,
        display: 'none',
        top: '50%',
        marginTop: -12,
      },
      '&:hover': {
        backgroundColor: '#f0f4f5',
        '& img': {
          display: 'block',
        },
      },
    },
    suggestionHighlighted: {
      backgroundColor: '#f0f4f5',
      '& img': {
        display: 'block',
      },
    },
    inputContainer: {
      padding: 20,
      paddingBottom: 0,
    },
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
    numberOfTimes: {
      width: '100%',
      margin: '0 0 20px 0',
      '& > div': {
        '& > div': {
          '&:focus': {
            transition: 'all 0.2s',
            backgroundColor: 'rgba(240, 244, 245, 0.3)',
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
          },
        },
      },
    },
    instructionsWrapper: {
      padding: '0 0 8px 0 !important',
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
      top: 15,
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
      alignItems: 'flex-start',
      '& button': {
        boxShadow: 'none',
        borderRadius: 0,
        backgroundColor: 'transparent',
        padding: 0,
        marginLeft: 12,
        minWidth: 'auto',
        '&:first-child': {
          marginTop: 4,
        },
      },
    },
    medicinePopup: {
      width: 480,
      margin: '60px auto 0 auto',
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
      minHeight: 400,
      position: 'relative',
    },
    loader: {
      left: '50%',
      top: '45%',
      position: 'absolute',
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
        padding: '15px 20px 0 20px',
        paddingBottom: 0,
      },
      '& input': {
        paddingRight: 30,
      },
    },
    addNewMedicine: {
      padding: 20,
      color: '#02475b',
      fontSize: 16,
    },
    inputRoot: {
      paddingRight: 35,
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e',
      },
      '& input': {
        fontSize: 15,
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
      top: 0,
      marginTop: -8,
      minWidth: 'auto',
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
    daysOfWeek: {
      '& button:last-child': {
        border: '1px solid #e50000',
        color: '#e50000',
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
    activeBtnRed: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
      fontWeight: 600,
      cursor: 'pointer',
      '&:last-child': {
        backgroundColor: '#e50000 !important',
        color: '#fff !important',
        border: '1px solid #e50000 !important',
      },
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
      '& > div': {
        paddingTop: '3px !important',
      },
    },
    focusInputs: {
      '&:focus': {
        transition: 'all 0.2s',
        backgroundColor: 'rgba(240, 244, 245, 0.3)',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
      },
      '& input': {
        '&:focus': {
          transition: 'all 0.2s',
          backgroundColor: 'rgba(240, 244, 245, 0.3)',
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        },
      },
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
interface PharmaOverview {
  generic: string;
  Doseform: any;
  Unit: string;
  Strength: string;
  Strengh: string;
  Overview:
    | {
        Caption: string;
        CaptionDesc: string;
      }[]
    | string;
}
export interface MedicineProductDetails extends MedicineProduct {
  PharmaOverview: PharmaOverview[];
}
export interface MedicineProduct {
  description: string;
  id: number;
  category_id: string;
  image: string | null;
  is_in_stock: boolean;
  is_prescription_required: '0' | '1'; //1 for required
  name: string;
  price: number;
  special_price: number | string;
  sku: string;
  small_image?: string | null;
  status: number;
  thumbnail: string | null;
  type_id: string;
  mou: string;
  manufacturer: string;
  PharmaOverview: PharmaOverview[];
}
export interface MedicineProductDetailsResponse {
  productdp: MedicineProductDetails[];
  message?: string;
}

export interface MedicineProductsResponse {
  product_count: number;
  products: MedicineProduct[];
}
let cancel: any;

export const MedicinePrescription: React.FC = () => {
  const classes = useStyles({});
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
  const [medicineUnit, setMedicineUnit] = React.useState<string>('OTHERS');
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
    {
      id: 'AS_NEEDED',
      value: 'As Needed',
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
  const OtherTypes = [
    'SYRUP',
    'DROPS',
    'CAPSULE',
    'INJECTION',
    'TABLET',
    'BOTTLE',
    'SUSPENSION',
    'ROTACAPS',
    'SACHET',
    'ML',
    'OTHERS',
  ];
  const gelLotionOintmentTypes = [
    'POWDER',
    'CREAM',
    'SOAP',
    'GEL',
    'LOTION',
    'SPRAY',
    'OINTMENT',
    'OTHERS',
  ];
  const dosageFrequency = [
    {
      id: 'ONCE_A_DAY',
      value: 'Once a day',
      selected: false,
    },
    {
      id: 'TWICE_A_DAY',
      value: 'Twice a day',
      selected: false,
    },
    {
      id: 'THRICE_A_DAY',
      value: 'Thrice a day',
      selected: false,
    },
    {
      id: 'FOUR_TIMES_A_DAY',
      value: 'Four times a day',
      selected: false,
    },
    {
      id: 'FIVE_TIMES_A_DAY',
      value: 'Five times a day',
      selected: false,
    },
    {
      id: 'AS_NEEDED',
      value: 'As Needed',
      selected: false,
    },
  ];
  const forOptions = [
    {
      id: 'DAYS',
      value: 'Day(s)',
      selected: false,
    },
    {
      id: 'WEEKS',
      value: 'Week(s)',
      selected: false,
    },
    {
      id: 'MONTHS',
      value: 'Month(s)',
      selected: false,
    },
  ];
  const [selectedMedicines, setSelectedMedicines] = React.useState<MedicineObject[]>([]);

  const [searchInput, setSearchInput] = useState('');
  const [isSuggestionFetched, setIsSuggestionFetched] = useState(true);
  const [medicine, setMedicine] = useState('');
  const [frequency, setFrequency] = useState(dosageFrequency[0].id);
  const [forUnit, setforUnit] = useState(forOptions[0].id);

  function getSuggestions(value: string) {
    return suggestions;
  }
  const [medicineForm, setMedicineForm] = useState<string>('OTHERS');
  const getMedicineDetails = (suggestion: OptionType) => {
    const CancelToken = axios.CancelToken;
    setLoading(true);
    axios
      .post(
        apiDetails.medicineDatailsUrl,
        { params: suggestion.sku },
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
        if (
          result &&
          result.data &&
          result.data.productdp &&
          result.data.productdp.length > 0 &&
          result.data.productdp[0] &&
          result.data.productdp[0].PharmaOverview &&
          result.data.productdp[0].PharmaOverview.length > 0 &&
          result.data.productdp[0].PharmaOverview[0].Doseform &&
          OtherTypes.indexOf(result.data.productdp[0].PharmaOverview[0].Doseform) > -1
        ) {
          setMedicineUnit(result.data.productdp[0].PharmaOverview[0].Doseform);
          setMedicineForm('OTHERS');
        } else if (
          result &&
          result.data &&
          result.data.productdp &&
          result.data.productdp.length > 0 &&
          result.data.productdp[0] &&
          result.data.productdp[0].PharmaOverview &&
          result.data.productdp[0].PharmaOverview.length > 0 &&
          result.data.productdp[0].PharmaOverview[0].Doseform &&
          gelLotionOintmentTypes.indexOf(result.data.productdp[0].PharmaOverview[0].Doseform) > -1
        ) {
          setMedicineUnit(result.data.productdp[0].PharmaOverview[0].Doseform);
          setMedicineForm('GEL_LOTION_OINTMENT');
        } else {
          setMedicineUnit('OTHERS');
          setMedicineForm('GEL_LOTION_OINTMENT');
        }
        setShowDosage(true);
        setSelectedValue(suggestion.label);
        setSelectedId(suggestion.sku);
        setMedicine('');
        setTabletsCount(1);
        setLoading(false);
        setConsumptionDuration('');
      })
      .catch((error) => {
        if (error.toString().includes('404')) {
          //setIsSuggestionFetched(false);
          setLoading(false);
        }
      });
  };
  function renderSuggestion(suggestion: OptionType, { query }: Autosuggest.RenderSuggestionParams) {
    const matches = match(suggestion.label, query);
    const parts = parse(suggestion.label, matches);

    return (
      medicine.length > 2 && (
        <div>
          {parts.map((part) => (
            <span
              key={part.text}
              style={{
                fontWeight: part.highlight ? 500 : 400,
                whiteSpace: 'pre',
              }}
              title={suggestion.label}
            >
              {part.text.length > 46
                ? part.text.substring(0, 45).toLowerCase() + '...'
                : part.text.toLowerCase()}
            </span>
          ))}
          <img src={require('images/ic_dark_plus.svg')} alt="" />
        </div>
      )
    );
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
        if (selectedSlot.toLowerCase() === slot.id.toLowerCase()) {
          slot.selected = true;
        }
      });
      return slot;
    });
    setDaySlots(dayslots);
    if (selectedMedicinesArr && selectedMedicinesArr[idx]) {
      setMedicineInstruction(selectedMedicinesArr![idx].medicineInstructions!);
      setConsumptionDuration(selectedMedicinesArr![idx].medicineConsumptionDurationInDays!);
      setTabletsCount(Number(selectedMedicinesArr![idx].medicineDosage!));
      setMedicineUnit(selectedMedicinesArr![idx].medicineUnit!);
      setSelectedValue(selectedMedicinesArr![idx].medicineName!);
      setSelectedId(selectedMedicinesArr![idx].id!);
      setFrequency(
        selectedMedicinesArr[idx].medicineFrequency!
          ? selectedMedicinesArr[idx].medicineFrequency!
          : dosageFrequency[0].id
      );
      setforUnit(
        selectedMedicinesArr[idx].medicineConsumptionDurationUnit!
          ? selectedMedicinesArr[idx].medicineConsumptionDurationUnit!
          : forOptions[0].id
      );
      setMedicineForm(
        selectedMedicinesArr[idx].medicineFormTypes!
          ? selectedMedicinesArr[idx].medicineFormTypes!
          : 'OTHERS'
      );
      setIsDialogOpen(true);
      setShowDosage(true);
      setIsUpdate(true);
      setIdx(idx);
    }
  };
  useEffect(() => {
    if (idx >= 0) {
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
        const medicineObj = selectedMedicines;
        medicineObj!.push(inputParams);
        setSelectedMedicines(medicineObj);
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
    const tobeTakenObjectList: any = [];
    value.map((slot: any) => {
      const tobeTakenObject = slot.replace('_', ' ').toLowerCase();
      tobeTakenObjectList.push(tobeTakenObject);
    });
    return tobeTakenObjectList;
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
  const term = (value: string, char: string) => {
    let changedString = value.substring(0, value.length - 1);
    return changedString + char;
  };
  // console.log(selectedMedicines);
  const selectedMedicinesHtml = selectedMedicinesArr!.map(
    (_medicine: any | null, index: number) => {
      const medicine = _medicine!;
      const duration =
        medicine.medicineConsumptionDurationInDays &&
        ` for ${Number(medicine.medicineConsumptionDurationInDays)} ${
          medicine.medicineConsumptionDurationUnit
            ? term(medicine.medicineConsumptionDurationUnit.toLowerCase(), '(s)')
            : 'day(s)'
        } `;
      const whenString =
        medicine.medicineToBeTaken.length > 0
          ? toBeTaken(medicine.medicineToBeTaken)
              .join(', ')
              .toLowerCase()
          : '';
      const unitHtmls =
        medicine.medicineUnit[medicine.medicineUnit.length - 1].toLowerCase() === 's'
          ? term(
              medicine.medicineUnit.toLowerCase(),
              medicine.medicineFormTypes === 'OTHERS' ? '(s)' : ''
            )
          : medicine.medicineUnit.toLowerCase() +
            (medicine.medicineFormTypes === 'OTHERS' ? '(s)' : '');
      const isInDuration =
        medicine.medicineTimings.length === 1 && medicine.medicineTimings[0] === 'AS_NEEDED'
          ? ''
          : 'in the ';
      let timesString =
        medicine.medicineTimings.length > 0
          ? isInDuration +
            medicine.medicineTimings
              .join(' , ')
              .toLowerCase()
              .replace('_', ' ')
          : '';
      if (timesString && timesString !== '') {
        timesString = timesString.replace(/,(?=[^,]*$)/, 'and');
      }
      const dosageCount = medicine.medicineDosage;
      const takeApplyHtml = medicine.medicineFormTypes === 'OTHERS' ? 'Take' : 'Apply';
      const unitHtml = `${unitHtmls}`;
      return (
        <div key={index} className={classes.medicineBox}>
          <div key={_uniqueId('med_id_')}>
            <div className={classes.medicineName}>{medicine.medicineName}</div>
            <div className={classes.medicineInfo}>
              {`${takeApplyHtml} ${
                dosageCount && medicine.medicineFormTypes === 'OTHERS' ? dosageCount : ''
              } ${unitHtml} ${
                medicine.medicineFrequency
                  ? medicine.medicineFrequency
                      .split('_')
                      .join(' ')
                      .toLowerCase()
                  : dosageFrequency[0].id
                      .split('_')
                      .join(' ')
                      .toLowerCase()
              } ${duration} ${whenString.length > 0 ? whenString : ''} ${
                timesString.length > 0 ? timesString : ''
              }`}
            </div>
            {medicine.medicineInstructions && (
              <div className={classes.medicineInfo}>{medicine.medicineInstructions}</div>
            )}
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
        className={daySlotitem.selected ? classes.activeBtnRed : ''}
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
        //daySlotsArr.push(slot.value.toUpperCase());
        daySlotsArr.push(slot.value.toUpperCase().replace(' ', '_'));
      }
      return slot.selected !== false;
    });
    if (tabletsCount && isNaN(Number(tabletsCount))) {
      setErrorState({
        ...errorState,
        tobeTakenErr: false,
        daySlotErr: false,
        durationErr: false,
        dosageErr: true,
      });
    } else if (consumptionDuration && isNaN(Number(consumptionDuration))) {
      setErrorState({
        ...errorState,
        durationErr: true,
        daySlotErr: false,
        tobeTakenErr: false,
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
        medicineFrequency: frequency,
        medicineConsumptionDurationUnit: forUnit,
        medicineFormTypes: medicineForm,
        id: selectedId,
        medicineUnit: medicineUnit,
      };

      const inputParams: any = {
        id: selectedId,
        value: selectedValue,
        name: selectedValue,
        times: daySlotsSelected.length,
        daySlots: `${daySlotsArr.join(',').toLowerCase()}`,
        duration: `${consumptionDuration} day(s) ${toBeTaken(toBeTakenSlotsArr).join(',')}`,
        selected: true,
        medicineUnit: medicineUnit,
        medicineFrequency: frequency,
        medicineConsumptionDurationUnit: forUnit,
        medicineFormTypes: medicineForm,
      };
      if (isUpdate) {
        const medicineArray = selectedMedicinesArr;
        medicineArray!.splice(idx, 1, inputParamsArr);
        setSelectedMedicinesArr(medicineArray);
        const medicineObj = selectedMedicines;
        medicineObj.splice(idx, 1, inputParams);
        setSelectedMedicines(medicineObj);
      } else {
        const medicineArray = selectedMedicinesArr;
        medicineArray!.push(inputParamsArr);
        setSelectedMedicinesArr(medicineArray);
        const medicineObj = selectedMedicines;
        medicineObj.push(inputParams);
        setSelectedMedicines(medicineObj);
      }
      setIsDialogOpen(false);
      setIsUpdate(false);
      setShowDosage(false);
      resetOptions();

      setMedicineInstruction('');
      setConsumptionDuration('');
      setTabletsCount(1);
      setSelectedValue('');
      setSelectedId('');
      setMedicineUnit('OTHERS');
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

    if (event.nativeEvent.type === 'input' && newValue.length > 2) {
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
  const generateMedicineTypes =
    medicineForm === 'OTHERS'
      ? OtherTypes.map((value: string, index: number) => {
          return (
            <MenuItem
              key={index.toString()}
              classes={{
                selected: classes.menuSelected,
              }}
              value={value}
            >
              {value.toLowerCase()}
            </MenuItem>
          );
        })
      : gelLotionOintmentTypes.map((value: string, index: number) => {
          return (
            <MenuItem
              key={index.toString()}
              classes={{
                selected: classes.menuSelected,
              }}
              value={value}
            >
              {value.toLowerCase()}
            </MenuItem>
          );
        });

  const generateFrequency = dosageFrequency.map((dosageObj: SlotsObject, index: number) => {
    return (
      <MenuItem
        key={index.toString()}
        classes={{
          selected: classes.menuSelected,
        }}
        value={dosageObj.id}
      >
        {dosageObj.value}
      </MenuItem>
    );
  });
  const forOptionHtml = forOptions.map((optionObj: SlotsObject, index: number) => {
    return (
      <MenuItem
        key={index.toString()}
        classes={{
          selected: classes.menuSelected,
        }}
        value={optionObj.id}
      >
        {optionObj.value}
      </MenuItem>
    );
  });

  const resetOptions = () => {
    setFrequency(dosageFrequency[0].id);
    setforUnit(forOptions[0].id);
    setMedicineForm('OTHERS');
    const dayslots = daySlots.map((slot: SlotsObject) => {
      slot.selected = false;
      return slot;
    });
    setDaySlots(dayslots);
    const slots = toBeTakenSlots.map((slot: SlotsObject) => {
      slot.selected = false;
      return slot;
    });
    setToBeTakenSlots(slots);
  };
  const horizontal = medicineForm ? 'right' : 'left';
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
              <Button onClick={() => setShowDosage(false)} className={classes.backArrow}>
                <img src={require('images/ic_back.svg')} alt="" />
              </Button>
            )}
            {showDosage ? (
              <div className={classes.selectedMedicine}>{selectedValue.toUpperCase()}</div>
            ) : (
              'ADD MEDICINE'
            )}
            <AphButton
              className={classes.dialogClose}
              onClick={() => {
                setIsDialogOpen(false);
                setShowDosage(false);
              }}
            >
              <img src={require('images/ic_cross.svg')} alt="" />
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
                    getMedicineDetails(suggestion);
                  }}
                  {...autosuggestProps}
                  inputProps={{
                    classes,
                    color: 'primary',
                    id: 'react-autosuggest-simple',
                    placeholder: 'Search',
                    value: state.single,
                    onChange: handleChange('single'),
                    onKeyPress: (e) => {
                      if (e.which == 13 || e.keyCode == 13) {
                        if (suggestions.length === 1) {
                          setState({
                            single: '',
                            popper: '',
                          });
                          getMedicineDetails(suggestions[0]);
                        }
                      }
                    },
                  }}
                  theme={{
                    container: classes.suggestionsContainer,
                    suggestionsList: classes.suggestionsList,
                    suggestion: classes.suggestionItem,
                    suggestionHighlighted: classes.suggestionHighlighted,
                  }}
                  renderSuggestionsContainer={(options) => (
                    <Paper
                      {...options.containerProps}
                      square
                      classes={{ root: classes.suggestionPopover }}
                    >
                      {options.children}
                    </Paper>
                  )}
                />
                {medicine.trim().length > 2 && !loading && (
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
                {loading ? <CircularProgress className={classes.loader} /> : null}
              </div>
            ) : (
              <div>
                <Scrollbars autoHide={true} style={{ height: 'calc(65vh' }}>
                  <div className={classes.dialogContent}>
                    <div className={classes.sectionGroup}>
                      <div className={classes.colGroup}>
                        {medicineForm === 'OTHERS' && (
                          <div className={classes.divCol}>
                            <div className={`${classes.sectionTitle} ${classes.noPadding}`}>
                              Take
                            </div>
                            <AphTextField
                              className={classes.focusInputs}
                              autoFocus
                              inputProps={{ maxLength: 6 }}
                              value={tabletsCount === 0 ? '' : tabletsCount}
                              onChange={(event: any) => {
                                setTabletsCount(event.target.value);
                              }}
                              error={errorState.dosageErr}
                            />
                            {errorState.dosageErr && (
                              <FormHelperText
                                className={classes.helpText}
                                component="div"
                                error={errorState.dosageErr}
                              >
                                Please enter valid number
                              </FormHelperText>
                            )}
                          </div>
                        )}
                        <div className={classes.divCol}>
                          <div className={`${classes.sectionTitle} ${classes.noPadding}`}>
                            {medicineForm !== 'OTHERS' ? 'Apply' : ''}
                          </div>
                          {medicineForm == 'OTHERS' && (
                            <div className={`${classes.sectionTitle} ${classes.noPadding}`}>
                              &nbsp;
                            </div>
                          )}
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
                              inputProps={{
                                classes: {
                                  root: classes.focusInputs,
                                },
                              }}
                              onChange={(e: any) => {
                                setMedicineUnit(e.target.value as string);
                              }}
                            >
                              {generateMedicineTypes}
                            </AphSelect>
                          </div>
                        </div>
                        {medicineForm !== 'OTHERS' && (
                          <div className={classes.divCol}>
                            {medicineForm !== 'OTHERS' && (
                              <div className={`${classes.sectionTitle} ${classes.noPadding}`}>
                                &nbsp;
                              </div>
                            )}
                            <AphSelect
                              style={{ paddingTop: 3 }}
                              value={frequency}
                              MenuProps={{
                                classes: {
                                  paper: classes.menuPaper,
                                },
                                anchorOrigin: {
                                  vertical: 'bottom',
                                  horizontal: horizontal,
                                },
                                transformOrigin: {
                                  vertical: 'top',
                                  horizontal: horizontal,
                                },
                              }}
                              inputProps={{
                                classes: { root: classes.focusInputs },
                              }}
                              onChange={(e: any) => {
                                setFrequency(e.target.value as string);
                              }}
                            >
                              {generateFrequency}
                            </AphSelect>
                          </div>
                        )}
                      </div>
                    </div>
                    {medicineForm === 'OTHERS' && (
                      <div className={classes.sectionGroup}>
                        <div className={classes.unitsSelect}>
                          <div className={classes.numberOfTimes}>
                            <AphSelect
                              style={{ paddingTop: 3 }}
                              value={frequency}
                              MenuProps={{
                                classes: {
                                  paper: classes.menuPaper,
                                },
                                anchorOrigin: {
                                  vertical: 'bottom',
                                  horizontal: horizontal,
                                },
                                transformOrigin: {
                                  vertical: 'top',
                                  horizontal: horizontal,
                                },
                              }}
                              onChange={(e: any) => {
                                setFrequency(e.target.value as string);
                              }}
                            >
                              {generateFrequency}
                            </AphSelect>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={classes.sectionGroup}>
                      <div className={classes.colGroup}>
                        <div className={classes.divCol}>
                          <div className={`${classes.sectionTitle} ${classes.noPadding}`}>For</div>
                          <AphTextField
                            className={classes.focusInputs}
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
                              Please enter valid number
                            </FormHelperText>
                          )}
                        </div>
                        <div className={classes.divCol}>
                          <div className={`${classes.sectionTitle} ${classes.noPadding}`}>
                            &nbsp;
                          </div>
                          <AphSelect
                            style={{ paddingTop: 3 }}
                            value={forUnit}
                            MenuProps={{
                              classes: {
                                paper: classes.menuPaper,
                              },
                              anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                              },
                              transformOrigin: {
                                vertical: 'top',
                                horizontal: 'left',
                              },
                            }}
                            inputProps={{
                              classes: {
                                root: classes.focusInputs,
                              },
                            }}
                            onChange={(e: any) => {
                              setforUnit(e.target.value as string);
                            }}
                          >
                            {forOptionHtml}
                          </AphSelect>
                        </div>
                      </div>
                    </div>
                    <div className={classes.sectionGroup}>
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
                    <div className={classes.sectionGroup}>
                      <div className={classes.sectionTitle}>Time of the Day</div>
                      <div className={`${classes.numberTablets} ${classes.daysOfWeek}`}>
                        {daySlotsHtml}
                      </div>
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
                      <div
                        className={`${classes.sectionTitle} ${classes.noPadding} ${classes.instructionsWrapper}`}
                      >
                        Instructions/Notes
                      </div>
                      <div className={classes.numberTablets}>
                        <AphTextField
                          multiline
                          placeholder="Eg. Route of Administration, Gaps in Dosage, etc."
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
