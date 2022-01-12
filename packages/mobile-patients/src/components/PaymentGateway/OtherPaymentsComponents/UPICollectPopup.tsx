import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { PayCash } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  VerifyVPA,
  one_apollo_store_code,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { verifyVPA, verifyVPAVariables } from '@aph/mobile-patients/src/graphql/types/verifyVPA';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { VERIFY_VPA } from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';

export interface UPICollectProps {
  onPressPay: (VPA: string) => void;
  amount: number;
}

export const UPICollectPopup: React.FC<UPICollectProps> = (props) => {
  const { onPressPay, amount } = props;
  const [VPA, setVPA] = useState<string>('');
  const [isVPAvalid, setisVPAvalid] = useState<boolean>(true);
  const [isVerifying, setisVerifying] = useState<boolean>(false);
  const client = useApolloClient();

  const UPIBanks = [
    '@oksbi',
    '@okaxis',
    '@ybl',
    '@paytm',
    '@upi',
    '@okhdfcbank',
    '@okicici',
    '@apl',
  ];

  const verifyVPA = (VPA: string) => {
    const verifyVPA: VerifyVPA = {
      vpa: VPA,
      merchant_id: AppConfig.Configuration.merchantId,
    };
    return client.mutate<verifyVPA, verifyVPAVariables>({
      mutation: VERIFY_VPA,
      variables: { verifyVPA: verifyVPA },
      fetchPolicy: 'no-cache',
    });
  };

  const verifyUPIId = async (id: string) => {
    try {
      setisVerifying(true);
      const res = await verifyVPA(id);
      if (res?.data?.verifyVPA?.status == 'VALID') {
        onPressPay(VPA);
      } else {
        setisVPAvalid(false);
      }
    } catch (error) {
    } finally {
      setisVerifying(false);
    }
  };

  const isValid = (VPA: string) => {
    const match = /^[\w\.\-_]{3,}@[a-zA-Z]{3,}/;
    return match.test(VPA);
  };

  const renderUPIInput = () => {
    return (
      <View>
        <View style={{ ...styles.inputCont, borderColor: isVPAvalid ? '#00B38E' : '#FF748E' }}>
          <TextInputComponent
            conatinerstyles={styles.conatinerstyles}
            inputStyle={styles.inputStyle}
            value={VPA}
            onChangeText={(text) => {
              setVPA(text);
              setisVPAvalid(true);
            }}
            placeholder={'Enter UPI Id'}
            onSubmitEditing={(e) => isValid(VPA) && verifyUPIId(VPA)}
          />
        </View>
      </View>
    );
  };

  const renderPayNowButton = () => {
    return !isVerifying ? (
      <Button
        disabled={isValid(VPA) ? false : true}
        style={{ marginTop: 10, borderRadius: 5 }}
        title={`VERIFY AND PAY ₹${amount}`}
        onPress={() => verifyUPIId(VPA)}
      />
    ) : (
      <Text style={styles.verifying}>Verifying ...</Text>
    );
  };

  const appendUPIbank = (bank: any) => {
    setisVPAvalid(true);
    if (!!bank) {
      const UpiId = VPA?.split('@');
      setVPA(UpiId?.[0] + bank);
    }
  };

  const renderUPIBankOptions = () => {
    return (
      <FlatList
        data={UPIBanks}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={(item: any) => (
          <TouchableOpacity onPress={() => appendUPIbank(item?.item)}>
            <Text
              style={{
                ...styles.UPIBank,
                marginTop: isVPAvalid ? 32 : 15,
                marginLeft: item?.index == 0 ? 0 : 12,
              }}
            >
              {item?.item}
            </Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  const renderUPICollectMsg = () => {
    return isVPAvalid ? null : (
      <Text style={{ ...styles.upiCollectMsg, color: '#CF8F6A' }}>
        Invalid UPI Id, Please check again
      </Text>
    );
  };

  const renderChildComponent = () => {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <View style={styles.ChildComponent}>
          {renderUPIInput()}
          {renderUPICollectMsg()}
          {renderUPIBankOptions()}
        </View>
        {renderPayNowButton()}
      </View>
    );
  };

  const keyboardVerticalOffset = Platform.OS === 'android' ? { keyboardVerticalOffset: -50 } : {};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ paddingTop: 12, paddingBottom: 24 }}
      {...keyboardVerticalOffset}
    >
      <View style={{}}>{renderChildComponent()}</View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  ChildComponent: {
    paddingVertical: 12,
    backgroundColor: '#FAFEFF',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  header: {
    marginHorizontal: 16,
    paddingBottom: 12,
  },
  heading: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 4,
  },
  inputStyle: {
    borderBottomWidth: 0,
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  inputCont: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    marginBottom: 4,
  },
  conatinerstyles: {
    justifyContent: 'center',
    height: 40,
    borderWidth: 2,
    paddingTop: 1,
    paddingBottom: 0,
    borderColor: '#00B38E',
    borderRadius: 4,
    paddingHorizontal: 12,
    // borderBottomWidth: 0,
  },
  UPIBank: {
    marginTop: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    backgroundColor: '#fff',
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 16,
    color: '#01475B',
  },
  upiCollectMsg: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 18,
    color: '#01475B',
    letterSpacing: 0.01,
  },
  verifying: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#FC9916',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 40,
  },
});
