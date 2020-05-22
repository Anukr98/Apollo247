export function distanceBetweenTwoLatLongInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist) * (180 / Math.PI) * (60 * 1.1515) * 1.609344 * 1000;
    return dist;
  }
}
