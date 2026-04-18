const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const AnomalySeverity = {
  low: "low",
  medium: "medium",
  high: "high",
}
exports.AnomalySeverity = AnomalySeverity;

const AnomalyType = {
  HIGH_DEDUCTION: "HIGH_DEDUCTION",
  INCOME_DROP: "INCOME_DROP",
  HOURS_MISMATCH: "HOURS_MISMATCH",
  SUDDEN_COMMISSION_SPIKE: "SUDDEN_COMMISSION_SPIKE",
  LOW_HOURLY_RATE: "LOW_HOURLY_RATE",
}
exports.AnomalyType = AnomalyType;

const GrievanceStatus = {
  open: "open",
  tagged: "tagged",
  escalated: "escalated",
  resolved: "resolved",
}
exports.GrievanceStatus = GrievanceStatus;

const UserRole = {
  worker: "worker",
  verifier: "verifier",
  advocate: "advocate",
}
exports.UserRole = UserRole;

const WorkerCategory = {
  ride_hailing: "ride_hailing",
  food_delivery: "food_delivery",
  freelance: "freelance",
  domestic: "domestic",
}
exports.WorkerCategory = WorkerCategory;

const connectorConfig = {
  connector: 'example',
  service: 'softec-webhackathon-service',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createUserFromFirebaseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUserFromFirebase', inputVars);
}
createUserFromFirebaseRef.operationName = 'CreateUserFromFirebase';
exports.createUserFromFirebaseRef = createUserFromFirebaseRef;

exports.createUserFromFirebase = function createUserFromFirebase(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createUserFromFirebaseRef(dcInstance, inputVars));
}
;

const createShiftRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateShift', inputVars);
}
createShiftRef.operationName = 'CreateShift';
exports.createShiftRef = createShiftRef;

exports.createShift = function createShift(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createShiftRef(dcInstance, inputVars));
}
;

const createGrievanceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateGrievance', inputVars);
}
createGrievanceRef.operationName = 'CreateGrievance';
exports.createGrievanceRef = createGrievanceRef;

exports.createGrievance = function createGrievance(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createGrievanceRef(dcInstance, inputVars));
}
;

const createIncomeCertificateRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateIncomeCertificate', inputVars);
}
createIncomeCertificateRef.operationName = 'CreateIncomeCertificate';
exports.createIncomeCertificateRef = createIncomeCertificateRef;

exports.createIncomeCertificate = function createIncomeCertificate(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createIncomeCertificateRef(dcInstance, inputVars));
}
;

const listPlatformsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPlatforms');
}
listPlatformsRef.operationName = 'ListPlatforms';
exports.listPlatformsRef = listPlatformsRef;

exports.listPlatforms = function listPlatforms(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listPlatformsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const workerDashboardSummaryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'WorkerDashboardSummary', inputVars);
}
workerDashboardSummaryRef.operationName = 'WorkerDashboardSummary';
exports.workerDashboardSummaryRef = workerDashboardSummaryRef;

exports.workerDashboardSummary = function workerDashboardSummary(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(workerDashboardSummaryRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const cityMedianCommissionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CityMedianCommission', inputVars);
}
cityMedianCommissionRef.operationName = 'CityMedianCommission';
exports.cityMedianCommissionRef = cityMedianCommissionRef;

exports.cityMedianCommission = function cityMedianCommission(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(cityMedianCommissionRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listGrievancesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListGrievances', inputVars);
}
listGrievancesRef.operationName = 'ListGrievances';
exports.listGrievancesRef = listGrievancesRef;

exports.listGrievances = function listGrievances(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listGrievancesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;
