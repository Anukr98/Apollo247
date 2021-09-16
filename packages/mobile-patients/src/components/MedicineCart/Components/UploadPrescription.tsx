import React, { useState } from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  useShoppingCart,
  PhysicalPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { NavigationScreenProps } from 'react-navigation';

export interface UploadPrescriptionProps extends NavigationScreenProps {
  showPopUp: boolean;
  onClickClose: () => void;
  type: string;
  onUpload?: () => void;
}

export const UploadPrescription: React.FC<UploadPrescriptionProps> = (props) => {
  const {
    physicalPrescriptions,
    setPhysicalPrescriptions,
    setEPrescriptions,
    ePrescriptions,
  } = useShoppingCart();
  const { showPopUp, onClickClose, type, onUpload } = props;
  const [showEprescriptionUpload, setshowEprescriptionUpload] = useState<boolean>(false);

  const updatePhysicalPrescriptions = (uploadPrescriptions: PhysicalPrescription[]) => {
    const itemsToAdd = uploadPrescriptions.filter(
      (p) => !physicalPrescriptions.find((pToFind) => pToFind.base64 == p.base64)
    );
    setPhysicalPrescriptions && setPhysicalPrescriptions([...itemsToAdd, ...physicalPrescriptions]);
  };

  const renderUploadPrescription = () => {
    return showPopUp ? (
      <UploadPrescriprionPopup
        type={type}
        isVisible={showPopUp}
        hideTAndCs={false}
        disabledOption={'NONE'}
        heading={'Upload Prescription(s)'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          'Take clear picture of your entire prescription.',
          'Doctor details & date of the prescription should be clearly visible.',
          'Medicines will be dispensed as per prescription.',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'UPLOAD FROM\nGALLERY',
          prescription: 'UPLOAD FROM\nRECORDS',
        }}
        onClickClose={onClickClose}
        onResponse={(selectedType, response) => {
          onClickClose();
          if (selectedType == 'CAMERA_AND_GALLERY') {
            updatePhysicalPrescriptions(response);
          } else {
            setshowEprescriptionUpload(true);
          }
          onUpload?.();
        }}
      />
    ) : null;
  };

  const renderEprescriptionUpload = () => {
    return showEprescriptionUpload ? (
      <SelectEPrescriptionModal
        displayPrismRecords={true}
        navigation={props.navigation}
        onSubmit={(selectedEPres) => {
          setshowEprescriptionUpload(false);
          if (selectedEPres.length == 0) {
            return;
          }
          setEPrescriptions && setEPrescriptions([...selectedEPres]);
        }}
        selectedEprescriptionIds={ePrescriptions.map((item) => item.id)}
        isVisible={showEprescriptionUpload}
      />
    ) : null;
  };

  return (
    <View>
      {renderUploadPrescription()}
      {renderEprescriptionUpload()}
    </View>
  );
};
