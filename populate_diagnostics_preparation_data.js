require('dotenv').config();
const { Client, Pool } = require('pg');
const fs = require('fs');
const parse = require('csv-parse');
const getStream = require('get-stream');

const nullPreparations = [
  'No special prepration required',
  'No special preparation required',
  'NOT APPLICABLE',
  'No special prepration is required',
  'No special prerpration required',
  'No test prepration required',
];

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

const getPreparationData = async () => {
  const output = [];

  const rows = await getStream.array(
    fs
      .createReadStream('./data/diagnosticPreparationData.csv')
      .pipe(parse({ trim: true, skip_empty_lines: true }))
  );
  for (element of rows) {
    let found;
    for (preparation of nullPreparations) {
      if (element[5].indexOf(preparation) > -1) {
        found = true;
        break;
      }
    }
    if (!found) {
      output.push(element);
    }
  }
  return output;
};

const updateDiagnosticsItem = async (client, item) => {
  const str = `UPDATE diagnostics SET "testPreparationData" = '${item[5]}' WHERE "itemId" = ${item[1]} AND "itemCode" = '${item[0]}'`;
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

const start = async () => {
  client.connect().catch(function (err) {
    console.log('error while connection', err);
    process.kill(process.pid);
  });
  const preparationData = await getPreparationData();
  for (const element of preparationData) {
    await updateDiagnosticsItem(client, element);
  }
  process.kill(process.pid);
};

start();
