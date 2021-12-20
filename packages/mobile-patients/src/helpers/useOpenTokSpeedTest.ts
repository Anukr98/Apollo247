import React, { useEffect, useState } from 'react';
import RNFetchBlob from 'rn-fetch-blob';

interface PublisherSettings {
  frameRate: number;
  resolution: string;
  unstable?: boolean;
}
// 640x480 @ 30 > 600   < 0.5%
// Excellent    352x288 @ 30    > 300   < 0.5%
// Excellent    320x240 @ 30    >300    < 0.5%
// Acceptable   1280x720 @ 30   > 350   < 3%
// Acceptable   640x480 @ 30    > 250   < 3%
// Acceptable   352x288 @ 30    > 150   < 3%
// Acceptable   320x240 @ 30    > 150
const downloadSize = 1000;
const matchResolution = (speed: number): PublisherSettings => {
  if (speed > 1000) {
    return { frameRate: 30, resolution: '1280x720' };
  }
  if (speed > 600) {
    return { frameRate: 30, resolution: '640x480' };
  }
  if (speed > 400) {
    return { frameRate: 30, resolution: '352x288' };
  }
  return { frameRate: 15, resolution: '320x240', unstable: true };
};
const showResults = (startTime: number, endTime: number): number => {
  let duration = (endTime - startTime) / 1000;
  let bitsLoaded = downloadSize * 8;
  let speedBps = (bitsLoaded / (duration ? duration : 0.001)).toFixed(2);
  let speedKbps = (Number(speedBps) / 1024).toFixed(2);
  return Number(speedKbps) * 100;
};
const useOpenTokSpeedTest = (): PublisherSettings => {
  const [publisherSettings, setPublisherSettings] = useState<PublisherSettings>({
    frameRate: 30,
    resolution: '640x360',
  });
  useEffect(() => {
    const networkTest = () => {
      let endTime: number;
      let startTime = new Date().getTime();
      let imageURI =
        'https://upload.wikimedia.org/wikipedia/commons/e/e6/1kb.png' + '?nnn=' + startTime;
      RNFetchBlob.config({
        fileCache: false,
      })
        .fetch('GET', imageURI, {})
        .then((res) => {
          endTime = new Date().getTime();
          const speed = showResults(startTime, endTime);
          const resolution = matchResolution(speed);
          setPublisherSettings(resolution);
        })
        .catch(() => {
          clearInterval(interval);
        });
    };
    const interval = setInterval(networkTest, 5000);
    return () => clearInterval(interval);
  }, []);
  return publisherSettings;
};
export default useOpenTokSpeedTest;
