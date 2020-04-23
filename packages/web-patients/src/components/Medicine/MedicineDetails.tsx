import React, { useRef, useEffect } from 'react';
import { Theme, Tabs, Tab } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import Scrollbars from 'react-custom-scrollbars';
import { MedicineImageGallery } from 'components/Medicine/MedicineImageGallery';
import { MedicineInformation } from 'components/Medicine/MedicineInformation';
import { useParams } from 'hooks/routerHooks';
import axios from 'axios';
import { MedicineProductDetails, PharmaOverview } from '../../helpers/MedicineApiCalls';
import stripHtml from 'string-strip-html';
import { MedicinesCartContext } from 'components/MedicinesCartProvider';
import { NavigationBottom } from 'components/NavigationBottom';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alerts } from 'components/Alerts/Alerts';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { ManageProfile } from 'components/ManageProfile';
import { Relation } from 'graphql/types/globalTypes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    medicineDetailsPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        paddingBottom: 20,
        position: 'absolute',
        top: 0,
        zIndex: 999,
        width: '100%',
      },
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
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
        position: 'fixed',
        zIndex: 999,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        boxShadow: '0 15px 20px 0 rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      },
    },
    medicineDetailsGroup: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px',
      },
      [theme.breakpoints.down('xs')]: {
        marginTop: 50,
      },
    },
    medicineDetailsHeader: {
      display: 'none',
      background: '#fff',
      padding: 20,
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 999,
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      padding: '0 10px 0 0',
      backgroundColor: '#fff',
      marginRight: 10,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        padding: 0,
      },
    },
    scrollResponsive: {
      [theme.breakpoints.down(992)]: {
        height: 'calc(100vh - 250px) !important',
      },
      [theme.breakpoints.down('xs')]: {
        maxHeight: 'inherit !important',
        height: 'auto !important',
      },
      '& > div': {
        [theme.breakpoints.down('xs')]: {
          maxHeight: 'inherit !important',
        },
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
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
    detailsHeader: {
      flex: 1,
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    productInformation: {
      backgroundColor: theme.palette.common.white,
      padding: 20,
      borderRadius: 5,
      display: 'flex',
      [theme.breakpoints.down(992)]: {
        display: 'block',
        width: '100%',
      },
      [theme.breakpoints.down(768)]: {
        display: 'flex',
        padding: '20px 0 0 0',
        backgroundColor: '#f7f8f5',
      },
    },
    noImageWrapper: {
      width: 290,
      border: 'solid 1px rgba(151,151,151,0.24)',
      borderRadius: 10,
      [theme.breakpoints.down(991)]: {
        width: '100%',
      },
      [theme.breakpoints.down('xs')]: {
        width: 80,
        position: 'absolute',
        marginLeft: 20,
      },
      '& img': {
        width: '100%',
      },
    },
    productDetails: {
      paddingLeft: 20,
      width: 'calc(100% - 290px)',
      [theme.breakpoints.down(992)]: {
        width: '100%',
        paddingTop: 20,
      },
      [theme.breakpoints.down('xs')]: {
        paddingTop: 0,
        paddingLeft: 0,
      },
      '& h2': {
        fontSize: 20,
        fontWeight: 600,
        color: '#02475b',
        margin: 0,
        paddingBottom: 10,
      },
    },
    productBasicInfo: {
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 115,
        minHeight: 160,
      },
    },
    productDetailed: {
      [theme.breakpoints.down('xs')]: {
        padding: '20px 0',
      },
    },
    productInfo: {
      fontSize: 14,
      color: '#02475b',
      lineHeight: '22px',
      fontWeight: 500,
      '& p': {
        margin: '5px 0',
      },
      [theme.breakpoints.down('xs')]: {
        borderTop: '0.5px solid rgba(2,71,91,0.3)',
        margin: '0 20px',
        padding: '20px 0',
      },
    },
    textInfo: {
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      textTransform: 'uppercase',
      paddingBottom: 8,
      '& label': {
        textTransform: 'none',
        color: '#658f9b',
        display: 'block',
      },
    },
    tabsRoot: {
      borderRadius: 0,
      minHeight: 'auto',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      margin: '5px 0 0 0',
      '& svg': {
        color: '#02475b',
      },
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
      },
      '&:before': {
        content: '""',
        borderTop: '0.5px solid rgba(2,71,91,0.3)',
        position: 'absolute',
        left: 20,
        right: 20,
      },
    },
    tabRoot: {
      fontSize: 14,
      fontWeight: 500,
      textAlign: 'center',
      color: '#02475b',
      padding: '10px 0',
      textTransform: 'none',
      opacity: 0.5,
      lineHeight: 'normal',
      minWidth: 'auto',
      minHeight: 'auto',
      flexBasis: 'auto',
      margin: '0 15px 0 0',
    },
    tabSelected: {
      opacity: 1,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 3,
    },
    tabContainer: {
      fontSize: 14,
      color: '#0087ba',
      lineHeight: '22px',
      [theme.breakpoints.down('xs')]: {
        padding: '15px 20px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      },
      '& p': {
        margin: '5px 0',
      },
    },
    productDescription: {
      fontSize: 14,
      color: '#0087ba',
      lineHeight: '22px',
      '& p': {
        margin: '5px 0',
      },
      '& ul': {
        padding: '0 0 0 20px',
      },
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        padding: 20,
      },
    },
    prescriptionBox: {
      backgroundColor: '#f7f8f5',
      padding: '8px 12px',
      display: 'flex',
      fontSize: 12,
      fontWeight: 'bold',
      color: '#02475b',
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
    },
    preImg: {
      marginLeft: 'auto',
      paddingLeft: 20,
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 72,
      },
    },
  };
});

type MedicineOverViewDetails = {
  Caption: string;
  CaptionDesc: string;
};

type MedicineOverView = MedicineOverViewDetails[] | string;

export const MedicineDetails: React.FC = (props) => {
  const classes = useStyles({});
  const [tabValue, setTabValue] = React.useState<number>(0);
  const params = useParams<{ sku: string }>();
  const [medicineDetails, setMedicineDetails] = React.useState<MedicineProductDetails | null>(null);
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);

  const apiDetails = {
    url: process.env.PHARMACY_MED_PROD_DETAIL_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  };

  const getMedicineDetails = async (sku: string) => {
    await axios
      .post(
        apiDetails.url || '',
        { params: sku },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then(({ data }) => {
        setMedicineDetails(data.productdp[0]);
      })
      .catch((e) => {
        alert(e);
      });
  };
  const { allCurrentPatients } = useAllCurrentPatients()
  const onePrimaryUser = 
    allCurrentPatients && allCurrentPatients.filter((x) => x.relation === Relation.ME).length === 1;

  useEffect(() => {
    if (!medicineDetails) {
      getMedicineDetails(params.sku);
    }
  }, [medicineDetails]);

  let medicinePharmacyDetails: PharmaOverview[] | null = null;

  if (medicineDetails && medicineDetails.PharmaOverview) {
    medicinePharmacyDetails = medicineDetails.PharmaOverview;
  }

  const getHeader = (caption: string) => {
    switch (caption) {
      case 'DRUG ALCOHOL INTERACTION':
        return 'Alcohol';
      case 'DRUG PREGNANCY INTERACTION':
        return 'Pregnancy';
      case 'DRUG MACHINERY INTERACTION (DRIVING)':
        return 'Driving';
      case 'KIDNEY':
        return 'Kidney';
      case 'LIVER':
        return 'Liver';
      default:
        return null;
    }
  };

  const getData = (overView: MedicineOverView) => {
    const modifiedData = [
      { key: 'Overview', value: '' },
      { key: 'Usage', value: '' },
      { key: 'Side Effects', value: '' },
      { key: 'Precautions', value: '' },
      { key: 'Drug Warnings', value: '' },
      { key: 'Storage', value: '' },
    ];

    if (typeof overView !== 'string') {
      overView.forEach((v) => {
        if (v.Caption === 'USES') {
          modifiedData.forEach((x) => {
            if (x.key === 'Overview') {
              x.value = x.value.concat(stripHtml(v.CaptionDesc));
            }
          });
        } else if (v.Caption === 'SIDE EFFECTS') {
          modifiedData.forEach((x) => {
            if (x.key === 'Side Effects') {
              x.value = `${x.value}${v.CaptionDesc.split('&lt;')
                .join('<')
                .split('&gt;')
                .join('>')
                .replace(/(<([^>]+)>)/gi, '')
                .replace(/&amp;amp;/g, '&')
                .replace(/&amp;nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '')
                .replace(/&gt/g, '')
                .replace(/br \//g, '')}`;
            }
          });
        } else if (v.Caption === 'HOW TO USE' || v.Caption === 'HOW IT WORKS') {
          modifiedData.forEach((x) => {
            if (x.key === 'Usage') {
              if (v.Caption === 'HOW TO USE') {
                x.value = `${stripHtml(v.CaptionDesc)}${x.value}`;
              } else {
                x.value = `${x.value}${stripHtml(v.CaptionDesc)} `;
              }
            }
          });
        } else if (
          v.Caption === 'DRUG ALCOHOL INTERACTION' ||
          v.Caption === 'DRUG PREGNANCY INTERACTION' ||
          v.Caption === 'DRUG MACHINERY INTERACTION (DRIVING)' ||
          v.Caption === 'KIDNEY' ||
          v.Caption === 'LIVER'
        ) {
          modifiedData.forEach((x) => {
            if (x.key === 'Precautions') {
              x.value = `${x.value}
              ${getHeader(v.Caption)}: \n
              ${v.CaptionDesc.split('&amp;lt')
                .join('<')
                .split('&amp;gt;')
                .join('>')
                .replace(/(<([^>]+)>)/gi, '')
                .replace(/&amp;amp;/g, '&')
                .replace(/&amp;nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/\.t/g, '.')}; \n
                `;
            }
          });
        } else if (v.Caption === 'DRUGS WARNINGS') {
          modifiedData.forEach((x) => {
            if (x.key === 'Drug Warnings') {
              x.value = `${x.value}${v.CaptionDesc.split('&lt;')
                .join('<')
                .split('&gt;')
                .join('>')
                .replace(/(<([^>]+)>)/gi, '')
                .replace(/&amp;amp;/g, '&')
                .replace(/&amp;nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '')
                .replace(/&gt/g, '')
                .replace(/br \//g, '')
                .replace(/&#039;/g, '')}`;
            }
          });
        } else if (v.Caption === 'STORAGE') {
          modifiedData.forEach((x) => {
            if (x.key === 'Storage') {
              x.value = x.value.concat(stripHtml(v.CaptionDesc));
            }
          });
        }
      });
    }
    return modifiedData;
  };

  const getUsageDesc = (desc: string) => {
    return desc.split('.').map((eachDesc) => {
      return <p>{eachDesc}.</p>;
    });
  };

  const renderOverviewTabDesc = (overView: MedicineOverView) => {
    const data = getData(overView);
    if (typeof overView !== 'string') {
      return data.map(
        (item, index) =>
          tabValue === index && (
            <div key={index} className={classes.tabContainer}>
              {item.value.split(';').map((description, idx) => {
                if (item.key === 'Usage') {
                  return <div key={index}>{getUsageDesc(description)}</div>;
                } else {
                  return <p key={idx}>{description}</p>;
                }
              })}
            </div>
          )
      );
    }
    return [];
  };

  const renderOverviewTabs = (overView: MedicineOverView) => {
    const data = getData(overView);
    return data.map((item, index) => (
      <Tab
        key={index}
        classes={{
          root: classes.tabRoot,
          selected: classes.tabSelected,
        }}
        label={item.key}
      />
    ));
  };
  const description =
    medicineDetails &&
    medicineDetails.description
      .split('&lt;')
      .join('<')
      .split('&gt;')
      .join('>')
      .replace(/(<([^>]+)>)/gi, '')
      .replace(/&amp;amp;/g, '&')
      .replace(/&amp;nbsp;/g, ' ')
      .replace(/&amp;/g, '&');
  return (
    <div className={classes.root}>
      <MedicinesCartContext.Consumer>
        {() => (
          <>
            <Header />
            <div className={classes.container}>
              <div className={classes.medicineDetailsPage}>
                <div className={classes.breadcrumbs}>
                  <a onClick={() => window.history.back()}>
                    <div className={classes.backArrow}>
                      <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                      <img
                        className={classes.whiteArrow}
                        src={require('images/ic_back_white.svg')}
                      />
                    </div>
                  </a>
                  <div className={classes.detailsHeader}>Product Detail</div>
                </div>
                {medicineDetails ? (
                  <div className={classes.medicineDetailsGroup}>
                    <div className={classes.searchSection}>
                      <Scrollbars
                        className={classes.scrollResponsive}
                        autoHide={true}
                        autoHeight
                        autoHeightMax={'calc(100vh - 215px'}
                      >
                        <div className={classes.productInformation}>
                          {medicineDetails.image && medicineDetails.image.includes('.') ? (
                            <MedicineImageGallery data={medicineDetails} />
                          ) : (
                            <div className={classes.noImageWrapper}>
                              <img src={require('images/medicine.svg')} alt="" />
                            </div>
                          )}
                          <div className={classes.productDetails}>
                            <div className={classes.productBasicInfo}>
                              <h2>{medicineDetails.name}</h2>
                              <div className={classes.textInfo}>
                                <label>Manufacturer</label>
                                {medicineDetails.manufacturer}
                              </div>
                              {medicinePharmacyDetails && medicinePharmacyDetails.length > 0 && (
                                <div className={classes.textInfo}>
                                  <label>Composition</label>
                                  {`${medicinePharmacyDetails[0].generic}-${medicinePharmacyDetails[0].Strengh}${medicinePharmacyDetails[0].Unit}`}
                                </div>
                              )}
                              <div className={classes.textInfo}>
                                <label>Pack Of</label>
                                {`${medicineDetails.mou} ${
                                  medicinePharmacyDetails && medicinePharmacyDetails.length > 0
                                    ? medicinePharmacyDetails[0].Doseform
                                    : ''
                                }${
                                  medicineDetails.mou && parseFloat(medicineDetails.mou) !== 1
                                    ? 'S'
                                    : ''
                                }`}
                              </div>
                              {medicineDetails.is_prescription_required !== '0' && (
                                <div className={classes.prescriptionBox}>
                                  <span>This medicine requires doctor’s prescription</span>
                                  <span className={classes.preImg}>
                                    <img src={require('images/ic_tablets.svg')} alt="" />
                                  </span>
                                </div>
                              )}
                            </div>
                            {medicinePharmacyDetails &&
                            medicinePharmacyDetails.length > 0 &&
                            medicinePharmacyDetails[0].Overview &&
                            medicinePharmacyDetails[0].Overview.length > 0 ? (
                              <>
                                <Tabs
                                  value={tabValue}
                                  variant="scrollable"
                                  scrollButtons="on"
                                  classes={{
                                    root: classes.tabsRoot,
                                    indicator: classes.tabsIndicator,
                                  }}
                                  onChange={(e, newValue) => {
                                    setTabValue(newValue);
                                  }}
                                >
                                  {renderOverviewTabs(medicinePharmacyDetails[0].Overview)}
                                </Tabs>
                                {renderOverviewTabDesc(medicinePharmacyDetails[0].Overview)}
                              </>
                            ) : medicineDetails.description ? (
                              <div className={classes.productDetailed}>
                                <div className={classes.productInfo}>Product Information</div>
                                <div className={classes.productDescription}>
                                  {description &&
                                    description.split('rn').map((data, index) => {
                                      return <p key={index}>{data}</p>;
                                    })}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </Scrollbars>
                    </div>
                    <MedicineInformation data={medicineDetails} />
                  </div>
                ) : (
                  <div className={classes.progressLoader}>
                    <CircularProgress size={30} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </MedicinesCartContext.Consumer>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
      <NavigationBottom />
      {!onePrimaryUser && <ManageProfile />}
    </div>
  );
};
