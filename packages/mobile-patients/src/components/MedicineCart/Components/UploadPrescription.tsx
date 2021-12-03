import React, { useState } from 'react';
import { View } from 'react-native';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { NavigationScreenProps } from 'react-navigation';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

export interface UploadPrescriptionProps extends NavigationScreenProps {
  showPopUp: boolean;
  onClickClose: () => void;
  type: string;
  onUpload?: () => void;
}

export const UploadPrescription: React.FC<UploadPrescriptionProps> = (props) => {
  const { ePrescriptions } = useShoppingCart();
  const { setUserActionPayload, uploadPhysicalPrescriptionsToServerCart } = useServerCart();
  const { currentPatient } = useAllCurrentPatients();
  const { showPopUp, onClickClose, type, onUpload } = props;
  const [showEprescriptionUpload, setshowEprescriptionUpload] = useState<boolean>(false);

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
            uploadPhysicalPrescriptionsToServerCart(response);
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
          selectedEPres.forEach((presToAdd) => {
            setUserActionPayload?.({
              prescriptionDetails: {
                prescriptionImageUrl: presToAdd.uploadedUrl,
                prismPrescriptionFileId: presToAdd.prismPrescriptionFileId,
                uhid: currentPatient?.id,
                appointmentId: presToAdd.appointmentId,
                meta: {
                  doctorName: presToAdd?.doctorName,
                  forPatient: presToAdd?.forPatient,
                  medicines: presToAdd?.medicines,
                  date: presToAdd?.date,
                },
              },
            });
          });
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
