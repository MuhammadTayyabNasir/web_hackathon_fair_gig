import { validateAdminArgs } from 'firebase-admin/data-connect';

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
  serviceId: 'softec-webhackathon-service',
  location: 'us-east4'
};

export function createUserFromFirebase(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateUserFromFirebase', inputVars, inputOpts);
}

export function createShift(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateShift', inputVars, inputOpts);
}

export function createGrievance(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateGrievance', inputVars, inputOpts);
}

export function createIncomeCertificate(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateIncomeCertificate', inputVars, inputOpts);
}

export function listPlatforms(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListPlatforms', undefined, inputOpts);
}

export function workerDashboardSummary(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('WorkerDashboardSummary', inputVars, inputOpts);
}

export function cityMedianCommission(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('CityMedianCommission', inputVars, inputOpts);
}

export function listGrievances(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, false);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListGrievances', inputVars, inputOpts);
}

