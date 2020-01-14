import React, { useState, useEffect, useContext } from 'react';
import {
  Theme,
  makeStyles,
  Paper,
  Grid,
  FormHelperText,
  Modal,
  Button,
  MenuItem,
  createStyles,
  CircularProgress,
} from '@material-ui/core';
import { AphTextField, AphButton, AphDialogTitle, AphSelect } from '@aph/web-ui-components';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { isEmpty, trim } from 'lodash';
import axios from 'axios';
import { CaseSheetContext } from 'context/CaseSheetContext';
import Scrollbars from 'react-custom-scrollbars';
import { GET_DOCTOR_FAVOURITE_MEDICINE } from 'graphql/doctors';
import {
  GetDoctorFavouriteMedicineList,
  GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList,
} from 'graphql/types/GetDoctorFavouriteMedicineList';
import { useApolloClient } from 'react-apollo-hooks';

const apiDetails = {
  url: process.env.PHARMACY_MED_SEARCH_URL,
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  medicineDatailsUrl: `${process.env.PHARMACY_MED_UAT_URL}/popcsrchpdp_api.php`,
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
      className={classes.inputField}
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

function renderSuggestion(
  suggestion: OptionType,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const matches = match(suggestion.label, query);
  const parts = parse(suggestion.label, matches);

  return (
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
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    suggestionsContainer: {
      position: 'relative',
      paddingTop: 20,
    },
    suggestionPopover: {
      boxShadow: 'none',
      maxHeight: 355,
      overflowY: 'auto',
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
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
    root: {
      flexGrow: 1,
    },
    mediceneContainer: {
      backgroundColor: 'rgba(0,0,0,0.02)',
      border: '1px solid rgba(2,71,91,0.1)',
      borderRadius: 5,
      padding: '0px 5px',
      position: 'relative',
      '& img': {
        border: '1px solid #00b38e',
        borderRadius: '50%',
        maxWidth: 24,
      },
    },
    paper: {
      textAlign: 'left',
      color: theme.palette.text.secondary,
      padding: '12px 25px 12px 5px',
      borderRadius: 0,
      maxWidth: '100%',
      position: 'relative',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      borderBottom: '1px solid rgba(2,71,91,0.1)',
      '&:last-child': {
        borderBottom: 'none',
      },
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
      margin: '60px auto 0 auto',
      boxShadow: 'none',
      outline: 'none',
    },
    btnAddDoctor: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      paddingLeft: 4,
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
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      position: 'absolute',
      right: 20,
      top: 15,
      padding: 0,
      minWidth: 'auto',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    medicineHeading: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 'normal',
      color: 'rgba(2, 71, 91, 0.6) !important',
      marginBottom: 12,
    },
    favMedBg: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    favmedicineHeading: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 'normal',
      color: 'rgba(2, 71, 91, 0.6) !important',
      marginBottom: 12,
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
    cross: {
      cursor: 'pointer',
      position: 'absolute',
      right: -10,
      top: -9,
      fontSize: 18,
      color: '#02475b',
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
    dialogContent: {
      minHeight: 400,
      position: 'relative',
      padding: 20,
      '& h6': {
        fontSize: 14,
        fontWeight: 500,
        color: 'rgba(2, 71, 91, 0.6)',
        margin: 0,
        lineHeight: 'normal',
      },
    },
    autoSuggestionWrapper: {
      padding: 0,
    },
    popupHeading: {
      '& h6': {
        fontSize: 13,
        color: '#01475b',
        fontWeight: 600,
      },
    },
    popupHeadingCenter: {
      padding: '20px 10px',
      '& h6': {
        fontSize: 13,
        color: '#01475b',
        fontWeight: 600,
        textAlign: 'center',
        padding: '0 50px',
      },
    },
    numberTablets: {
      fontSize: 16,
      color: '#02475b',
      fontWeight: 500,
      marginBottom: 0,
      '& button': {
        border: '1px solid #00b38e',
        padding: '0 10px',
        fontSize: 12,
        fontWeight: 'normal',
        borderRadius: 14,
        marginRight: 15,
        cursor: 'pointer',
        color: '#00b38e',
        backgroundColor: '#fff',
        textTransform: 'none',
        boxShadow: 'none',
        '&:focus': {
          outline: 'none',
        },
      },
    },
    daysInWeek: {
      margin: '0 0 10px 0 !important',
    },
    daysOfWeek: {
      '& button:last-child': {
        border: '1px solid #e50000 !important',
        color: '#e50000',
      },
    },
    instructionText: {
      margin: '0 0 8px 0 !important',
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
    },
    activeBtnRed: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
      fontWeight: 600,
      '&:last-child': {
        backgroundColor: '#e50000 !important',
        color: '#fff',
        border: '1px solid #e50000 !important',
      },
    },
    helpText: {
      paddingLeft: 0,
      paddingRight: 20,
      paddingBottom: 10,
    },
    medicineDilog: {
      '& .dialogBoxClose': {
        display: 'none !important',
      },
    },
    loader: {
      left: '50%',
      top: '45%',
      position: 'absolute',
    },
    updateSymptom: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      top: 5,
      right: 2,
      color: '#666666',
      position: 'absolute',
      fontSize: 14,
      fontWeight: theme.typography.fontWeightBold,
      minWidth: 30,
      padding: '5px 0',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    deleteSymptom: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      top: 5,
      right: 21,
      color: '#666666',
      position: 'absolute',
      fontSize: 14,
      fontWeight: theme.typography.fontWeightBold,
      minWidth: 30,
      padding: '5px 10px',
      '&:hover': {
        backgroundColor: 'transparent',
      },
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
        color: '#02475b !important',
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
    selectDropdown: {
      paddingTop: 3,
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
      marginTop: 0,
      '& div': {
        '&:focus': {
          boxShadow: '0 8px 6px -6px rgba(128, 128, 128, 0.3)',
          transition: 'all 0.2s',
        },
      },
    },
    medicineCard: {
      color: 'rgba(0, 0, 0, 0.54)',
      border: '1px solid rgba(2,71,91,0.1)',
      padding: '12px 40px 12px 12px',
      position: 'relative',
      maxWidth: '100%',
      boxShadow: 'none',
      textAlign: 'left',
      borderRadius: 5,
      marginBottom: 12,
      backgroundColor: 'rgba(0,0,0,0.02)',
      '& h5': {
        color: '#02475b',
        margin: 0,
        fontSize: 14,
        fontWeight: 600,
      },
      '& h6': {
        color: '#02475b',
        margin: 0,
        fontSize: 12,
        fontWeight: 'normal',
      },
    },
    inputField: {
      padding: '0 20px 0 20px',
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
  const classes = useStyles();

  const {
    medicinePrescription: selectedMedicinesArr,
    setMedicinePrescription: setSelectedMedicinesArr,
  } = useContext(CaseSheetContext);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isEditFavMedicine, setIsEditFavMedicine] = React.useState<boolean>(false);
  const [showDosage, setShowDosage] = React.useState<boolean>(false);
  const [idx, setIdx] = React.useState();
  const [isUpdate, setIsUpdate] = React.useState(false);
  const [medicineInstruction, setMedicineInstruction] = React.useState<string>('');
  const [favouriteMedicine, setFavouriteMedicine] = React.useState<
    (GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList | null)[] | null
  >([]);
  const [favMedicineName, setFavMedicineName] = React.useState<string>('');
  const [showAddCondition, setShowAddCondition] = useState<boolean>(false);
  const showAddConditionHandler = (show: boolean) => setShowAddCondition(show);

  const client = useApolloClient();
  useEffect(() => {
    client
      .query<GetDoctorFavouriteMedicineList>({
        query: GET_DOCTOR_FAVOURITE_MEDICINE,
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        setFavouriteMedicine(
          data &&
            data.data &&
            data.data.getDoctorFavouriteMedicineList &&
            data.data.getDoctorFavouriteMedicineList.medicineList
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const [errorState, setErrorState] = React.useState<errorObject>({
    daySlotErr: false,
    tobeTakenErr: false,
    durationErr: false,
    dosageErr: false,
  });
  const { caseSheetEdit } = useContext(CaseSheetContext);
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
  let dosageFrequency = [
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
  let forOptions = [
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
  const [isSuggestionFetched, setIsSuggestionFetched] = useState(true);
  const [medicine, setMedicine] = useState('');
  const [frequency, setFrequency] = useState(dosageFrequency[0].id);
  const [forUnit, setforUnit] = useState(forOptions[0].id);
  const [searchInput, setSearchInput] = useState('');
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
        resetFrequencyFor();
      })
      .catch((error) => {
        if (error.toString().includes('404')) {
          //setIsSuggestionFetched(false);
          setLoading(false);
        }
      });
  };
  const resetFrequencyFor = () => {
    setFrequency(dosageFrequency[0].id);
    setforUnit(forOptions[0].id);
    dosageFrequency = dosageFrequency.map((dosageObj: SlotsObject) => {
      dosageObj.selected = false;
      return dosageObj;
    });
    forOptions = forOptions.map((forObj: SlotsObject) => {
      forObj.selected = false;
      return forObj;
    });
  };
  const toBeTaken = (value: any) => {
    const tobeTakenObjectList: any = [];
    value.map((slot: any) => {
      const tobeTakenObject = slot.replace('_', ' ').toLowerCase();
      tobeTakenObjectList.push(tobeTakenObject);
    });
    return tobeTakenObjectList;
  };

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
      setMedicineInstruction(selectedMedicinesArr[idx].medicineInstructions!);
      setConsumptionDuration(selectedMedicinesArr[idx].medicineConsumptionDurationInDays!);
      setTabletsCount(Number(selectedMedicinesArr[idx].medicineDosage!));
      setMedicineUnit(selectedMedicinesArr[idx].medicineUnit!);
      setSelectedValue(selectedMedicinesArr[idx].medicineName!);
      setSelectedId(selectedMedicinesArr[idx].id!);
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
    }
    setIsDialogOpen(true);
    setShowDosage(true);
    setIsUpdate(true);
    setIdx(idx);
  };
  const updateFavMedicine = (idx: any) => {
    setSelectedValue(idx.medicineName);
    setFavMedicineName(idx.medicineName);
    setTabletsCount(idx.medicineDosage);
    setMedicineUnit(idx.medicineUnit);
    setConsumptionDuration(idx.medicineConsumptionDurationInDays);
    setMedicineInstruction(idx.medicineInstructions);
    setFrequency(idx.medicineFrequency);
    setforUnit(idx.medicineConsumptionDurationUnit);
    setMedicineForm(idx.medicineFormTypes);
    toBeTakenSlots.map((slot: SlotsObject) => {
      idx.medicineToBeTaken.map((selectedSlot: any) => {
        const selectedValue = selectedSlot.replace('_', '');
        if (selectedValue.toLowerCase() === slot.id) {
          slot.selected = true;
        }
        return slot;
      });
    });
    daySlots.map((slot: SlotsObject) => {
      idx.medicineTimings.map((selectedSlot: any) => {
        if (selectedSlot.toLowerCase() === slot.id.toLowerCase()) {
          slot.selected = true;
        }
      });
      return slot;
    });
    setShowDosage(true);
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
      selectedMedicinesArr!.forEach((res: any) => {
        const inputParamsArr: any = {
          medicineConsumptionDurationInDays: res.medicineConsumptionDurationInDays,
          medicineDosage: String(res.medicineDosage),
          medicineInstructions: res.medicineInstructions,
          medicineTimings: res.medicineTimings,
          medicineToBeTaken: res.medicineToBeTaken,
          medicineName: res.medicineName,
          medicineUnit: res.medicineUnit,
          id: res.id,
          medicineFrequency: res.medicineFrequency ? res.medicineFrequency : dosageFrequency[0].id,
          medicineConsumptionDurationUnit: res.medicineConsumptionDurationUnit
            ? res.medicineConsumptionDurationUnit
            : forOptions[0].id,
          medicineFormTypes: res.medicineFormTypes ? res.medicineFormTypes : 'OTHERS',
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
          medicineFrequency: res.medicineFrequency ? res.medicineFrequency : dosageFrequency[0].id,
          medicineConsumptionDurationUnit: res.medicineConsumptionDurationUnit
            ? res.medicineConsumptionDurationUnit
            : forOptions[0].id,
          medicineFormTypes: res.medicineFormTypes ? res.medicineFormTypes : 'OTHERS',
        };
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

  const toBeTakenSlotsToggleAction = (slotId: string) => {
    const slots = toBeTakenSlots.map((slot: SlotsObject) => {
      if (slotId === slot.id) {
        slot.selected = !slot.selected;
      }
      return slot;
    });
    setToBeTakenSlots(slots);
  };

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
        medicineConsumptionDurationInDays: String(consumptionDuration),
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
      setIsEditFavMedicine(false);
      setIsUpdate(false);
      setShowDosage(false);
      resetOptions();

      setMedicineInstruction('');
      setConsumptionDuration('');
      setTabletsCount(1);
      setMedicineUnit('OTHERS');
      setSelectedValue('');
      setSelectedId('');
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
    setMedicine(newValue);
    setLoading(false);
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

  const handleClearRequested = () => {
    resetFrequencyFor();
    const slots = toBeTakenSlots.map((slot: SlotsObject) => {
      slot.selected = false;
      return slot;
    });

    const dayslots = daySlots.map((slot: SlotsObject) => {
      slot.selected = false;
      return slot;
    });

    setToBeTakenSlots(slots);
    setDaySlots(dayslots);
    setMedicineInstruction('');
    setConsumptionDuration('');
    setTabletsCount(1);
    setMedicineUnit('OTHERS');
    setSelectedValue('');
    setSelectedId('');
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
  const term = (value: string, char: string) => {
    let changedString = value.substring(0, value.length - 1);
    return changedString + char;
  };
  const resetOptions = () => {
    resetFrequencyFor();
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
      <Grid container spacing={1}>
        <Grid item lg={6} xs={12}>
          <div className={classes.medicineHeading}>Medicines</div>
          {selectedMedicinesArr!.map((_medicine: any, index: number) => {
            const medicine = _medicine!;
            //const durations = Number(medicine.medicineConsumptionDurationInDays);
            const duration =
              medicine.medicineConsumptionDurationInDays &&
              ` for ${Number(medicine.medicineConsumptionDurationInDays)} ${
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
                ? term(medicine.medicineUnit.toLowerCase(), '(s)')
                : medicine.medicineUnit.toLowerCase() + '(s)';
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
              <div style={{ position: 'relative' }} key={index}>
                <Paper className={classes.medicineCard}>
                  <h5>{medicine.medicineName}</h5>
                  <h6>
                    {`${takeApplyHtml} ${
                      dosageCount && medicine.medicineFormTypes === 'OTHERS' ? dosageCount : ''
                    } ${unitHtml} ${
                      medicine.medicineFrequency
                        ? medicine.medicineFrequency
                            .split('_')
                            .join(' ')
                            .toLowerCase()
                        : dosageFrequency[0].id
                            .split('_')
                            .join(' ')
                            .toLowerCase()
                    }
                    ${duration} ${whenString.length > 0 ? whenString : ''} ${
                      timesString.length > 0 ? timesString : ''
                    }
                    `}
                  </h6>
                  {medicine.medicineInstructions && <h6>{medicine.medicineInstructions}</h6>}
                </Paper>
                {caseSheetEdit && (
                  <AphButton
                    variant="contained"
                    color="primary"
                    classes={{ root: classes.updateSymptom }}
                    onClick={() => updateMedicine(index)}
                  >
                    <img src={require('images/round_edit_24_px.svg')} alt="" />
                  </AphButton>
                )}
                {caseSheetEdit && (
                  <AphButton
                    variant="contained"
                    color="primary"
                    classes={{ root: classes.deleteSymptom }}
                    onClick={() => deletemedicine(index)}
                  >
                    <img src={require('images/ic_cancel_green.svg')} alt="" />
                  </AphButton>
                )}
              </div>
            );
          })}
          {caseSheetEdit && (
            <AphButton
              variant="contained"
              color="primary"
              classes={{ root: classes.btnAddDoctor }}
              onClick={() => setIsDialogOpen(true)}
            >
              <img src={require('images/ic_dark_plus.svg')} alt="" /> ADD Medicine
            </AphButton>
          )}
        </Grid>
        {!showAddCondition && caseSheetEdit && favouriteMedicine && favouriteMedicine.length > 0 && (
          <Grid item lg={6} xs={12}>
            <div className={classes.favmedicineHeading}>Favourite Medicines</div>
            <div className={classes.mediceneContainer}>
              {favouriteMedicine.map((_favMedicine: any, id, index) => {
                const favMedicine = _favMedicine!;
                const favDurations =
                  favMedicine.medicineConsumptionDurationInDays &&
                  ` for ${Number(favMedicine.medicineConsumptionDurationInDays)} ${
                    favMedicine.medicineConsumptionDurationUnit
                      ? term(favMedicine.medicineConsumptionDurationUnit.toLowerCase(), '(s)')
                      : 'day(s)'
                  } `;
                const favWhenString =
                  favMedicine.medicineToBeTaken.length > 0
                    ? toBeTaken(favMedicine.medicineToBeTaken)
                        .join(', ')
                        .toLowerCase()
                    : '';
                //const favUnitHtmls = favMedicine.medicineUnit.toLowerCase();
                const favUnitHtmls =
                  favMedicine.medicineUnit[favMedicine.medicineUnit.length - 1].toLowerCase() ===
                  's'
                    ? term(favMedicine.medicineUnit.toLowerCase(), '(s)')
                    : favMedicine.medicineUnit.toLowerCase() + '(s)';
                const isInDuration =
                  favMedicine.medicineTimings.length === 1 &&
                  favMedicine.medicineTimings[0] === 'AS_NEEDED'
                    ? ''
                    : 'in the ';
                let favTimesString =
                  favMedicine.medicineTimings.length > 0
                    ? isInDuration +
                      favMedicine.medicineTimings
                        .join(' , ')
                        .toLowerCase()
                        .replace('_', ' ')
                    : '';

                if (favTimesString && favTimesString !== '') {
                  favTimesString = favTimesString.replace(/,(?=[^,]*$)/, 'and');
                }
                const favDosageCount = favMedicine.medicineDosage;
                const favTakeApplyHtml =
                  favMedicine.medicineFormTypes === 'OTHERS' ? 'Take' : 'Apply';
                const favUnitHtml = `${favUnitHtmls}`;
                return (
                  <div className={classes.paper} key={id}>
                    <Paper className={classes.favMedBg}>
                      <h5>{favMedicine.medicineName}</h5>
                      <h6>
                        {`${favTakeApplyHtml} ${
                          favDosageCount && favMedicine.medicineFormTypes === 'OTHERS'
                            ? favDosageCount
                            : ''
                        } ${favUnitHtml} ${
                          favMedicine.medicineFrequency
                            ? favMedicine.medicineFrequency
                                .split('_')
                                .join(' ')
                                .toLowerCase()
                            : dosageFrequency[0].id
                                .split('_')
                                .join(' ')
                                .toLowerCase()
                        } ${favDurations} ${favWhenString.length > 0 ? favWhenString : ''} ${
                          favTimesString.length > 0 ? favTimesString : ''
                        }
                    `}
                      </h6>
                    </Paper>
                    <AphButton
                      variant="contained"
                      color="primary"
                      classes={{ root: classes.updateSymptom }}
                      onClick={(id) => {
                        setIsEditFavMedicine(true);
                        updateFavMedicine(favMedicine);
                      }}
                    >
                      <img
                        src={favouriteMedicine && require('images/add_doctor_white.svg')}
                        alt=""
                      />
                    </AphButton>
                  </div>
                );
              })}
            </div>
          </Grid>
        )}
      </Grid>
      {isEditFavMedicine && (
        <Modal
          open={isEditFavMedicine}
          onClose={() => setIsEditFavMedicine(false)}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <Paper className={classes.medicinePopup}>
            <AphDialogTitle
              className={!showDosage ? classes.popupHeading : classes.popupHeadingCenter}
            >
              {showDosage ? favMedicineName.toUpperCase() : 'ADD FAVOURITE MEDICINE'}
              <Button className={classes.cross}>
                <img
                  src={require('images/ic_cross.svg')}
                  alt=""
                  onClick={() => {
                    setIsEditFavMedicine(false);
                    setShowDosage(false);
                    handleClearRequested();
                  }}
                />
              </Button>
            </AphDialogTitle>
            <div>
              <div>
                <Scrollbars autoHide={true} style={{ height: 'calc(60vh' }}>
                  <div className={classes.dialogContent}>
                    <Grid container spacing={2}>
                      {medicineForm === 'OTHERS' && (
                        <Grid item lg={6} md={6} xs={6}>
                          <h6>Take</h6>
                          <AphTextField
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
                        </Grid>
                      )}
                      <Grid item lg={6} md={6} xs={6}>
                        <h6>{medicineForm !== 'OTHERS' ? 'Apply' : ''}</h6>
                        <div className={classes.unitsSelect}>
                          <AphSelect
                            style={{ paddingTop: 3 }}
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
                            {generateMedicineTypes}
                          </AphSelect>
                        </div>
                      </Grid>
                      <Grid
                        item
                        lg={medicineForm === 'OTHERS' ? 12 : 6}
                        md={medicineForm === 'OTHERS' ? 12 : 6}
                        xs={6}
                      >
                        <div className={classes.unitsSelect}>
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
                      </Grid>
                      <Grid item lg={6} md={6} xs={6}>
                        <h6>For</h6>
                        <div className={classes.numberTablets}>
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
                              Please enter valid number
                            </FormHelperText>
                          )}
                        </div>
                      </Grid>
                      <Grid item lg={6} md={6} xs={6}>
                        <h6>&nbsp;</h6>
                        <div className={classes.unitsSelect}>
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
                            onChange={(e: any) => {
                              setforUnit(e.target.value as string);
                            }}
                          >
                            {forOptionHtml}
                          </AphSelect>
                        </div>
                      </Grid>
                      <Grid item lg={6} md={6} xs={12}>
                        <h6>&nbsp;</h6>
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
                      </Grid>
                      <Grid item lg={12} xs={12}>
                        <h6>In The</h6>
                        <div className={`${classes.numberTablets} ${classes.daysOfWeek}`}>
                          {daySlotsHtml}
                        </div>
                        {errorState.daySlotErr && (
                          <FormHelperText
                            className={classes.helpText}
                            component="div"
                            error={errorState.daySlotErr}
                          >
                            Please select time of the day.
                          </FormHelperText>
                        )}
                      </Grid>
                      <Grid item lg={12} xs={12}>
                        <h6 className={classes.instructionText}>Instructions/Notes</h6>
                        <div className={classes.numberTablets}>
                          <AphTextField
                            multiline
                            placeholder="Type here..."
                            value={medicineInstruction}
                            onChange={(event: any) => {
                              setMedicineInstruction(event.target.value);
                            }}
                          />
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                </Scrollbars>
              </div>
              <div className={classes.dialogActions}>
                <AphButton
                  className={classes.cancelBtn}
                  color="primary"
                  onClick={() => {
                    setIsEditFavMedicine(false);
                    setShowDosage(false);
                    setIsUpdate(false);
                    handleClearRequested();
                  }}
                >
                  Cancel
                </AphButton>
                {
                  <AphButton
                    color="primary"
                    className={classes.updateBtn}
                    onClick={() => {
                      addUpdateMedicines();
                    }}
                  >
                    Add Medicine
                  </AphButton>
                }
              </div>
            </div>
          </Paper>
        </Modal>
      )}
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
              <Button onClick={() => setShowDosage(false)} className={classes.backArrow}>
                <img src={require('images/ic_back.svg')} alt="" />
              </Button>
            )}
            {showDosage ? selectedValue.toUpperCase() : 'ADD MEDICINE'}
            <Button
              className={classes.cross}
              onClick={() => {
                setIsDialogOpen(false);
                setShowDosage(false);
                handleClearRequested();
              }}
            >
              <img src={require('images/ic_cross.svg')} alt="" />
            </Button>
          </AphDialogTitle>
          <div className={classes.shadowHide}>
            {!showDosage ? (
              <div className={`${classes.dialogContent} ${classes.autoSuggestionWrapper}`}>
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
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setState({
                        single: '',
                        popper: '',
                      });
                      setShowDosage(true);
                      setSelectedValue(medicine);
                      setSelectedId('IB01');
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
                <div>
                  <Scrollbars autoHide={true} style={{ height: 'calc(65vh' }}>
                    <div className={classes.dialogContent}>
                      <Grid container spacing={2}>
                        {medicineForm === 'OTHERS' && (
                          <Grid item lg={6} md={6} xs={6}>
                            <h6>Take</h6>
                            <AphTextField
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
                          </Grid>
                        )}
                        <Grid item lg={6} md={6} xs={6}>
                          <h6>{medicineForm !== 'OTHERS' ? 'Apply' : ''}</h6>
                          {medicineForm == 'OTHERS' && <h6>&nbsp;</h6>}
                          <div className={classes.unitsSelect}>
                            <AphSelect
                              style={{ paddingTop: 3 }}
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
                              {generateMedicineTypes}
                            </AphSelect>
                          </div>
                        </Grid>
                        <Grid item xs={medicineForm === 'OTHERS' ? 12 : 6}>
                          {medicineForm !== 'OTHERS' && <h6>&nbsp;</h6>}
                          <div className={classes.unitsSelect}>
                            <AphSelect
                              style={{ paddingTop: 3 }}
                              value={frequency}
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
                              onChange={(e: any) => {
                                setFrequency(e.target.value as string);
                              }}
                            >
                              {generateFrequency}
                            </AphSelect>
                          </div>
                        </Grid>

                        <Grid item lg={6} md={6} xs={6}>
                          <h6>For</h6>
                          <div className={classes.numberTablets}>
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
                                Please enter valid number
                              </FormHelperText>
                            )}
                          </div>
                        </Grid>
                        <Grid item lg={6} md={6} xs={6}>
                          <h6>&nbsp;</h6>
                          <div className={classes.unitsSelect}>
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
                              onChange={(e: any) => {
                                setforUnit(e.target.value as string);
                              }}
                            >
                              {forOptionHtml}
                            </AphSelect>
                          </div>
                        </Grid>
                        <Grid item lg={6} md={6} xs={12}>
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
                        </Grid>
                        <Grid item lg={12} xs={12}>
                          <h6 className={classes.daysInWeek}>In the</h6>
                          <div className={`${classes.numberTablets} ${classes.daysOfWeek}`}>
                            {daySlotsHtml}
                          </div>
                          {errorState.daySlotErr && (
                            <FormHelperText
                              className={classes.helpText}
                              component="div"
                              error={errorState.daySlotErr}
                            >
                              Please select time of the day.
                            </FormHelperText>
                          )}
                        </Grid>
                        <Grid item lg={12} xs={12}>
                          <h6 className={classes.instructionText}>Instructions/Notes</h6>
                          <div className={classes.numberTablets}>
                            <AphTextField
                              multiline
                              placeholder="Type here..."
                              value={medicineInstruction}
                              onChange={(event: any) => {
                                setMedicineInstruction(event.target.value);
                              }}
                            />
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  </Scrollbars>
                </div>
                <div className={classes.dialogActions}>
                  <AphButton
                    className={classes.cancelBtn}
                    color="primary"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setShowDosage(false);
                      setIsUpdate(false);
                      handleClearRequested();
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
