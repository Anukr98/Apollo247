import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Linking, Image, Dimensions } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { HelpIcon, DownOrange, UpOrange, EllipseBulletPoint, ExclamationGreen, HdfcBannerSilver, HdfcBannerGold, HdfcBannerPlatinum, SpeakerOff } from '../ui/Icons';
import { TabsComponent } from '../ui/TabsComponent';
import { AppRoutes } from '../NavigatorContainer';
import { HdfcConnectPopup } from './HdfcConnectPopup';
import { Hdfc_values } from '@aph/mobile-patients/src/strings/strings.json';
import { useAppCommonData } from '../AppCommonDataProvider';
import { g } from '../../helpers/helperFunctions';
import { AvailNowPopup } from './AvailNowPopup';
import { Spinner } from '../ui/Spinner';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 10,
    marginVertical: 4,
    padding: 16,
  },
  tabsContainer: {
    ...theme.viewStyles.cardViewStyle,
    elevation: 4,
    borderRadius: 0,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
    marginTop: 15,
  },
  arrowStyle: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
  sectionsHeading: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eligibleText: {
    ...theme.viewStyles.text('R', 13, '#02475B', 1, 17, 0.35),
    width: '90%'
  },
  horizontalLine: {
    marginVertical: 20,
    borderTopColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopWidth: 1,
  },
  tncContainer: {
    backgroundColor: '#FFFFFF',
    marginVertical: 20,
    borderRadius: 0,
    marginHorizontal: -10,
  },
  tncHeading: {
    ...theme.viewStyles.text('SB', 17, '#02475B', 1, 20, 0.35),
    paddingLeft: 10,
  },
  tncText: {
    ...theme.viewStyles.text('M', 13, '#02475B', 1, 20, 0.35),
    marginBottom: 15,
  },
  redeemButtonText: {
    ...theme.viewStyles.text('B', 15, '#FC9916', 1, 20, 0.35),
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  redeemableCardsHeading: {
    ...theme.viewStyles.text('SB', 15, '#00B38E', 1, 20, 0.35),
    marginBottom: 10,
  },
  redeemableCardsText: {
    ...theme.viewStyles.text('R', 13, '#02475B', 1, 20, 0.35),
    width: '75%',
  },
  bulletPointsContainer: {
    width: '75%',
    marginBottom: 5,
  },
  ellipseBulletPointStyle: {
    resizeMode: 'contain',
    width: 7,
    height: 7,
    alignSelf: 'center',
    marginRight: 10,
  },
  bottomContainer: {
    backgroundColor: '#FC9916',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  howToAvail: {
    flexDirection: 'row',
    marginTop: 15,
    width: '80%',
  },
  oneVectorStyle: {
    marginRight: 10,
    marginTop: 5,
  },
  bulletStyle: {
    resizeMode: 'contain',
    width: 10,
    height: 10,
    alignSelf: 'center',
    marginRight: 10,
  },
  safeAreaStyle: {
    flex: 1,
    backgroundColor: theme.colors.CARD_BG,
  },
  inactivePlanText: {
    ...theme.viewStyles.text('M', 13, '#EA5F65', 1, 17, 0.35),
  },
  benefitsAvailableHeading: {
    ...theme.viewStyles.text('B', 17, '#02475B', 1, 20, 0.35),
    paddingHorizontal: 20,
  },
  membershipBanner: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
});

export interface MembershipDetailsProps extends NavigationScreenProps {
  membershipType: string;
  isActive: boolean;
}

export const MembershipDetails: React.FC<MembershipDetailsProps> = (props) => {
  const membershipType = props.navigation.getParam('membershipType');

  const { hdfcUserSubscriptions } = useAppCommonData();
  const membershipDetails = membershipType === g(hdfcUserSubscriptions, 'name') ? hdfcUserSubscriptions : g(hdfcUserSubscriptions, 'canUpgradeTo');
  const isCanUpgradeTo = 
    membershipType === g(hdfcUserSubscriptions, 'canUpgradeTo', 'name') ||
    membershipType === g(hdfcUserSubscriptions, 'canUpgradeTo', 'canUpgradeTo', 'name');
  const isActivePlan = !!membershipDetails!.isActive;
  const benefits = membershipDetails!.benefits;
  const coupons = membershipDetails!.coupons;
  const areBenefitsAvailable = !!benefits.length;
  const areCouponsAvailable = !!coupons.length;
  const [selectedTab, setSelectedTab] = useState<string>('Benefits Available');
  const [isActiveCouponVisible, setIsActiveCouponVisible] = useState<boolean>(true);
  const [isWhatWillYouGetVisible, setIsWhatWillYouGetVisible] = useState<boolean>(true);
  const [isHowToAvailVisible, setIsHowToAvailVisible] = useState<boolean>(true);
  const [isTnCVisible, setIsTnCVisible] = useState<boolean>(false);
  const [showHdfcConnectPopup, setShowHdfcConnectPopup] = useState<boolean>(false);
  const [showAvailPopup, setShowAvailPopup] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const { TnC, SILVER_PLAN, GOLD_PLAN, PLATINUM_PLAN } = Hdfc_values;

  useEffect(() => {
    if (hdfcUserSubscriptions && g(hdfcUserSubscriptions, '_id')) {
      setshowSpinner(false);
    }
  }, [hdfcUserSubscriptions]);

  const benefitsActionMapping = [
    {
      attribute: 'CALL_EXOTEL_API',
      action: () => {
        setShowHdfcConnectPopup(true);
      }
    },
    {
      attribute: 'SPECIALITY_LISTING',
      action: () => {
        props.navigation.navigate(AppRoutes.DoctorSearch);
      }
    },
    {
      attribute: 'PHARMACY_LANDING',
      action: () => {
        props.navigation.navigate('MEDICINES');
      }
    },
    {
      attribute: 'PHR',
      action: () => {
        props.navigation.navigate('APPOINTMENTS');
      }
    },
    {
      attribute: 'DIAGNOSTICS_LANDING',
      action: () => {
        props.navigation.navigate('HEALTH RECORDS');
      }
    },
    {
      attribute: 'DOC_LISTING_WITH_PAYROLL_DOCS_SELECTED',
      action: () => {
        props.navigation.navigate(AppRoutes.DoctorSearch);
      }
    },
    {
      attribute: 'WHATSAPP_OPEN_CHAT',
      action: () => {
        Linking.openURL(`whatsapp://send?text=&phone=+914048218743`);
      }
    },
  ];

  const renderTabComponent = () => {
    return (
      <ScrollView bounces={false}>
        {renderCoupons()}
        <TabsComponent
          style={styles.tabsContainer}
          onChange={(title) => {
            setSelectedTab(title);
          }}
          data={
            [{ title: 'Benefits Available' }, { title: 'Benefits Consumed' }]
          }
          selectedTab={selectedTab}
          selectedTitleStyle={theme.viewStyles.text('B', 16, '#02475B')}
        />
        {selectedTab == 'Benefits Available'
          ? renderBenefitsAvailable()
          : renderBenefitsConsumed()}
      </ScrollView>
    );
  };

  const renderActivePlans = () => {
    return (
      (areBenefitsAvailable) &&
      benefits.map(value => {
        const {headerContent, description, ctaLabel, ctaAction, benefitCtaAction, icon} = value;
        const {action, message, type} = benefitCtaAction;
        const ctaLabelName = ctaLabel.toUpperCase();
        return (
          ctaLabelName !== 'NULL' && 
          renderRedeemableCards(
            headerContent, 
            description, 
            ctaLabelName, 
            ctaAction,
            action,
            message,
            type,
            icon,
          )
        )
      })
    );
  };

  const renderInactivePlans = () => {
    return (
      <View style={styles.cardStyle}>
        {
          benefits.map((value, index) => {
            const {headerContent, description, icon} = value;
            return (
              <>
                {renderRedeemableCardsContent(headerContent, description, icon)}
                <TouchableOpacity disabled={true} onPress={() => {}}>
                  <Text style={[styles.redeemButtonText, {color: '#f7cc8f'}]}>
                    REDEEM
                  </Text>
                </TouchableOpacity>
                {
                  (index + 1 !== benefits.length) &&
                  <View style={styles.horizontalLine} />
                }
              </>
            )
          })
        }
      </View>
    )
  };

  const renderBenefitsAvailable = () => {
    return (
      <ScrollView 
        contentContainerStyle={{
          padding: 10,
          backgroundColor: '#FFFFFF'
        }}
        bounces={false}
      >
        {isActivePlan ? renderActivePlans() : renderInactivePlans()}

        {renderTermsAndConditions()}
        {/* {renderBottomContainer()} */}
      </ScrollView>
    );
  };

  const renderTermsAndConditions = () => {
    return (
      <View style={[styles.cardStyle, styles.tncContainer]}>
        <TouchableOpacity onPress={() => {setIsTnCVisible(!isTnCVisible)}} style={styles.sectionsHeading}>
          <Text style={styles.tncHeading}>Terms and Conditions</Text>
          {
            isTnCVisible ? 
            <DownOrange
              style={styles.arrowStyle}
            /> :
            <UpOrange
              style={styles.arrowStyle}
            />
          }
        </TouchableOpacity>
        {
          isTnCVisible && 
          <View style={{
            padding: 10,
          }}>
            {
              TnC.map((text, index) => {
                return (
                  <Text style={styles.tncText}>{`${index + 1}. ${text}`}</Text>
                )
              })
            }
          </View>
        }
      </View>
    );
  };

  const renderRedeemableCards = (
    heading: string, 
    bodyText: string, 
    ctaLabel: string, 
    ctaAction: string,
    action: string,
    message: string,
    type: string,
    icon: string | null,
  ) => {
    let actionCta = benefitsActionMapping.filter((value) => {
      return value.attribute === action
    });
    if (type === 'WHATSAPP_OPEN_CHAT') {
      actionCta = [
        {
          attribute: type,
          action: () => {
            Linking.openURL(`whatsapp://send?text=${message}&phone=${action}`);
          }
        }
      ]
    };
    const onCtaClick = actionCta[0].action;
    return (
      <View style={[styles.cardStyle, { marginVertical: 10 }]}>
        {renderRedeemableCardsContent(heading, bodyText, icon)}
        <TouchableOpacity onPress={() => {onCtaClick()}}>
          <Text style={styles.redeemButtonText}>
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRedeemableCardsContent = (heading: string, bodyText: string, icon: string | null) => {
    // console.log(icon);
    return (
      <View>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <Text style={styles.redeemableCardsHeading}>
            {heading}
          </Text>
          {/* {
            icon && 
            <Image
              style={{
                width: 30,
                height: 30,
                resizeMode: 'contain',
              }}
              source={{
                uri: icon,
              }}
              resizeMode={'contain'}
            />
          } */}
        </View>
        <Text style={styles.redeemableCardsText}>
          {bodyText}
        </Text>
      </View>
    );
  };

  const renderCouponInfo = (name?: string, description?: string) => {
    return (
      <View style={{
        marginTop: 15,
      }}>
        <Text style={theme.viewStyles.text('SB', 13, '#007C9D', 1, 25, 0.35)}>
          {name}
        </Text>
        <Text style={theme.viewStyles.text('R', 12, '#02475B', 1, 17, 0.35)}>
          {description}
        </Text>
      </View>
    );
  };

  const renderBenefitsConsumed = () => {
    const benefitStyle = StyleSheet.create({
      whiteBG: {
        backgroundColor: 'white',
      },
      benefitContainer: {
        width,
        flexDirection: 'column',
        padding: 20,
        borderBottomColor: '#A9A9A9',
        borderBottomWidth: 1,
      },
      rowStretch: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'stretch',
      },
      halfWidth: {
        width: width / 2.1
      },
      benefitDescription: {
        textTransform: 'uppercase',
        paddingRight: 10,
        ...theme.viewStyles.text('R', 15, '#000000', 1, 20, 0.35),
      },
      benefitHeading: {
        ...theme.viewStyles.text('SB', 15, '#00B38E', 1, 20, 0.35),
        marginBottom: 10,
      },
    });
    return (
      <ScrollView 
        horizontal={true}
        // showsHorizontalScrollIndicator={true}
        contentContainerStyle={{
          paddingVertical: 20,
        }} 
        bounces={false}
      >
        <View style={[
          benefitStyle.whiteBG,
          {
            flexDirection: 'row',
          }
        ]}>
          {
            benefits.map(value => {
              const limit = value.attributeType!.type;
              const status = limit === 'unlimited' ? 'AVAILABLE' : `${value.attributeType!.remaining} REMAINING`;
              return (
                <View style={benefitStyle.benefitContainer}>
                  <View style={benefitStyle.rowStretch}>
                    <View style={benefitStyle.halfWidth}>
                      <Text style={benefitStyle.benefitHeading}>
                        BENEFIT
                      </Text>
                      <Text style={benefitStyle.benefitDescription}>
                        {value.headerContent}
                      </Text>
                    </View>
                    <View style={benefitStyle.halfWidth}>
                      <Text style={benefitStyle.benefitHeading}>
                        WHAT DO YOU GET
                      </Text>
                      <Text style={benefitStyle.benefitDescription}>
                        {value.description}
                      </Text>
                    </View>
                  </View>
                  <View style={benefitStyle.rowStretch}>
                    <View style={benefitStyle.halfWidth}>
                      <Text style={benefitStyle.benefitHeading}>
                        REDEMPTION LIMIT
                      </Text>
                      <Text style={benefitStyle.benefitDescription}>
                        {limit}
                      </Text>
                    </View>
                    <View style={benefitStyle.halfWidth}>
                      <Text style={benefitStyle.benefitHeading}>
                        STATUS
                      </Text>
                      <Text style={benefitStyle.benefitDescription}>
                        {status}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })
          }
        </View>
      </ScrollView>
    );
  };

  const renderBottomContainer = () => {
    const buttonText = isCanUpgradeTo ? 'AVAIL NOW' : (isActivePlan ? 'EXPLORE NOW' : 'ACTIVATE NOW');
    return (
      <TouchableOpacity
        style={styles.bottomContainer}
        onPress={() => {
          if (isCanUpgradeTo) {
            setShowAvailPopup(true);
          } else {
            props.navigation.navigate(AppRoutes.ConsultRoom, {});
          }
        }}
      >
        <Text style={theme.viewStyles.text('B', 13, '#FFFFFF', 1, 20, 0.35)}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSubscribeContent = () => {
    return (
      <ScrollView 
        contentContainerStyle={{
          marginHorizontal: 10,
          paddingBottom: 20,
        }}
        bounces={false}
      >
        {areBenefitsAvailable && renderWhatWillYouGet()}
        {renderHowToAvail()}
        {/* {renderBottomContainer()} */}
      </ScrollView>
    )
  };

  const renderWhatWillYouGet = () => {
    return (
      <View style={styles.cardStyle}>
        <TouchableOpacity onPress={() => {setIsWhatWillYouGetVisible(!isWhatWillYouGetVisible)}} style={styles.sectionsHeading}>
          <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 20, 0.35)}>
            What Will You Get!
          </Text>
          {
            isWhatWillYouGetVisible ? 
            <DownOrange
              style={styles.arrowStyle}
            /> :
            <UpOrange
              style={styles.arrowStyle}
            />
          }
        </TouchableOpacity>
        {
          isWhatWillYouGetVisible &&
          <View style={{
            marginTop: 15,
          }}>
            {
              benefits.map(value => {
                return (
                  getEllipseBulletPoint(value.headerContent)
                )
              })
            }
          </View>
        }
      </View>
    );
  };

  const renderHowToAvail = () => {
    return (
      <View style={styles.cardStyle}>
        <TouchableOpacity onPress={() => {setIsHowToAvailVisible(!isHowToAvailVisible)}} style={styles.sectionsHeading}>
          <View style={{
            flexDirection: 'row'
          }}>
            <ExclamationGreen style={{
              width: 20,
              height: 20,
              resizeMode: 'contain',
              marginRight: 10,
            }} />
            <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 20, 0.35)}>
              How To Avail
            </Text>
          </View>
          {
            isHowToAvailVisible ? 
            <DownOrange
              style={styles.arrowStyle}
            /> :
            <UpOrange
              style={styles.arrowStyle}
            />
          }
        </TouchableOpacity>
        {
          isHowToAvailVisible &&
          renderHowToAvailContent()
        }
      </View>
    );
  };

  const renderHowToAvailContent = () => {
    const canUpgradeMembership = g(hdfcUserSubscriptions, 'canUpgradeTo', 'name');
    const smallCaseName = canUpgradeMembership ? canUpgradeMembership.toLowerCase() : '';
    return (
      <View style={{
        marginTop: 15,
      }}>
        <Text style={theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35)}>
          {`Complete transactions worth Rs.${membershipDetails!.minTransactionValue} or more on the Apollo 24|7 app to unlock ${smallCaseName} membership​`}
        </Text>
      </View>
    );
  };

  const getEllipseBulletPoint = (text: string) => {
    return (
      <View style={{flexDirection: 'row', marginBottom: 15}}>
        <EllipseBulletPoint style={styles.bulletStyle} />
        <Text style={theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35)}>{text}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <Header
          leftIcon="backArrow"
          rightComponent={<HelpIcon style={styles.arrowStyle} />}
          title={'MEMBERSHIP PLAN DETAIL'}
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
    );
  };

  const renderInactivePlansContainer = () => {
    return (
      <ScrollView bounces={false}>
        {renderInactivePlanMessage()}
        <Text style={styles.benefitsAvailableHeading}>Benefits Available</Text>
        {renderBenefitsAvailable()}
      </ScrollView>
    );
  };

  const renderInactivePlanMessage = () => {
    return (
      <View style={[
        styles.cardStyle,
        {
          marginHorizontal: 20,
          marginBottom: 20,
        }
      ]}>
        <Text style={theme.viewStyles.text('M', 14, '#02475B', 1, 17, 0.35)}>
          Complete your first transaction to unlock your benefits
        </Text>
        <Text style={theme.viewStyles.text('M', 14, '#02475B', 1, 27, 0.35)}>
          How to Unlock
        </Text>
        <Text style={{
          ...theme.viewStyles.text('R', 13, '#007C9D', 1, 17, 0.35),
          marginTop: 6,
        }}>
          {`Transact for Rs ${membershipDetails!.minTransactionValue} or more on Virtual Consultations or Pharmacy Orders`}
        </Text>
      </View>
    )
  };

  const renderCoupons = () => {
    return (
      areCouponsAvailable &&
      <View style={styles.cardStyle}>
        <TouchableOpacity onPress={() => {setIsActiveCouponVisible(!isActiveCouponVisible)}} style={styles.sectionsHeading}>
          <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 20, 0.35)}>
            Here’s what you have unlocked !
          </Text>
          {
            isActiveCouponVisible ? 
            <DownOrange
              style={styles.arrowStyle}
            /> :
            <UpOrange
              style={styles.arrowStyle}
            />
          }
        </TouchableOpacity>
        {
          isActiveCouponVisible &&
          <View style={{
            marginTop: 15,
          }}>
            <Text style={styles.eligibleText}>
              Use the coupon codes to avail the benefits
            </Text>
            {
              coupons.map(value => {
                return (
                  renderCouponInfo(value.coupon, value.message)
                );
              })
            }
          </View>
        }
      </View>
    )
  };

  const renderMembershipBanner = () => {
    const isSilverMembership = membershipType === SILVER_PLAN;
    const isGoldMembership = membershipType === GOLD_PLAN;
    const isPlatinumMembership = membershipType === PLATINUM_PLAN;

    return (
      <View>
        {isSilverMembership && <HdfcBannerSilver style={styles.membershipBanner}/>}
        {isGoldMembership && <HdfcBannerGold style={styles.membershipBanner}/>}
        {isPlatinumMembership && <HdfcBannerPlatinum style={styles.membershipBanner}/>}
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeAreaStyle}>
        {renderHeader()}
        {renderMembershipBanner()}
        {
          isCanUpgradeTo ?
          renderSubscribeContent() : 
          (
            isActivePlan ? 
            renderTabComponent() : 
            renderInactivePlansContainer()
          )
        }
        {renderBottomContainer()}
      </SafeAreaView>
      {
        showHdfcConnectPopup &&
        <HdfcConnectPopup
          onClose={() => setShowHdfcConnectPopup(false)}
        />
      }
      {
        showAvailPopup && 
        <AvailNowPopup 
          onClose={() => setShowAvailPopup(false)} 
          transactionAmount={membershipDetails!.minTransactionValue} 
          navigation={props.navigation}
        />
      }
      {showSpinner && <Spinner />}
    </View>
  );
};
