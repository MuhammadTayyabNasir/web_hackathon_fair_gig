const { getDataConnect } = require('firebase-admin/data-connect');
const { connectorConfig } = require('../dataconnect-admin-generated');
const { ensureFirebaseAdmin } = require('./firebase-admin');

let cachedDataConnect;

/**
 * Returns a singleton Data Connect admin client bound to Firebase Admin app.
 * @returns {import('firebase-admin/data-connect').DataConnect}
 */
function getAdminDataConnect() {
  if (!cachedDataConnect) {
    const admin = ensureFirebaseAdmin();
    cachedDataConnect = getDataConnect(connectorConfig, admin.app());
    const emulatorHost = process.env.DATACONNECT_EMULATOR_HOST;
    if (emulatorHost) {
      cachedDataConnect.connectEmulator(emulatorHost);
    }
  }
  return cachedDataConnect;
}

module.exports = { getAdminDataConnect };
