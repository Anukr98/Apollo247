fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew install fastlane`

# Available Actions
## Android
### android codepush
```
fastlane android codepush
```
CodePush to Android Environments
### android build
```
fastlane android build
```
Build the Android apk
### android build_debug
```
fastlane android build_debug
```
Build the Android Debug apk
### android bundle
```
fastlane android bundle
```
Build the Android bundle
### android bundle_debug
```
fastlane android bundle_debug
```
Build the Android Debug bundle
### android build_bundle
```
fastlane android build_bundle
```
Build the Android apk and bundle
### android appcenter_apk
```
fastlane android appcenter_apk
```
Upload Android apk to appcenter

----

## iOS
### ios codepush
```
fastlane ios codepush
```
CodePush to IOS Environments
### ios build
```
fastlane ios build
```
Build the ipa
### ios appcenter_ipa
```
fastlane ios appcenter_ipa
```
Upload iOS ipa to appcenter

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
