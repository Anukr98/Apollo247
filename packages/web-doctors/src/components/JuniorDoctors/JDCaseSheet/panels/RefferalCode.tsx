import React, { useContext, useState, useEffect } from 'react';
import { Typography, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { AphTextField } from '@aph/web-ui-components';
import { GET_ALL_SPECIALTIES } from 'graphql/profiles';
import { GetAllSpecialties } from 'graphql/types/GetAllSpecialties';
import { useApolloClient } from 'react-apollo-hooks';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import Select, { components } from 'react-select';
import { isEmpty } from 'lodash';

const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      {props.selectProps.menuIsOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
    </components.DropdownIndicator>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    width: '100%',

    '& textarea:focus': {
      borderRadius: '5px',
      boxShadow: '0 0 5px #00b38e',
      backgroundColor: '#ffffff',
    },
  },
  sectionContainer: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    border: 0,
    outline: 0,
    fontSize: 15,
    fontWeight: 500,
    color: '#01475b',
    padding: '14px 16px !important',
  },
  inputRoot: {
    border: '1px solid rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: '0 !important',
    borderRadius: 5,
    '& fieldset': {
      border: 0,
    },
  },
  label: {
    color: 'rgba(2, 71, 91, 0.6)',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 12,
  },
  error: {
    '& + p': {
      position: 'absolute',
      bottom: -25,
      margin: 0,
    },
  },
}));

export const RefferalCode: React.FC = () => {
  const classes = useStyles({});
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState<string>('');

  const {
    loading,
    caseSheetEdit,
    referralSpecialtyName,
    referralDescription,
    referralError,
    setReferralSpecialtyName,
    setReferralDescription,
    setReferralError,
  } = useContext(CaseSheetContextJrd);

  const client = useApolloClient();

  const moveCursorToEnd = (element: any) => {
    if (typeof element.selectionStart == 'number') {
      element.selectionStart = element.selectionEnd = element.value.length;
    } else if (typeof element.createTextRange != 'undefined') {
      element.focus();
      const range = element.createTextRange();
      range.collapse(false);
      range.select();
    }
  };

  useEffect(() => {
    client
      .query<GetAllSpecialties>({
        query: GET_ALL_SPECIALTIES,
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        if (
          data &&
          data.data &&
          data.data.getAllSpecialties &&
          data.data.getAllSpecialties.length > 0
        ) {
          const optionData: any[] = [];
          data.data.getAllSpecialties.forEach((value: any) => {
            optionData.push(buildOption(value.name));
          });
          setOptions(optionData);
        }
      });
  }, []);

  if (loading) return null;

  const buildOption = (option: any) => (isEmpty(option) ? '' : { label: option, value: option });

  return (
    <div className={classes.mainContainer}>
      <div className={classes.sectionContainer}>
        <Typography variant="h5" className={classes.label}>
          Which speciality should the patient consult?
        </Typography>
        <Select
          value={buildOption(referralSpecialtyName)}
          onChange={(newValue: any) => {
            const updatedValue = newValue ? newValue.value : '';
            setReferralSpecialtyName(updatedValue);
            if (updatedValue === '') setReferralDescription('');
          }}
          noOptionsMessage={() => 'No speciality matching your search'}
          options={options}
          id="specialty"
          name="specialty"
          isSearchable
          placeholder="Select Speciality..."
          isClearable
          isDisabled={!caseSheetEdit}
          menuShouldScrollIntoView
          backspaceRemovesValue
          inputValue={inputValue || ''}
          onInputChange={(newValue: string) => {
            setInputValue(newValue || '');
          }}
          styles={{
            placeholder: (base: any) => ({
              ...base,
              fontSize: '15px',
              color: '#97aeb7 !important',
              fontWeight: 500,
            }),
            control: (base: any) => ({
              ...base,
              border: '1px solid rgba(2, 71, 91, 0.15)',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              padding: '0 !important',
              borderRadius: 5,
              cursor: 'text',
              outline: 0,
              boxShadow: 'none',
              '&:hover': {
                border: '1px solid rgba(2, 71, 91, 0.15)',
              },
            }),
            valueContainer: (base: any) => ({
              ...base,
              color: '#01475b !important',
              padding: '9px 16px !important',
            }),
            singleValue: (base: any) => ({
              ...base,
              fontSize: 15,
              fontWeight: 500,
              color: '#01475b !important',
            }),
            input: (base: any) => ({
              ...base,
              '& input': {
                fontSize: 15,
                fontWeight: 500,
                color: '#01475b !important',
              },
            }),
            dropdownIndicator: (base: any) => ({
              ...base,
              color: '#00b38e !important',
              cursor: 'pointer',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: '#e6e6e680',
              },
            }),
            clearIndicator: (base: any) => ({
              ...base,
              color: '#00b38e !important',
              cursor: 'pointer',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: '#e6e6e680',
              },
            }),
            menu: (base: any) => ({
              ...base,
              margin: '2px 0',
              border: 0,
              boxShadow: '0 5px 20px 0 rgba(128,128,128,0.8)',
              borderRadius: 10,
              overflow: 'hidden',
            }),
            menuList: (base: any) => ({
              ...base,
              padding: 0,
            }),
            option: (base: any, state: any) => ({
              ...base,
              padding: '10px 20px',
              fontSize: 18,
              color: state.isSelected && '#fff !important',
              backgroundColor: state.isSelected
                ? '#fc9916 !important'
                : state.isFocused
                ? '#f0f4f5 !important'
                : '#fff',
              cursor: 'pointer',
            }),
          }}
          components={{
            DropdownIndicator,
          }}
        />
      </div>
      <div className={classes.sectionContainer}>
        <Typography variant="h5" className={classes.label}>
          Reason*
        </Typography>
        <AphTextField
          variant="outlined"
          placeholder="Enter reason for referral"
          multiline
          disabled={!caseSheetEdit}
          required
          onFocus={(e) => moveCursorToEnd(e.currentTarget)}
          error={referralError}
          value={referralDescription}
          helperText={referralError && 'This field is required'}
          InputProps={{
            classes: {
              root: classes.inputRoot,
              input: classes.input,
              error: classes.error,
            },
          }}
          onChange={(e) => {
            const value = e.target.value.trim();
            if (referralSpecialtyName && !value) setReferralError(true);
            else setReferralError(false);
            setReferralDescription(e.target.value);
          }}
          onBlur={(e) => {
            const value = e.target.value.trim();
            if (referralSpecialtyName && !value) setReferralError(true);
            else setReferralError(false);
          }}
        />
      </div>
    </div>
  );
};
