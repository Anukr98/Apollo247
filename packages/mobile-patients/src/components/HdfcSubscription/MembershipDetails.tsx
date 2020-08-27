import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { HelpIcon, OneApolloGold, HdfcGoldMedal, DownOrange, UpOrange, EllipseBulletPoint, OneApolloPlatinum, HdfcPlatinumMedal, OneVectorNumber, TwoVectorNumber } from '../ui/Icons';
import { TabsComponent } from '../ui/TabsComponent';
import { SubscriptionBanner } from './SubscriptionBanner';
import { AvailSubscriptionPopup } from './AvailSubscriptionPopup';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AppRoutes } from '../NavigatorContainer';

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
    backgroundColor: theme.colors.CARD_BG,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
});

export interface MembershipDetailsProps extends NavigationScreenProps {
  membershipType: string;
  isSubscribed?: boolean;
}

const hdfc_tnc = [
  'The Healthy Life offering is the marketing program offered by Apollo 24/7, an app managed by Apollo Hospitals Enterprise Limited (AHEL) only for HDFC Bank customers.',
  'The validity of the program (“Term”) is till 31st August 2021, unless extended by Apollo 24/7 and HDFC Bank.',
  'The discounts applicable as per the Healthy Life program shall be applied at the time of payment checkout by the customer.',
  'This program is designed for select HDFC customers and offerings will vary with the different categories of HDFC customers. However, membership schemes can be upgraded on the basis of the spending on the Apollo 24/7 app as mentioned in the offer grid.',
  'The Healthy Life Program is open to all HDFC customers with a valid Indian mobile number only.',
  'The T&C’s of the silver, gold and platinum membership offered in the Healthy Life program shall be governed by the terms & conditions of the website - https://www.oneapollo.com/terms-conditions/',
  'The Healthy Life offering will be applicable to all HDFC customers, whether they are existing customers of Apollo 24/7 or not. However, all the customers shall adhere to the offerings as mentioned in this marketing program.',
  'The Healthy Life program is non-transferable.',
  'The activation of the benefits for the Healthy Life program will be completed 24 hours post the service delivery/fulfillment of the qualifying transaction. For e.g., to unlock benefits, the user is needed to make a qualifying transaction of INR 499, amount subject to change as per different tiers.',
  'By enrolling for the Healthy Life program, a member consents to allow use and disclosure by Apollo Health centres, along with his/her personal and other information as provided by the member at the time of enrolment and/or subsequently.',
  'As a prerequisite to becoming a member, a customer will need to provide mandatory information including full name, valid and active Indian mobile number. He/she shall adhere to such terms and conditions as may be prescribed for membership from time to time.',
  'The Healthy Life membership program will be issued solely at the discretion of the management and the final discretion on all matters relating to the membership shall rest with Apollo 24/7(AHEL).',
  'Healthy Life program is a corporate offering exclusively for HDFC bank customers and not for individuals.',
  'Apollo 24/7 reserves the right to add, alter, amend and revise terms and conditions as well as rules and regulations governing the Healthy Life membership program without prior notice.',
  'Benefits and offers available through the program may change or be withdrawn without prior intimation. Apollo 24/7 will not be responsible for any liability arising from such situations or use of such offers.',
  'Any disputes arising out of the offer shall be subject to arbitration by a sole arbitrator appointed by Apollo 24/7 for this purpose. The proceedings of the arbitration shall be conducted as per the provisions of Arbitration and Conciliation Act, 1996. The place of  arbitration  shall  be  at  Chennai  and  language  of  arbitration  shall  be  English.  The existence of a dispute, if at all, shall not constitute a claim against Apollo 24/7.',
];

export const MembershipDetails: React.FC<MembershipDetailsProps> = (props) => {
  const membershipType = props.navigation.getParam('membershipType');
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('Benefits Available');
  const [isActiveCouponVisible, setIsActiveCouponVisible] = useState<boolean>(true);
  const [isWhatWillYouGetVisible, setIsWhatWillYouGetVisible] = useState<boolean>(true);
  const [isHowToAvailVisible, setIsHowToAvailVisible] = useState<boolean>(true);
  const [isTnCVisible, setIsTnCVisible] = useState<boolean>(false);
  const [showAvailPopup, setshowAvailPopup] = useState<boolean>(false);

  const isActivePlan = false; // testing purpose

  const renderTabComponent = () => {
    return (
      <>
        <TabsComponent
          style={styles.tabsContainer}
          onChange={(title) => {
            setSelectedTab(title);
          }}
          data={
            [{ title: 'Benefits Available' }] // , { title: 'Benefits Consumed' }
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
          <TouchableOpacity onPress={() => {setIsActiveCouponVisible(!isActiveCouponVisible)}} style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <Text style={theme.viewStyles.text('SB', 15, '#00B38E', 1, 20, 0.35)}>
              Active Coupons
            </Text>
            {
              isActiveCouponVisible ? 
              <DownOrange
                style={{
                  resizeMode: 'contain',
                  width: 20,
                  height: 20,
                }}
              /> :
              <UpOrange
                style={{
                  resizeMode: 'contain',
                  width: 20,
                  height: 20,
                }}
              />
            }
          </TouchableOpacity>
          {
            isActiveCouponVisible &&
            <View style={{
              marginTop: 15,
            }}>
              <Text style={{
                ...theme.viewStyles.text('R', 13, '#02475B', 1, 17, 0.35),
                width: '70%'
              }}>
                You are eligible for the following coupons on Apollo 24|7
              </Text>
              {renderCouponInfo()}
              {renderCouponInfo()}
              {renderCouponInfo()}
              {renderCouponInfo()}
            </View>
          }
        </View>
        {renderRedeemableCards(
          '24/7 Access to a General Physician on Call',
          ['Round-the-clock doctor availability at a click of a button']
        )}
        {renderRedeemableCards(
          'Concierge for 24|7 services',
          ['Priority Chat Support on Whatsapp with our Executives']
        )}
        {renderRedeemableCards(
          'Covid-19 Care',
          [
            'Preferential Access to Pre & Post COVID Assessments',
            'Preferential Access to COVID Home Testing',
            'Preferential Access to Home & Hotel Care',
          ]
        )}
      </>
    );
  };

  const renderInactivePlans = () => {
    return (
      <View style={styles.cardStyle}>
        {renderRedeemableCardsContent(
          '24/7 Access to a General Physician on Call',
          ['Round-the-clock doctor availability at a click of a button']
        )}
        <View style={{
          marginVertical: 20,
          borderTopColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
          borderTopWidth: 1,
        }}></View>
        {renderRedeemableCardsContent(
          'Concierge for 24|7 services',
          ['Priority Chat Support on Whatsapp with our Executives']
        )}
        <View style={{
          marginVertical: 20,
          borderTopColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
          borderTopWidth: 1,
        }}></View>
        {renderRedeemableCardsContent(
          'Covid-19 Care',
          [
            'Preferential Access to Pre & Post COVID Assessments',
            'Preferential Access to COVID Home Testing',
            'Preferential Access to Home & Hotel Care',
          ]
        )}
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
      <View style={{
        backgroundColor: '#FFFFFF',
        marginVertical: 20,
        ...styles.cardStyle,
        borderRadius: 0,
        marginHorizontal: -10,
      }}>
        <TouchableOpacity onPress={() => {setIsTnCVisible(!isTnCVisible)}} style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <Text style={{
            ...theme.viewStyles.text('SB', 17, '#02475B', 1, 20, 0.35),
            paddingLeft: 10,
          }}>Terms and Conditions</Text>
          {
            isTnCVisible ? 
            <DownOrange
              style={{
                resizeMode: 'contain',
                width: 20,
                height: 20,
              }}
            /> :
            <UpOrange
              style={{
                resizeMode: 'contain',
                width: 20,
                height: 20,
              }}
            />
          }
        </TouchableOpacity>
        {
          isTnCVisible && 
          <View style={{
            padding: 10,
          }}>
            {
              hdfc_tnc.map((text, index) => {
                return (
                  <Text style={{
                    ...theme.viewStyles.text('M', 13, '#02475B', 1, 20, 0.35),
                    marginBottom: 15,
                  }}>{`${index + 1}. ${text}`}</Text>
                )
              })
            }
          </View>
        }
      </View>
    );
  };

  const renderRedeemableCards = (heading: string, bodyText: string[]) => {
    return (
      <View style={[styles.cardStyle, { marginVertical: 10 }]}>
        {renderRedeemableCardsContent(heading, bodyText)}
        <TouchableOpacity onPress={() => {}}>
          <Text style={{
            ...theme.viewStyles.text('B', 15, '#FC9916', 1, 20, 0.35),
            textAlign: 'right',
          }}>
            REDEEM
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRedeemableCardsContent = (heading: string, bodyText: string[]) => {
    return (
      <>
      <Text style={{
        ...theme.viewStyles.text('SB', 15, '#00B38E', 1, 20, 0.35),
        marginBottom: 10,
      }}>
        {heading}
      </Text>
      {
        bodyText.length === 1 ? (
          <Text style={{
            ...theme.viewStyles.text('R', 13, '#02475B', 1, 20, 0.35),
            width: '75%',
          }}>
            {bodyText[0]}
          </Text>
        ) : (
          <View style={{
            width: '75%',
            marginBottom: 5,
          }}>
            {
              bodyText.map((text) => {
                return (
                  <View style={{flexDirection: 'row', marginBottom: 10}}>
                    <EllipseBulletPoint style={{
                      resizeMode: 'contain',
                      width: 7,
                      height: 7,
                      alignSelf: 'center',
                      marginRight: 10,
                    }} />
                    <Text style={theme.viewStyles.text('R', 13, '#02475B', 1, 20, 0.35)}>{text}</Text>
                  </View>
                )
              })
            }
          </View>
        )
      }
      {/* <TouchableOpacity onPress={() => {}}>
        <Text style={{
          ...theme.viewStyles.text('B', 15, '#FC9916', 1, 20, 0.35),
          textAlign: 'right',
        }}>
          REDEEM
        </Text>
      </TouchableOpacity> */}
      </>
    );
  };

  const renderCouponInfo = () => {
    return (
      <View style={{
        marginTop: 15,
      }}>
        <Text style={theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35)}>
          Coupon Name 1
        </Text>
        <Text style={theme.viewStyles.text('R', 12, '#02475B', 1, 25, 0.35)}>
          Get Rs. 249/- Off on 2 Virtual Consultations Bookings 
        </Text>
      </View>
    );
  };

  const renderBenefitsConsumed = () => {
    return (
      <ScrollView bounces={false}>
        <Text>BENEFITS CONSUMED</Text>
      </ScrollView>
    );
  };

  const renderBottomContainer = () => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#FC9916',
          margin: 10,
          padding: 10,
          borderRadius: 10,
          alignItems: 'center'
        }}
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
        <TouchableOpacity onPress={() => {setIsWhatWillYouGetVisible(!isWhatWillYouGetVisible)}} style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <Text style={theme.viewStyles.text('SB', 15, '#00B38E', 1, 20, 0.35)}>
            What Will You Get!
          </Text>
          {
            isWhatWillYouGetVisible ? 
            <DownOrange
              style={{
                resizeMode: 'contain',
                width: 20,
                height: 20,
              }}
            /> :
            <UpOrange
              style={{
                resizeMode: 'contain',
                width: 20,
                height: 20,
              }}
            />
          }
        </TouchableOpacity>
        {
          isWhatWillYouGetVisible &&
          <View style={{
            marginTop: 15,
          }}>
            {getEllipseBulletPoint('One Apollo Membership')}
            {getEllipseBulletPoint('Preferential access to COVID-19 home testing')}
            {getEllipseBulletPoint('Preffrential access to home and hotel care')}
            {getEllipseBulletPoint('Health essentials hamper gift')}
            {getEllipseBulletPoint('2 Vouchers for Doctor Consultation worth Rs 249 each')}
            {getEllipseBulletPoint('3 Vouchers of Rs 100 each for Apollo Pharmacy')}
            {getEllipseBulletPoint('15% Off on Apollo Labeled Products')}
            {getEllipseBulletPoint('Digital Vault for health records')}
            {getEllipseBulletPoint('Health assesment consultation by apollo Doctor')}
            {getEllipseBulletPoint('Base Diabetes management program')}
          </View>
        }
      </View>
    );
  };

  const renderHowToAvail = () => {
    return (
      <View style={styles.cardStyle}>
        <TouchableOpacity onPress={() => {setIsHowToAvailVisible(!isHowToAvailVisible)}} style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <Text style={theme.viewStyles.text('SB', 15, '#00B38E', 1, 20, 0.35)}>
            How To Avail
          </Text>
          {
            isHowToAvailVisible ? 
            <DownOrange
              style={{
                resizeMode: 'contain',
                width: 20,
                height: 20,
              }}
            /> :
            <UpOrange
              style={{
                resizeMode: 'contain',
                width: 20,
                height: 20,
              }}
            />
          }
        </TouchableOpacity>
        {
          isHowToAvailVisible &&
          <View style={{
            marginTop: 15,
          }}>
            <Text style={theme.viewStyles.text('SB', 13, '#02475B', 1, 20, 0.35)}>
              Please Follow These Steps
            </Text>
            <View>
              <View style={{
                flexDirection: 'row',
                marginTop: 15,
                width: '80%'
              }}>
                <OneVectorNumber style={{
                  marginRight: 10,
                  marginTop: 5,
                }} />
                <Text style={{
                  ...theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35),
                }}>
                  Complete transactions worth Rs 25000+ on Apollo 24/7
                </Text>
              </View>
              <View style={{
                flexDirection: 'row',
                marginTop: 15,
                width: '80%'
              }}>
                <TwoVectorNumber style={{
                  marginRight: 10,
                  marginTop: 5,
                }} />
                <Text style={{
                  ...theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35),
                }}>
                  Duration of membership is 1 year. It will be auto renewed if you spend more than Rs 25000 within 1 year on Apollo 24/7
                </Text>
              </View>
            </View>
          </View>
        }
      </View>
    );
  };

  const getEllipseBulletPoint = (text: string) => {
    return (
      <View style={{flexDirection: 'row', marginBottom: 15}}>
        <EllipseBulletPoint style={{
          resizeMode: 'contain',
          width: 10,
          height: 10,
          alignSelf: 'center',
          marginRight: 10,
        }} />
        <Text style={theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35)}>{text}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF'}}>
        <Header
          leftIcon="backArrow"
          rightComponent={<HelpIcon style={{
            resizeMode: 'contain',
            width: 20,
            height: 20,
          }} />}
          title={'MEMBERSHIP PLAN DETAIL'}
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <SubscriptionBanner membershipType={membershipType} />
        {
          isActivePlan ? 
          renderTabComponent() : 
          <ScrollView bounces={false}>
            <Text style={{
              ...theme.viewStyles.text('M', 13, '#EA5F65', 1, 17, 0.35),
              paddingHorizontal: 20,
              paddingBottom: 20,
            }}>
              Your Plan is Currently INACTIVE. To activate your plan, make a transaction greater than Rs 499 on Apollo 24/7
            </Text>
            <Text style={{
              ...theme.viewStyles.text('B', 17, '#02475B', 1, 20, 0.35),
              paddingHorizontal: 20,
            }}>Benefits Available</Text>
            {renderBenefitsAvailable()}
          </ScrollView>
        }
        {/* {isSubscribed ? renderTabComponent() : renderSubscribeContent()} 
        {
          showAvailPopup &&
          <AvailSubscriptionPopup 
            onAvailNow={() => {}} 
            onClose={() => setshowAvailPopup(false)} 
            />
        } */}
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
