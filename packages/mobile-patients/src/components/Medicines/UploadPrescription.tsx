import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CrossYellow,
  PrescriptionIcon,
  PrescriptionThumbnail,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  ImageSourcePropType,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image as PickerImage } from 'react-native-image-crop-picker';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = StyleSheet.create({
  cardContainer: {
    paddingTop: 16,
    marginTop: 20,
    marginVertical: 4,
    ...theme.viewStyles.cardContainer,
    borderRadius: 0,
    backgroundColor: theme.colors.CARD_BG,
  },
  labelView: {
    marginHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
  },
  leftText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
});

type PrescriptionsList = {
  id: number;
  title: string;
  descripiton: string;
  image: ImageSourcePropType;
};

const PrescriptionsList: PrescriptionsList[] = [
  {
    id: 1,
    title: 'Are you looking for a particular doctor?',
    descripiton: 'SEARCH SPECIALIST',
    image: require('@aph/mobile-patients/src/images/home/doctor.png'),
  },
  {
    id: 2,
    title: 'Do you want to buy some medicines?',
    descripiton: 'SEARCH MEDICINE',
    image: require('@aph/mobile-patients/src/images/home/medicine.png'),
  },
  {
    id: 3,
    title: 'Do you want to get some tests done?',
    descripiton: 'BOOK A TEST',
    image: require('@aph/mobile-patients/src/images/home/test.png'),
  },
];

type prescriptions = {
  id: number;
  doctor_name: string;
  date: string;
  patient_name: string;
  disease: string;
};

const Prescriptions: prescriptions[] = [
  {
    id: 1,
    doctor_name: 'Dr. Simran Rai',
    date: '27 July 2019',
    patient_name: 'Preeti',
    disease: 'Cytoplam, Metformin, Insulin, Crocin',
  },
  {
    id: 2,
    doctor_name: 'Dr. Ranjan Reddy',
    date: '25 July 2019',
    patient_name: 'Surj',
    disease: 'Cytoplam, Metformin, Insulin, Crocin',
  },
];
export interface UploadPrescriptionProps extends NavigationScreenProps {}
export const UploadPrescription: React.FC<UploadPrescriptionProps> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [Images, setImages] = useState<PickerImage[]>(
    props.navigation.state.params ? props.navigation.state.params!.images : []
  );
  const [ShowPopop, setShowPopop] = useState<boolean>(false);

  const renderLabel = (label: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.leftText}>{label}</Text>
      </View>
    );
  };

  const renderRow = (data: PickerImage, i: number) => {
    return (
      <View key={i} style={{}}>
        <TouchableOpacity key={i} onPress={() => {}}>
          <View
            style={{
              ...theme.viewStyles.cardViewStyle,
              shadowRadius: 4,
              height: 56,
              marginHorizontal: 20,
              backgroundColor: theme.colors.WHITE,
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: i === 0 ? 16 : 4,
              marginBottom: Images.length === i + 1 ? 16 : 4,
            }}
            key={i}
          >
            {/* <View style={{ width: width - 144, justifyContent: 'space-between' }}> */}
            <View
              style={{
                paddingLeft: 8,
                paddingRight: 16,
                width: 54,
              }}
            >
              <PrescriptionThumbnail />
            </View>
            <View style={{ flex: 1 }}>
              <TextInputComponent
                inputStyle={{
                  marginTop: 3,
                }}
                value={data!
                  .path!.split('\\')!
                  .pop()!
                  .split('/')
                  .pop()}
              />
            </View>
            <TouchableOpacity
              style={{
                width: 40,
                paddingHorizontal: 8,
              }}
              onPress={() => {
                const imageCOPY = [...Images];
                imageCOPY.splice(i, 1);
                console.log(imageCOPY, 'imageCOPYImages remove');
                setImages(imageCOPY);
              }}
            >
              <CrossYellow />
              {/* <Image style={{ height: 59, width: 72 }} source={data.image} /> */}
            </TouchableOpacity>
            {/* </View> */}
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const renderPhysicalPrescriptions = () => {
    console.log(Images, 'render Images');
    if (Images.length > 0)
      return (
        <View style={styles.cardContainer}>
          <View>{renderLabel('Physical Prescriptions')}</View>
          <FlatList
            bounces={false}
            data={Images}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) => renderRow(item, index)}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
      );
    return null;
  };

  const renderPrescriptionRow = (rowData: prescriptions, rowID: number) => {
    return (
      <TouchableOpacity onPress={() => {}}>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            shadowRadius: 4,
            padding: 16,
            paddingLeft: 11,
            paddingBottom: 8,
            marginHorizontal: 20,
            backgroundColor: theme.colors.WHITE,
            marginTop: rowID === 0 ? 20 : 4,
            marginBottom: Prescriptions.length === rowID + 1 ? 16 : 4,
          }}
          key={rowID}
        >
          <View style={{ flexDirection: 'row' }}>
            <PrescriptionIcon />
            <Text
              style={{
                color: theme.colors.LIGHT_BLUE,
                lineHeight: 24,
                textAlign: 'left',
                ...theme.fonts.IBMPlexSansMedium(16),
                paddingLeft: 16,
              }}
            >
              {rowData.doctor_name}
            </Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <CrossYellow />
            </View>
          </View>
          <View style={{ paddingLeft: 43 }}>
            <View style={{ flexDirection: 'row', paddingTop: 5, paddingBottom: 3.5 }}>
              <Text
                style={{
                  color: 'rgba(2, 71, 91, 0.6)',
                  textAlign: 'left',
                  ...theme.fonts.IBMPlexSansMedium(14),
                  lineHeight: 20,
                  letterSpacing: 0.04,
                }}
              >
                {rowData.date}
              </Text>
              <View
                style={{
                  borderRightWidth: 0.5,
                  borderBottomColor: 'rgba(2, 71, 91, 0.3)',
                  paddingLeft: 24,
                }}
              />
              <Text
                style={{
                  paddingLeft: 19,
                  color: 'rgba(2, 71, 91, 0.6)',
                  textAlign: 'left',
                  ...theme.fonts.IBMPlexSansMedium(14),
                  lineHeight: 20,
                  letterSpacing: 0.04,
                }}
              >
                {rowData.patient_name}
              </Text>
            </View>
            <View
              style={{
                borderBottomWidth: 0.5,
                borderBottomColor: 'rgba(2, 71, 91, 0.3)',
              }}
            />
            <Text
              style={{
                marginTop: 7.5,
                color: theme.colors.SKY_BLUE,
                textAlign: 'left',
                ...theme.fonts.IBMPlexSansMedium(12),
              }}
            >
              {rowData.disease}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEPrescriptions = () => {
    return (
      <View style={[styles.cardContainer, { marginTop: 4, marginBottom: 16 }]}>
        <View>{renderLabel('Prescriptions From Health Records')}</View>
        <FlatList
          bounces={false}
          data={Prescriptions}
          onEndReachedThreshold={0.5}
          renderItem={({ item, index }) => renderPrescriptionRow(item, index)}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>
    );
  };

  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            height: 100,
            backgroundColor: theme.colors.CARD_BG,
            ...theme.viewStyles.shadowStyle,
            shadowRadius: 5,
          }}
        >
          <Header
            title={'UPLOAD PRESCRIPTION'}
            leftIcon="backArrow"
            container={{ ...theme.viewStyles.shadowStyle }}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
        </View>
        <ScrollView style={{ flex: 1 }}>
          {renderPhysicalPrescriptions()}
          {renderEPrescriptions()}
          <Text
            style={{
              ...fonts.IBMPlexSansBold(13),
              color: theme.colors.APP_YELLOW,
              lineHeight: 24,
              paddingBottom: 24,
              paddingRight: 24,
              textAlign: 'right',
            }}
            onPress={() => setShowPopop(true)}
          >
            ADD MORE PRESCRIPTIONS
          </Text>
          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
      <StickyBottomComponent defaultBG>
        <Button
          title={'SUBMIT PRESCRIPTION'}
          onPress={() => props.navigation.goBack()}
          style={{ marginHorizontal: 60, flex: 1 }}
        />
      </StickyBottomComponent>
      {ShowPopop && (
        <UploadPrescriprionPopup
          onClickClose={() => setShowPopop(false)}
          getData={(images) => {
            console.log(images);
            setShowPopop(false);
            console.log(Images, images);
            const imageCopy = [...Images].concat(images as PickerImage[]);
            console.log(imageCopy, 'imageCopy');
            setImages(imageCopy);
          }}
          navigation={props.navigation}
        />
      )}
    </View>
  );
};
