import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import {
  TriangleGreyBulletPoint,
  SilverMembershipBanner,
  MembershipBenefitsOne,
  MembershipBenefitsTwo,
  MembershipBenefitsThree,
  OneApolloGold,
  OneApolloSilver,
  OneApolloPlatinum,
  OneApolloLockIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';

const styles = StyleSheet.create({
  subHeading: {
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  bulletText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.LIGHT_BLUE,
    paddingLeft: 10,
  },
  bulletPoint: {
    justifyContent: 'flex-end',
    height: 7,
    width: 7,
    resizeMode: 'contain',
    marginTop: 5,
  },
  pointsContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 7,
  },
  benefitsImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },
  benefitsHeading: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  benefitsDescription: {
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
    ...theme.fonts.IBMPlexSansMedium(10),
    marginTop: 5,
    marginBottom: 7,
  },
});

type tierType = {
  tier?: String;
};

export interface MyMembershipProps extends tierType {}

export const MyMembership: React.FC<MyMembershipProps> = (props) => {
  const membershipType = props.tier;
  const [showGoldContent, setShowGoldContent] = useState<boolean>(membershipType === 'Silver');
  const [showBenefits, setShowBenefits] = useState<boolean>(true);
  const [showCreditEarnings, setShowCreditEarnings] = useState<boolean>(true);
  const [showCreditRedemption, setShowCreditRedemption] = useState<boolean>(true);
  const [showMembershipUpgrades, setShowMembershipUpgrades] = useState<boolean>(true);

  const renderBanner = () => {
    return (
      <View style={{ padding: 20, display: 'flex' }}>
        <SilverMembershipBanner
          style={{
            width: '100%',
            height: 200,
          }}
        />
      </View>
    );
  };

  const renderMembershipBenefits = () => {
    return (
      <View>
        <CollapseCard
          heading="MY MEMBERSHIP BENEFITS"
          collapse={showBenefits}
          headingStyle={{ paddingBottom: 10 }}
          onPress={() => {
            setShowBenefits(!showBenefits);
          }}
        >
          <View
            style={{
              padding: 20,
              paddingTop: 10,
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 15,
              }}
            >
              <MembershipBenefitsTwo style={styles.benefitsImage} />
              <View
                style={{
                  alignSelf: 'center',
                }}
              >
                <Text style={styles.benefitsHeading}>Apollo Cradle</Text>
                <Text style={styles.benefitsDescription}>Avail 15% discount on Health Checks</Text>
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 15,
              }}
            >
              <MembershipBenefitsThree style={styles.benefitsImage} />
              <View
                style={{
                  alignSelf: 'center',
                }}
              >
                <Text style={styles.benefitsHeading}>Apollo Diagnostics</Text>
                <Text style={[styles.benefitsDescription, { marginBottom: 0 }]}>
                  Avail 5% discount on Lab & Imaging
                </Text>
                <Text style={[styles.benefitsDescription, { marginTop: 0, marginBottom: 0 }]}>
                  Services in OP Diagnostics
                </Text>
              </View>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderHealthCreditEarning = () => {
    return (
      <CollapseCard
        heading="HEALTH CREDIT EARNING"
        collapse={showCreditEarnings}
        headingStyle={{ paddingBottom: 10 }}
        onPress={() => {
          setShowCreditEarnings(!showCreditEarnings);
        }}
      >
        <View
          style={{
            padding: 20,
            paddingTop: 10,
          }}
        >
          <Text style={styles.subHeading}>On pharmacy transactions at Apollo 247 earn HCs</Text>
          <View style={styles.pointsContainer}>
            <TriangleGreyBulletPoint style={styles.bulletPoint} />
            <Text style={styles.bulletText}>5% of non-pharmaceutical products</Text>
          </View>
          <View style={styles.pointsContainer}>
            <TriangleGreyBulletPoint style={styles.bulletPoint} />
            <Text style={styles.bulletText}>10% of pharmaceutical products</Text>
          </View>
          {/**
           * silver - 10%
           * gold - 15%
           * platinum - 20%
           */}
          <View style={styles.pointsContainer}>
            <TriangleGreyBulletPoint style={styles.bulletPoint} />
            <Text style={styles.bulletText}>
              {membershipType === 'Silver' ? '10' : membershipType === 'Gold' ? '15' : '20'}% of
              Apollo brand products
            </Text>
          </View>
          <Text
            style={{
              marginTop: 10,
              color: theme.colors.APP_GREEN,
              ...theme.fonts.IBMPlexSansMedium(11),
            }}
          >
            T&C Apply
          </Text>
        </View>
      </CollapseCard>
    );
  };

  const renderHealthCreditRedemption = () => {
    return (
      <CollapseCard
        heading="HEALTH CREDIT REDEMPTION"
        collapse={showCreditRedemption}
        headingStyle={{ paddingBottom: 10 }}
        onPress={() => {
          setShowCreditRedemption(!showCreditRedemption);
        }}
      >
        <Text
          style={[
            styles.subHeading,
            {
              padding: 20,
              paddingTop: 10,
              paddingBottom: 10,
            },
          ]}
        >
          Redeem your health credits on transactions at Apollo 247 pharmacy orders at a value of
          <Text style={{ color: theme.colors.LIGHT_BLUE }}> 1 HC = ₹ 1</Text>
        </Text>
      </CollapseCard>
    );
  };

  const renderMembershipUpgrades = () => {
    return (
      <CollapseCard
        heading="MEMBERSHIP UPGRADES"
        collapse={showMembershipUpgrades}
        headingStyle={{ paddingBottom: 10, paddingTop: 15 }}
        onPress={() => {
          setShowMembershipUpgrades(!showMembershipUpgrades);
        }}
      >
        <View
          style={{
            padding: 20,
            paddingTop: 0,
          }}
        >
          <ScrollView
            horizontal={true}
            contentContainerStyle={{ width: membershipType === 'Gold' ? '100%' : '200%' }}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={200}
            decelerationRate="fast"
            pagingEnabled
            onScroll={(event) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              if (offsetX < 100) {
                setShowGoldContent(true);
              } else {
                setShowGoldContent(false);
              }
            }}
          >
            {membershipType === 'Silver' && (
              <View>
                <OneApolloGold
                  style={{
                    width: 300,
                    height: 200,
                    resizeMode: 'contain',
                    marginRight: 10,
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    alignSelf: 'center',
                    marginVertical: 80,
                  }}
                >
                  <OneApolloLockIcon
                    style={{
                      resizeMode: 'contain',
                      alignSelf: 'center',
                    }}
                  />
                  <Text
                    style={{
                      color: theme.colors.PLATINUM_GREY,
                      ...theme.fonts.IBMPlexSansMedium(10),
                      marginTop: 10,
                    }}
                  >
                    Gold
                  </Text>
                </View>
              </View>
            )}
            <View>
              <OneApolloPlatinum
                style={{
                  width: 300,
                  height: 200,
                  resizeMode: 'contain',
                  marginRight: 10,
                  marginLeft: 10,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  alignSelf: 'center',
                  marginVertical: 80,
                }}
              >
                <OneApolloLockIcon
                  style={{
                    resizeMode: 'contain',
                    alignSelf: 'center',
                  }}
                />
                <Text
                  style={{
                    color: theme.colors.PLATINUM_GREY,
                    ...theme.fonts.IBMPlexSansMedium(10),
                    marginTop: 10,
                  }}
                >
                  Platinum
                </Text>
              </View>
            </View>
          </ScrollView>
          <Text
            style={{
              color: theme.colors.PLATINUM_GREY,
              opacity: 0.62,
              ...theme.fonts.IBMPlexSansMedium(11),
            }}
          >
            {showGoldContent
              ? 'Upgrade to gold and enjoy more benefits by satisfying either of the conditions:'
              : 'Upgrade to platinum and enjoy more benefits by satisfying either of the conditions:'}
          </Text>
          <View style={styles.pointsContainer}>
            <TriangleGreyBulletPoint style={styles.bulletPoint} />
            <Text style={[styles.bulletText, { color: theme.colors.PLATINUM_GREY }]}>
              {showGoldContent
                ? `Spend ${string.common.Rs} 75,000 in one year period`
                : `Spend ${string.common.Rs} 2,00,000 in one year period`}
            </Text>
          </View>
          <View style={styles.pointsContainer}>
            <TriangleGreyBulletPoint style={styles.bulletPoint} />
            <Text style={[styles.bulletText, { color: theme.colors.PLATINUM_GREY }]}>
              {showGoldContent
                ? 'Buy an annual gym membership from Apollo Life'
                : 'Maintain Gold membership for 2 consecutive years'}
            </Text>
          </View>
        </View>
      </CollapseCard>
    );
  };

  return (
    <View style={{ ...theme.viewStyles.container, backgroundColor: '#fff' }}>
      {renderBanner()}
      {renderMembershipBenefits()}
      {renderHealthCreditEarning()}
      {renderHealthCreditRedemption()}
      {membershipType !== 'Platinum' && renderMembershipUpgrades()}
      <TouchableOpacity
        onPress={() => {
          Linking.openURL('https://www.oneapollo.com/');
        }}
      >
        <Text
          style={{
            paddingLeft: 20,
            paddingBottom: 20,
            color: theme.colors.APP_YELLOW,
            ...theme.fonts.IBMPlexSansMedium(11),
          }}
        >
          KNOW MORE
        </Text>
      </TouchableOpacity>
    </View>
  );
};
