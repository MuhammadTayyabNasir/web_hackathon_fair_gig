const { validateAdminArgs } = require('firebase-admin/data-connect');

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
  serviceId: 'softec-webhackathon-service',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

function createUserFromFirebase(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateUserFromFirebase', inputVars, inputOpts);
}
exports.createUserFromFirebase = createUserFromFirebase;

function createShift(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateShift', inputVars, inputOpts);
}
exports.createShift = createShift;

function createGrievance(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateGrievance', inputVars, inputOpts);
}
exports.createGrievance = createGrievance;

function createIncomeCertificate(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateIncomeCertificate', inputVars, inputOpts);
}
exports.createIncomeCertificate = createIncomeCertificate;

function listPlatforms(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListPlatforms', undefined, inputOpts);
}
exports.listPlatforms = listPlatforms;

function workerDashboardSummary(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('WorkerDashboardSummary', inputVars, inputOpts);
}
exports.workerDashboardSummary = workerDashboardSummary;

function cityMedianCommission(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('CityMedianCommission', inputVars, inputOpts);
}
exports.cityMedianCommission = cityMedianCommission;

function listGrievances(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListGrievances', inputVars, inputOpts);
}
exports.listGrievances = listGrievances;

