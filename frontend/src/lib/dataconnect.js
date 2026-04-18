import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '../dataconnect-generated';

const dataConnect = getDataConnect(connectorConfig);

const emulatorHost = import.meta.env.VITE_DATACONNECT_EMULATOR_HOST;
if (emulatorHost) {
  const [host, rawPort] = emulatorHost.split(':');
  const port = Number(rawPort || '9399');
  connectDataConnectEmulator(dataConnect, host, port);
}

export { dataConnect };
