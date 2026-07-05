const dotenv = require('dotenv');
dotenv.config();

function getEnv(name, fallback = undefined) {
  const value = process.env[name];
  return value === undefined ? fallback : value;
}

module.exports = { getEnv };
