import React, { useState, useContext, useRef } from 'react';
import { Chip, Theme } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { useParams } from 'hooks/routerHooks';
import { Params } from 'components/JuniorDoctors/JDCaseSheet/CaseSheet';
import {
  getLocalStorageItem,
  updateLocalStorageItem,
} from 'components/case-sheet/panels/LocalStorageUtils';

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
        boxShadow: 'none',
      },
      '& img': {
        marginRight: 8,
      },
    },
    inputRoot: {
      position: 'relative',
      marginTop: 6,
      '& button': {
        position: 'absolute',
        right: 16,
        top: 14,
        minWidth: 'auto',
        margin: 0,
        '& img': {
          margin: 0,
        },
      },
      '& textarea': {
        paddingRight: 50,
      },
    },
    chipSection: {
      paddingBottom: 0,
    },
    chipCol: {
      display: 'inline-block',
    },
    chipItem: {
      padding: 12,
      paddingRight: 80,
      fontSize: 14,
      fontWeight: 600,
      color: '#02475b',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      borderRadius: 5,
      marginRight: 16,
      marginTop: 6,
      marginBottom: 6,
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
      height: 'auto',
      wordBreak: 'break-word',
      position: 'relative',
      '& span': {
        padding: 0,
        whiteSpace: 'pre-wrap',
      },
      '&:focus': {
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
      },
    },
    editImg: {
      position: 'absolute',
      right: 60,
      top: 10,
      cursor: 'pointer',
    },
    deleteImg: {
      position: 'absolute',
      right: 10,
      top: 10,
    },
    autoSuggestBox: {
      position: 'relative',
    },
    searchpopup: {
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128,128,128,0.8)',
      marginTop: 2,
      position: 'absolute',
      left: 0,
      width: '100%',
      zIndex: 1,
      '& ul': {
        padding: 0,
        margin: 0,
        borderRadius: 10,
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
            padding: '10px 62px 10px 16px',
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
            borderRadius: '10px 10px 0 0',
          },
          '&:last-child': {
            borderRadius: '10px 10px 0 0',
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
  })
);

export const OtherInstructions: React.FC = () => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const { otherInstructions: selectedValues, setOtherInstructions: setSelectedValues } = useContext(
    CaseSheetContextJrd
  );
  const adviceInputRef = useRef(null);
  const { caseSheetEdit } = useContext(CaseSheetContextJrd);
  const [idx, setIdx] = React.useState(0);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [showAddInputText, setShowAddInputText] = useState<boolean>(false);
  const handleDelete = (item: any, idx: number) => {
    selectedValues!.splice(idx, 1);
    const storageItem = getLocalStorageItem(params.appointmentId);
    if (storageItem) {
      storageItem.otherInstructions = selectedValues;
      updateLocalStorageItem(params.appointmentId, storageItem);
    }
    setSelectedValues(selectedValues);
    const sum = idx + Math.random();
    setIdx(sum);
  };

  const renderChipWithEditableField = (item: any, idx: number) => {
    if (isEditing === idx) {
      if (showAddInputText) {
        setShowAddInputText(false);
      }

      return (
        <div
          className={classes.inputRoot}
          key={idx}
          style={{
            marginBottom: 12,
          }}
        >
          <AphTextField
            autoFocus
            fullWidth
            multiline
            placeholder="Enter instruction here.."
            defaultValue={item.instruction}
            inputRef={adviceInputRef}
          />
          <AphButton
            classes={{ root: classes.addBtn }}
            disableRipple
            onClick={() => {
              const node = (adviceInputRef as any).current;
              if (node) {
                const adviceValue = node.value;
                const updatedText = adviceValue || item.instruction;
                if (updatedText.trim() !== '') {
                  selectedValues!.splice(idx, 1, {
                    instruction: updatedText,
                    __typename: 'OtherInstructions',
                  });

                  const storageItem = getLocalStorageItem(params.appointmentId);
                  if (storageItem) {
                    storageItem.otherInstructions = selectedValues;
                    updateLocalStorageItem(params.appointmentId, storageItem);
                  }

                  setSelectedValues(selectedValues);
                  setTimeout(() => {
                    node.value = '';
                    setIsEditing(false);
                  }, 10);
                } else {
                  node.value = item.instruction;
                  setIsEditing(false);
                }
              } else {
                console.log('No node selected');
              }
            }}
          >
            <img src={require('images/ic_plus.svg')} alt="" />
          </AphButton>
        </div>
      );
    }
    return (
      <div className={classes.chipCol}>
        <Chip
          className={classes.chipItem}
          key={idx}
          label={item!.instruction}
          icon={
            <img
              src={caseSheetEdit && require('images/ic_edit.svg')}
              alt=""
              height="20px"
              className={classes.editImg}
              onClick={() => {
                setIsEditing(idx);
              }}
            />
          }
          onDelete={() => handleDelete(item, idx)}
          deleteIcon={
            <img
              src={caseSheetEdit ? require('images/ic_cancel_green.svg') : ''}
              alt=""
              height="20px"
              className={classes.deleteImg}
            />
          }
        />
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <div className={classes.sectionGroup}>
        <div className={classes.sectionTitle}>Instructions to the patient</div>
        <div className={classes.chipSection}>
          {selectedValues !== null &&
            selectedValues.length > 0 &&
            selectedValues!.map(
              (item, idx) =>
                item.instruction!.trim() !== '' && renderChipWithEditableField(item, idx)
            )}
        </div>
      </div>
      {showAddInputText && (
        <div className={classes.inputRoot}>
          <AphTextField
            autoFocus
            fullWidth
            multiline
            placeholder="Enter instruction here.."
            inputRef={adviceInputRef}
          />
          <AphButton
            classes={{ root: classes.addBtn }}
            disableRipple
            onClick={() => {
              const node = (adviceInputRef as any).current;
              if (node) {
                const adviceValue = node.value;
                if (adviceValue.trim() !== '') {
                  selectedValues!.splice(idx, 0, {
                    instruction: adviceValue,
                    __typename: 'OtherInstructions',
                  });
                  const storageItem = getLocalStorageItem(params.appointmentId);
                  if (storageItem) {
                    storageItem.otherInstructions = selectedValues;
                    updateLocalStorageItem(params.appointmentId, storageItem);
                  }
                  setSelectedValues(selectedValues);
                  setIdx(selectedValues!.length + 1);
                }
                node.value = '';
                node.focus();
              } else {
                console.log('No node selected');
              }
            }}
          >
            <img src={require('images/ic_plus.svg')} alt="" />
          </AphButton>
        </div>
      )}
      {!showAddInputText && caseSheetEdit && (
        <AphButton classes={{ root: classes.addBtn }} onClick={() => setShowAddInputText(true)}>
          <img src={require('images/ic_dark_plus.svg')} alt="" /> Add Instructions
        </AphButton>
      )}
    </div>
  );
};
