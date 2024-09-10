const fs = require('fs');
const path = require('path');
const { decryptJSON } = require('./utils');

const FILE_PATH = path.join(__dirname, '../notes.json');

exports.handler = async function (event, context) {
  const { userKey } = JSON.parse(event.body);

  if (!userKey) {
    return {
      statusCode: 400,
      body: 'Missing userKey in request',
    };
  }

  let encryptedData;
  try {
    const fileContent = fs.readFileSync(FILE_PATH, 'utf8');
    encryptedData = JSON.parse(fileContent);
  } catch (err) {
    console.error('Error reading or parsing the file:', err);
    return {
      statusCode: 500,
      body: 'Error reading or parsing the file',
    };
  }

  try {
    const decryptedData = decryptJSON(encryptedData, userKey);
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Decrypted JSON data has been saved to notes.json',
        data: decryptedData
      }),
    };
  } catch (error) {
    console.error('Error decrypting JSON data:', error);
    return {
      statusCode: 500,
      body: 'Error decrypting JSON data',
    };
  }
};
