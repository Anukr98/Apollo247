import React, { useEffect } from 'react';
import { Theme, Tabs, Tab } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { clientRoutes } from 'helpers/clientRoutes';
import Scrollbars from 'react-custom-scrollbars';
import { MedicineImageGallery } from 'components/Medicine/MedicineImageGallery';
import { MedicineInformation } from 'components/Medicine/MedicineInformation';
import { useParams } from 'hooks/routerHooks';
import axios from 'axios';
import { MedicineProductDetails, PharmaOverview } from '../../helpers/MedicineApiCalls';
import stripHtml from 'string-strip-html';
import { MedicinesCartContext } from 'components/MedicinesCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    medicineDetailsPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
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
        zIndex: 2,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
    },
    medicineDetailsGroup: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 20px 20px 3px',
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      padding: '0 10px 0 0',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingRight: 20,
        paddingTop: 14,
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
    customScroll: {
      padding: '0 7px 0 20px',
    },
    productInformation: {
      backgroundColor: theme.palette.common.white,
      padding: 20,
      borderRadius: 5,
      display: 'flex',
    },
    productDetails: {
      paddingLeft: 20,
      width: 'calc(100% - 290px)',
      '& h2': {
        fontSize: 20,
        fontWeight: 600,
        color: '#02475b',
        margin: 0,
        paddingBottom: 10,
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
    },
    tabRoot: {
      fontSize: 14,
      fontWeight: 500,
      textAlign: 'center',
      color: '#02475b',
      padding: 0,
      paddingBottom: 6,
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

  const apiDetails = {
    url: `${
      process.env.NODE_ENV === 'production'
        ? process.env.PHARMACY_MED_PROD_URL
        : process.env.PHARMACY_MED_UAT_URL
    }/popcsrchpdp_api.php`,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  };

  const getMedicineDetails = async (sku: string) => {
    await axios
      .post(
        apiDetails.url,
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
      .catch((e) => alert(e));
  };

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
      { key: 'Side Effects', value: '' },
      { key: 'Usage', value: '' },
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
              x.value = x.value.concat(stripHtml(v.CaptionDesc));
            }
          });
        } else if (v.Caption === 'HOW TO USE' || v.Caption === 'HOW IT WORKS') {
          modifiedData.forEach((x) => {
            if (x.key === 'Usage') {
              x.value = x.value.concat(stripHtml(v.CaptionDesc));
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
                .replace(/&amp;/g, '&')}; \n
                `;
            }
          });
        } else if (v.Caption === 'DRUGS WARNINGS') {
          modifiedData.forEach((x) => {
            if (x.key === 'Drug Warnings') {
              x.value = x.value.concat(stripHtml(v.CaptionDesc));
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

  const renderOverviewTabDesc = (overView: MedicineOverView) => {
    const data = getData(overView);
    if (typeof overView !== 'string') {
      return data.map(
        (item, index) =>
          tabValue === index && (
            <div key={index} className={classes.tabContainer}>
              {item.value.split(';').map((data, idx) => {
                return <p key={idx}>{data}</p>;
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
    <div className={classes.welcome}>
      <MedicinesCartContext.Consumer>
        {() => (
          <>
            <div className={classes.headerSticky}>
              <div className={classes.container}>
                <Header />
              </div>
            </div>
            <div className={classes.container}>
              <div className={classes.medicineDetailsPage}>
                <div className={classes.breadcrumbs}>
                  <a onClick={() => (window.location.href = clientRoutes.medicines())}>
                    <div className={classes.backArrow}>
                      <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                      <img
                        className={classes.whiteArrow}
                        src={require('images/ic_back_white.svg')}
                      />
                    </div>
                  </a>
                  Product Detail
                </div>
                {medicineDetails && (
                  <div className={classes.medicineDetailsGroup}>
                    <div className={classes.searchSection}>
                      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 215px'}>
                        <div className={classes.customScroll}>
                          <div className={classes.productInformation}>
                            <MedicineImageGallery data={medicineDetails} />
                            <div className={classes.productDetails}>
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
                              {medicinePharmacyDetails &&
                              medicinePharmacyDetails.length > 0 &&
                              medicinePharmacyDetails[0].Overview &&
                              medicinePharmacyDetails[0].Overview.length > 0 ? (
                                <>
                                  <Tabs
                                    value={tabValue}
                                    variant="scrollable"
                                    scrollButtons="auto"
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
                                <div>
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
                        </div>
                      </Scrollbars>
                    </div>
                    <MedicineInformation data={medicineDetails} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </MedicinesCartContext.Consumer>
    </div>
  );
};
