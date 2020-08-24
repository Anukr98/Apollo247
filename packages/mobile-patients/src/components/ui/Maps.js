import React, { Component } from 'react';
import {
  StyleSheet
} from 'react-native';
import MapView,{ PROVIDER_GOOGLE } from 'react-native-maps';

export default class App extends Component {
  render() {
    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
      >
        <MapView.Marker
          title="Greenwich"
          coordinate={{
            latitude: 51.48,
            longitude: 0
          }}
          calloutOffset={{
            x: -50,
            y: -50
          }}
        />
      </MapView>
    );
  }
}