import React, { useState, useEffect, useContext } from 'react';
import { Typography, Chip, Theme, MenuItem, Paper, Button } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import { Grid, FormHelperText, Modal, CircularProgress, Tabs, Tab } from '@material-ui/core';
import { AphDialogTitle, AphSelect } from '@aph/web-ui-components';
import deburr from 'lodash/deburr';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Autosuggest from 'react-autosuggest';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { SEARCH_DIAGNOSTICS } from 'graphql/profiles';
import { SearchDiagnostics } from 'graphql/types/SearchDiagnostics';
import { GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription } from 'graphql/types/GetCaseSheet';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { GetDoctorFavouriteTestList } from 'graphql/types/GetDoctorFavouriteTestList';
import { AphDialog, AphDialogClose } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

import {
  GET_DOCTOR_FAVOURITE_TEST_LIST,
  ADD_DOCTOR_FAVOURITE_TEST,
  UPDATE_DOCTOR_FAVOURITE_TEST,
  DELETE_DOCTOR_FAVOURITE_TEST,
} from 'graphql/profiles';
import {
  AddDoctorFavouriteTest,
  AddDoctorFavouriteTestVariables,
} from 'graphql/types/AddDoctorFavouriteTest';
import {
  UpdateDoctorFavouriteTest,
  UpdateDoctorFavouriteTestVariables,
} from 'graphql/types/UpdateDoctorFavouriteTest';
import {
  DeleteDoctorFavouriteTest,
  DeleteDoctorFavouriteTestVariables,
} from 'graphql/types/DeleteDoctorFavouriteTest';
interface OptionType {
  itemname: string;
  __typename: 'DiagnosticPrescription';
}

let suggestions: (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription | null)[] = [];

function renderInputComponent(inputProps: any) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <AphTextField
      className={classes.inputField}
      autoFocus
      fullWidth
      InputProps={{
        inputRef: (node) => {
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
  suggestion: any | null,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const matches = match(suggestion!.itemName, query);
  const parts = parse(suggestion!.itemName, matches);

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
const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 250,
      flexGrow: 1,
    },
    container: {
      position: 'relative',
    },
    suggestionsContainerOpen: {
      position: 'absolute',
      zIndex: 1,
      marginTop: theme.spacing(1),
      left: 0,
      right: 0,
    },
    medicinePopup: {
      width: 480,
      margin: '30px auto 0 auto',
      boxShadow: 'none',
    },
    popupHeadingCenter: {
      borderRadius: 10,
      padding: 0,
      '& h6': {
        fontSize: 13,
        color: '#01475b',
        fontWeight: 600,
        textAlign: 'center',
        marginTop: 5,
      },
    },
    dialogContent: {
      padding: '20px 20px 0 20px',
      minHeight: 100,
      position: 'relative',
      '& h6': {
        fontSize: 14,
        fontWeight: 500,
        color: 'rgba(2, 71, 91, 0.6)',
        marginBottom: 5,
        marginTop: 5,
        lineHeight: 'normal',
        textAlign: 'left',
        paddingLeft: 0,
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
        '&:focus': {
          outline: 'none',
        },
      },
    },
    dialogActions: {
      padding: '0 15px 15px 0',
      boxShadow: 'none',
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
    updateBtn: {
      backgroundColor: '#fc9916 !important',
    },
    loader: {
      left: '50%',
      top: 41,
      position: 'relative',
    },
    textFieldWrapper: {
      border: 'solid 1px #30c1a3',
      borderRadius: 10,
      width: '100%',
      padding: 16,
      color: '#01475b',
      fontSize: 14,
      fontWeight: 500,
      position: 'relative',
      paddingRight: 48,
    },
    iconRight: {
      position: 'absolute',
      right: 5,
      top: 13,
      '& img': {
        cursor: 'pointer',
      },
    },
    chatSubmitBtn: {
      position: 'absolute',
      top: '50%',
      marginTop: -18,
      right: 10,
      minWidth: 'auto',
      padding: 0,
      '& img': {
        maxWidth: 36,
      },
    },
    divider: {
      height: theme.spacing(2),
    },
    mainContainer: {
      width: '100%',
    },
    contentContainer: {
      display: 'flex',
      flexFlow: 'row',
      flexWrap: 'wrap',
      width: '100%',
      position: 'relative',
      padding: '0px 5px 0px 10px',
      '& h5': {
        color: 'rgba(2, 71, 91, 0.6)',
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 12,
      },
    },
    column: {
      width: '49%',
      display: 'flex',
      marginRight: '1%',
      flexDirection: 'column',
    },
    listContainer: {
      display: 'flex',
      flexFlow: 'column',
    },
    icon: {
      color: '#00b38e',
    },
    textFieldContainer: {
      width: '100%',
    },
    othersBtn: {
      border: '1px solid rgba(2, 71, 91, 0.15)',
      backgroundColor: 'rgba(0,0,0,0.02)',
      height: 'auto',
      marginBottom: 12,
      borderRadius: 5,
      fontWeight: 600,
      fontSize: 14,
      color: '#02475b !important',
      whiteSpace: 'normal',
      '&:focus': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
      '& span': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'left',
        whiteSpace: 'normal',
        padding: 10,
        wordBreak: 'break-word',
      },
    },
    textFieldColor: {
      '& input': {
        color: 'initial',
        '& :before': {
          border: 0,
        },
      },
    },
    btnAddDoctor: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      // pointerEvents: 'none',
      paddingLeft: 8,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        marginRight: 8,
      },
    },
    card: {
      position: 'relative',
      margin: 0,
      '& ul': {
        padding: 0,
        margin: 0,
        '& li': {
          color: '#02475b',
          listStyleType: 'none',
          padding: '10px 50px 10px 10px !important',
          fontSize: 14,
          fontWeight: 500,
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
    addedList: {
      '& li': {
        padding: '10px 50px 10px 0 !important',
        wordWrap: 'break-word',
      },
      '& li:last-child': {
        borderBottom: '1px solid rgba(128, 128, 128, 0.2) !important',
      },
    },
    darkGreenaddBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: 600,
      position: 'absolute',
      right: -10,
      top: 10,
      paddingLeft: 4,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        marginRight: 8,
      },
    },
    searchPopupScroll: {
      borderBottomRightRadius: 10,
      borderBottomLefttRadius: 10,
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
    inputRoot: {
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e',
      },
      '& input': {
        fontSize: 16,
        fontWeight: 500,
        color: '#01475b',
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
    fullWidth: {
      width: '100%',
    },
    inputField: {
      padding: '20px 20px 0 20px',
    },
    tabsRoot: {
      backgroundColor: theme.palette.common.white,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      padding: '0 70px 0 50px',
    },
    tabRoot: {
      fontSize: 13,
      fontWeight: theme.typography.fontWeightMedium,
      textAlign: 'center',
      color: '#01475b',
      padding: '20px 0',
      textTransform: 'none',
      width: '50%',
      opacity: 1,
      lineHeight: 'normal',
      [theme.breakpoints.down('xs')]: {
        width: '50%',
      },
    },
    tabSelected: {
      fontWeight: theme.typography.fontWeightBold,
      color: '#02475b',
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    testsPopup: {
      margin: '30px auto 0 auto',
      boxShadow: 'none',
      '& >div:nth-child(3)': {
        '& >div': {
          maxWidth: 480,
        },
      },
    },
    tabsContainer: {
      fontSize: 18,
      fontWeight: 500,
      color: '#01475b',
      position: 'relative',
    },
    closeIcon: {
      position: 'absolute',
      right: 15,
      top: 15,
      cursor: 'pointer',
    },
    comingSoonWrapper: {
      padding: 20,
    },
    searchFrom: {
      padding: 0,
      position: 'relative',
    },
  })
);

export const Tests: React.FC = () => {
  const classes = useStyles({});
  const [searchInput, setSearchInput] = useState('');
  // const { favouriteTests: selectedValues, setFavouriteTests: setSelectedValues } = useContext(
  //   CaseSheetContext
  // );
  const [selectedValues, setSelectedValues] = useState();
  const [idx, setIdx] = React.useState();
  const client = useApolloClient();
  const { caseSheetEdit, patientDetails } = useContext(CaseSheetContext);
  const [updateText, setUpdateText] = useState('');
  const [updateId, setUpdateId] = useState('');
  const [checkoutDialogOpen, setCheckoutDialogOpen] = React.useState<boolean>(false);
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);

  const fetchDignostic = async (value: string) => {
    client
      .query<SearchDiagnostics, any>({
        query: SEARCH_DIAGNOSTICS,
        variables: {
          city:
            patientDetails &&
            patientDetails.patientAddress &&
            patientDetails.patientAddress.length > 0
              ? patientDetails.patientAddress[0]!.city
              : '',
          patientId: patientDetails && patientDetails.id ? patientDetails.id : '',
          searchText: value,
        },
      })
      .then((_data: any) => {
        const filterVal: any = _data!.data!.searchDiagnostics!.diagnostics;

        filterVal.forEach((val: any, index: any) => {
          selectedValues &&
            selectedValues.length > 0 &&
            selectedValues.forEach((selectedval: any) => {
              if (val.itemName === selectedval.itemname) {
                filterVal.splice(index, 1);
              }
            });
        });
        suggestions = filterVal;
        const length = 0;
        if (suggestions && suggestions.length) {
          setLengthOfSuggestions(suggestions.length);
        }

        setSearchInput(value);
      })
      .catch((e) => {
        console.log('Error occured while searching for tests', e);
      });
  };
  const getSuggestions = (value: string) => {
    return suggestions;
  };
  // const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const [tabValue, setTabValue] = useState<number>(0);

  function getSuggestionValue(suggestion: any | null) {
    return suggestion!.itemName;
  }

  useEffect(() => {
    client
      .query<GetDoctorFavouriteTestList>({
        query: GET_DOCTOR_FAVOURITE_TEST_LIST,
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        const temp: any =
          _data.data &&
          _data.data.getDoctorFavouriteTestList &&
          _data.data.getDoctorFavouriteTestList.testList;

        const xArr: any = selectedValues && selectedValues.length > 0 ? selectedValues : [];
        temp.map((data1: any) => {
          if (data1) {
            xArr!.push(data1);
          }
        });

        setSelectedValues(xArr);
      })
      .catch((e) => {
        console.log('Error occured while fetching Doctor Favourite Medicine List', e);
      });
  }, []);

  useEffect(() => {
    if (searchInput && searchInput.length > 2) {
      setSuggestions(getSuggestions(searchInput));
    }
  }, [searchInput]);

  useEffect(() => {
    if (idx >= 0) {
      setSelectedValues(selectedValues);
      suggestions &&
        suggestions.length > 0 &&
        suggestions!.map((item, idx) => {
          selectedValues &&
            selectedValues.length > 0 &&
            selectedValues!.map((val: any) => {
              if (val) {
                if (item!.itemname === val!.itemname) {
                  const indexDelete = suggestions.indexOf(item);
                  suggestions!.splice(indexDelete, 1);
                }
              }
            });
        });
    }
  }, [selectedValues, idx]);

  const [state, setState] = React.useState({
    single: '',
    popper: '',
  });
  const [stateSuggestions, setSuggestions] = React.useState<
    (GetCaseSheet_getCaseSheet_pastAppointments_caseSheet_diagnosticPrescription | null)[]
  >([]);

  const handleSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const [showAddCondition, setShowAddCondition] = useState<boolean>(false);
  const [showAddOtherTests, setShowAddOtherTests] = useState<boolean>(false);
  const [otherDiagnostic, setOtherDiagnostic] = useState('');
  const showAddConditionHandler = (show: boolean) => setShowAddCondition(show);
  const [lengthOfSuggestions, setLengthOfSuggestions] = useState<number>(1);
  const [isUpdate, setIsUpdate] = useState(false);

  const handleChange = (itemname: keyof typeof state) => (
    event: React.ChangeEvent<{}>,
    { newValue }: Autosuggest.ChangeEvent
  ) => {
    if (newValue && newValue.length > 2) {
      fetchDignostic(newValue);
    }
    setOtherDiagnostic(newValue);
    setState({
      ...state,
      [itemname]: newValue,
    });
  };
  const [testLoader, setTestLoader] = useState<boolean>(false);
  const [isSmartTestsDialogOpen, setIsSmartTestsDialogOpen] = React.useState<boolean>(false);
  const getTest = () => {
    setTestLoader(true);
    client
      .query<GetDoctorFavouriteTestList>({
        query: GET_DOCTOR_FAVOURITE_TEST_LIST,
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        const temp: any =
          _data.data &&
          _data.data.getDoctorFavouriteTestList &&
          _data.data.getDoctorFavouriteTestList.testList;

        const xArr: any = [];
        temp.map((data1: any) => {
          if (data1) {
            xArr!.push(data1);
          }
        });

        setSelectedValues(xArr);
        setTestLoader(false);
      })
      .catch((e) => {
        console.log('Error occured while fetching Doctor Favourite Medicine List', e);
        setTestLoader(false);
      });
  };
  const handleDelete = (item: any, idx: number) => {
    // suggestions.splice(0, 0, item);
    deleteTest(idx);
    selectedValues!.splice(idx, 1);
    setSelectedValues(selectedValues);
    const sum = idx + Math.random();
    setIdx(sum);
  };
  const autosuggestProps = {
    renderInputComponent,
    suggestions: (stateSuggestions as unknown) as OptionType[],
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
  };

  const saveTests = (value: any) => {
    client
      .mutate<AddDoctorFavouriteTest, AddDoctorFavouriteTestVariables>({
        mutation: ADD_DOCTOR_FAVOURITE_TEST,
        variables: {
          itemname: value.itemName,
        },
      })
      .then((data) => {
        console.log('data after mutation' + data);
        getTest();
      });
  };

  const deleteTest = (idx: any) => {
    if (selectedValues && selectedValues[idx].id!) {
      client
        .mutate<DeleteDoctorFavouriteTest, DeleteDoctorFavouriteTestVariables>({
          mutation: DELETE_DOCTOR_FAVOURITE_TEST,
          variables: {
            testId: selectedValues[idx].id!,
          },
        })
        .then((data) => {
          console.log('data after mutation' + data);
        });
    }
  };
  const updateModalValue = (idx: any) => {
    setUpdateId(selectedValues[idx].id);
    setUpdateText(
      selectedValues[idx].itemname ? selectedValues[idx].itemname : selectedValues[idx].itemName
    );
    setIsUpdate(true);
  };
  const updateTest = (value: any) => {
    client
      .mutate<UpdateDoctorFavouriteTest, UpdateDoctorFavouriteTestVariables>({
        mutation: UPDATE_DOCTOR_FAVOURITE_TEST,
        variables: {
          id: updateId,
          itemname: value,
        },
      })
      .then((data) => {
        console.log('data after mutation' + data);
        getTest();
      });
  };

  return (
    <Typography component="div" className={classes.contentContainer}>
      <Typography component="div" className={classes.fullWidth}>
        {/* <Typography component="h5" variant="h5">
          Tests
        </Typography> */}
        {testLoader ? (
          <CircularProgress className={classes.loader} />
        ) : (
          <Typography component="div" className={classes.listContainer}>
            {/* <div className={classes.card}> */}
            <ul className={classes.addedList}>
              {selectedValues !== null &&
                selectedValues &&
                selectedValues.length > 0 &&
                selectedValues!.map((item: any, idx: any) =>
                  item && item.itemName
                    ? item.itemName!.trim() !== '' && (
                        <li key={idx}>
                          {item!.itemName}
                          <span className={classes.iconRight}>
                            <img
                              width="16"
                              onClick={() => updateModalValue(idx)}
                              src={require('images/round_edit_24_px.svg')}
                              alt=""
                            />
                            <img
                              width="16"
                              onClick={() => handleDelete(item, idx)}
                              src={require('images/ic_cancel_green.svg')}
                              alt=""
                            />
                          </span>
                        </li>
                      )
                    : //   <Chip
                      //     className={classes.othersBtn}
                      //     key={idx}
                      //     label={item!.itemName}
                      //     onDelete={() => handleDelete(item, idx)}
                      //     deleteIcon={<img src={require('images/ic_cancel_green.svg')} alt="" />}
                      //   />
                      // )
                      item.itemname &&
                      item.itemname!.trim() !== '' && (
                        <li key={idx}>
                          {item!.itemname}
                          <span className={classes.iconRight}>
                            <img
                              width="16"
                              onClick={() => updateModalValue(idx)}
                              src={require('images/round_edit_24_px.svg')}
                              alt=""
                            />
                            <img
                              width="16"
                              onClick={() => handleDelete(item, idx)}
                              src={require('images/ic_cancel_green.svg')}
                              alt=""
                            />
                          </span>
                        </li>
                        // <Chip
                        //   className={classes.othersBtn}
                        //   key={idx}
                        //   label={item!.itemname}
                        //   onDelete={() => handleDelete(item, idx)}
                        //   deleteIcon={<img src={require('images/ic_cancel_green.svg')} alt="" />}
                        // />
                      )
                )}
            </ul>
          </Typography>
        )}
      </Typography>
      <Typography component="div" className={classes.textFieldContainer}>
        {!showAddCondition && (
          // <AphButton
          //   className={classes.btnAddDoctor}
          //   variant="contained"
          //   color="primary"
          //   onClick={() => {
          //     showAddConditionHandler(true);

          //   }}
          // >
          //   <img src={require('images/ic_dark_plus.svg')} alt="" />
          //   <div>ADD TESTS</div>
          // </AphButton>
          <AphButton
            variant="contained"
            className={classes.btnAddDoctor}
            color="primary"
            onClick={() => setIsSmartTestsDialogOpen(true)}
          >
            <img src={require('images/ic_dark_plus.svg')} alt="" />
            <div>ADD TESTS</div>
          </AphButton>
        )}
        <AphDialog open={isSmartTestsDialogOpen} className={classes.testsPopup}>
          <Tabs
            value={tabValue}
            classes={{
              root: classes.tabsRoot,
              indicator: classes.tabsIndicator,
            }}
            onChange={(e, newValue) => {
              setTabValue(newValue);
            }}
          >
            <Tab
              classes={{
                root: classes.tabRoot,
                selected: classes.tabSelected,
              }}
              label="ADD BLOOD TEST"
            />
            <Tab
              classes={{
                root: classes.tabRoot,
                selected: classes.tabSelected,
              }}
              label="SCANS &amp; HEALTH CHECKS"
            />
          </Tabs>
          <div onClick={() => setIsSmartTestsDialogOpen(false)} className={classes.closeIcon}>
            <img src={require('images/ic_cross.svg')} alt="" />
          </div>
          {tabValue === 0 && (
            <TabContainer>
              <div className={classes.tabsContainer}>
                <div className={classes.searchFrom}>
                  <Autosuggest
                    onSuggestionSelected={(e, { suggestion }) => {
                      if (selectedValues && selectedValues.length > 0) {
                        selectedValues.push(suggestion);
                        setSelectedValues(selectedValues);
                      } else {
                        const emptySelectedValue = [];
                        emptySelectedValue.push(suggestion);
                        setSelectedValues(emptySelectedValue);
                      }
                      saveTests(suggestion);
                      setShowAddCondition(false);
                      suggestions = suggestions.filter(
                        (val) => selectedValues && !selectedValues!.includes(val!)
                      );
                      setState({
                        single: '',
                        popper: '',
                      });
                      setOtherDiagnostic('');
                    }}
                    {...autosuggestProps}
                    inputProps={{
                      classes,
                      id: 'react-autosuggest-simple',
                      placeholder: 'Search Tests',
                      value: state.single,
                      onChange: handleChange('single'),
                      onKeyPress: (e) => {
                        if (e.which == 13 || e.keyCode == 13) {
                          if (suggestions.length === 1) {
                            if (selectedValues && selectedValues.length > 0) {
                              selectedValues.push(suggestions[0]);
                              setSelectedValues(selectedValues);
                            } else {
                              const emptySelectedValue = [];
                              emptySelectedValue.push(suggestions[0]);
                              setSelectedValues(emptySelectedValue);
                            }
                            saveTests(suggestions[0]);
                            setShowAddCondition(false);
                            suggestions = suggestions.filter(
                              (val) => selectedValues && selectedValues.includes(val!)
                            );
                            setState({
                              single: '',
                              popper: '',
                            });
                            setOtherDiagnostic('');
                          }
                        }
                      },
                    }}
                    theme={{
                      container: classes.container,
                      suggestionsContainerOpen: classes.suggestionsContainerOpen,
                    }}
                    renderSuggestionsContainer={(options) => (
                      <Scrollbars
                        autoHide={true}
                        style={{ height: 'calc(45vh' }}
                        className={classes.searchPopupScroll}
                      >
                        <Paper {...options.containerProps} square className={classes.searchpopup}>
                          {options.children}
                        </Paper>
                      </Scrollbars>
                    )}
                  />
                  {otherDiagnostic.length > 2 && (
                    <AphButton
                      className={classes.darkGreenaddBtn}
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        if (otherDiagnostic.trim() !== '') {
                          const obj = {
                            itemName: otherDiagnostic,
                          };
                          saveTests(obj);
                          selectedValues!.splice(idx, 0, {
                            itemname: otherDiagnostic,
                            __typename: 'DiagnosticPrescription',
                          });
                          setSelectedValues(selectedValues);
                          setShowAddOtherTests(false);
                          setShowAddCondition(false);
                          setIdx(selectedValues!.length + 1);
                          setTimeout(() => {
                            setOtherDiagnostic('');
                          }, 10);
                        } else {
                          setOtherDiagnostic('');
                        }
                      }}
                    >
                      <img src={require('images/ic_add_circle.svg')} alt="" />
                    </AphButton>
                  )}
                </div>
              </div>
            </TabContainer>
          )}
          {tabValue === 1 && (
            <TabContainer>
              <div className={classes.tabsContainer}>
                <div className={classes.comingSoonWrapper}>Coming Soon..</div>
              </div>
            </TabContainer>
          )}
        </AphDialog>
      </Typography>

      <Modal
        open={isUpdate}
        onClose={() => setIsUpdate(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <Paper className={classes.medicinePopup}>
          <AphDialogTitle className={classes.popupHeadingCenter}>
            <div>
              <div>
                <div className={classes.dialogContent}>
                  <Grid container spacing={2}>
                    <Grid item lg={12} xs={12}>
                      <h6>UPDATE TEST</h6>
                      <div className={classes.numberTablets}>
                        <AphTextField
                          value={updateText}
                          onChange={(event: any) => {
                            setUpdateText(event.target.value);
                          }}
                        />
                      </div>
                    </Grid>
                  </Grid>
                </div>
              </div>
              <div className={classes.dialogActions}>
                <AphButton
                  className={classes.cancelBtn}
                  color="primary"
                  onClick={() => {
                    setIsUpdate(false);
                  }}
                >
                  Cancel
                </AphButton>

                <AphButton
                  color="primary"
                  className={classes.updateBtn}
                  onClick={() => {
                    updateTest(updateText);
                    setIsUpdate(false);
                  }}
                >
                  Update Test
                </AphButton>
              </div>
            </div>
          </AphDialogTitle>
        </Paper>
      </Modal>
    </Typography>
  );
};
