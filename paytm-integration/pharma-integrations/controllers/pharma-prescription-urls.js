const axios = require('axios');
const Constants = require('./../../Constants');

module.exports = async (prescriptionImages, patientDetails) => {
  const prescriptionImagesPromises = prescriptionImages.map(async (imageUrl) => {
    const requestJSON = {
      query: `mutation{
            fetchBlobURLWithPRISMData(patientId:"${patientDetails.id}",fileUrl:"${imageUrl}"){
              blobUrl
            }
          }`,
    };
    axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
    return await axios.post(process.env.API_URL, requestJSON);
  });
  const prescriptionImagesResponse = await Promise.all(prescriptionImagesPromises);
  return prescriptionImagesResponse.map((response) => {
    return { url: response.data.data.fetchBlobURLWithPRISMData.blobUrl };
  });
};
