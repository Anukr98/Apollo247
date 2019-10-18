import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { SectionHeader, Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CartIcon,
  FileBig,
  MedicineIcon,
  NotificationIcon,
  ChatSend,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { UserIntro } from '@aph/mobile-patients/src/components/ui/UserIntro';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  labelView: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff748e',
    height: 14,
    width: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
});

export interface MedicineProps extends NavigationScreenProps {}

export const Medicine: React.FC<MedicineProps> = (props) => {
  const [ShowPopop, setShowPopop] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);

  const { cartItems } = useShoppingCart();
  const cartItemsCount = cartItems.length;

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderTopView = () => {
    return (
      <View
        style={{
          height: 225 - 54,
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <UserIntro
            style={{
              height: 109,
            }}
            description={string.home.description}
          >
            <View
              style={{
                height: 83,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: 20,
              }}
            >
              <TouchableOpacity
                style={{ marginTop: 20 }}
                onPress={() => props.navigation.replace(AppRoutes.ConsultRoom)}
              >
                <ApolloLogo />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', marginTop: 16 }}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() =>
                    props.navigation.navigate(AppRoutes.YourCart, { isComingFromConsult: true })
                  }
                  style={{ right: 20 }}
                >
                  <CartIcon style={{}} />
                  {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
                </TouchableOpacity>
                <NotificationIcon />
              </View>
            </View>
          </UserIntro>
        </View>
      </View>
    );
  };

  const renderEPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        onSubmit={(selectedEPres) => {
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          }
          props.navigation.navigate(AppRoutes.UploadPrescription, {
            ePrescriptionsProp: selectedEPres,
          });
        }}
        selectedEprescriptionIds={[]}
        isVisible={isSelectPrescriptionVisible}
      />
    );
  };

  const renderUploadPrescriprionPopup = () => {
    return (
      <UploadPrescriprionPopup
        isVisible={ShowPopop}
        disabledOption="NONE"
        type="nonCartFlow"
        heading={'Upload Prescription(s)'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          'Take clear picture of your entire prescription.',
          'Doctor details & date of the prescription should be clearly visible.',
          'Medicines will be dispensed as per prescription.',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE\nFROM GALLERY',
          prescription: 'SELECT FROM\nE-PRESCRIPTION',
        }}
        onClickClose={() => setShowPopop(false)}
        onResponse={(selectedType, response) => {
          setShowPopop(false);
          if (selectedType == 'CAMERA_AND_GALLERY') {
            if (response.length == 0) return;
            props.navigation.navigate(AppRoutes.UploadPrescription, {
              phyPrescriptionsProp: response,
            });
          } else {
            setSelectPrescriptionVisible(true);
          }
        }}
      />
    );
  };

  const renderOfferBanner = () => {
    const [imgHeight, setImgHeight] = useState(120);
    const uri = 'https://via.placeholder.com/360X120';
    return (
      <Image
        PlaceholderContent={<Spinner />}
        onLoad={(value) => {
          console.log({ value });
          const { width: winWidth } = Dimensions.get('window');
          const { height, width } = value.nativeEvent.source;
          setImgHeight(height * (winWidth / width));
        }}
        style={{ width: '100%', minHeight: imgHeight }}
        containerStyle={{ paddingBottom: 20 }}
        source={{ uri }}
      />
    );
  };

  const uploadPrescriptionCTA = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text
            style={{
              ...theme.viewStyles.text('M', 16, '#02475b', 1, 24, 0),
              paddingBottom: 12,
            }}
          >
            Have a prescription ready?
          </Text>
          <Button
            onPress={() => {
              setShowPopop(true);
            }}
            style={{ width: 'auto' }}
            titleTextStyle={{
              ...theme.viewStyles.text('B', 13, '#fff', 1, 24, 0),
            }}
            title={'UPLOAD PRESCRIPTION'}
          />
        </View>
        <FileBig style={{ height: 60, width: 40 }} />
      </View>
    );
  };
  const consultDoctorCTA = () => {
    return (
      <View>
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, '#02475b', 1, 20, 0.04),
            paddingBottom: 8,
          }}
        >
          Don’t have a prescription? Don’t worry!
        </Text>
        <Text
          onPress={() => props.navigation.navigate(AppRoutes.DoctorSearch)}
          style={{
            ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24, 0),
          }}
        >
          CONSULT A DOCTOR
        </Text>
      </View>
    );
  };
  const renderUploadPrescriptionSection = () => {
    return (
      <View style={{ ...theme.viewStyles.card(), marginTop: 0, marginBottom: 12 }}>
        {uploadPrescriptionCTA()}
        <Spearator style={{ marginVertical: 11.5 }} />
        {consultDoctorCTA()}
      </View>
    );
  };
  const renderYourOrders = () => {
    return (
      <ListCard
        onPress={() => props.navigation.navigate(AppRoutes.YourOrdersScene)}
        container={{ marginBottom: 24 }}
        title={'Your Orders'}
        leftIcon={<MedicineIcon />}
      />
    );
  };

  const renderBrandCard = (imgUrl: string, onPress: () => void, style?: ViewStyle) => {
    return (
      <View
        style={[
          {
            ...theme.viewStyles.card(12, 0),
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: 152,
            height: 68,
          },
          style,
        ]}
      >
        <Image
          source={{ uri: imgUrl }}
          style={{
            height: 45,
            width: 80,
          }}
        />
      </View>
    );
  };

  const renderCatalogCard = (
    text: string,
    imgUrl: string,
    onPress: () => void,
    style?: ViewStyle
  ) => {
    return (
      <View
        style={[
          {
            ...theme.viewStyles.card(12, 0),
            flexDirection: 'row',
            width: 152,
            height: 68,
          },
          style,
        ]}
      >
        <Image
          source={{ uri: imgUrl }}
          style={{
            height: 40,
            width: 40,
          }}
        />
        <View style={{ width: 16 }} />
        <Text
          numberOfLines={2}
          style={{
            flex: 1,
            ...theme.viewStyles.text('M', 14, '#01475b', 1, 20, 0),
          }}
        >
          {text}
        </Text>
      </View>
    );
  };

  const brands = [
    {
      imgUrl: 'https://via.placeholder.com/80x45',
      goToPage: AppRoutes.SearchMedicineScene,
    },
  ];

  const healthAreas = [
    {
      text: 'Diabetes Care',
      imgUrl: 'https://via.placeholder.com/40',
      goToPage: AppRoutes.SearchMedicineScene,
    },
    {
      text: 'Pain Relief',
      imgUrl: 'https://via.placeholder.com/40',
      goToPage: AppRoutes.SearchMedicineScene,
    },
  ];

  const renderShopByHealthAreas = () => {
    return (
      <View>
        <SectionHeader leftText={'SHOP BY HEALTH AREAS'} />
        <FlatList
          bounces={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 20,
            paddingLeft: 20,
          }}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={[...healthAreas, ...healthAreas]}
          renderItem={({ item }) => {
            return renderCatalogCard(
              item.text,
              item.imgUrl,
              () => props.navigation.navigate(item.goToPage),
              { marginRight: 8 }
            );
          }}
        />
      </View>
    );
  };

  const renderDealsOfTheDay = () => {
    return (
      <View>
        <SectionHeader leftText={'DEALS OF THE DAY'} />
        <FlatList
          bounces={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 20,
            paddingLeft: 20,
          }}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={Array.from({ length: 10 }).map(
            () => `https://via.placeholder.com/${Dimensions.get('screen').width * 0.86}x144`
          )}
          renderItem={({ item }) => {
            return (
              <Image
                source={{ uri: item }}
                containerStyle={{
                  ...theme.viewStyles.card(0, 0),
                  marginRight: 8,
                }}
                style={{
                  borderRadius: 10,
                  height: 144,
                  width: Dimensions.get('screen').width * 0.86,
                }}
              />
            );
          }}
        />
      </View>
    );
  };

  const hotSellersData = [
    {
      text: 'Similac IQ+ Stage 1 400gm Tin',
      imgUrl: 'https://via.placeholder.com/68x68',
      discount: 30,
      price: 650,
    },
  ];

  const renderHotSellers = () => {
    return (
      <View>
        <SectionHeader leftText={'HOT SELLERS'} />
        <FlatList
          bounces={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 20,
            paddingLeft: 20,
          }}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={[...hotSellersData, ...hotSellersData, ...hotSellersData, ...hotSellersData]}
          renderItem={({ item }) => {
            return hotSellerCard({
              name: item.text,
              imgUrl: item.imgUrl,
              price: item.price,
              discount: item.discount,
              onAddToCart: () => props.navigation.navigate(AppRoutes.SearchMedicineScene),
            });
          }}
        />
      </View>
    );
  };

  const renderShopByCategory = () => {
    return (
      <View>
        <SectionHeader leftText={'SHOP BY CATEGORY'} />
        <FlatList
          bounces={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 20,
            paddingLeft: 20,
          }}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={[...healthAreas, ...healthAreas]}
          renderItem={({ item }) => {
            return renderCatalogCard(
              item.text,
              item.imgUrl,
              () => props.navigation.navigate(item.goToPage),
              { marginRight: 8 }
            );
          }}
        />
      </View>
    );
  };

  const renderShopByBrand = () => {
    return (
      <View>
        <SectionHeader
          leftText={'SHOP BY BRAND'}
          rightText={'VIEW ALL'}
          rightTextStyle={{
            ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
          }}
          onPressRightText={() => props.navigation.navigate(AppRoutes.SearchMedicineScene)}
          style={{ paddingBottom: 1 }}
        />
        <FlatList
          bounces={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 40,
            paddingLeft: 20,
          }}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={[...brands, ...brands, ...brands, ...brands]}
          renderItem={({ item }) => {
            return renderBrandCard(item.imgUrl, () => props.navigation.navigate(item.goToPage), {
              marginRight: 8,
            });
          }}
        />
      </View>
    );
  };

  const hotSellerCard = (data: {
    name: string;
    imgUrl: string;
    price: number;
    discount?: number;
    onAddToCart: () => void;
  }) => {
    const { name, imgUrl, price, discount } = data;

    const renderDiscountedPrice = () => {
      const styles = StyleSheet.create({
        discountedPriceText: {
          ...theme.viewStyles.text('M', 14, '#01475b', 0.6, 24),
          textAlign: 'center',
        },
        priceText: {
          ...theme.viewStyles.text('B', 14, '#01475b', 1, 24),
          textAlign: 'center',
        },
      });
      return (
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {!!discount && (
            <Text style={[styles.discountedPriceText, { marginRight: 4 }]}>
              (
              <Text style={[{ textDecorationLine: 'line-through' }]}>
                Rs. {(discount / 100) * price}
              </Text>
              )
            </Text>
          )}
          <Text style={styles.priceText}>Rs. {price}</Text>
        </View>
      );
    };

    return (
      <View
        style={{
          ...theme.viewStyles.card(12, 0),
          height: 232,
          width: 152,
          marginRight: 8,
          alignItems: 'center',
        }}
      >
        <Image source={{ uri: imgUrl }} style={{ height: 68, width: 68, marginBottom: 8 }} />
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, '#01475b', 1, 20),
            textAlign: 'center',
          }}
        >
          {name}
        </Text>
        <Spearator style={{ marginBottom: 7.5 }} />
        {renderDiscountedPrice()}
        <Text
          style={{
            ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
            textAlign: 'center',
          }}
          onPress={() => {}}
        >
          {'ADD TO CART'}
        </Text>
      </View>
    );
  };

  const renderNeedHelp = () => {
    return (
      <NeedHelpAssistant
        navigation={props.navigation}
        containerStyle={{
          paddingBottom: 20,
        }}
      />
    );
  };

  const renderSearchBar = () => {
    const styles = StyleSheet.create({});
    return (
      <Input
        autoCorrect={false}
        rightIcon={<ChatSend />}
        placeholder="Search meds, brands &amp; more"
        selectionColor="#00b38e"
        underlineColorAndroid="transparent"
        placeholderTextColor="rgba(1,48,91, 0.4)"
        inputStyle={{
          minHeight: 29,
          ...theme.fonts.IBMPlexSansMedium(18),
        }}
        inputContainerStyle={{
          borderBottomColor: '#00b38e',
          borderBottomWidth: 2,
        }}
        rightIconContainerStyle={{
          height: 24,
        }}
        style={{ paddingBottom: 18.5 }}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {renderTopView()}
        {renderSearchBar()}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          <View>
            {renderOfferBanner()}
            {renderUploadPrescriptionSection()}
            {renderYourOrders()}
            {renderShopByHealthAreas()}
            {renderDealsOfTheDay()}
            {renderHotSellers()}
            {renderShopByCategory()}
            {renderShopByBrand()}
            {renderNeedHelp()}
          </View>
        </ScrollView>
      </SafeAreaView>
      {renderEPrescriptionModal()}
      {renderUploadPrescriprionPopup()}
    </View>
  );
};
