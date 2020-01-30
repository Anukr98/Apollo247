import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
// import RNFS from 'react-native-fs';
// import resizebase64 from 'resize-base64';
// import ImagePicker from 'react-native-image-picker';

export interface AzureUploadProps {}

export const AzureUpload: React.FC<AzureUploadProps> = (props) => {
  const options = {
    quality: 0.1,
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const createBold = async () => {
    // ImagePicker.openPicker({
    //   width: 300,
    //   height: 400,
    //   cropping: true,
    // }).then((image) => {
    //   console.log(image);
    //   console.log(image.sourceURL);
    //   RNFS.readFile(image.sourceURL, 'base64').then(async (res: string) => {
    //     console.log(res);
    //     const img = await resizebase64(res, 200, 200);
    //     console.log('img', img);
    //   });
    // });
    // ImagePicker.openCamera({
    //   width: 300,
    //   height: 400,
    //   cropping: true,
    // }).then((image) => {
    //   console.log(image);
    // });
    // Open Image Library:
    // ImagePicker.launchImageLibrary(options, (response) => {
    //   // Same code as in above section!
    //   console.log('response', response);
    // });
  };

  const uploadDocument = () => {
    const bearer = 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms';
    console.log('bearer', bearer);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: bearer,
    };
    console.log('headers', headers);

    fetch('http://13.126.95.18/searchprd_api.php', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ params: 'MONTEC' }),
    })
      .then((response) => {
        console.log('response fetching: ' + response);
        console.log({ response });

        return response.json();
      })
      .then((jsonData) => {
        console.log('jsonData', jsonData);
      })
      .catch((error) => {
        CommonBugFender('AzureUpload_uploadDocument', error);
        console.log('Error fetching: ' + error);
      });

    // createBold()
    //   .then(() => {
    //     console.log('Successfully executed sample.');
    //   })
    //   .catch((err) => {
    //     console.log(err.message);
    //   });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'green' }}>
      <TouchableOpacity
        style={{ marginTop: 50, marginLeft: 50, backgroundColor: 'red' }}
        onPress={() => uploadDocument()}
      >
        <Text> Upload </Text>
      </TouchableOpacity>
    </View>
  );
};
