#replace RCTTiming.m in react-native/React/modules
cat ./modLibrary/RCTTiming.m > ./node_modules/react-native/React/Modules/RCTTiming.m 
cat ./modLibrary/opentok-react-native.podspec > ./node_modules/opentok-react-native/opentok-react-native.podspec
cat ./modLibrary/AndroidManifest.xml > ./node_modules/react-native-call-detection/android/src/main/AndroidManifest.xml