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
import { isEmpty, debounce, trim, deburr } from 'lodash';
import axios from 'axios';
import { CaseSheetContext } from 'context/CaseSheetContext';
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
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part) => (
          <span
            key={part.text}
            style={{
              fontWeight: part.highlight ? 500 : 400,
              whiteSpace: 'pre',
            }}
          >
            {part.text}
          </span>
        ))}
      </div>
      <img src={require('images/ic_dark_plus.svg')} alt="" />
    </MenuItem>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
    },
    input: {
      color: 'black',
      paddingTop: 0,
    },
    suggestionsContainerOpen: {
      position: 'absolute',
      zIndex: 1,
      marginTop: theme.spacing(1),
      left: 0,
      right: 0,
      color: 'black',
      boxShadow: 'none',
    },
    suggestion: {
      display: 'block',
      overflow: 'hidden',
      // borderBottom: '1px solid rgba(2,71,91,0.1)',
      '& div': {
        paddingLeft: 0,
      },
      '&:hover': {
        '& div': {
          backgroundColor: '#f0f4f5 !important',
        },
      },
    },
    suggestionsList: {
      margin: 0,
      padding: 0,
      listStyleType: 'none',
      color: '#02475b',
      fontSize: 18,
      fontWeight: 500,
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
    },
    activeCard: {
      // border: '1px solid #00b38e',
      // backgroundColor: '#fff',
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
      fontWeight: 600,
      padding: '2px 4px 8px 5px',

      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        marginRight: 8,
      },
    },
    card: {
      background: '#fff',
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.2)',
      padding: 16,
      borderRadius: 10,
      '& ul': {
        padding: 0,
        margin: '0 0 0 10px',
        '& li': {
          color: '#02475b',
          listStyleType: 'none',
          // padding: 10,
          fontSize: 14,
          fontWeight: 500,
          padding: '10px 50px 10px 10px !important',
          position: 'relative',
          borderBottom: '1px solid rgba(128, 128, 128, 0.2)',
          '&:last-child': {
            paddingBottom: 0,
            borderBottom: 'none',
            paddingLeft: 0,
          },
          '& img': {
            '&:first-child': {
              position: 'relative',
              top: -2,
              marginRight: 10,
            },
          },
        },
      },
    },
    darkGreenaddBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      position: 'absolute',
      left: '414px',
      top: '0px',
      padding: 0,
      marginTop: 12,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        marginRight: 8,
      },
    },
    medicineHeading: {
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
      top: -2,
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
    loading: {
      position: 'absolute',
      left: '48%',
      top: '48%',
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
      padding: '20px 0',
      minHeight: 300,
      position: 'relative',

      '& h6': {
        fontSize: 14,
        fontWeight: 500,
        color: 'rgba(2, 71, 91, 0.6)',
        marginBottom: 5,
        marginTop: 5,
        lineHeight: 'normal',
        minHeight: 9,
      },
    },
    dialogNewMedicine: {
      padding: 20,
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
      padding: '20px 10px',
      '& h6': {
        fontSize: 13,
        color: '#01475b',
        fontWeight: 600,
        textAlign: 'center',
        padding: '0 25px',
        marginTop: 5,
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
      top: '45%',
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
    updateSymptom: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      top: 5,
      right: 40,
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
    deleteSymptom: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      top: 5,
      right: 0,
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
      paddingRight: 35,
      margin: 0,
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
    },
    headingName: {
      display: 'inline-block',
      width: '90%',
      wordBreak: 'break-word',
      textAlign: 'center',
    },
    searchpopup: {
      borderRadius: 'none',
      boxShadow: 'none',
      '& ul': {
        padding: 0,
        margin: 0,
        overflow: 'hidden',
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
            padding: '10px 62px 10px 20px',
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
          '&:first-child': {
            borderRadius: 0,
          },
          '&:last-child': {
            borderRadius: 0,
            '&:after': {
              display: 'none',
            },
          },
          '&:hover': {
            '&:first-child': {
              borderRadius: 0,
            },
            '&:last-child': {
              borderRadius: 0,
            },
            '& >div': {
              '& img': {
                display: 'block',
              },
            },
          },
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
  const [consumptionDuration, setConsumptionDuration] = React.useState<string>('');
  const [tabletsCount, setTabletsCount] = React.useState<number>(1);
  const [medicineUnit, setMedicineUnit] = React.useState<MEDICINE_UNIT>(MEDICINE_UNIT.OTHERS);
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
  const [loadingStatus, setLoading] = useState<boolean>(false);
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
    MEDICINE_UNIT.SYRUP,
    MEDICINE_UNIT.DROPS,
    MEDICINE_UNIT.CAPSULE,
    MEDICINE_UNIT.INJECTION,
    MEDICINE_UNIT.TABLET,
    MEDICINE_UNIT.BOTTLE,
    MEDICINE_UNIT.SUSPENSION,
    MEDICINE_UNIT.ROTACAPS,
    MEDICINE_UNIT.SACHET,
    MEDICINE_UNIT.ML,
    MEDICINE_UNIT.OTHERS,
  ];
  const gelLotionOintmentTypes = [
    MEDICINE_UNIT.POWDER,
    MEDICINE_UNIT.CREAM,
    MEDICINE_UNIT.SOAP,
    MEDICINE_UNIT.GEL,
    MEDICINE_UNIT.LOTION,
    MEDICINE_UNIT.SPRAY,
    MEDICINE_UNIT.OINTMENT,
    MEDICINE_UNIT.OTHERS,
  ];
  const forOptions = [
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
  const dosageFrequency = [
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
      id: MEDICINE_FREQUENCY.AS_NEEDED,
      value: 'As Needed',
      selected: false,
    },
  ];

  const [selectedMedicines, setSelectedMedicines] = React.useState<MedicineObject[]>([]);
  const [isSuggestionFetched, setIsSuggestionFetched] = useState(true);
  const [medicine, setMedicine] = useState('');
  const [frequency, setFrequency] = useState(dosageFrequency[0].id);
  const [forUnit, setforUnit] = useState(forOptions[0].id);
  const [searchInput, setSearchInput] = useState('');
  const client = useApolloClient();
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
          setMedicineForm(MEDICINE_FORM_TYPES.OTHERS);
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
          setMedicineForm(MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT);
        } else {
          setMedicineUnit(MEDICINE_UNIT.OTHERS);
          setMedicineForm(MEDICINE_FORM_TYPES.GEL_LOTION_OINTMENT);
        }
        setShowDosage(true);
        setSelectedValue(suggestion.label);
        setSelectedId(suggestion.sku);
        setMedicine('');
        setTabletsCount(1);
        setLoading(false);
      })
      .catch((error) => {
        if (error.toString().includes('404')) {
          //setIsSuggestionFetched(false);
          setLoading(false);
        }
      });
  };
  function getSuggestions(value: string) {
    return suggestions;
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
        const temp: any =
          _data.data &&
          _data.data.getDoctorFavouriteMedicineList &&
          _data.data.getDoctorFavouriteMedicineList.medicineList;

        const medicineList: any = temp;
        // temp.map((data1: any) => {
        //   if (data1) {
        //     selectedMedicinesArr!.push(data1);
        //   }
        // });

        setSelectedMedicinesArr(medicineList);
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
    setMedicineInstruction(selectedMedicinesArr![idx].medicineInstructions!);
    setConsumptionDuration(selectedMedicinesArr![idx].medicineConsumptionDurationInDays!);
    setTabletsCount(Number(selectedMedicinesArr![idx].medicineDosage!));
    setMedicineUnit(selectedMedicinesArr![idx].medicineUnit!);
    setSelectedValue(selectedMedicinesArr![idx].medicineName!);
    setSelectedId(selectedMedicinesArr![idx].id!);
    setSelectedExternalId(selectedMedicinesArr![idx].externalId!);
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

  const daySlotsToggleAction = (slotId: string) => {
    const slots = daySlots.map((slot: SlotsObject) => {
      if (slot && slotId === slot.id) {
        slot.selected = !slot.selected;
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
        className={daySlotitem.selected ? classes.activeBtnRed : ''}
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
      const inputParamsArr: any = {
        medicineConsumptionDurationInDays: consumptionDuration,
        medicineDosage: String(tabletsCount),
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
              medicineDosage: tabletsCount ? String(tabletsCount) : '',
              medicineTimings: daySlotsArr,
              medicineToBeTaken: toBeTakenSlotsArr,
              medicineName: selectedValue,
              medicineUnit: medicineUnit,
              medicineInstructions: String(medicineInstruction),
            },
          },
        })
        .then((data) => {
          getMedicineData();
        });

      setMedicineInstruction('');
      setConsumptionDuration('');
      setTabletsCount(1);
      setMedicineUnit(MEDICINE_UNIT.OTHERS);
      setSelectedValue('');
      setSelectedId('');
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
      const inputParamsArr: any = {
        medicineConsumptionDurationInDays: Number(consumptionDuration),
        medicineDosage: String(tabletsCount),
        medicineInstructions: medicineInstruction,
        medicineTimings: daySlotsArr,
        medicineToBeTaken: toBeTakenSlotsArr,
        medicineName: selectedValue,
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
        medicineInstructions: medicineInstruction,
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
              medicineFrequency: dosageFrequency[0].id,
              medicineConsumptionDurationInDays: Number(consumptionDuration),
              medicineDosage: tabletsCount ? String(tabletsCount) : '',
              medicineUnit: medicineUnit,
              medicineInstructions: medicineInstruction,
              medicineTimings: daySlotsArr,
              medicineToBeTaken: toBeTakenSlotsArr,
              medicineName: selectedValue,
              id: selectedId,
            },
          },
        })
        .then((data) => {
          console.log('data after mutation' + data);
        });

      setMedicineInstruction('');
      setConsumptionDuration('');
      setTabletsCount(1);
      setMedicineUnit(MEDICINE_UNIT.OTHERS);
      setSelectedValue('');
      setSelectedId('');
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
    if (event.nativeEvent.type === 'input') {
      if (newValue.length > 2) {
        fetchMedicines(newValue);
      }
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
                  <li key={index}>
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
                <div className={classes.backArrow} onClick={() => setShowDosage(false)}>
                  <img src={require('images/ic_back.svg')} alt="" />
                </div>
              )}
              <span className={classes.headingName}>
                {showDosage ? selectedValue.toUpperCase() : 'ADD MEDICINE'}
              </span>
              <Button className={classes.cross}>
                <img
                  src={require('images/ic_cross.svg')}
                  alt=""
                  onClick={() => {
                    setIsDialogOpen(false);
                    setShowDosage(false);
                    setTabletsCount(1);
                    setMedicineUnit(MEDICINE_UNIT.OTHERS);
                    setConsumptionDuration('');
                    setMedicineInstruction('');
                    resetOptions();
                  }}
                />
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
                        container: classes.container,
                        suggestionsContainerOpen: classes.suggestionsContainerOpen,
                        suggestionsList: classes.suggestionsList,
                        suggestion: classes.suggestion,
                      }}
                      renderSuggestionsContainer={(options) => (
                        <Scrollbars autoHide={true} style={{ height: 'calc(60vh' }}>
                          <Paper {...options.containerProps} square className={classes.searchpopup}>
                            {options.children}
                          </Paper>
                        </Scrollbars>
                      )}
                    />
                    {medicine.length > 2 && !loadingStatus && (
                      <div>
                        <span>
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
                              setSelectedId('');
                              setLoading(false);
                              setMedicine('');
                            }}
                          >
                            <img src={require('images/ic_add_circle.svg')} alt="" />
                          </AphButton>
                        </span>
                      </div>
                    )}
                    {loadingStatus ? <CircularProgress className={classes.loader} /> : null}
                  </div>
                </div>
              ) : (
                <div>
                  <div>
                    <Scrollbars autoHide={true} style={{ height: 'calc(60vh' }}>
                      <div className={`${classes.dialogContent} ${classes.dialogNewMedicine}`}>
                        <Grid container spacing={2}>
                          {medicineForm === 'OTHERS' && (
                            <Grid item lg={6} md={6} xs={12}>
                              <h6>Take</h6>
                              <AphTextField
                                autoFocus
                                inputProps={{ maxLength: 6 }}
                                value={tabletsCount && tabletsCount <= 0 ? '' : tabletsCount}
                                onChange={(event: any) => {
                                  setTabletsCount(event.target.value);
                                }}
                                InputProps={{
                                  classes: {
                                    root: classes.inputRootNew,
                                  },
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
                          <Grid item lg={6} md={6} xs={12}>
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
                                  setMedicineUnit(e.target.value as MEDICINE_UNIT);
                                }}
                              >
                                {generateMedicineTypes}
                              </AphSelect>
                            </div>
                          </Grid>
                          {/* {medicineForm === 'OTHERS' && ( */}
                          <Grid item lg={6} md={6} xs={6}>
                            <h6>&nbsp;</h6>
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
                                  setFrequency(e.target.value as MEDICINE_FREQUENCY);
                                }}
                              >
                                {generateFrequency}
                              </AphSelect>
                            </div>
                          </Grid>
                          {/* // )} */}
                          <Grid item lg={6} md={6} xs={12}>
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
                          <Grid item lg={6} md={6} xs={12}>
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
                            <h6>Instructions/Notes</h6>
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
                        setTabletsCount(1);
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
