import React, { useContext, useState, useEffect } from 'react';
import { Typography, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import SelectSearch from 'react-select-search';
import { GET_ALL_SPECIALTIES } from 'graphql/profiles';
import { GetAllSpecialties } from 'graphql/types/GetAllSpecialties'
import { Script } from 'vm';
import { useParams } from 'hooks/routerHooks';
import { getLocalStorageItem, updateLocalStorageItem } from './LocalStorageUtils';
import { useApolloClient } from 'react-apollo-hooks';
import { from } from 'zen-observable';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'wrap',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    width: '49%',
    marginRight: '1%',
  },
  content: {
    borderRadius: '5px',
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    width: '100%',
    position: 'relative',
    '& textarea': {
      border: 'none',
      padding: 15,
      fontSize: 15,
      fontWeight: 500,
      paddingRight: 60,
      borderRadius: 0,
    },
  },
  textContent: {
    color: '#01475b',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.43,
  },
  header: {
    color: 'rgba(2,71,91,0.6)',
    marginBottom: 8,
    marginTop: 16,
    fontWeight: 500,
  },
  mainContainer: {
    display: 'inline-block',
    width: '100%',
  },
  drugAllergies: {
    width: '45%',
    display: 'inline-block',
    paddingRight: 10,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      paddingRight: 0,
    },
  },
  dietAllergies: {
    width: '45%',
    display: 'inline-block',
    float: 'right',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      paddingRight: 0,
    },
  },
  boxActions: {
    position: 'absolute',
    right: 12,
    top: 12,
    display: 'flex',
    alignItems: 'center',
    '& button': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      minWidth: 'auto',
      padding: 0,
      marginLeft: 12,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        maxWidth: 20,
        maxHeight: 20,
      },
    },
  },
}));

type Params = { id: string; patientId: string; tabValue: string };
export const RefferalCode: React.FC = () => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const [options, setOptions] = useState<any>([]); 
//   const options = [
//     {name: 'Swedish', value: 'sv'},
//     {name: 'English', value: 'en'},
//     {name: 'Marathi', value: 'mr'},
//     {name: 'Hindi', value: 'hn'},
//     {name: 'Spanish', value: 'sp'},
// ];
  const {
    loading,
    caseSheetEdit,
  } = useContext(CaseSheetContext);

  const client = useApolloClient();
  const moveCursorToEnd = (element: any) => {
    if (typeof element.selectionStart == 'number') {
      element.selectionStart = element.selectionEnd = element.value.length;
    } else if (typeof element.createTextRange != 'undefined') {
      element.focus();
      var range = element.createTextRange();
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
    if(data && data.data && data.data.getAllSpecialties && data.data.getAllSpecialties.length > 0){
      //console.log(data.data.getAllSpecialties);
      let optionData: any = [];
      data.data.getAllSpecialties.forEach((value, index) => {
        optionData.push({name: value.name, value: value.name})
      })
      setOptions(optionData)
    } 
  //       setAdviceList(
  //         data.data.getDoctorFavouriteAdviceList &&
  //           data.data.getDoctorFavouriteAdviceList.adviceList
  //       );
      });
  }, []);
  console.log(options);
  return loading ? (
    <div></div>
  ) : (
    <Typography component="div" className={classes.mainContainer}>
      <div>
      <SelectSearch search={true} options={options} defaultValue="sv" name="language" placeholder="Choose your language" />
      </div>
    </Typography>
  );
};
