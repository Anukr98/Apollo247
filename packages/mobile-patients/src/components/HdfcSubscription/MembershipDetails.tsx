import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { HelpIcon, DownOrange, UpOrange, EllipseBulletPoint, OneVectorNumber, TwoVectorNumber } from '../ui/Icons';
import { TabsComponent } from '../ui/TabsComponent';
import { SubscriptionBanner } from './SubscriptionBanner';
import { AppRoutes } from '../NavigatorContainer';
import { HdfcConnectPopup } from './HdfcConnectPopup';
import { Hdfc_values } from '@aph/mobile-patients/src/strings/strings.json';
import { useAppCommonData } from '../AppCommonDataProvider';
import { g } from '../../helpers/helperFunctions';

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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  benefitsAvailableHeading: {
    ...theme.viewStyles.text('B', 17, '#02475B', 1, 20, 0.35),
    paddingHorizontal: 20,
  }
});

export interface MembershipDetailsProps extends NavigationScreenProps {
  membershipType: string;
  isActive: boolean;
}

export const MembershipDetails: React.FC<MembershipDetailsProps> = (props) => {
  const membershipType = props.navigation.getParam('membershipType');

  const { hdfcUserSubscriptions } = useAppCommonData();
  const membershipDetails = membershipType === g(hdfcUserSubscriptions, 'name') ? hdfcUserSubscriptions : g(hdfcUserSubscriptions, 'canUpgradeTo');
  const isActivePlan = !!membershipDetails!.isActive;
  const benefits = membershipDetails!.benefits;
  const coupons = membershipDetails!.coupons;
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('Benefits Available');
  const [isActiveCouponVisible, setIsActiveCouponVisible] = useState<boolean>(true);
  const [isWhatWillYouGetVisible, setIsWhatWillYouGetVisible] = useState<boolean>(true);
  const [isHowToAvailVisible, setIsHowToAvailVisible] = useState<boolean>(true);
  const [isTnCVisible, setIsTnCVisible] = useState<boolean>(false);
  const [showHdfcConnectPopup, setShowHdfcConnectPopup] = useState<boolean>(false);
  const { TnC, WhatWillYouGetPoints } = Hdfc_values;

  const benefitsActionsMapping = [
    {
      attribute: 'Call Exotel API',
      action: () => {
        setShowHdfcConnectPopup(true);
      }
    },
    {
      attribute: 'Redirect to Specialty Listing',
      action: () => {
        props.navigation.navigate(AppRoutes.DoctorSearch);
      }
    },
    {
      attribute: 'Redirect to Pharmacy Landing',
      action: () => {
        props.navigation.navigate('MEDICINES');
      }
    },
    {
      attribute: 'Redirect to PHR',
      action: () => {
        props.navigation.navigate('APPOINTMENTS');
      }
    },
    {
      attribute: 'Redirect to doc listing with payroll docs selected',
      action: () => {
        props.navigation.navigate(AppRoutes.DoctorSearch);
      }
    },
    {
      attribute: 'Call Whatsapp API & open chat with ****',
      action: () => {
        Linking.openURL(`whatsapp://send?text=&phone=+914048218743`);
      }
    },
  ];

  const renderTabComponent = () => {
    return (
      <>
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
        <ScrollView bounces={false}>
          {selectedTab == 'Benefits Available'
            ? renderBenefitsAvailable()
            : renderBenefitsConsumed()}
        </ScrollView>
      </>
    );
  };

  const renderActivePlans = () => {
    return (
      <>
        <View style={styles.cardStyle}>
          <TouchableOpacity onPress={() => {setIsActiveCouponVisible(!isActiveCouponVisible)}} style={styles.sectionsHeading}>
            <Text style={theme.viewStyles.text('SB', 15, '#00B38E', 1, 20, 0.35)}>
              Active Coupons
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
                You are eligible for the following coupons on Apollo 24|7
              </Text>
              {
                coupons &&
                coupons.map(value => {
                  return (
                    renderCouponInfo(value.coupon, value.message)
                  );
                })
              }
            </View>
          }
        </View>
        {
          benefits.map(value => {
            const {headerContent, description, ctaLabel, ctaAction} = value;
            const ctaLabelName = ctaLabel.toUpperCase();
            return (
              ctaLabelName !== 'NULL' && renderRedeemableCards(headerContent, description, ctaLabel, ctaAction)
            )
          })
        }
      </>
    );
  };

  const renderInactivePlans = () => {
    return (
      <View style={styles.cardStyle}>
        {
          benefits.map((value, index) => {
            const {headerContent, description} = value;
            return (
              <>
                {renderRedeemableCardsContent(headerContent, description)}
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
        {renderBottomContainer()}
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

  const renderRedeemableCards = (heading: string, bodyText: string, ctaLabel: string, ctaAction: string) => {
    const action = benefitsActionsMapping.filter((value) => {
      return value.attribute === ctaAction
    });
    const onCtaClick = action[0].action;
    return (
      <View style={[styles.cardStyle, { marginVertical: 10 }]}>
        {renderRedeemableCardsContent(heading, bodyText)}
        <TouchableOpacity onPress={() => {onCtaClick()}}>
          <Text style={styles.redeemButtonText}>
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRedeemableCardsContent = (heading: string, bodyText: string) => {
    return (
      <>
      <Text style={styles.redeemableCardsHeading}>
        {heading}
      </Text>
      <Text style={styles.redeemableCardsText}>
        {bodyText}
      </Text>
      {/* {
        bodyText.length === 1 ? (
          <Text style={styles.redeemableCardsText}>
            {bodyText[0]}
          </Text>
        ) : (
          <View style={styles.bulletPointsContainer}>
            {
              bodyText.map((text) => {
                return (
                  <View style={{flexDirection: 'row', marginBottom: 10}}>
                    <EllipseBulletPoint style={styles.ellipseBulletPointStyle} />
                    <Text style={theme.viewStyles.text('R', 13, '#02475B', 1, 20, 0.35)}>{text}</Text>
                  </View>
                )
              })
            }
          </View>
        )
      } */}
      </>
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
        width: '50%'
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
        contentContainerStyle={{
          paddingVertical: 20,
        }} 
        bounces={false}
      >
        <View style={benefitStyle.whiteBG}>
          {
            benefits.map(value => {
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
                  <View style={[benefitStyle.rowStretch, { marginTop: 20 }]}>
                    <View style={benefitStyle.halfWidth}>
                      <Text style={benefitStyle.benefitHeading}>
                        REDEMPTION LIMIT
                      </Text>
                      <Text style={benefitStyle.benefitDescription}>
                        {value.attributeType!.type}
                      </Text>
                    </View>
                    <View style={benefitStyle.halfWidth}>
                      <Text style={benefitStyle.benefitHeading}>
                        STATUS
                      </Text>
                      <Text style={benefitStyle.benefitDescription}>
                      {`${value.attributeType!.remaining} REMAINING`}
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
    return (
      <TouchableOpacity
        style={styles.bottomContainer}
        onPress={() => {
          props.navigation.navigate(AppRoutes.ConsultRoom, {});
        }}
      >
        <Text style={theme.viewStyles.text('B', 13, '#FFFFFF', 1, 20, 0.35)}>
          {isActivePlan ? 'EXPLORE NOW' : 'ACTIVATE NOW'}
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
        {renderWhatWillYouGet()}
        {renderHowToAvail()}
        {renderBottomContainer()}
      </ScrollView>
    )
  };

  const renderWhatWillYouGet = () => {
    return (
      <View style={styles.cardStyle}>
        <TouchableOpacity onPress={() => {setIsWhatWillYouGetVisible(!isWhatWillYouGetVisible)}} style={styles.sectionsHeading}>
          <Text style={theme.viewStyles.text('SB', 15, '#00B38E', 1, 20, 0.35)}>
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
              WhatWillYouGetPoints.map(value => {
                return (
                  getEllipseBulletPoint(value)
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
          <Text style={theme.viewStyles.text('SB', 15, '#00B38E', 1, 20, 0.35)}>
            How To Avail
          </Text>
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
    return (
      <View style={{
        marginTop: 15,
      }}>
        <Text style={theme.viewStyles.text('SB', 13, '#02475B', 1, 20, 0.35)}>
          Please Follow These Steps
        </Text>
        <View>
          <View style={styles.howToAvail}>
            <OneVectorNumber style={styles.oneVectorStyle} />
            <Text style={{
              ...theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35),
            }}>
              Complete transactions worth Rs 25000+ on Apollo 24/7
            </Text>
          </View>
          <View style={styles.howToAvail}>
            <TwoVectorNumber style={styles.oneVectorStyle} />
            <Text style={theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35)}>
              Duration of membership is 1 year. It will be auto renewed if you spend more than Rs 25000 within 1 year on Apollo 24/7
            </Text>
          </View>
        </View>
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
        <Text style={styles.inactivePlanText}>
          {`Your Plan is Currently INACTIVE. To activate your plan, make a transaction greater than Rs ${membershipDetails!.minTransactionValue} on Apollo 24/7`}
        </Text>
        <Text style={styles.benefitsAvailableHeading}>Benefits Available</Text>
        {renderBenefitsAvailable()}
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeAreaStyle}>
        {renderHeader()}
        <SubscriptionBanner 
          membershipType={membershipType} 
          benefitsWorth={membershipDetails!.benefitsWorth || ' '}
        />
        {
          isActivePlan ? 
          renderTabComponent() : 
          renderInactivePlansContainer()
        }
      </SafeAreaView>
      {/* {
        showHdfcConnectPopup &&
        <HdfcConnectPopup
          onClose={() => setShowHdfcConnectPopup(false)}
        />
      }
      {showSpinner && <Spinner />} */}
    </View>
  );
};
