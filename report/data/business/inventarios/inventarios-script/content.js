// Use the "beforeRender" or "afterRender" hook
// to manipulate and control the report generation
const baseApiUrl = 'http://localhost:8080/api/reports/inventaries';

const axios = require('axios');

async function fetchData() {
  try {
    // Replace with the API endpoint you want to call
    const response = await axios.get(baseApiUrl);
    // Store the result in the report context
    return response.data;
  } catch (error) {
    console.error('Error fetching API data', error);
  }
}

async function beforeRender(req, res) {
  req.data.apiData = await fetchData();
}
