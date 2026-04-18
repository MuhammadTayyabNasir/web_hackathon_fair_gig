import { CreateUserFromFirebaseData, CreateUserFromFirebaseVariables, CreateShiftData, CreateShiftVariables, CreateGrievanceData, CreateGrievanceVariables, CreateIncomeCertificateData, CreateIncomeCertificateVariables, ListPlatformsData, WorkerDashboardSummaryData, WorkerDashboardSummaryVariables, CityMedianCommissionData, CityMedianCommissionVariables, ListGrievancesData, ListGrievancesVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUserFromFirebase(options?: useDataConnectMutationOptions<CreateUserFromFirebaseData, FirebaseError, CreateUserFromFirebaseVariables>): UseDataConnectMutationResult<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;
export function useCreateUserFromFirebase(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserFromFirebaseData, FirebaseError, CreateUserFromFirebaseVariables>): UseDataConnectMutationResult<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;

export function useCreateShift(options?: useDataConnectMutationOptions<CreateShiftData, FirebaseError, CreateShiftVariables>): UseDataConnectMutationResult<CreateShiftData, CreateShiftVariables>;
export function useCreateShift(dc: DataConnect, options?: useDataConnectMutationOptions<CreateShiftData, FirebaseError, CreateShiftVariables>): UseDataConnectMutationResult<CreateShiftData, CreateShiftVariables>;

export function useCreateGrievance(options?: useDataConnectMutationOptions<CreateGrievanceData, FirebaseError, CreateGrievanceVariables>): UseDataConnectMutationResult<CreateGrievanceData, CreateGrievanceVariables>;
export function useCreateGrievance(dc: DataConnect, options?: useDataConnectMutationOptions<CreateGrievanceData, FirebaseError, CreateGrievanceVariables>): UseDataConnectMutationResult<CreateGrievanceData, CreateGrievanceVariables>;

export function useCreateIncomeCertificate(options?: useDataConnectMutationOptions<CreateIncomeCertificateData, FirebaseError, CreateIncomeCertificateVariables>): UseDataConnectMutationResult<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;
export function useCreateIncomeCertificate(dc: DataConnect, options?: useDataConnectMutationOptions<CreateIncomeCertificateData, FirebaseError, CreateIncomeCertificateVariables>): UseDataConnectMutationResult<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;

export function useListPlatforms(options?: useDataConnectQueryOptions<ListPlatformsData>): UseDataConnectQueryResult<ListPlatformsData, undefined>;
export function useListPlatforms(dc: DataConnect, options?: useDataConnectQueryOptions<ListPlatformsData>): UseDataConnectQueryResult<ListPlatformsData, undefined>;

export function useWorkerDashboardSummary(vars: WorkerDashboardSummaryVariables, options?: useDataConnectQueryOptions<WorkerDashboardSummaryData>): UseDataConnectQueryResult<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;
export function useWorkerDashboardSummary(dc: DataConnect, vars: WorkerDashboardSummaryVariables, options?: useDataConnectQueryOptions<WorkerDashboardSummaryData>): UseDataConnectQueryResult<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;

export function useCityMedianCommission(vars: CityMedianCommissionVariables, options?: useDataConnectQueryOptions<CityMedianCommissionData>): UseDataConnectQueryResult<CityMedianCommissionData, CityMedianCommissionVariables>;
export function useCityMedianCommission(dc: DataConnect, vars: CityMedianCommissionVariables, options?: useDataConnectQueryOptions<CityMedianCommissionData>): UseDataConnectQueryResult<CityMedianCommissionData, CityMedianCommissionVariables>;

export function useListGrievances(vars?: ListGrievancesVariables, options?: useDataConnectQueryOptions<ListGrievancesData>): UseDataConnectQueryResult<ListGrievancesData, ListGrievancesVariables>;
export function useListGrievances(dc: DataConnect, vars?: ListGrievancesVariables, options?: useDataConnectQueryOptions<ListGrievancesData>): UseDataConnectQueryResult<ListGrievancesData, ListGrievancesVariables>;
