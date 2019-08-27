import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  FileBig,
  MedicineRxIcon,
  PrescriptionThumbnail,
  CrossYellow,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { PickerImage } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AddFilePopup } from '@aph/mobile-patients/src/components/HealthRecords/AddFilePopup';

const styles = StyleSheet.create({
  labelStyle: {
    paddingBottom: 4,
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export interface AddRecordProps extends NavigationScreenProps {}

export const AddRecord: React.FC<AddRecordProps> = (props) => {
  const [showImages, setshowImages] = useState<boolean>(true);
  const [showRecordDetails, setshowRecordDetails] = useState<boolean>(true);
  const [showReportDetails, setshowReportDetails] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);

  const [Images, setImages] = useState<PickerImage[]>(
    props.navigation.state.params ? props.navigation.state.params!.images : []
  );

  const data = {
    doctorInfo: {
      firstName: 'Mamatha',
      photoUrl:
        'https://image.shutterstock.com/image-photo/smiling-doctor-posing-arms-crossed-600w-519507367.jpg',
    },
    id: '34567890987654',
    consult_info: '03 Aug 2019, Online Consult',
    description: 'This is a follow-up consult to the Clinic Visit on 27 Jul 2019',
  };

  const renderImagesRow = (data: PickerImage, i: number) => {
    return (
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
            <Text>
              {data!
                .path!.split('\\')!
                .pop()!
                .split('/')
                .pop()}
            </Text>
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
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUploadedImages = () => {
    return (
      <View>
        <CollapseCard
          heading="IMAGES UPLOADED"
          collapse={showImages}
          onPress={() => setshowImages(!showImages)}
        >
          <View style={[styles.cardViewStyle, { paddingHorizontal: 8 }]}>
            <FlatList
              bounces={false}
              data={Images}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) => renderImagesRow(item, index)}
              keyExtractor={(_, index) => index.toString()}
            />
            <Text
              style={[theme.viewStyles.yellowTextStyle, { textAlign: 'right', paddingBottom: 16 }]}
              onPress={() => setdisplayOrderPopup(true)}
            >
              ADD IMAGE
            </Text>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderRecordDetails = () => {
    return (
      <View>
        <CollapseCard
          heading="RECORD DETAILS"
          collapse={showRecordDetails}
          onPress={() => setshowRecordDetails(!showRecordDetails)}
        >
          <View style={[styles.cardViewStyle, { paddingTop: 6, paddingBottom: 5 }]}>
            <TextInputComponent label={'Type Of Record'} />
            <TextInputComponent label={'Name Of Test'} />
            <TextInputComponent label={'Date Of Test'} />
          </View>
        </CollapseCard>
      </View>
    );
  };
  const renderReportDetails = () => {
    return (
      <View>
        <CollapseCard
          heading="REPORT DETAILS (Optional)"
          collapse={showReportDetails}
          onPress={() => setshowReportDetails(!showReportDetails)}
        >
          <View
            style={[
              //   styles.cardViewStyle,
              {
                ...theme.viewStyles.cardContainer,
                marginTop: 15,
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 20,
              },
            ]}
          >
            <View>
              <View style={styles.labelViewStyle}>
                <Text style={styles.labelStyle}>Parameters</Text>
              </View>
              <View
                style={{
                  marginTop: 16,
                  ...theme.viewStyles.cardViewStyle,
                  shadowRadius: 4,
                  paddingHorizontal: 16,
                  paddingTop: 6,
                  paddingBottom: 5,
                }}
              >
                <TextInputComponent label={'Name Of Parameter'} placeholder={'Enter name'} />
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <TextInputComponent label={'Result'} placeholder={'Enter value'} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <TextInputComponent label={'Unit'} placeholder={'Select unit'} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <TextInputComponent label={'Min'} placeholder={'Enter value'} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <TextInputComponent label={'Max'} placeholder={'Enter value'} />
                  </View>
                </View>
              </View>
            </View>
            <Text
              style={{ ...theme.viewStyles.yellowTextStyle, textAlign: 'right', paddingTop: 16 }}
            >
              ADD PARAMETER
            </Text>
            <View>
              <View style={styles.labelViewStyle}>
                <Text style={[styles.labelStyle, { paddingTop: 20 }]}>Observation Details</Text>
              </View>
              <View
                style={{
                  marginTop: 16,
                  ...theme.viewStyles.cardViewStyle,
                  shadowRadius: 4,
                  paddingHorizontal: 16,
                  paddingTop: 6,
                  paddingBottom: 5,
                }}
              >
                <TextInputComponent label={'Referring Doctor'} placeholder={'Enter name'} />
                <TextInputComponent
                  label={'Observations / Impressions'}
                  placeholder={'Enter observations'}
                />
                <TextInputComponent label={'Additional Notes'} placeholder={'Enter name'} />
              </View>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderData = () => {
    return (
      <View
        style={{
          marginTop: 28,
        }}
      >
        {renderUploadedImages()}
        {renderRecordDetails()}
        {renderReportDetails()}
      </View>
    );
  };

  const renderBottomButton = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title="ADD RECORD"
          style={{ flex: 1, marginHorizontal: 60 }}
          onPress={() => props.navigation.navigate(AppRoutes.AddAddress)}
        />
      </StickyBottomComponent>
    );
  };

  if (data.doctorInfo)
    return (
      <View
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Header
            container={{
              ...theme.viewStyles.cardViewStyle,
              borderRadius: 0,
            }}
            title="ADD A RECORD"
            leftIcon="backArrow"
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <ScrollView bounces={false}>
            {renderData()}
            <View style={{ height: 80 }} />
          </ScrollView>
        </SafeAreaView>
        {renderBottomButton()}
        {displayOrderPopup && (
          <AddFilePopup
            onClickClose={() => {
              setdisplayOrderPopup(false);
            }}
            getData={(data: (PickerImage | PickerImage[])[]) => {
              console.log(data);
              setImages(data);
            }}
          />
        )}
      </View>
    );
  return null;
};
