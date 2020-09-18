require('dotenv').config();
const { Client, Pool } = require('pg');
const FormData = require('form-data');
const fetch = require('node-fetch');
const async = require('async');

const client = new Client({
  user: process.env.PROFILES_DB_USER,
  password: process.env.PROFILES_DB_PASSWORD,
  host: process.env.PROFILES_DB_HOST,
  port: parseInt(process.env.PROFILES_DB_PORT, 10),
  database: `profiles_${process.env.DB_NODE_ENV}`,
  max: 20,
  //idleTimeoutMillis: 300000,
  //connectionTimeoutMillis: 20000,
});

const getToken = async () => {
  let token;
  const diagnosticLoginURL = process.env.DIAGNOSTIC_ITDOSE_LOGIN_URL;
  if (!diagnosticLoginURL) {
    throw new Error('add env DIAGNOSTICS_ITDOSE_LOGIN_URL');
  }
  const diagnosticItdoseUsername = process.env.DIAGNOSTIC_ITDOSE_USERNAME;
  const diagnosticItdosePassword = process.env.DIAGNOSTIC_ITDOSE_PASSWORD;
  if (!diagnosticItdoseUsername || !diagnosticItdosePassword) {
    throw new Error('add env DIAGNOSTICS_ITDOSE_LOGIN credentials');
  }
  const apiUrl = `${diagnosticLoginURL}`;
  const form = new FormData();
  form.append('Username', diagnosticItdoseUsername);
  form.append('Password', diagnosticItdosePassword);
  form.append('Client', '24*7');
  let options = {
    method: 'POST',
    body: form,
    headers: form.getHeaders(),
  };
  const getToken = await fetch(apiUrl, options)
    .then((res) => res.json())
    .catch((error) => {
      console.log(error);
      process.kill(process.pid);
    });
  if (getToken.status != true) {
    throw new Error(`unexpected status, want: true; got: ${getToken.status}`);
  }
  token = getToken.data[0].Token;
  return token;
};

const updateItems = async (client, token, cityStateMapping) => {
  await updateDiagnosticItemAsInActive(client);
  const totalCities = cityStateMapping.length;
  let currentCity = 0;
  for (const map of cityStateMapping) {
    currentCity++;
    console.log(
      currentCity,
      'out-of',
      totalCities,
      'city',
      map.city,
      'and state',
      map.state,
      map.state_id,
      '/',
      map.city_id
    );
    items = await fetchDiagnosticsItems(token, map.state_id, map.city_id);
    await updateItem(client, items, map.state_id, map.city_id, map.state.toUpperCase(), map.city);
  }
  console.log('all the items have been pushed. Terminating process');
  process.kill(process.pid);
};

const updateDiagnosticItemAsInActive = async (client) => {
  const str = `UPDATE diagnostics SET "isActive" = false`;
  try {
    const result = await client.query(str);
    if (result.rowCount != 1) {
      console.log('rows updated', result.rowCount, 'query:', str);
    }
  } catch (err) {
    console.log(err);
    process.kill(process.pid);
  }
};

const updateItem = async (client, items, stateId, cityId, state, city) => {
  let itemtypemismatch = 0;
  let rowsUpdated = 0;
  let rowsCreated = 0;
  for (const item of items) {
    let itemInDB = await getDiagnosticItem(client, item.itemid, stateId, cityId, item.LabCode);
    if (itemInDB.length > 0) {
      itemInDB = itemInDB[0]; // not considering labid and labcode
      await updateDiagnosticItem(client, item, stateId, cityId, state, city);
      rowsUpdated++;
      if (item.ItemType.toLowerCase() != itemInDB.itemType.toLowerCase()) {
        itemtypemismatch++;
      }
    } else {
      await saveDiagnosticItem(client, item, stateId, cityId, state, city);
      rowsCreated++;
    }
  }
  console.log(
    'item type mismatch',
    itemtypemismatch,
    'rows created',
    rowsCreated,
    'rows updated',
    rowsUpdated
  );
  console.log('\n');
};

const updateDiagnosticItem = async (client, item, stateId, cityId, state, city) => {
  const str = `UPDATE diagnostics SET "rate" = ${item.Rate}, "itemName" = '${item.itemname}', "toAgeInDays" = ${item.ToAgeInDays}, "isActive" = true, "itemAliasName" = '', "testInPackage" = 0, "NABL_CAP" = '', "itemRemarks" = '', "discounted" = 'N', "testPreparationData" = '', "state" = '${state}', "city" = '${city}' WHERE "itemId" = '${item.itemid}' AND "stateId" = ${stateId} AND "cityId" = ${cityId}`;
  try {
    const result = await client.query(str);
    if (result.rowCount != 1) {
      console.log('unexpected rows updated', result.rowCount, 'query:', str);
    }
  } catch (err) {
    console.log(err);
    process.kill(process.pid);
  }
};

const saveDiagnosticItem = async (client, item, stateId, cityId, state, city) => {
  const str = `INSERT INTO diagnostics ("itemId", "itemName", "itemCode", "fromAgeInDays", "toAgeInDays", "gender", "labName", "labCode", "labID",
   "rate", "itemType", "stateId", "cityId", "state", "city", "scheduleRate",
   "itemAliasName", "testInPackage", "NABL_CAP", "itemRemarks", "discounted", "testPreparationData") VALUES ('${
     item.itemid
   }', '${item.itemname}', '${item.itemcode}', ${item.FromAgeInDays}, ${item.ToAgeInDays}, '${
    item.Gender
  }', '${item.LabName}', '${item.LabCode}', ${item.LabID}, ${
    item.Rate
  }, '${item.ItemType.toUpperCase()}', ${stateId}, ${cityId}, '${state}', '${city}', 0.00, '', 0, '', '', 'N', '')`;
  try {
    await client.query(str);
  } catch (err) {
    console.log(err);
    process.kill(process.pid);
  }
};

const getDiagnosticItem = async (client, itemid, stateId, cityId, labCode) => {
  const str = `SELECT * from diagnostics WHERE "itemId" = '${itemid}' AND "stateId" = ${stateId} AND "cityId" = ${cityId}`;
  try {
    docs = await client.query(str);
    return docs.rows;
  } catch (err) {
    console.log(err);
    process.kill(process.pid);
  }
};

const fetchDiagnosticsItems = async (token, stateId, cityId) => {
  const apiUrl = process.env.DIAGNOSTIC_ITDOSE_GET_ITEMLIST;
  if (!apiUrl) {
    console.log(new Error('add env DIAGNOSTIC_ITDOSE_GET_ITEMLIST'));
    process.kill(process.pid);
  }
  const form = new FormData();
  form.append('stateID', stateId);
  form.append('cityID', cityId);
  let options = {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, ...form.getHeaders() },
    body: form,
  };
  const itemslist = await fetch(apiUrl, options)
    .then((res) => res.json())
    .catch((error) => {
      console.log(error);
      process.kill(process.pid);
    });
  if (itemslist.status != true || !itemslist.data) {
    throw new Error('unexpected response from api', itemslist);
  }
  return itemslist.data;
};

const getDistinctCityState = async (client) => {
  const str =
    'SELECT DISTINCT "city_id", "state_id", "city", "state" from diagnostic_itdose_pincode_hubs';
  try {
    docs = await client.query(str);
    return docs.rows;
  } catch (err) {
    console.log(err);
    process.kill(process.pid);
  }
};

const start = async () => {
  const token = await getToken();
  client.connect().catch(function (err) {
    console.log('error while connection', err);
  });
  const cityStateMapping = await getDistinctCityState(client);
  await updateItems(client, token, cityStateMapping);
};

start();
