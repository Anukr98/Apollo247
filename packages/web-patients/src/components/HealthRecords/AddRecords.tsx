import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  Grid,
  ExpansionPanelDetails,
  MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton, AphSelect, AphTextField } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    addRecordsPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f0f1ec',
        paddingBottom: 20,
        position: 'absolute',
        top: 0,
        zIndex: 999,
        height: '100%',
      },
    },
    breadcrumbs: {
      marginLeft: 62,
      marginRight: 62,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        zIndex: 2,
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        padding: '15px 20px',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    addRecordSection: {
      padding: '10px 42px 20px 42px',
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    detailsHeader: {
      [theme.breakpoints.down('xs')]: {
        flex: 1,
        textAlign: 'center',
      },
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      marginRight: 15,
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        paddingBottom: 16,
        marginBottom: 0,
      },
    },
    count: {
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 5,
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -122,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      [theme.breakpoints.down('xs')]: {
        marginRight: 0,
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    panelRoot: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: '12px !important',
      width: '100%',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: '4px 20px',
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      textTransform: 'uppercase',
    },
    panelExpanded: {
      minHeight: 'auto !important',
      '& >div:first-child': {
        marginTop: 12,
        marginBottom: 12,
      },
    },
    panelDetails: {
      padding: 20,
      paddingTop: 0,
      display: 'inline-block',
      width: '100%',
    },
    gridWidth: {
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        padding: '5px 10px !important',
      },
    },
    uploadImage: {
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      marginTop: 5,
      '& input': {
        position: 'absolute',
        left: -40,
        top: -40,
      },
      '& label': {
        backgroundColor: '#f7f8f5',
        borderRadius: 5,
        fontSize: 14,
        fontWeight: 600,
        color: '#fc9916',
        textTransform: 'uppercase',
        cursor: 'pointer',
        lineHeight: '44px',
        padding: 20,
        display: 'block',
        width: '100%',
        textAlign: 'center',
        [theme.breakpoints.down('xs')]: {
          padding: 0,
          lineHeight: 1,
          backgroundColor: '#fff',
          textAlign: 'right',
          margin: '8px 0',
        },
      },
    },
    uploadedImage: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: '20px 16px 20px 20px',
      display: 'flex',
      alignItems: 'center',
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      marginTop: 5,
      minHeight: 84,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
        minHeight: 'auto',
        backgroundColor: '#fff',
      },
    },
    docImg: {
      marginRight: 16,
      '& img': {
        verticalAlign: 'middle',
        maxWidth: 30,
      },
    },
    documentDetails: {
      display: 'flex',
      width: '100%',
      [theme.breakpoints.down('xs')]: {
        borderBottom: '0.5px solid rgba(2,71,91,0.3)',
        paddingBottom: 10,
      },
    },
    removeBtn: {
      marginLeft: 'auto',
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        minWidth: 'auto',
      },
    },
    formGroup: {
      paddingTop: 5,
      paddingBottom: 10,
      '& label': {
        fontSize: 14,
        fontWeight: 500,
        color: '#02475b',
      },
      '& >div': {
        paddingTop: 0,
      },
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      '& ul': {
        padding: '10px 20px',
        '& li': {
          fontSize: 16,
          fontWeight: 500,
          color: '#01475b',
          minHeight: 'auto',
          paddingLeft: 0,
          paddingRight: 0,
          borderBottom: '1px solid rgba(1,71,91,0.2)',
          textTransform: 'capitalize',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    formGroupHeader: {
      paddingBottom: 15,
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
    },
    formGroupContent: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 20,
      marginBottom: 15,
    },
    formBottomActions: {
      textAlign: 'right',
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        color: '#fc9916',
      },
      [theme.breakpoints.down('xs')]: {
        marginBottom: 15,
      },
    },
    observationDetails: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 24,
      marginTop: 15,
    },
    formGroupLast: {
      marginBottom: 0,
    },
    customScroll: {
      padding: 20,
      paddingTop: 10,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 20,
        paddingBottom: 5,
      },
    },
    pageBottomActions: {
      padding: 20,
      paddingTop: 10,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        paddingTop: 20,
      },
      '& button': {
        borderRadius: 10,
        minWidth: 288,
      },
    },
  };
});

export const AddRecords: React.FC = (props) => {
  const classes = useStyles({});
  const [typeOfRecord] = React.useState(1);
  const [nameOfTest] = React.useState(1);
  const [unit] = React.useState(1);
  const [minValue] = React.useState(1);
  const [maxValue] = React.useState(1);
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.addRecordsPage}>
          <div className={classes.breadcrumbs}>
            <Link to={clientRoutes.healthRecords()}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            <div className={classes.detailsHeader}>Add a Record</div>
          </div>
          <div className={classes.addRecordSection}>
            <Scrollbars
              autoHide={true}
              autoHeight
              autoHeightMax={isSmallScreen ? 'calc(100vh - 130px)' : 'calc(100vh - 255px)'}
            >
              <div className={classes.customScroll}>
                <ExpansionPanel className={classes.panelRoot} defaultExpanded={true}>
                  <ExpansionPanelSummary
                    expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
                    classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
                  >
                    Documents Uploaded
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <Grid container spacing={2}>
                      <Grid item sm={4} className={classes.gridWidth}>
                        <div className={classes.uploadedImage}>
                          <div className={classes.docImg}>
                            <img src={require('images/ic_prescription_thumbnail.png')} alt="" />
                          </div>
                          <div className={classes.documentDetails}>
                            <span>IMG_2019072601</span>
                            <div className={classes.removeBtn}>
                              <AphButton>
                                <img src={require('images/ic_cross_onorange_small.svg')} alt="" />
                              </AphButton>
                            </div>
                          </div>
                        </div>
                      </Grid>
                      <Grid item sm={4} className={classes.gridWidth}>
                        <div className={classes.uploadedImage}>
                          <div className={classes.docImg}>
                            <img src={require('images/ic_prescription_thumbnail.png')} alt="" />
                          </div>
                          <div className={classes.documentDetails}>
                            <span>IMG_2019072601</span>
                            <div className={classes.removeBtn}>
                              <AphButton>
                                <img src={require('images/ic_cross_onorange_small.svg')} alt="" />
                              </AphButton>
                            </div>
                          </div>
                        </div>
                      </Grid>
                      <Grid item sm={4} className={classes.gridWidth}>
                        <div className={classes.uploadImage}>
                          <input accept="image/*" id="icon-button-file" type="file" />
                          <label htmlFor="icon-button-file">Upload document</label>
                        </div>
                      </Grid>
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel className={classes.panelRoot} defaultExpanded={true}>
                  <ExpansionPanelSummary
                    expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
                    classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
                  >
                    Record Details
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <Grid container spacing={2}>
                      <Grid item sm={6} className={classes.gridWidth}>
                        <div className={classes.formGroup}>
                          <label>Type Of Record</label>
                          <AphSelect
                            value={typeOfRecord}
                            MenuProps={{
                              classes: { paper: classes.menuPopover },
                              anchorOrigin: {
                                vertical: 'top',
                                horizontal: 'right',
                              },
                              transformOrigin: {
                                vertical: 'top',
                                horizontal: 'right',
                              },
                            }}
                          >
                            <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                              Test Report
                            </MenuItem>
                          </AphSelect>
                        </div>
                      </Grid>
                      <Grid item sm={6} className={classes.gridWidth}>
                        <div className={classes.formGroup}>
                          <label>Name Of Test</label>
                          <AphSelect
                            value={nameOfTest}
                            MenuProps={{
                              classes: { paper: classes.menuPopover },
                              anchorOrigin: {
                                vertical: 'top',
                                horizontal: 'right',
                              },
                              transformOrigin: {
                                vertical: 'top',
                                horizontal: 'right',
                              },
                            }}
                          >
                            <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                              Glucose-Serum/Plasma (Fasting)
                            </MenuItem>
                          </AphSelect>
                        </div>
                      </Grid>
                      <Grid item sm={6} className={classes.gridWidth}>
                        <div className={classes.formGroup}>
                          <label>Date Of Test</label>
                          <AphTextField value={'09/08/2019'} placeholder="09/08/2019" />
                        </div>
                      </Grid>
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel className={classes.panelRoot} defaultExpanded={true}>
                  <ExpansionPanelSummary
                    expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
                    classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
                  >
                    Report Details (Optional)
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <div className={classes.formGroupHeader}>Parameters</div>
                    {/* click on Add Parameters button this section will be repeat */}
                    <div className={classes.formGroupContent}>
                      <Grid container spacing={2}>
                        <Grid item sm={6} className={classes.gridWidth}>
                          <div className={classes.formGroup}>
                            <label>Name Of Parameter</label>
                            <AphTextField value="" placeholder="Name Of Parameter" />
                          </div>
                        </Grid>
                        <Grid item sm={6} className={classes.gridWidth}>
                          <div className={classes.formGroup}>
                            <label>Result</label>
                            <AphTextField value="" placeholder="Result" />
                          </div>
                        </Grid>
                        <Grid item sm={6} className={classes.gridWidth}>
                          <div className={classes.formGroup}>
                            <label>Unit</label>
                            <AphSelect
                              value={unit}
                              MenuProps={{
                                classes: { paper: classes.menuPopover },
                                anchorOrigin: {
                                  vertical: 'top',
                                  horizontal: 'right',
                                },
                                transformOrigin: {
                                  vertical: 'top',
                                  horizontal: 'right',
                                },
                              }}
                            >
                              <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                                Select unit
                              </MenuItem>
                            </AphSelect>
                          </div>
                        </Grid>
                      </Grid>
                      <Grid container spacing={2}>
                        <Grid item sm={6} className={classes.gridWidth}>
                          <div className={classes.formGroup}>
                            <label>Min</label>
                            <AphSelect
                              value={minValue}
                              MenuProps={{
                                classes: { paper: classes.menuPopover },
                                anchorOrigin: {
                                  vertical: 'top',
                                  horizontal: 'right',
                                },
                                transformOrigin: {
                                  vertical: 'top',
                                  horizontal: 'right',
                                },
                              }}
                            >
                              <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                                Enter value
                              </MenuItem>
                            </AphSelect>
                          </div>
                        </Grid>
                        <Grid item sm={6} className={classes.gridWidth}>
                          <div className={classes.formGroup}>
                            <label>Max</label>
                            <AphSelect
                              value={maxValue}
                              MenuProps={{
                                classes: { paper: classes.menuPopover },
                                anchorOrigin: {
                                  vertical: 'top',
                                  horizontal: 'right',
                                },
                                transformOrigin: {
                                  vertical: 'top',
                                  horizontal: 'right',
                                },
                              }}
                            >
                              <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                                Enter value
                              </MenuItem>
                            </AphSelect>
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                    {/*Parameters Group end here */}
                    <div className={classes.formBottomActions}>
                      <AphButton>Add Parameter</AphButton>
                    </div>
                    <div className={classes.observationDetails}>
                      <div className={classes.formGroupHeader}>Observation Details</div>
                      <div className={`${classes.formGroupContent} ${classes.formGroupLast}`}>
                        <Grid container spacing={2}>
                          <Grid item sm={6} className={classes.gridWidth}>
                            <div className={classes.formGroup}>
                              <label>Referring Doctor</label>
                              <AphTextField value="" placeholder="Enter name" />
                            </div>
                          </Grid>
                          <Grid item sm={6} className={classes.gridWidth}>
                            <div className={classes.formGroup}>
                              <label>Observations / Impressions</label>
                              <AphTextField value="" placeholder="Enter observations" />
                            </div>
                          </Grid>
                          <Grid item sm={6} className={classes.gridWidth}>
                            <div className={classes.formGroup}>
                              <label>Additional Notes</label>
                              <AphTextField value="" placeholder="Enter notes" />
                            </div>
                          </Grid>
                        </Grid>
                      </div>
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </div>
            </Scrollbars>
            <div className={classes.pageBottomActions}>
              <AphButton color="primary">Add Record</AphButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
