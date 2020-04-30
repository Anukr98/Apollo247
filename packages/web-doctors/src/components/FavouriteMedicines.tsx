import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  RadioGroup,
} from '@material-ui/core';
import {
  AphTextField,
  AphButton,
  AphDialogTitle,
  AphSelect,
  AphRadio,
} from '@aph/web-ui-components';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import axios from 'axios';
import Scrollbars from 'react-custom-scrollbars';
import { GetDoctorFavouriteMedicineList } from 'graphql/types/GetDoctorFavouriteMedicineList';
import {
  GET_DOCTOR_FAVOURITE_MEDICINE_LIST,
  SAVE_DOCTORS_FAVOURITE_MEDICINE,
  UPDATE_DOCTOR_FAVOURITE_MEDICINE,
  REMOVE_FAVOURITE_MEDICINE,
} from 'graphql/profiles';
import {
  MEDICINE_CONSUMPTION_DURATION,
  MEDICINE_FREQUENCY,
  MEDICINE_FORM_TYPES,
  MEDICINE_UNIT,
  ROUTE_OF_ADMINISTRATION,
} from 'graphql/types/globalTypes';
import { useApolloClient } from 'react-apollo-hooks';
import {
  SaveDoctorsFavouriteMedicine,
  SaveDoctorsFavouriteMedicineVariables,
} from 'graphql/types/SaveDoctorsFavouriteMedicine';
import {
  UpdateDoctorFavouriteMedicine,
  UpdateDoctorFavouriteMedicineVariables,
} from 'graphql/types/UpdateDoctorFavouriteMedicine';

import {
  RemoveFavouriteMedicine,
  RemoveFavouriteMedicineVariables,
} from 'graphql/types/RemoveFavouriteMedicine';
import { GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList } from 'graphql/types/GetDoctorFavouriteMedicineList';
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
    none: {
      display: 'none',
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
    paper: {
      textAlign: 'left',
      color: theme.palette.text.secondary,
      marginBottom: 12,
      backgroundColor: 'rgba(0,0,0,0.02)',
      border: '1px solid rgba(2,71,91,0.1)',
      padding: '12px 40px 12px 12px',
      maxWidth: '100%',
      borderRadius: 5,
      position: 'relative',
      boxShadow: 'none',
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
      outline: '0 !important',
    },
    btnAddDoctor: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      padding: '2px 4px 8px 5px',

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
      position: 'absolute',
      right: -10,
      top: -9,
      fontSize: 18,
      color: '#02475b',
    },
    dialogActions: {
      padding: 10,
      paddingTop: 10,
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
      padding: '20px 0 0 0',
      minHeight: 400,
      position: 'relative',
      '& h6': {
        fontSize: 14,
        fontWeight: 500,
        color: 'rgba(2, 71, 91, 0.6)',
        margin: 0,
        lineHeight: 'normal',
      },
    },
    dialogNewMedicine: {
      padding: 20,
      '& h4': {
        color: '#fc9916',
        fontWeight: 'bold',
        margin: 0,
        cursor: 'pointer',
      },
    },
    radioGroup: {
      '& label': {
        width: '30%',
        color: 'rgba(2, 71, 91, 0.8)',
        fontSize: 14,
        '& span': {
          fontWeight: 500,
          fontSize: 14,
        },
      },
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
        padding: '5px 10px',
        fontSize: 12,
        fontWeight: 'normal',
        borderRadius: 14,
        marginRight: 15,
        color: '#00b38e',
        backgroundColor: '#fff',
        cursor: 'pointer',
        '&:focus': {
          outline: 'none',
        },
      },
    },
    daysOfWeek: {
      margin: '10px 0 0 0 !important',
      '& button:last-child': {
        border: '1px solid #e50000',
        color: '#e50000',
      },
    },
    instructionText: {
      margin: '0 0 10px 0 !important',
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
      left: '45%',
      top: '20%',
      position: 'absolute',
    },
    faverite: {
      fontSize: 16,
      color: '#02475b',
      fontWeight: 600,
      borderBottom: 'none',
      margin: '0 0 10px 0',
    },
    ProfileContainer: {
      paddingLeft: 0,
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: 15,
        paddingTop: 0,
      },
      '& h3': {
        lineHeight: '22px',
        padding: '3px 5px 5px 20px',
      },
      '& h4': {
        padding: '5px 5px 5px 0',
        marginLeft: 20,
        borderBottom: 'solid 0.5px rgba(98,22,64,0.2)',
      },
      '& h5': {
        padding: '5px 5px 3px 20px',
        fontWeight: 500,
      },
      '& h6': {
        color: '#658f9b',
        padding: '5px 5px 0 0',
        letterSpacing: '0.3px',
        marginLeft: 20,
        fontWeight: theme.typography.fontWeightMedium,
        '& span': {
          padding: '0 2px',
        },
      },
    },
    medicineListElement: {
      paddingRight: '60px !important',
    },
    iconRight: {
      position: 'absolute',
      right: 5,
      top: 8,
    },
    inputRoot: {
      paddingRight: 35,
      margin: '0 20px',
      width: 'auto',
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
    inputRootNew: {
      paddingRight: 10,
      margin: 0,
      width: 'auto',
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e',
      },
      '& input': {
        fontSize: 16,
        fontWeight: 500,
        color: '#02475b !important',
        paddingTop: 9,
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
    menuPaper: {
      width: 200,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.8)',
      marginTop: 0,
      maxHeight: '60vh',

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
    },
    numDays: {
      position: 'relative',
      top: -5,
      left: 7,
    },
  })
);

interface SlotsObject {
  id: string;
  value: string;
  selected: boolean;
}
interface FrequencyType {
  id: MEDICINE_FREQUENCY;
  value: string;
  selected: boolean;
}
interface RoaType {
  id: ROUTE_OF_ADMINISTRATION;
  value: string;
  selected: boolean;
}
interface DurationType {
  id: MEDICINE_CONSUMPTION_DURATION;
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
  dosageErr: boolean;
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

export interface MedicineProductDetailsResponse {
  productdp: MedicineProductDetails[];
  message?: string;
}

export interface MedicineProductsResponse {
  product_count: number;
  products: MedicineProduct[];
}
let cancel: any;
export const FavouriteMedicines: React.FC = () => {
  const classes = useStyles();
  const [selectedMedicinesArr, setSelectedMedicinesArr] = React.useState<
    GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList[] | null
  >([]);
  const [dosageList, setDosageList] = useState<any>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [showDosage, setShowDosage] = React.useState<boolean>(false);
  const [customDosageMorning, setCustomDosageMorning] = React.useState<string>('0');
  const [customDosageNoon, setCustomDosageNoon] = React.useState<string>('0');
  const [customDosageEvening, setCustomDosageEvening] = React.useState<string>('0');
  const [customDosageNight, setCustomDosageNight] = React.useState<string>('0');
  const [idx, setIdx] = React.useState();
  const [isUpdate, setIsUpdate] = React.useState(false);
  const [medicineInstruction, setMedicineInstruction] = React.useState<string>('');
  const [errorState, setErrorState] = React.useState<errorObject>({
    daySlotErr: false,
    tobeTakenErr: false,
    durationErr: false,
    dosageErr: false,
  });
  const [consumptionDuration, setConsumptionDuration] = React.useState<string>('');
  const [tabletsCount, setTabletsCount] = React.useState<string>('1');
  const [medicineUnit, setMedicineUnit] = React.useState<MEDICINE_UNIT>(MEDICINE_UNIT.OTHERS);
  const [loadingStatus, setLoading] = useState<boolean>(false);
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
  let forOptions = [
    {
      id: MEDICINE_CONSUMPTION_DURATION.DAYS,
      value: 'Day(s)',
      selected: false,
    },
    {
      id: MEDICINE_CONSUMPTION_DURATION.WEEKS,
      value: 'Week(s)',
      selected: false,
    },
    {
      id: MEDICINE_CONSUMPTION_DURATION.MONTHS,
      value: 'Month(s)',
      selected: false,
    },
  ];
  let dosageFrequency = [
    {
      id: MEDICINE_FREQUENCY.ONCE_A_DAY,
      value: 'Once a day',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.TWICE_A_DAY,
      value: 'Twice a day',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.THRICE_A_DAY,
      value: 'Thrice a day',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.FOUR_TIMES_A_DAY,
      value: 'Four times a day',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.FIVE_TIMES_A_DAY,
      value: 'Five times a day',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.EVERY_HOUR,
      value: 'Every hour',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.EVERY_TWO_HOURS,
      value: 'Every two hours',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.EVERY_FOUR_HOURS,
      value: 'Every four hours',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.ONCE_A_WEEK,
      value: 'Once a week',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.TWICE_A_WEEK,
      value: 'Twice a week',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.THREE_TIMES_A_WEEK,
      value: 'Three times a week',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.ONCE_IN_15_DAYS,
      value: 'Once in 15 days',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.ONCE_A_MONTH,
      value: 'Once a month',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.AS_NEEDED,
      value: 'As Needed',
      selected: false,
    },
    {
      id: MEDICINE_FREQUENCY.ALTERNATE_DAY,
      value: 'Alternate day',
      selected: false,
    },
  ];
  let roaOptionsList = [
    {
      id: ROUTE_OF_ADMINISTRATION.EAR_DROPS,
      value: 'Ear drops',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.EYE_DROPS,
      value: 'Eye drops',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.GARGLE,
      value: 'Gargle',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.INHALE,
      value: 'Inhale',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.INTRAMUSCULAR,
      value: 'Intramuscular',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.INTRAVENOUS,
      value: 'Intravenous',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
      value: 'Local application',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.NASAL_DROPS,
      value: 'Nasal drops',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.ORALLY,
      value: 'Orally',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.ORAL_DROPS,
      value: 'Oral drops',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.PER_RECTAL,
      value: 'Per rectal',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.SUBCUTANEOUS,
      value: 'Subcutaneous',
      selected: false,
    },
    {
      id: ROUTE_OF_ADMINISTRATION.SUBLINGUAL,
      value: 'Sublingual',
      selected: false,
    },
  ];
  const medicineMappingObj: any = {
    syrup: {
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      defaultUnitDp: 'ML',
      defaultRoa: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    ointment: {
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      defaultUnitDp: 'AS_PRESCRIBED',
      defaultRoa: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    injection: {
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      defaultUnitDp: 'UNIT',
      defaultRoa: ROUTE_OF_ADMINISTRATION.INTRAMUSCULAR,
    },
    liquid: {
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      defaultUnitDp: 'ML',
      defaultRoa: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    suspension: {
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      defaultUnitDp: 'ML',
      defaultRoa: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    tablet: {
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      defaultUnitDp: 'TABLET',
      defaultRoa: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    capsule: {
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      defaultUnitDp: 'TABLET',
      defaultRoa: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    gel: {
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      defaultUnitDp: 'AS_PRESCRIBED',
      defaultRoa: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    drops: {
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      defaultUnitDp: 'ML',
      defaultRoa: ROUTE_OF_ADMINISTRATION.ORAL_DROPS,
    },
    lotion: {
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      defaultUnitDp: 'AS_PRESCRIBED',
      defaultRoa: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    soap: {
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      defaultUnitDp: 'AS_PRESCRIBED',
      defaultRoa: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    spray: {
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      defaultUnitDp: 'SPRAY',
      defaultRoa: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    powder: {
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      defaultUnitDp: 'AS_PRESCRIBED',
      defaultRoa: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    inhaler: {
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      defaultUnitDp: 'PUFF',
      defaultRoa: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    respules: {
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      defaultUnitDp: 'SPRAY',
      defaultRoa: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    patch: {
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      defaultUnitDp: 'PATCH',
      defaultRoa: ROUTE_OF_ADMINISTRATION.LOCAL_APPLICATION,
    },
    paste: {
      defaultSetting: MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
      defaultUnitDp: 'AS_PRESCRIBED',
      defaultRoa: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
    others: {
      defaultSetting: MEDICINE_FORM_TYPES.OTHERS,
      defaultUnitDp: 'TABLET',
      defaultRoa: ROUTE_OF_ADMINISTRATION.ORALLY,
    },
  };
  const medUnitObject: any = {
    ML: { value: 'ml' },
    MG: { value: 'mg' },
    GM: { value: 'gm' },
    TABLET: { value: 'tablet(s)' },
    PUFF: { value: 'puff(s)' },
    UNIT: { value: 'unit(s)' },
    SPRAY: { value: 'spray(s)' },
    PATCH: { value: 'patch' },
    AS_PRESCRIBED: { value: 'As prescribed' },
  };
  const client = useApolloClient();
  const [selectedMedicines, setSelectedMedicines] = React.useState<MedicineObject[]>([]);
  const [isSuggestionFetched, setIsSuggestionFetched] = useState(true);
  const [isCustomform, setIsCustomForm] = useState<boolean>(false);
  const [medicine, setMedicine] = useState('');
  const [frequency, setFrequency] = useState(dosageFrequency[0].id);
  const [roaOption, setRoaOption] = useState(roaOptionsList[0].id);
  const [forUnit, setforUnit] = useState(forOptions[0].id);
  const [searchInput, setSearchInput] = useState('');
  const [medicineForm, setMedicineForm] = useState<string>(MEDICINE_FORM_TYPES.OTHERS);

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
        setIsCustomForm(false);
        setCustomDosageMorning('0');
        setCustomDosageNoon('0');
        setCustomDosageEvening('0');
        setCustomDosageNight('0');
        if (
          result &&
          result.data &&
          result.data.productdp &&
          result.data.productdp.length > 0 &&
          result.data.productdp[0] &&
          result.data.productdp[0].PharmaOverview &&
          result.data.productdp[0].PharmaOverview.length > 0 &&
          result.data.productdp[0].PharmaOverview[0].Doseform &&
          medicineMappingObj[result.data.productdp[0].PharmaOverview[0].Doseform.toLowerCase()]
          //OtherTypes.indexOf(result.data.productdp[0].PharmaOverview[0].Doseform) > -1
        ) {
          console.log(
            medicineMappingObj[result.data.productdp[0].PharmaOverview[0].Doseform.toLowerCase()]
          );
          setMedicineUnit(
            medicineMappingObj[result.data.productdp[0].PharmaOverview[0].Doseform.toLowerCase()]
              .defaultUnitDp
          );
          setMedicineForm(
            medicineMappingObj[result.data.productdp[0].PharmaOverview[0].Doseform.toLowerCase()]
              .defaultSetting
          );
          setRoaOption(
            medicineMappingObj[result.data.productdp[0].PharmaOverview[0].Doseform.toLowerCase()]
              .defaultRoa
          );
        } else {
          setMedicineUnit(medicineMappingObj['others'].defaultUnitDp);
          setMedicineForm(medicineMappingObj['others'].defaultSetting);
          setRoaOption(medicineMappingObj['others'].defaultRoa);
        }
        setShowDosage(true);
        setSelectedValue(suggestion.label);
        setSelectedId(suggestion.sku);
        setMedicine('');
        setTabletsCount('1');
        setLoading(false);
      })
      .catch((error) => {
        if (error.toString().includes('404')) {
          setLoading(false);
        }
      });
  };
  function getSuggestions(value: string) {
    return suggestions;
  }

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
  const toBeTaken = (value: any) => {
    const tobeTakenObjectList: any = [];
    value.map((slot: any) => {
      const tobeTakenObject = slot.replace('_', ' ').toLowerCase();
      tobeTakenObjectList.push(tobeTakenObject);
    });
    return tobeTakenObjectList;
  };
  const [medicineLoader, setMedicineLoader] = useState<boolean>(false);
  const getMedicineData = () => {
    setMedicineLoader(true);
    client
      .query<GetDoctorFavouriteMedicineList>({
        query: GET_DOCTOR_FAVOURITE_MEDICINE_LIST,
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        if (
          _data &&
          _data.data &&
          _data.data.getDoctorFavouriteMedicineList &&
          _data.data.getDoctorFavouriteMedicineList.medicineList
        ) {
          const temp: any = _data.data.getDoctorFavouriteMedicineList.medicineList;
          setSelectedMedicinesArr(temp);
        }
        if (
          _data &&
          _data.data &&
          _data.data.getDoctorFavouriteMedicineList &&
          _data.data.getDoctorFavouriteMedicineList.allowedDosages
        ) {
          setDosageList(_data.data.getDoctorFavouriteMedicineList.allowedDosages);
        }
        setMedicineLoader(false);
      })
      .catch((e) => {
        setMedicineLoader(false);
      });
  };
  useEffect(() => {
    setMedicineLoader(true);
    client
      .query<GetDoctorFavouriteMedicineList>({
        query: GET_DOCTOR_FAVOURITE_MEDICINE_LIST,
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        const temp: any =
          _data.data &&
          _data.data.getDoctorFavouriteMedicineList &&
          _data.data.getDoctorFavouriteMedicineList.medicineList;

        const medicineList: any = selectedMedicinesArr;
        temp.map((data1: any) => {
          if (data1) {
            selectedMedicinesArr!.push(data1);
          }
        });
        if (
          _data &&
          _data.data &&
          _data.data.getDoctorFavouriteMedicineList &&
          _data.data.getDoctorFavouriteMedicineList.allowedDosages
        ) {
          setDosageList(_data.data.getDoctorFavouriteMedicineList.allowedDosages);
        }
        setSelectedMedicinesArr(medicineList);
        setMedicineLoader(false);
      })
      .catch((e) => {
        setMedicineLoader(false);
      });
  }, []);

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
    client
      .mutate<RemoveFavouriteMedicine, RemoveFavouriteMedicineVariables>({
        mutation: REMOVE_FAVOURITE_MEDICINE,
        variables: {
          id: selectedMedicinesArr![idx].id!,
        },
      })
      .then((data) => {
        console.log('data after mutation' + data);
      });

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
    if (selectedMedicinesArr) {
      console.log(selectedMedicinesArr[idx]);
      setMedicineInstruction(selectedMedicinesArr[idx].medicineInstructions!);
      setConsumptionDuration(selectedMedicinesArr[idx].medicineConsumptionDurationInDays!);
      if (
        selectedMedicinesArr[idx].medicineUnit &&
        dosageList.indexOf(selectedMedicinesArr[idx].medicineUnit) < 0
      ) {
        setMedicineUnit(medicineMappingObj['others'].defaultUnitDp);
      } else {
        setMedicineUnit(selectedMedicinesArr[idx].medicineUnit!);
      }
      setSelectedValue(selectedMedicinesArr[idx].medicineName!);
      setSelectedId(selectedMedicinesArr[idx].id!);
      setSelectedExternalId(selectedMedicinesArr[idx].externalId!);
      setIsCustomForm(
        selectedMedicinesArr[idx].medicineCustomDosage! &&
          selectedMedicinesArr[idx].medicineCustomDosage !== ''
          ? true
          : false
      );
      if (
        selectedMedicinesArr[idx].medicineCustomDosage! &&
        selectedMedicinesArr[idx].medicineCustomDosage !== ''
      ) {
        const dosageTimingArray = selectedMedicinesArr[idx].medicineCustomDosage!.split('-');
        setCustomDosageMorning(dosageTimingArray[0]);
        setCustomDosageNoon(dosageTimingArray[1]);
        setCustomDosageEvening(dosageTimingArray[2]);
        setCustomDosageNight(dosageTimingArray[3]);
        setIsCustomForm(true);
        setTabletsCount('');
      } else {
        setTabletsCount(selectedMedicinesArr[idx].medicineDosage!);
        setCustomDosageMorning('0');
        setCustomDosageNoon('0');
        setCustomDosageEvening('0');
        setCustomDosageNight('0');
        setIsCustomForm(false);
      }
      setFrequency(
        selectedMedicinesArr[idx].medicineFrequency!
          ? selectedMedicinesArr[idx].medicineFrequency!
          : dosageFrequency[0].id
      );
      setRoaOption(
        selectedMedicinesArr[idx].routeOfAdministration!
          ? selectedMedicinesArr[idx].routeOfAdministration!
          : roaOptionsList[0].id
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
    if (selectedMedicinesArr && selectedMedicinesArr.length > 0) {
      selectedMedicinesArr.forEach((res: any) => {
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
        const allMedicines = selectedMedicines;
        allMedicines.push(inputParams);
        setSelectedMedicines(allMedicines);
      });
    }
  }, [selectedMedicinesArr]);
  useEffect(() => {
    if (searchInput.length > 2) {
      setSuggestions(getSuggestions(searchInput));
    }
  }, [searchInput]);
  const resetFrequencyFor = () => {
    setFrequency(dosageFrequency[0].id);
    setforUnit(forOptions[0].id);
    setRoaOption(roaOptionsList[0].id);
    dosageFrequency = dosageFrequency.map((dosageObj: FrequencyType) => {
      dosageObj.selected = false;
      return dosageObj;
    });

    forOptions = forOptions.map((forObj: DurationType) => {
      forObj.selected = false;
      return forObj;
    });
    roaOptionsList = roaOptionsList.map((roaObj: RoaType) => {
      roaObj.selected = false;
      return roaObj;
    });
  };
  const daySlotsToggleAction = (slotId: string) => {
    let isAsNeededSelected = false;
    if (slotId === 'AS_NEEDED') {
      daySlots.map((slot: SlotsObject) => {
        if (slot && slot.id === 'AS_NEEDED' && !slot.selected) {
          isAsNeededSelected = true;
        }
      });
    }
    const slots = daySlots.map((slot: SlotsObject) => {
      if (!isAsNeededSelected) {
        if (slot && slot.id === 'AS_NEEDED') {
          slot.selected = false;
        } else {
          if (slot && slotId === slot.id) {
            slot.selected = !slot.selected;
          }
        }
      } else {
        slot.selected = slot && slotId === slot.id && slotId === 'AS_NEEDED' ? true : false;
      }
      return slot;
    });
    setDaySlots(slots);
  };

  const toBeTakenSlotsToggleAction = (slotId: string) => {
    const slots = toBeTakenSlots.map((slot: SlotsObject) => {
      if (slot && slotId === slot.id) {
        slot.selected = !slot.selected;
      }
      return slot;
    });
    setToBeTakenSlots(slots);
  };

  const daySlotsHtml = daySlots.map((_daySlotitem: SlotsObject | null, index: number) => {
    const daySlotitem = _daySlotitem!;
    return (
      <button
        key={daySlotitem.id}
        className={`${daySlotitem.selected ? classes.activeBtnRed : ''} ${
          isCustomform && daySlotitem.id === 'AS_NEEDED' ? classes.none : ''
        }`}
        onClick={() => {
          daySlotsToggleAction(daySlotitem.id);
        }}
      >
        {daySlotitem.value}
      </button>
    );
  });

  const saveMedicines = () => {
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
    let customDosageArray = [];
    if (customDosageMorning && customDosageMorning.trim() !== '')
      customDosageArray.push(customDosageMorning.trim());
    if (customDosageNoon && customDosageNoon.trim() !== '')
      customDosageArray.push(customDosageNoon.trim());
    if (customDosageEvening && customDosageEvening.trim() !== '')
      customDosageArray.push(customDosageEvening.trim());
    if (customDosageNight && customDosageNight.trim() !== '')
      customDosageArray.push(customDosageNight.trim());
    if (!isCustomform && tabletsCount.trim() === '') {
      setErrorState({
        ...errorState,
        tobeTakenErr: false,
        daySlotErr: false,
        durationErr: false,
        dosageErr: true,
      });
    } else if (
      isCustomform &&
      (customDosageMorning.trim() === '' &&
        customDosageNoon.trim() === '' &&
        customDosageEvening.trim() === '' &&
        customDosageNight.trim() === '')
    ) {
      setErrorState({
        ...errorState,
        tobeTakenErr: false,
        daySlotErr: false,
        durationErr: false,
        dosageErr: true,
      });
    } else if (
      isCustomform &&
      customDosageMorning.trim() !== '' &&
      daySlotsArr.indexOf('MORNING') < 0
    ) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (isCustomform && customDosageNoon.trim() !== '' && daySlotsArr.indexOf('NOON') < 0) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (
      isCustomform &&
      customDosageEvening.trim() !== '' &&
      daySlotsArr.indexOf('EVENING') < 0
    ) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (
      isCustomform &&
      customDosageNight.trim() !== '' &&
      daySlotsArr.indexOf('NIGHT') < 0
    ) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (isCustomform && customDosageArray.length !== daySlotsArr.length) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (daySlotsArr.length === 0) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (consumptionDuration === '' || isNaN(Number(consumptionDuration))) {
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
        medicineDosage: String(tabletsCount).trim(),
        medicineTimings: daySlotsArr,
        medicineToBeTaken: toBeTakenSlotsArr,
        medicineName: selectedValue,
        medicineUnit: medicineUnit,
        medicineInstructions: medicineInstruction,
        medicineFrequency: frequency,
        medicineConsumptionDurationUnit: forUnit,
        medicineFormTypes: medicineForm,
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
        medicineInstructions: medicineInstruction,
        medicineFrequency: frequency,
        medicineConsumptionDurationUnit: forUnit,
        medicineFormTypes: medicineForm,
      };
      const medicineArray: any = selectedMedicinesArr;
      medicineArray.push(inputParamsArr);
      setSelectedMedicinesArr(medicineArray);
      const medicineSelected = selectedMedicines;
      medicineSelected.push(inputParams);
      setSelectedMedicines(medicineSelected);
      setIsDialogOpen(false);
      setIsUpdate(false);
      setShowDosage(false);
      resetOptions();
      const medicineCustomDosage =
        customDosageMorning.trim() +
        '-' +
        customDosageNoon.trim() +
        '-' +
        customDosageEvening.trim() +
        '-' +
        customDosageNight.trim();
      client
        .mutate<SaveDoctorsFavouriteMedicine, SaveDoctorsFavouriteMedicineVariables>({
          mutation: SAVE_DOCTORS_FAVOURITE_MEDICINE,
          variables: {
            saveDoctorsFavouriteMedicineInput: {
              externalId: selectedId,
              medicineConsumptionDuration: '',
              medicineConsumptionDurationUnit: forUnit,
              medicineFormTypes:
                medicineForm === 'OTHERS'
                  ? MEDICINE_FORM_TYPES.OTHERS
                  : MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
              medicineFrequency: frequency,
              medicineConsumptionDurationInDays: Number(consumptionDuration),
              medicineDosage: tabletsCount ? String(tabletsCount).trim() : '',
              medicineTimings: daySlotsArr,
              medicineToBeTaken: toBeTakenSlotsArr,
              medicineName: selectedValue,
              medicineUnit: medicineUnit,
              medicineInstructions: String(medicineInstruction),
              routeOfAdministration: roaOption,
              medicineCustomDosage: isCustomform ? medicineCustomDosage : '',
            },
          },
        })
        .then((data) => {
          getMedicineData();
        });
      setMedicineInstruction('');
      setConsumptionDuration('');
      setTabletsCount('1');
      setMedicineUnit(MEDICINE_UNIT.OTHERS);
      setSelectedValue('');
      setSelectedId('');
      resetFrequencyFor();
    }
  };
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
    const medicineCustomDosage =
      customDosageMorning.trim() +
      '-' +
      customDosageNoon.trim() +
      '-' +
      customDosageEvening.trim() +
      '-' +
      customDosageNight.trim();
    let customDosageArray = [];
    if (customDosageMorning && customDosageMorning.trim() !== '')
      customDosageArray.push(customDosageMorning.trim());
    if (customDosageNoon && customDosageNoon.trim() !== '')
      customDosageArray.push(customDosageNoon.trim());
    if (customDosageEvening && customDosageEvening.trim() !== '')
      customDosageArray.push(customDosageEvening.trim());
    if (customDosageNight && customDosageNight.trim() !== '')
      customDosageArray.push(customDosageNight.trim());
    if (!isCustomform && tabletsCount.trim() === '') {
      setErrorState({
        ...errorState,
        tobeTakenErr: false,
        daySlotErr: false,
        durationErr: false,
        dosageErr: true,
      });
    } else if (
      isCustomform &&
      (customDosageMorning.trim() === '' &&
        customDosageNoon.trim() === '' &&
        customDosageEvening.trim() === '' &&
        customDosageNight.trim() === '')
    ) {
      setErrorState({
        ...errorState,
        tobeTakenErr: false,
        daySlotErr: false,
        durationErr: false,
        dosageErr: true,
      });
    } else if (
      isCustomform &&
      customDosageMorning.trim() !== '' &&
      daySlotsArr.indexOf('MORNING') < 0
    ) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (isCustomform && customDosageNoon.trim() !== '' && daySlotsArr.indexOf('NOON') < 0) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (
      isCustomform &&
      customDosageEvening.trim() !== '' &&
      daySlotsArr.indexOf('EVENING') < 0
    ) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (
      isCustomform &&
      customDosageNight.trim() !== '' &&
      daySlotsArr.indexOf('NIGHT') < 0
    ) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (isCustomform && customDosageArray.length !== daySlotsArr.length) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (daySlotsArr.length === 0) {
      setErrorState({
        ...errorState,
        durationErr: false,
        daySlotErr: true,
        tobeTakenErr: false,
        dosageErr: false,
      });
    } else if (consumptionDuration === '' || isNaN(Number(consumptionDuration))) {
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
      setMedicineLoader(true);
      const inputParamsArr: any = {
        medicineConsumptionDurationInDays: Number(consumptionDuration),
        medicineDosage: String(tabletsCount).trim(),
        medicineInstructions: medicineInstruction,
        medicineTimings: daySlotsArr,
        medicineToBeTaken: toBeTakenSlotsArr,
        medicineName: selectedValue,
        id: selectedId,
        medicineUnit: medicineUnit,
        medicineConsumptionDurationUnit: forUnit,
        medicineFormTypes: medicineForm,
        routeOfAdministration: roaOption,
        medicineFrequency: frequency,
        medicineCustomDosage: isCustomform ? medicineCustomDosage : '',
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
        medicineInstructions: medicineInstruction,
        medicineConsumptionDurationUnit: forUnit,
        medicineFormTypes: medicineForm,
        routeOfAdministration: roaOption,
        medicineFrequency: frequency,
        medicineCustomDosage: isCustomform ? medicineCustomDosage : '',
      };
      if (isUpdate) {
        const medicineArray = selectedMedicinesArr;
        medicineArray!.splice(idx, 1, inputParamsArr);
        setSelectedMedicinesArr(medicineArray);
        const medicineSelected = selectedMedicines;
        medicineSelected.splice(idx, 1, inputParams);
        setSelectedMedicines(medicineSelected);
      } else {
        const medicineArray: any = selectedMedicinesArr;
        medicineArray!.push(inputParamsArr);
        setSelectedMedicinesArr(medicineArray);
        const medicineSelected = selectedMedicines;
        medicineSelected.push(inputParams);
        setSelectedMedicines(medicineSelected);
      }
      setIsDialogOpen(false);
      setIsUpdate(false);
      setShowDosage(false);
      resetOptions();
      client
        .mutate<UpdateDoctorFavouriteMedicine, UpdateDoctorFavouriteMedicineVariables>({
          mutation: UPDATE_DOCTOR_FAVOURITE_MEDICINE,
          variables: {
            updateDoctorsFavouriteMedicineInput: {
              externalId: selectedExternalId,
              medicineConsumptionDuration: '',
              medicineConsumptionDurationUnit: forUnit,
              medicineFormTypes:
                medicineForm === 'OTHERS'
                  ? MEDICINE_FORM_TYPES.OTHERS
                  : MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT,
              medicineFrequency: frequency,
              medicineConsumptionDurationInDays: Number(consumptionDuration),
              medicineDosage: tabletsCount ? String(tabletsCount).trim() : '',
              medicineUnit: medicineUnit,
              medicineInstructions: medicineInstruction,
              medicineTimings: daySlotsArr,
              medicineToBeTaken: toBeTakenSlotsArr,
              medicineName: selectedValue,
              id: selectedId,
              routeOfAdministration: roaOption,
              medicineCustomDosage: isCustomform ? medicineCustomDosage : '',
            },
          },
        })
        .then((data) => {
          console.log('data after mutation' + data);
          setMedicineLoader(false);
        });
      setMedicineInstruction('');
      setConsumptionDuration('');
      setTabletsCount('1');
      setMedicineUnit(MEDICINE_UNIT.OTHERS);
      setSelectedValue('');
      setSelectedId('');
      resetFrequencyFor();
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

  const [state, setState] = React.useState({
    single: '',
    popper: '',
  });
  //const [checked, setChecked] = useState(MEDICINE_FORM_TYPES.OTHERS);
  const [stateSuggestions, setSuggestions] = React.useState<OptionType[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedExternalId, setSelectedExternalId] = useState<string>('');

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
  const generateMedicineTypes =
    dosageList.length > 0
      ? dosageList.map((value: string, index: number) => {
          return (
            <MenuItem
              key={index.toString()}
              classes={{
                selected: classes.menuSelected,
              }}
              value={value}
            >
              {value && medUnitObject[value]
                ? medUnitObject[value].value
                : value.toLowerCase().replace('_', ' ')}
            </MenuItem>
          );
        })
      : null;
  const generateFrequency = dosageFrequency.map((dosageObj: FrequencyType, index: number) => {
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
  const forOptionHtml = forOptions.map((optionObj: DurationType, index: number) => {
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
  const roaOptionHtml = roaOptionsList.map((optionObj: RoaType, index: number) => {
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
    //const [checked, setChecked] = useState(false);
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
    resetFrequencyFor();
  };
  const term = (value: string, char: string) => {
    let changedString = value.substring(0, value.length - 1);
    return changedString + char;
  };
  console.log(errorState);
  return (
    <div className={classes.ProfileContainer}>
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid sm={12} xs={12} key={5} item>
            <ul>
              {medicineLoader ? (
                <CircularProgress className={classes.loader} />
              ) : (
                selectedMedicinesArr &&
                selectedMedicinesArr.length > 0 &&
                selectedMedicinesArr.map((medicine: any, index: number) => (
                  <li key={index} className={classes.medicineListElement}>
                    {medicine!.medicineName}
                    <span className={classes.iconRight}>
                      <img
                        width="16"
                        onClick={() => updateMedicine(index)}
                        src={require('images/round_edit_24_px.svg')}
                        alt=""
                      />
                      <img
                        width="16"
                        onClick={() => deletemedicine(index)}
                        src={require('images/ic_cancel_green.svg')}
                        alt=""
                      />
                    </span>
                  </li>
                ))
              )}
              <li>
                <AphButton
                  variant="contained"
                  color="primary"
                  classes={{ root: classes.btnAddDoctor }}
                  onClick={() => {
                    setIsDialogOpen(true);
                    setIsUpdate(false);
                  }}
                >
                  <img src={require('images/ic_dark_plus.svg')} alt="" /> ADD Medicine
                </AphButton>
              </li>
            </ul>
          </Grid>
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
                <Button className={classes.backArrow} onClick={() => setShowDosage(false)}>
                  <img src={require('images/ic_back.svg')} alt="" />
                </Button>
              )}
              {showDosage ? selectedValue.toUpperCase() : 'ADD MEDICINE'}
              <Button
                className={classes.cross}
                onClick={() => {
                  setIsDialogOpen(false);
                  setShowDosage(false);
                  setTabletsCount('1');
                  setMedicineUnit(MEDICINE_UNIT.OTHERS);
                  setConsumptionDuration('');
                  setMedicineInstruction('');
                  resetOptions();
                }}
              >
                <img src={require('images/ic_cross.svg')} alt="" />
              </Button>
            </AphDialogTitle>
            <div className={classes.shadowHide}>
              {!showDosage ? (
                <div>
                  <div className={classes.dialogContent}>
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
                    {medicine.trim().length > 2 && !loadingStatus && (
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
                          setIsCustomForm(false);
                          setMedicineUnit(medicineMappingObj['others'].defaultUnitDp);
                          setMedicineForm(medicineMappingObj['others'].defaultSetting);
                          setRoaOption(medicineMappingObj['others'].defaultRoa);
                          setSelectedValue(medicine);
                          setSelectedId('');
                          setLoading(false);
                          setMedicine('');
                        }}
                      >
                        <img src={require('images/ic_add_circle.svg')} alt="" />
                      </AphButton>
                    )}
                    {loadingStatus ? <CircularProgress className={classes.loader} /> : null}
                  </div>
                </div>
              ) : (
                <div>
                  <div>
                    <Scrollbars autoHide={true} style={{ height: 'calc(65vh' }}>
                      <div className={`${classes.dialogContent} ${classes.dialogNewMedicine}`}>
                        <Grid container spacing={2}>
                          <Grid item lg={12} md={12} xs={12}>
                            <RadioGroup
                              className={classes.radioGroup}
                              value={medicineForm}
                              onChange={(e) => {
                                setMedicineForm((e.target as HTMLInputElement)
                                  .value as MEDICINE_FORM_TYPES);
                              }}
                              row
                            >
                              <FormControlLabel
                                value={MEDICINE_FORM_TYPES.OTHERS}
                                label="Take"
                                control={<AphRadio title="Take" />}
                              />
                              <FormControlLabel
                                value={MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT}
                                label="Apply"
                                control={<AphRadio title="Apply" />}
                              />
                            </RadioGroup>
                          </Grid>
                          <Grid item lg={12} md={12} xs={12}>
                            {isCustomform ? (
                              <>
                                <Grid container spacing={2}>
                                  <Grid item lg={2} md={2} xs={2}>
                                    <AphTextField
                                      autoFocus
                                      inputProps={{ maxLength: 6 }}
                                      value={customDosageMorning}
                                      onChange={(event: any) => {
                                        setCustomDosageMorning(event.target.value);
                                      }}
                                      onKeyPress={(e) => {
                                        if (
                                          isNaN(parseInt(e.key, 10)) &&
                                          e.key !== '/' &&
                                          e.key !== '.' &&
                                          e.key !== ' '
                                        )
                                          e.preventDefault();
                                      }}
                                      InputProps={{
                                        classes: {
                                          root: classes.inputRootNew,
                                        },
                                      }}
                                      //error={errorState.dosageErr}
                                    />
                                  </Grid>

                                  <Grid item lg={2} md={2} xs={2}>
                                    <AphTextField
                                      autoFocus
                                      inputProps={{ maxLength: 6 }}
                                      value={customDosageNoon}
                                      onChange={(event: any) => {
                                        setCustomDosageNoon(event.target.value);
                                      }}
                                      onKeyPress={(e) => {
                                        if (
                                          isNaN(parseInt(e.key, 10)) &&
                                          e.key !== '/' &&
                                          e.key !== '.' &&
                                          e.key !== ' '
                                        )
                                          e.preventDefault();
                                      }}
                                      InputProps={{
                                        classes: {
                                          root: classes.inputRootNew,
                                        },
                                      }}
                                      //error={errorState.dosageErr}
                                    />
                                  </Grid>

                                  <Grid item lg={2} md={2} xs={2}>
                                    <AphTextField
                                      autoFocus
                                      inputProps={{ maxLength: 6 }}
                                      value={customDosageEvening}
                                      onChange={(event: any) => {
                                        setCustomDosageEvening(event.target.value);
                                      }}
                                      onKeyPress={(e) => {
                                        if (
                                          isNaN(parseInt(e.key, 10)) &&
                                          e.key !== '/' &&
                                          e.key !== '.' &&
                                          e.key !== ' '
                                        )
                                          e.preventDefault();
                                      }}
                                      InputProps={{
                                        classes: {
                                          root: classes.inputRootNew,
                                        },
                                      }}
                                      //error={errorState.dosageErr}
                                    />
                                  </Grid>
                                  <Grid item lg={2} md={2} xs={2}>
                                    <AphTextField
                                      autoFocus
                                      inputProps={{ maxLength: 6 }}
                                      value={customDosageNight}
                                      onChange={(event: any) => {
                                        setCustomDosageNight(event.target.value);
                                      }}
                                      onKeyPress={(e) => {
                                        if (
                                          isNaN(parseInt(e.key, 10)) &&
                                          e.key !== '/' &&
                                          e.key !== '.' &&
                                          e.key !== ' '
                                        )
                                          e.preventDefault();
                                      }}
                                      InputProps={{
                                        classes: {
                                          root: classes.inputRootNew,
                                        },
                                      }}
                                      //error={errorState.dosageErr}
                                    />
                                  </Grid>
                                  <Grid item lg={4} md={4} xs={4}>
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
                                        setMedicineUnit(e.target.value as MEDICINE_UNIT);
                                      }}
                                    >
                                      {generateMedicineTypes}
                                    </AphSelect>
                                  </Grid>
                                </Grid>
                                <Grid item lg={12} md={12} xs={12}>
                                  {errorState.dosageErr && (
                                    <FormHelperText
                                      className={classes.helpText}
                                      component="div"
                                      error={errorState.dosageErr}
                                    >
                                      Please enter dosage.
                                    </FormHelperText>
                                  )}
                                </Grid>
                              </>
                            ) : (
                              <>
                                <Grid container spacing={2}>
                                  <Grid item lg={3} md={3} xs={3}>
                                    <AphTextField
                                      autoFocus
                                      inputProps={{ maxLength: 6 }}
                                      value={tabletsCount}
                                      onChange={(event: any) => {
                                        setTabletsCount(event.target.value);
                                      }}
                                      onKeyPress={(e) => {
                                        if (
                                          isNaN(parseInt(e.key, 10)) &&
                                          e.key !== '/' &&
                                          e.key !== '.' &&
                                          e.key !== ' '
                                        )
                                          e.preventDefault();
                                      }}
                                      InputProps={{
                                        classes: {
                                          root: classes.inputRootNew,
                                        },
                                      }}
                                      //error={errorState.dosageErr}
                                    />
                                  </Grid>

                                  <Grid item lg={3} md={3} xs={3}>
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
                                        setMedicineUnit(e.target.value as MEDICINE_UNIT);
                                      }}
                                    >
                                      {generateMedicineTypes}
                                    </AphSelect>
                                  </Grid>
                                  <Grid item lg={6} md={6} xs={6}>
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
                                        setFrequency(e.target.value as MEDICINE_FREQUENCY);
                                      }}
                                    >
                                      {generateFrequency}
                                    </AphSelect>
                                  </Grid>
                                </Grid>
                                <Grid item lg={12} md={12} xs={12}>
                                  {errorState.dosageErr && (
                                    <FormHelperText
                                      className={classes.helpText}
                                      component="div"
                                      error={errorState.dosageErr}
                                    >
                                      Please enter dosage.
                                    </FormHelperText>
                                  )}
                                </Grid>
                              </>
                            )}
                          </Grid>
                          <Grid item lg={12} md={12} xs={12}>
                            <h4>
                              <span
                                onClick={() => {
                                  setIsCustomForm(!isCustomform);
                                  // medicineCustomDosage && medicineCustomDosage !== ''
                                  //   ? setMedicineCustomDosage('')
                                  //   : setMedicineCustomDosage('0-0-0-0');
                                }}
                              >
                                {isCustomform ? 'DEFAULT' : 'CUSTOM'}
                              </span>
                            </h4>
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
                                Please select valid time of the day.
                              </FormHelperText>
                            )}
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
                          <Grid item lg={6} md={6} xs={12}>
                            &nbsp;
                          </Grid>
                          <Grid item lg={3} md={3} xs={3}>
                            <h6>For</h6>
                            <div className={classes.numberTablets}>
                              <AphTextField
                                placeholder=""
                                inputProps={{ maxLength: 6 }}
                                value={consumptionDuration}
                                onChange={(event: any) => {
                                  setConsumptionDuration(event.target.value);
                                }}
                                onKeyPress={(e) => {
                                  if (isNaN(parseInt(e.key, 10))) e.preventDefault();
                                }}
                                //error={errorState.durationErr}
                              />
                            </div>
                          </Grid>
                          <Grid item lg={3} md={3} xs={3}>
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
                                  setforUnit(e.target.value as MEDICINE_CONSUMPTION_DURATION);
                                }}
                              >
                                {forOptionHtml}
                              </AphSelect>
                            </div>
                          </Grid>
                          <Grid item lg={6} md={6} xs={6}>
                            <h6>Route of Administration</h6>
                            <div className={classes.unitsSelect}>
                              <AphSelect
                                style={{ paddingTop: 3 }}
                                value={roaOption}
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
                                  setRoaOption(e.target.value as ROUTE_OF_ADMINISTRATION);
                                }}
                              >
                                {roaOptionHtml}
                              </AphSelect>
                            </div>
                          </Grid>
                          <div className={classes.numDays}>
                            {errorState.durationErr && (
                              <FormHelperText
                                className={classes.helpText}
                                component="div"
                                error={errorState.durationErr}
                              >
                                Please enter number of {term(forUnit.toLowerCase(), '(s)')}
                              </FormHelperText>
                            )}
                          </div>
                          <Grid item lg={12} xs={12}>
                            <h6 className={classes.instructionText}>Instructions/Notes</h6>
                            <div className={classes.numberTablets}>
                              <AphTextField
                                multiline
                                placeholder="Type here.."
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
                        setTabletsCount('1');
                        setMedicineUnit(MEDICINE_UNIT.OTHERS);
                        setConsumptionDuration('');
                        setMedicineInstruction('');
                        resetOptions();
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
                          saveMedicines();
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
    </div>
  );
};
