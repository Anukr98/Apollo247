import React, { useState, useEffect } from 'react';
import { Typography, Chip, Theme, MenuItem, Paper, TextField } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { makeStyles, createStyles } from '@material-ui/styles';
import AddCircle from '@material-ui/icons/AddCircle';
import { AphButton } from '@aph/web-ui-components';
import deburr from 'lodash/deburr';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Autosuggest from 'react-autosuggest';
import {
  GetJuniorDoctorCaseSheet,
  GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription,
} from 'graphql/types/GetJuniorDoctorCaseSheet';

interface OptionType {
  name: string;
}

const suggestions: (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription | null)[] = [
  { name: 'Ultrasound', __typename: 'DiagnosticPrescription' },
  { name: 'Ultra-something else', __typename: 'DiagnosticPrescription' },
];

function renderInputComponent(inputProps: any) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: (node) => {
          ref(node);
          inputRef(node);
        },
        classes: {
          input: classes.input,
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
  const matches = match(suggestion.name, query);
  const parts = parse(suggestion.name, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part) => (
          <span key={part.text} style={{ fontWeight: part.highlight ? 500 : 400 }}>
            {part.text}
          </span>
        ))}
      </div>
    </MenuItem>
  );
}

function getSuggestions(value: string) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? []
    : suggestions.filter((suggestion) => {
        const keep =
          count < 5 &&
          suggestion !== null &&
          suggestion.name!.slice(0, inputLength).toLowerCase() === inputValue;

        if (keep) {
          count += 1;
        }

        return keep;
      });
}

function getSuggestionValue(suggestion: OptionType) {
  return suggestion.name;
}

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
    suggestion: {
      display: 'block',
    },
    suggestionsList: {
      margin: 0,
      padding: 0,
      listStyleType: 'none',
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
      height: 44,
      marginBottom: 12,
      borderRadius: 5,
      fontWeight: 600,
      fontSize: 14,
      color: '#02475b !important',
      '&:focus': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
      '& span': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'left',
      },
    },
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
  })
);

interface CasesheetInfoProps {
  casesheetInfo: GetJuniorDoctorCaseSheet;
}
export const DiagnosticPrescription: React.FC<CasesheetInfoProps> = (props) => {
  const classes = useStyles();
  //const [selectedValues, setSelectedValues] = useState<OptionType[]>([{ name: 'Diagnostic ABC' }]);
  const [selectedValues, setSelectedValues] = useState<
    (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription | null)[]
  >([]);
  useEffect(() => {
    if (
      props.casesheetInfo.getJuniorDoctorCaseSheet!.caseSheetDetails &&
      props.casesheetInfo.getJuniorDoctorCaseSheet!.caseSheetDetails &&
      props.casesheetInfo.getJuniorDoctorCaseSheet!.caseSheetDetails!.diagnosticPrescription &&
      props.casesheetInfo.getJuniorDoctorCaseSheet!.caseSheetDetails!.diagnosticPrescription !==
        null &&
      props.casesheetInfo.getJuniorDoctorCaseSheet!.caseSheetDetails!.diagnosticPrescription
        .length > 0
    ) {
      setSelectedValues(
        props.casesheetInfo.getJuniorDoctorCaseSheet!.caseSheetDetails!.diagnosticPrescription
      );
    }
  }, []);
  // const [favoriteDiagnostics, setFavoriteDiagnostics] = useState<OptionType[]>([
  //   { name: 'Diagnostic DEF' },
  //   { name: 'Diagnostic XYZ' },
  // ]);
  const [state, setState] = React.useState({
    single: '',
    popper: '',
  });
  const [stateSuggestions, setSuggestions] = React.useState<
    (GetJuniorDoctorCaseSheet_getJuniorDoctorCaseSheet_caseSheetDetails_diagnosticPrescription | null)[]
  >([]);

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
    setState({
      ...state,
      [name]: newValue,
    });
  };
  const [showAddCondition, setShowAddCondition] = useState<boolean>(false);
  const showAddConditionHandler = (show: boolean) => setShowAddCondition(show);

  const autosuggestProps = {
    renderInputComponent,
    suggestions: stateSuggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
  };

  return (
    <Typography component="div" className={classes.contentContainer}>
      <Typography component="div" className={classes.column}>
        <Typography component="h5" variant="h5">
          Diagnosed Medical Condition
        </Typography>
        <Typography component="div" className={classes.listContainer}>
          {selectedValues.map((item, idx) => (
            <Chip
              className={classes.othersBtn}
              key={idx}
              label={item!.name}
              onDelete={() => {}}
              deleteIcon={<img src={require('images/ic_selected.svg')} alt="" />}
            />
          ))}
        </Typography>
      </Typography>
      {/* <Typography component="div" className={classes.column}>
        <Typography component="h3" variant="h4">
          Favorite Diagnostics
        </Typography>
        <Typography component="div" className={classes.listContainer}>
          {favoriteDiagnostics.map((item, idx) => (
            <Chip
              key={idx}
              label={item.name}
              onDelete={() => {
                setSelectedValues(selectedValues.concat(item));
                setFavoriteDiagnostics(favoriteDiagnostics.filter((i) => i.name !== item.name));
              }}
              deleteIcon={<AddCircle className={classes.icon} />}
            />
          ))}
        </Typography>
      </Typography> */}
      <Typography component="div" className={classes.textFieldContainer}>
        {!showAddCondition && (
          <AphButton
            className={classes.btnAddDoctor}
            variant="contained"
            color="primary"
            onClick={() => showAddConditionHandler(true)}
          >
            <img src={require('images/ic_add.svg')} alt="" /> ADD CONDITION
          </AphButton>
        )}
        {showAddCondition && (
          <div>fkgdjfhgkdf</div>
          // <Autosuggest
          //   onSuggestionSelected={(e, { suggestion }) => {
          //     setSelectedValues(selectedValues.concat(suggestion));
          //     setShowAddCondition(false);
          //     setState({
          //       single: '',
          //       popper: '',
          //     });
          //   }}
          //   {...autosuggestProps}
          //   inputProps={{
          //     classes,
          //     id: 'react-autosuggest-simple',
          //     placeholder: 'Search Diagnostics',
          //     value: state.single,
          //     onChange: handleChange('single'),
          //   }}
          //   theme={{
          //     container: classes.container,
          //     suggestionsContainerOpen: classes.suggestionsContainerOpen,
          //     suggestionsList: classes.suggestionsList,
          //     suggestion: classes.suggestion,
          //   }}
          //   renderSuggestionsContainer={(options) => (
          //     <Paper {...options.containerProps} square>
          //       {options.children}
          //     </Paper>
          //   )}
          // />
        )}
      </Typography>
    </Typography>
  );
};
