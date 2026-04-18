import { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const AnomalySeverity = {
  low: "low",
  medium: "medium",
  high: "high",
}

export const AnomalyType = {
  HIGH_DEDUCTION: "HIGH_DEDUCTION",
  INCOME_DROP: "INCOME_DROP",
  HOURS_MISMATCH: "HOURS_MISMATCH",
  SUDDEN_COMMISSION_SPIKE: "SUDDEN_COMMISSION_SPIKE",
  LOW_HOURLY_RATE: "LOW_HOURLY_RATE",
}

export const GrievanceStatus = {
  open: "open",
  tagged: "tagged",
  escalated: "escalated",
  resolved: "resolved",
}

export const UserRole = {
  worker: "worker",
  verifier: "verifier",
  advocate: "advocate",
}

export const WorkerCategory = {
  ride_hailing: "ride_hailing",
  food_delivery: "food_delivery",
  freelance: "freelance",
  domestic: "domestic",
}

export const connectorConfig = {
  connector: 'example',
  service: 'softec-webhackathon-service',
  location: 'us-east4'
};
export const createUserFromFirebaseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUserFromFirebase', inputVars);
}
createUserFromFirebaseRef.operationName = 'CreateUserFromFirebase';

export function createUserFromFirebase(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createUserFromFirebaseRef(dcInstance, inputVars));
}

export const createShiftRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateShift', inputVars);
}
createShiftRef.operationName = 'CreateShift';

export function createShift(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createShiftRef(dcInstance, inputVars));
}

export const createGrievanceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateGrievance', inputVars);
}
createGrievanceRef.operationName = 'CreateGrievance';

export function createGrievance(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createGrievanceRef(dcInstance, inputVars));
}

export const createIncomeCertificateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateIncomeCertificate', inputVars);
}
createIncomeCertificateRef.operationName = 'CreateIncomeCertificate';

export function createIncomeCertificate(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createIncomeCertificateRef(dcInstance, inputVars));
}

export const listPlatformsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPlatforms');
}
listPlatformsRef.operationName = 'ListPlatforms';

export function listPlatforms(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listPlatformsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const workerDashboardSummaryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'WorkerDashboardSummary', inputVars);
}
workerDashboardSummaryRef.operationName = 'WorkerDashboardSummary';

export function workerDashboardSummary(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(workerDashboardSummaryRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const cityMedianCommissionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CityMedianCommission', inputVars);
}
cityMedianCommissionRef.operationName = 'CityMedianCommission';

export function cityMedianCommission(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(cityMedianCommissionRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listGrievancesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListGrievances', inputVars);
}
listGrievancesRef.operationName = 'ListGrievances';

export function listGrievances(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listGrievancesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

