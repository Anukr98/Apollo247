import React, { useContext, useState, useEffect, ChangeEvent } from 'react';
import { Typography, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import { GET_ALL_SPECIALTIES } from 'graphql/profiles';
import { GetAllSpecialties } from 'graphql/types/GetAllSpecialties';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Script } from 'vm';
import { useParams } from 'hooks/routerHooks';
import { getLocalStorageItem, updateLocalStorageItem } from './LocalStorageUtils';
import { useApolloClient } from 'react-apollo-hooks';
import { from } from 'zen-observable';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    width: '100%',
  },
  sectionContainer: {},
  selectContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    border: 0,
    outline: 0,
    fontSize: 15,
    fontWeight: 500,
    color: '#01475b',
    padding: '0 !important',
  },
  inputRoot: {
    border: '1px solid rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: '14px 16px !important',
    borderRadius: 5,
    '& fieldset': {
      border: 0,
    },
  },
  popupIndicator: {
    color: '#00b38e',
  },
  option: {
    '&:hover, &[data-focus="true"]': {
      backgroundColor: '#f0f4f5',
    },
    '&[aria-selected="true"]': {
      color: '#fff',
      backgroundColor: '#fc9916',
    },
  },
  label: {
    color: 'rgba(2, 71, 91, 0.6)',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 12,
  },
}));

type Params = { id: string; patientId: string; tabValue: string };

export const RefferalCode: React.FC = () => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const {
    loading,
    caseSheetEdit,
    referralSpecialtyName,
    referralDescription,
    setReferralSpecialtyName,
    setReferralDescription,
  } = useContext(CaseSheetContext);

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
          const optionData: string[] = [];
          data.data.getAllSpecialties.forEach((value) => {
            optionData.push(value.name);
          });
          setOptions(optionData);
        }
      });
  }, []);

  if (loading) return null;

  const getDefaultValue = (type: string) => {
    const localStorageItem = getLocalStorageItem(params.id);
    switch (type) {
      case 'referralSpecialtyName':
        return localStorageItem ? localStorageItem.referralSpecialtyName : referralSpecialtyName;
      case 'referralDescription':
        return localStorageItem ? localStorageItem.referralDescription : referralDescription;
    }
  };

  return (
    <div className={classes.mainContainer}>
      <div className={classes.sectionContainer}>
        <Typography variant="h5" className={classes.label}>
          Which speciality should the patient consult?
        </Typography>
        <div className={classes.selectContainer}>
          <Autocomplete
            value={getDefaultValue('referralSpecialtyName')}
            disabled={!caseSheetEdit}
            onChange={(event: ChangeEvent, newValue: string) => {
              //console.log(event);
              const storageItem = getLocalStorageItem(params.id);
              if (storageItem) {
                storageItem.referralSpecialtyName = newValue;
                updateLocalStorageItem(params.id, storageItem);
              }
              setReferralSpecialtyName(newValue);
            }}
            inputValue={inputValue}
            onInputChange={(event: ChangeEvent, newInputValue: string) => {
              //console.log(event);
              setInputValue(newInputValue);
            }}
            options={options}
            closeIcon={null}
            noOptionsText="No speciality matching your search"
            classes={{
              inputRoot: classes.inputRoot,
              input: classes.input,
              popupIndicator: classes.popupIndicator,
              option: classes.option,
            }}
            id="speciality"
            renderInput={(params: any) => (
              <AphTextField {...params} variant="outlined" placeholder="Select Speciality" />
            )}
          />
        </div>
      </div>
    </div>
  );
};
