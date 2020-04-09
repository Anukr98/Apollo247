const axios = require('axios');

exports.autoSubmitJDCasesheet = (req, res) => {
  const requestJSON = {
    query: 'query { autoSubmitJDCasesheet }',
  };
  axios.defaults.headers.common['authorization'] = 'Bearer 3d1833da7020e0602165529446587434';
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};
