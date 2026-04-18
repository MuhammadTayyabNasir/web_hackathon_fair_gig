# Generated React README
This README will guide you through the process of using the generated React SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `JavaScript README`, you can find it at [`dataconnect-generated/README.md`](../README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

You can use this generated SDK by importing from the package `@dataconnect/generated/react` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#react).

# Table of Contents
- [**Overview**](#generated-react-readme)
- [**TanStack Query Firebase & TanStack React Query**](#tanstack-query-firebase-tanstack-react-query)
  - [*Package Installation*](#installing-tanstack-query-firebase-and-tanstack-react-query-packages)
  - [*Configuring TanStack Query*](#configuring-tanstack-query)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPlatforms*](#listplatforms)
  - [*WorkerDashboardSummary*](#workerdashboardsummary)
  - [*CityMedianCommission*](#citymediancommission)
  - [*ListGrievances*](#listgrievances)
- [**Mutations**](#mutations)
  - [*CreateUserFromFirebase*](#createuserfromfirebase)
  - [*CreateShift*](#createshift)
  - [*CreateGrievance*](#creategrievance)
  - [*CreateIncomeCertificate*](#createincomecertificate)

# TanStack Query Firebase & TanStack React Query
This SDK provides [React](https://react.dev/) hooks generated specific to your application, for the operations found in the connector `example`. These hooks are generated using [TanStack Query Firebase](https://react-query-firebase.invertase.dev/) by our partners at Invertase, a library built on top of [TanStack React Query v5](https://tanstack.com/query/v5/docs/framework/react/overview).

***You do not need to be familiar with Tanstack Query or Tanstack Query Firebase to use this SDK.*** However, you may find it useful to learn more about them, as they will empower you as a user of this Generated React SDK.

## Installing TanStack Query Firebase and TanStack React Query Packages
In order to use the React generated SDK, you must install the `TanStack React Query` and `TanStack Query Firebase` packages.
```bash
npm i --save @tanstack/react-query @tanstack-query-firebase/react
```
```bash
npm i --save firebase@latest # Note: React has a peer dependency on ^11.3.0
```

You can also follow the installation instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#tanstack-install), or the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react) and [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/installation).

## Configuring TanStack Query
In order to use the React generated SDK in your application, you must wrap your application's component tree in a `QueryClientProvider` component from TanStack React Query. None of your generated React SDK hooks will work without this provider.

```javascript
import { QueryClientProvider } from '@tanstack/react-query';

// Create a TanStack Query client instance
const queryClient = new QueryClient()

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <MyApplication />
    </QueryClientProvider>
  )
}
```

To learn more about `QueryClientProvider`, see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/quick-start) and the [TanStack Query Firebase documentation](https://invertase.docs.page/tanstack-query-firebase/react#usage).

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`.

You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#emulator-react-angular).

```javascript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) using the hooks provided from your generated React SDK.

# Queries

The React generated SDK provides Query hook functions that call and return [`useDataConnectQuery`](https://react-query-firebase.invertase.dev/react/data-connect/querying) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and the most recent data returned by the Query, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/querying).

TanStack React Query caches the results of your Queries, so using the same Query hook function in multiple places in your application allows the entire application to automatically see updates to that Query's data.

Query hooks execute their Queries automatically when called, and periodically refresh, unless you change the `queryOptions` for the Query. To learn how to stop a Query from automatically executing, including how to make a query "lazy", see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries).

To learn more about TanStack React Query's Queries, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/queries).

## Using Query Hooks
Here's a general overview of how to use the generated Query hooks in your code:

- If the Query has no variables, the Query hook function does not require arguments.
- If the Query has any required variables, the Query hook function will require at least one argument: an object that contains all the required variables for the Query.
- If the Query has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Query's variables are optional, the Query hook function does not require any arguments.
- Query hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Query hooks functions can be called with or without passing in an `options` argument of type `useDataConnectQueryOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/query-options).
  - ***Special case:***  If the Query has all optional variables and you would like to provide an `options` argument to the Query hook function without providing any variables, you must pass `undefined` where you would normally pass the Query's variables, and then may provide the `options` argument.

Below are examples of how to use the `example` connector's generated Query hook functions to execute each Query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## ListPlatforms
You can execute the `ListPlatforms` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListPlatforms(dc: DataConnect, options?: useDataConnectQueryOptions<ListPlatformsData>): UseDataConnectQueryResult<ListPlatformsData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListPlatforms(options?: useDataConnectQueryOptions<ListPlatformsData>): UseDataConnectQueryResult<ListPlatformsData, undefined>;
```

### Variables
The `ListPlatforms` Query has no variables.
### Return Type
Recall that calling the `ListPlatforms` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListPlatforms` Query is of type `ListPlatformsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListPlatformsData {
  platforms: ({
    id: UUIDString;
    name: string;
    slug: string;
    country: string;
    isActive: boolean;
  } & Platform_Key)[];
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListPlatforms`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListPlatforms } from '@dataconnect/generated/react'

export default function ListPlatformsComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListPlatforms();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListPlatforms(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListPlatforms(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListPlatforms(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.platforms);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## WorkerDashboardSummary
You can execute the `WorkerDashboardSummary` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useWorkerDashboardSummary(dc: DataConnect, vars: WorkerDashboardSummaryVariables, options?: useDataConnectQueryOptions<WorkerDashboardSummaryData>): UseDataConnectQueryResult<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useWorkerDashboardSummary(vars: WorkerDashboardSummaryVariables, options?: useDataConnectQueryOptions<WorkerDashboardSummaryData>): UseDataConnectQueryResult<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;
```

### Variables
The `WorkerDashboardSummary` Query requires an argument of type `WorkerDashboardSummaryVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface WorkerDashboardSummaryVariables {
  workerId: UUIDString;
}
```
### Return Type
Recall that calling the `WorkerDashboardSummary` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `WorkerDashboardSummary` Query is of type `WorkerDashboardSummaryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `WorkerDashboardSummary`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, WorkerDashboardSummaryVariables } from '@dataconnect/generated';
import { useWorkerDashboardSummary } from '@dataconnect/generated/react'

export default function WorkerDashboardSummaryComponent() {
  // The `useWorkerDashboardSummary` Query hook requires an argument of type `WorkerDashboardSummaryVariables`:
  const workerDashboardSummaryVars: WorkerDashboardSummaryVariables = {
    workerId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useWorkerDashboardSummary(workerDashboardSummaryVars);
  // Variables can be defined inline as well.
  const query = useWorkerDashboardSummary({ workerId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useWorkerDashboardSummary(dataConnect, workerDashboardSummaryVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useWorkerDashboardSummary(workerDashboardSummaryVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useWorkerDashboardSummary(dataConnect, workerDashboardSummaryVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.shifts);
    console.log(query.data.anomalies);
    console.log(query.data.certificates);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CityMedianCommission
You can execute the `CityMedianCommission` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useCityMedianCommission(dc: DataConnect, vars: CityMedianCommissionVariables, options?: useDataConnectQueryOptions<CityMedianCommissionData>): UseDataConnectQueryResult<CityMedianCommissionData, CityMedianCommissionVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useCityMedianCommission(vars: CityMedianCommissionVariables, options?: useDataConnectQueryOptions<CityMedianCommissionData>): UseDataConnectQueryResult<CityMedianCommissionData, CityMedianCommissionVariables>;
```

### Variables
The `CityMedianCommission` Query requires an argument of type `CityMedianCommissionVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CityMedianCommissionVariables {
  city: string;
  category: WorkerCategory;
}
```
### Return Type
Recall that calling the `CityMedianCommission` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `CityMedianCommission` Query is of type `CityMedianCommissionData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `CityMedianCommission`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CityMedianCommissionVariables } from '@dataconnect/generated';
import { useCityMedianCommission } from '@dataconnect/generated/react'

export default function CityMedianCommissionComponent() {
  // The `useCityMedianCommission` Query hook requires an argument of type `CityMedianCommissionVariables`:
  const cityMedianCommissionVars: CityMedianCommissionVariables = {
    city: ..., 
    category: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useCityMedianCommission(cityMedianCommissionVars);
  // Variables can be defined inline as well.
  const query = useCityMedianCommission({ city: ..., category: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useCityMedianCommission(dataConnect, cityMedianCommissionVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useCityMedianCommission(cityMedianCommissionVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useCityMedianCommission(dataConnect, cityMedianCommissionVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.commissionSnapshots);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListGrievances
You can execute the `ListGrievances` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListGrievances(dc: DataConnect, vars?: ListGrievancesVariables, options?: useDataConnectQueryOptions<ListGrievancesData>): UseDataConnectQueryResult<ListGrievancesData, ListGrievancesVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListGrievances(vars?: ListGrievancesVariables, options?: useDataConnectQueryOptions<ListGrievancesData>): UseDataConnectQueryResult<ListGrievancesData, ListGrievancesVariables>;
```

### Variables
The `ListGrievances` Query has an optional argument of type `ListGrievancesVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListGrievancesVariables {
  status?: GrievanceStatus | null;
}
```
### Return Type
Recall that calling the `ListGrievances` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListGrievances` Query is of type `ListGrievancesData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListGrievances`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListGrievancesVariables } from '@dataconnect/generated';
import { useListGrievances } from '@dataconnect/generated/react'

export default function ListGrievancesComponent() {
  // The `useListGrievances` Query hook has an optional argument of type `ListGrievancesVariables`:
  const listGrievancesVars: ListGrievancesVariables = {
    status: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListGrievances(listGrievancesVars);
  // Variables can be defined inline as well.
  const query = useListGrievances({ status: ..., });
  // Since all variables are optional for this Query, you can omit the `ListGrievancesVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListGrievances();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListGrievances(dataConnect, listGrievancesVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListGrievances(listGrievancesVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListGrievances(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListGrievances(dataConnect, listGrievancesVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.grievances);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

# Mutations

The React generated SDK provides Mutations hook functions that call and return [`useDataConnectMutation`](https://react-query-firebase.invertase.dev/react/data-connect/mutations) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, and the most recent data returned by the Mutation, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/mutations).

Mutation hooks do not execute their Mutations automatically when called. Rather, after calling the Mutation hook function and getting a `UseMutationResult` object, you must call the `UseMutationResult.mutate()` function to execute the Mutation.

To learn more about TanStack React Query's Mutations, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations).

## Using Mutation Hooks
Here's a general overview of how to use the generated Mutation hooks in your code:

- Mutation hook functions are not called with the arguments to the Mutation. Instead, arguments are passed to `UseMutationResult.mutate()`.
- If the Mutation has no variables, the `mutate()` function does not require arguments.
- If the Mutation has any required variables, the `mutate()` function will require at least one argument: an object that contains all the required variables for the Mutation.
- If the Mutation has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Mutation's variables are optional, the Mutation hook function does not require any arguments.
- Mutation hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Mutation hooks also accept an `options` argument of type `useDataConnectMutationOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations#mutation-side-effects).
  - `UseMutationResult.mutate()` also accepts an `options` argument of type `useDataConnectMutationOptions`.
  - ***Special case:*** If the Mutation has no arguments (or all optional arguments and you wish to provide none), and you want to pass `options` to `UseMutationResult.mutate()`, you must pass `undefined` where you would normally pass the Mutation's arguments, and then may provide the options argument.

Below are examples of how to use the `example` connector's generated Mutation hook functions to execute each Mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## CreateUserFromFirebase
You can execute the `CreateUserFromFirebase` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateUserFromFirebase(options?: useDataConnectMutationOptions<CreateUserFromFirebaseData, FirebaseError, CreateUserFromFirebaseVariables>): UseDataConnectMutationResult<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateUserFromFirebase(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserFromFirebaseData, FirebaseError, CreateUserFromFirebaseVariables>): UseDataConnectMutationResult<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;
```

### Variables
The `CreateUserFromFirebase` Mutation requires an argument of type `CreateUserFromFirebaseVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateUserFromFirebaseVariables {
  firebaseUid: string;
  name: string;
  email: string;
  role: UserRole;
}
```
### Return Type
Recall that calling the `CreateUserFromFirebase` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateUserFromFirebase` Mutation is of type `CreateUserFromFirebaseData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateUserFromFirebaseData {
  user_insert: User_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateUserFromFirebase`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateUserFromFirebaseVariables } from '@dataconnect/generated';
import { useCreateUserFromFirebase } from '@dataconnect/generated/react'

export default function CreateUserFromFirebaseComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateUserFromFirebase();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateUserFromFirebase(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateUserFromFirebase(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateUserFromFirebase(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateUserFromFirebase` Mutation requires an argument of type `CreateUserFromFirebaseVariables`:
  const createUserFromFirebaseVars: CreateUserFromFirebaseVariables = {
    firebaseUid: ..., 
    name: ..., 
    email: ..., 
    role: ..., 
  };
  mutation.mutate(createUserFromFirebaseVars);
  // Variables can be defined inline as well.
  mutation.mutate({ firebaseUid: ..., name: ..., email: ..., role: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createUserFromFirebaseVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.user_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateShift
You can execute the `CreateShift` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateShift(options?: useDataConnectMutationOptions<CreateShiftData, FirebaseError, CreateShiftVariables>): UseDataConnectMutationResult<CreateShiftData, CreateShiftVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateShift(dc: DataConnect, options?: useDataConnectMutationOptions<CreateShiftData, FirebaseError, CreateShiftVariables>): UseDataConnectMutationResult<CreateShiftData, CreateShiftVariables>;
```

### Variables
The `CreateShift` Mutation requires an argument of type `CreateShiftVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateShiftVariables {
  workerId: UUIDString;
  platformId: UUIDString;
  workDate: DateString;
  hoursWorked?: number | null;
  grossEarned: number;
  platformDeductions: number;
  netReceived: number;
}
```
### Return Type
Recall that calling the `CreateShift` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateShift` Mutation is of type `CreateShiftData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateShiftData {
  shift_insert: Shift_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateShift`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateShiftVariables } from '@dataconnect/generated';
import { useCreateShift } from '@dataconnect/generated/react'

export default function CreateShiftComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateShift();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateShift(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateShift(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateShift(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateShift` Mutation requires an argument of type `CreateShiftVariables`:
  const createShiftVars: CreateShiftVariables = {
    workerId: ..., 
    platformId: ..., 
    workDate: ..., 
    hoursWorked: ..., // optional
    grossEarned: ..., 
    platformDeductions: ..., 
    netReceived: ..., 
  };
  mutation.mutate(createShiftVars);
  // Variables can be defined inline as well.
  mutation.mutate({ workerId: ..., platformId: ..., workDate: ..., hoursWorked: ..., grossEarned: ..., platformDeductions: ..., netReceived: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createShiftVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.shift_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateGrievance
You can execute the `CreateGrievance` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateGrievance(options?: useDataConnectMutationOptions<CreateGrievanceData, FirebaseError, CreateGrievanceVariables>): UseDataConnectMutationResult<CreateGrievanceData, CreateGrievanceVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateGrievance(dc: DataConnect, options?: useDataConnectMutationOptions<CreateGrievanceData, FirebaseError, CreateGrievanceVariables>): UseDataConnectMutationResult<CreateGrievanceData, CreateGrievanceVariables>;
```

### Variables
The `CreateGrievance` Mutation requires an argument of type `CreateGrievanceVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateGrievanceVariables {
  workerId: UUIDString;
  platformId?: UUIDString | null;
  isAnonymous: boolean;
  category: string;
  description: string;
  city?: string | null;
  zone?: string | null;
}
```
### Return Type
Recall that calling the `CreateGrievance` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateGrievance` Mutation is of type `CreateGrievanceData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateGrievanceData {
  grievance_insert: Grievance_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateGrievance`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateGrievanceVariables } from '@dataconnect/generated';
import { useCreateGrievance } from '@dataconnect/generated/react'

export default function CreateGrievanceComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateGrievance();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateGrievance(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateGrievance(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateGrievance(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateGrievance` Mutation requires an argument of type `CreateGrievanceVariables`:
  const createGrievanceVars: CreateGrievanceVariables = {
    workerId: ..., 
    platformId: ..., // optional
    isAnonymous: ..., 
    category: ..., 
    description: ..., 
    city: ..., // optional
    zone: ..., // optional
  };
  mutation.mutate(createGrievanceVars);
  // Variables can be defined inline as well.
  mutation.mutate({ workerId: ..., platformId: ..., isAnonymous: ..., category: ..., description: ..., city: ..., zone: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createGrievanceVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.grievance_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateIncomeCertificate
You can execute the `CreateIncomeCertificate` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateIncomeCertificate(options?: useDataConnectMutationOptions<CreateIncomeCertificateData, FirebaseError, CreateIncomeCertificateVariables>): UseDataConnectMutationResult<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateIncomeCertificate(dc: DataConnect, options?: useDataConnectMutationOptions<CreateIncomeCertificateData, FirebaseError, CreateIncomeCertificateVariables>): UseDataConnectMutationResult<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;
```

### Variables
The `CreateIncomeCertificate` Mutation requires an argument of type `CreateIncomeCertificateVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateIncomeCertificateVariables {
  workerId: UUIDString;
  fromDate: DateString;
  toDate: DateString;
  totalVerifiedEarnings?: number | null;
  avgMonthlyIncome?: number | null;
  totalVerifiedShifts?: number | null;
  token: string;
}
```
### Return Type
Recall that calling the `CreateIncomeCertificate` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateIncomeCertificate` Mutation is of type `CreateIncomeCertificateData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateIncomeCertificateData {
  incomeCertificate_insert: IncomeCertificate_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateIncomeCertificate`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateIncomeCertificateVariables } from '@dataconnect/generated';
import { useCreateIncomeCertificate } from '@dataconnect/generated/react'

export default function CreateIncomeCertificateComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateIncomeCertificate();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateIncomeCertificate(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateIncomeCertificate(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateIncomeCertificate(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateIncomeCertificate` Mutation requires an argument of type `CreateIncomeCertificateVariables`:
  const createIncomeCertificateVars: CreateIncomeCertificateVariables = {
    workerId: ..., 
    fromDate: ..., 
    toDate: ..., 
    totalVerifiedEarnings: ..., // optional
    avgMonthlyIncome: ..., // optional
    totalVerifiedShifts: ..., // optional
    token: ..., 
  };
  mutation.mutate(createIncomeCertificateVars);
  // Variables can be defined inline as well.
  mutation.mutate({ workerId: ..., fromDate: ..., toDate: ..., totalVerifiedEarnings: ..., avgMonthlyIncome: ..., totalVerifiedShifts: ..., token: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createIncomeCertificateVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.incomeCertificate_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

