const fs = require('fs');
const path = require('path');
const { encryptJSON } = require('./utils');

const FILE_PATH = path.join(__dirname, '../notes.json');

exports.handler = async function (event, context) {
  const { userKey } = JSON.parse(event.body);

  if (!userKey) {
    return {
      statusCode: 400,
      body: 'Missing userKey in request',
    };
  }

  let jsonData;
  try {
    const fileContent = fs.readFileSync(FILE_PATH, 'utf8');
    jsonData = JSON.parse(fileContent);
  } catch (err) {
    console.error('Error reading or parsing the file:', err);
    return {
      statusCode: 500,
      body: 'Error reading or parsing the file',
    };
  }

  const encryptedData = encryptJSON(jsonData, userKey);

  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(encryptedData, null, 2), 'utf8');
    return {
      statusCode: 200,
      body: 'Encrypted JSON data has been saved to notes.json',
    };
  } catch (err) {
    console.error('Error writing to the file:', err);
    return {
      statusCode: 500,
      body: 'Error saving encrypted data',
    };
  }
};
