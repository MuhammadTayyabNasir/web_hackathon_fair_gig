import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export enum AnomalySeverity {
  low = "low",
  medium = "medium",
  high = "high",
};

export enum AnomalyType {
  HIGH_DEDUCTION = "HIGH_DEDUCTION",
  INCOME_DROP = "INCOME_DROP",
  HOURS_MISMATCH = "HOURS_MISMATCH",
  SUDDEN_COMMISSION_SPIKE = "SUDDEN_COMMISSION_SPIKE",
  LOW_HOURLY_RATE = "LOW_HOURLY_RATE",
};

export enum GrievanceStatus {
  open = "open",
  tagged = "tagged",
  escalated = "escalated",
  resolved = "resolved",
};

export enum UserRole {
  worker = "worker",
  verifier = "verifier",
  advocate = "advocate",
};

export enum WorkerCategory {
  ride_hailing = "ride_hailing",
  food_delivery = "food_delivery",
  freelance = "freelance",
  domestic = "domestic",
};



export interface AnomalyLog_Key {
  id: UUIDString;
  __typename?: 'AnomalyLog_Key';
}

export interface CityMedianCommissionData {
  commissionSnapshots: ({
    id: UUIDString;
    reportedRatePct: number;
    snapshotDate: DateString;
    platform: {
      id: UUIDString;
      name: string;
      slug: string;
    } & Platform_Key;
  } & CommissionSnapshot_Key)[];
}

export interface CityMedianCommissionVariables {
  city: string;
  category: WorkerCategory;
}

export interface CommissionSnapshot_Key {
  id: UUIDString;
  __typename?: 'CommissionSnapshot_Key';
}

export interface CreateGrievanceData {
  grievance_insert: Grievance_Key;
}

export interface CreateGrievanceVariables {
  workerId: UUIDString;
  platformId?: UUIDString | null;
  isAnonymous: boolean;
  category: string;
  description: string;
  city?: string | null;
  zone?: string | null;
}

export interface CreateIncomeCertificateData {
  incomeCertificate_insert: IncomeCertificate_Key;
}

export interface CreateIncomeCertificateVariables {
  workerId: UUIDString;
  fromDate: DateString;
  toDate: DateString;
  totalVerifiedEarnings?: number | null;
  avgMonthlyIncome?: number | null;
  totalVerifiedShifts?: number | null;
  token: string;
}

export interface CreateShiftData {
  shift_insert: Shift_Key;
}

export interface CreateShiftVariables {
  workerId: UUIDString;
  platformId: UUIDString;
  workDate: DateString;
  hoursWorked?: number | null;
  grossEarned: number;
  platformDeductions: number;
  netReceived: number;
}

export interface CreateUserFromFirebaseData {
  user_insert: User_Key;
}

export interface CreateUserFromFirebaseVariables {
  firebaseUid: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Grievance_Key {
  id: UUIDString;
  __typename?: 'Grievance_Key';
}

export interface IncomeCertificate_Key {
  id: UUIDString;
  __typename?: 'IncomeCertificate_Key';
}

export interface ListGrievancesData {
  grievances: ({
    id: UUIDString;
    category: string;
    description: string;
    status: GrievanceStatus;
    city?: string | null;
    zone?: string | null;
    upvoteCount: number;
    isAnonymous: boolean;
    worker: {
      id: UUIDString;
      name: string;
    } & User_Key;
      platform?: {
        name: string;
        slug: string;
      };
        createdAt: TimestampString;
  } & Grievance_Key)[];
}

export interface ListGrievancesVariables {
  status?: GrievanceStatus | null;
}

export interface ListPlatformsData {
  platforms: ({
    id: UUIDString;
    name: string;
    slug: string;
    country: string;
    isActive: boolean;
  } & Platform_Key)[];
}

export interface Platform_Key {
  id: UUIDString;
  __typename?: 'Platform_Key';
}

export interface Shift_Key {
  id: UUIDString;
  __typename?: 'Shift_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Verification_Key {
  shiftId: UUIDString;
  __typename?: 'Verification_Key';
}

export interface WorkerDashboardSummaryData {
  shifts: ({
    id: UUIDString;
    workDate: DateString;
    grossEarned: number;
    platformDeductions: number;
    netReceived: number;
    currency: string;
    platform: {
      name: string;
      slug: string;
    };
  } & Shift_Key)[];
    anomalies: ({
      id: UUIDString;
      anomalyType: AnomalyType;
      severity: AnomalySeverity;
      plainExplanation: string;
      detectedAt: TimestampString;
      shift?: {
        id: UUIDString;
        workDate: DateString;
      } & Shift_Key;
    } & AnomalyLog_Key)[];
      certificates: ({
        id: UUIDString;
        token: string;
        fromDate: DateString;
        toDate: DateString;
        totalVerifiedEarnings?: number | null;
        avgMonthlyIncome?: number | null;
        totalVerifiedShifts?: number | null;
        generatedAt: TimestampString;
      } & IncomeCertificate_Key)[];
}

export interface WorkerDashboardSummaryVariables {
  workerId: UUIDString;
}

export interface WorkerProfile_Key {
  userId: UUIDString;
  __typename?: 'WorkerProfile_Key';
}

interface CreateUserFromFirebaseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserFromFirebaseVariables): MutationRef<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserFromFirebaseVariables): MutationRef<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;
  operationName: string;
}
export const createUserFromFirebaseRef: CreateUserFromFirebaseRef;

export function createUserFromFirebase(vars: CreateUserFromFirebaseVariables): MutationPromise<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;
export function createUserFromFirebase(dc: DataConnect, vars: CreateUserFromFirebaseVariables): MutationPromise<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;

interface CreateShiftRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateShiftVariables): MutationRef<CreateShiftData, CreateShiftVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateShiftVariables): MutationRef<CreateShiftData, CreateShiftVariables>;
  operationName: string;
}
export const createShiftRef: CreateShiftRef;

export function createShift(vars: CreateShiftVariables): MutationPromise<CreateShiftData, CreateShiftVariables>;
export function createShift(dc: DataConnect, vars: CreateShiftVariables): MutationPromise<CreateShiftData, CreateShiftVariables>;

interface CreateGrievanceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateGrievanceVariables): MutationRef<CreateGrievanceData, CreateGrievanceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateGrievanceVariables): MutationRef<CreateGrievanceData, CreateGrievanceVariables>;
  operationName: string;
}
export const createGrievanceRef: CreateGrievanceRef;

export function createGrievance(vars: CreateGrievanceVariables): MutationPromise<CreateGrievanceData, CreateGrievanceVariables>;
export function createGrievance(dc: DataConnect, vars: CreateGrievanceVariables): MutationPromise<CreateGrievanceData, CreateGrievanceVariables>;

interface CreateIncomeCertificateRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateIncomeCertificateVariables): MutationRef<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateIncomeCertificateVariables): MutationRef<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;
  operationName: string;
}
export const createIncomeCertificateRef: CreateIncomeCertificateRef;

export function createIncomeCertificate(vars: CreateIncomeCertificateVariables): MutationPromise<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;
export function createIncomeCertificate(dc: DataConnect, vars: CreateIncomeCertificateVariables): MutationPromise<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;

interface ListPlatformsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPlatformsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPlatformsData, undefined>;
  operationName: string;
}
export const listPlatformsRef: ListPlatformsRef;

export function listPlatforms(options?: ExecuteQueryOptions): QueryPromise<ListPlatformsData, undefined>;
export function listPlatforms(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPlatformsData, undefined>;

interface WorkerDashboardSummaryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: WorkerDashboardSummaryVariables): QueryRef<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: WorkerDashboardSummaryVariables): QueryRef<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;
  operationName: string;
}
export const workerDashboardSummaryRef: WorkerDashboardSummaryRef;

export function workerDashboardSummary(vars: WorkerDashboardSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;
export function workerDashboardSummary(dc: DataConnect, vars: WorkerDashboardSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;

interface CityMedianCommissionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CityMedianCommissionVariables): QueryRef<CityMedianCommissionData, CityMedianCommissionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CityMedianCommissionVariables): QueryRef<CityMedianCommissionData, CityMedianCommissionVariables>;
  operationName: string;
}
export const cityMedianCommissionRef: CityMedianCommissionRef;

export function cityMedianCommission(vars: CityMedianCommissionVariables, options?: ExecuteQueryOptions): QueryPromise<CityMedianCommissionData, CityMedianCommissionVariables>;
export function cityMedianCommission(dc: DataConnect, vars: CityMedianCommissionVariables, options?: ExecuteQueryOptions): QueryPromise<CityMedianCommissionData, CityMedianCommissionVariables>;

interface ListGrievancesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListGrievancesVariables): QueryRef<ListGrievancesData, ListGrievancesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListGrievancesVariables): QueryRef<ListGrievancesData, ListGrievancesVariables>;
  operationName: string;
}
export const listGrievancesRef: ListGrievancesRef;

export function listGrievances(vars?: ListGrievancesVariables, options?: ExecuteQueryOptions): QueryPromise<ListGrievancesData, ListGrievancesVariables>;
export function listGrievances(dc: DataConnect, vars?: ListGrievancesVariables, options?: ExecuteQueryOptions): QueryPromise<ListGrievancesData, ListGrievancesVariables>;

