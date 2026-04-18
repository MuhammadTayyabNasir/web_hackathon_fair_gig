# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
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

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListPlatforms
You can execute the `ListPlatforms` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPlatforms(options?: ExecuteQueryOptions): QueryPromise<ListPlatformsData, undefined>;

interface ListPlatformsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPlatformsData, undefined>;
}
export const listPlatformsRef: ListPlatformsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPlatforms(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPlatformsData, undefined>;

interface ListPlatformsRef {
  ...
  (dc: DataConnect): QueryRef<ListPlatformsData, undefined>;
}
export const listPlatformsRef: ListPlatformsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPlatformsRef:
```typescript
const name = listPlatformsRef.operationName;
console.log(name);
```

### Variables
The `ListPlatforms` query has no variables.
### Return Type
Recall that executing the `ListPlatforms` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPlatformsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListPlatforms`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPlatforms } from '@dataconnect/generated';


// Call the `listPlatforms()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPlatforms();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPlatforms(dataConnect);

console.log(data.platforms);

// Or, you can use the `Promise` API.
listPlatforms().then((response) => {
  const data = response.data;
  console.log(data.platforms);
});
```

### Using `ListPlatforms`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPlatformsRef } from '@dataconnect/generated';


// Call the `listPlatformsRef()` function to get a reference to the query.
const ref = listPlatformsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPlatformsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.platforms);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.platforms);
});
```

## WorkerDashboardSummary
You can execute the `WorkerDashboardSummary` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
workerDashboardSummary(vars: WorkerDashboardSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;

interface WorkerDashboardSummaryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: WorkerDashboardSummaryVariables): QueryRef<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;
}
export const workerDashboardSummaryRef: WorkerDashboardSummaryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
workerDashboardSummary(dc: DataConnect, vars: WorkerDashboardSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;

interface WorkerDashboardSummaryRef {
  ...
  (dc: DataConnect, vars: WorkerDashboardSummaryVariables): QueryRef<WorkerDashboardSummaryData, WorkerDashboardSummaryVariables>;
}
export const workerDashboardSummaryRef: WorkerDashboardSummaryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the workerDashboardSummaryRef:
```typescript
const name = workerDashboardSummaryRef.operationName;
console.log(name);
```

### Variables
The `WorkerDashboardSummary` query requires an argument of type `WorkerDashboardSummaryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface WorkerDashboardSummaryVariables {
  workerId: UUIDString;
}
```
### Return Type
Recall that executing the `WorkerDashboardSummary` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `WorkerDashboardSummaryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `WorkerDashboardSummary`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, workerDashboardSummary, WorkerDashboardSummaryVariables } from '@dataconnect/generated';

// The `WorkerDashboardSummary` query requires an argument of type `WorkerDashboardSummaryVariables`:
const workerDashboardSummaryVars: WorkerDashboardSummaryVariables = {
  workerId: ..., 
};

// Call the `workerDashboardSummary()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await workerDashboardSummary(workerDashboardSummaryVars);
// Variables can be defined inline as well.
const { data } = await workerDashboardSummary({ workerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await workerDashboardSummary(dataConnect, workerDashboardSummaryVars);

console.log(data.shifts);
console.log(data.anomalies);
console.log(data.certificates);

// Or, you can use the `Promise` API.
workerDashboardSummary(workerDashboardSummaryVars).then((response) => {
  const data = response.data;
  console.log(data.shifts);
  console.log(data.anomalies);
  console.log(data.certificates);
});
```

### Using `WorkerDashboardSummary`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, workerDashboardSummaryRef, WorkerDashboardSummaryVariables } from '@dataconnect/generated';

// The `WorkerDashboardSummary` query requires an argument of type `WorkerDashboardSummaryVariables`:
const workerDashboardSummaryVars: WorkerDashboardSummaryVariables = {
  workerId: ..., 
};

// Call the `workerDashboardSummaryRef()` function to get a reference to the query.
const ref = workerDashboardSummaryRef(workerDashboardSummaryVars);
// Variables can be defined inline as well.
const ref = workerDashboardSummaryRef({ workerId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = workerDashboardSummaryRef(dataConnect, workerDashboardSummaryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.shifts);
console.log(data.anomalies);
console.log(data.certificates);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.shifts);
  console.log(data.anomalies);
  console.log(data.certificates);
});
```

## CityMedianCommission
You can execute the `CityMedianCommission` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
cityMedianCommission(vars: CityMedianCommissionVariables, options?: ExecuteQueryOptions): QueryPromise<CityMedianCommissionData, CityMedianCommissionVariables>;

interface CityMedianCommissionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CityMedianCommissionVariables): QueryRef<CityMedianCommissionData, CityMedianCommissionVariables>;
}
export const cityMedianCommissionRef: CityMedianCommissionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
cityMedianCommission(dc: DataConnect, vars: CityMedianCommissionVariables, options?: ExecuteQueryOptions): QueryPromise<CityMedianCommissionData, CityMedianCommissionVariables>;

interface CityMedianCommissionRef {
  ...
  (dc: DataConnect, vars: CityMedianCommissionVariables): QueryRef<CityMedianCommissionData, CityMedianCommissionVariables>;
}
export const cityMedianCommissionRef: CityMedianCommissionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the cityMedianCommissionRef:
```typescript
const name = cityMedianCommissionRef.operationName;
console.log(name);
```

### Variables
The `CityMedianCommission` query requires an argument of type `CityMedianCommissionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CityMedianCommissionVariables {
  city: string;
  category: WorkerCategory;
}
```
### Return Type
Recall that executing the `CityMedianCommission` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CityMedianCommissionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `CityMedianCommission`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, cityMedianCommission, CityMedianCommissionVariables } from '@dataconnect/generated';

// The `CityMedianCommission` query requires an argument of type `CityMedianCommissionVariables`:
const cityMedianCommissionVars: CityMedianCommissionVariables = {
  city: ..., 
  category: ..., 
};

// Call the `cityMedianCommission()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await cityMedianCommission(cityMedianCommissionVars);
// Variables can be defined inline as well.
const { data } = await cityMedianCommission({ city: ..., category: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await cityMedianCommission(dataConnect, cityMedianCommissionVars);

console.log(data.commissionSnapshots);

// Or, you can use the `Promise` API.
cityMedianCommission(cityMedianCommissionVars).then((response) => {
  const data = response.data;
  console.log(data.commissionSnapshots);
});
```

### Using `CityMedianCommission`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, cityMedianCommissionRef, CityMedianCommissionVariables } from '@dataconnect/generated';

// The `CityMedianCommission` query requires an argument of type `CityMedianCommissionVariables`:
const cityMedianCommissionVars: CityMedianCommissionVariables = {
  city: ..., 
  category: ..., 
};

// Call the `cityMedianCommissionRef()` function to get a reference to the query.
const ref = cityMedianCommissionRef(cityMedianCommissionVars);
// Variables can be defined inline as well.
const ref = cityMedianCommissionRef({ city: ..., category: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = cityMedianCommissionRef(dataConnect, cityMedianCommissionVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.commissionSnapshots);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.commissionSnapshots);
});
```

## ListGrievances
You can execute the `ListGrievances` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listGrievances(vars?: ListGrievancesVariables, options?: ExecuteQueryOptions): QueryPromise<ListGrievancesData, ListGrievancesVariables>;

interface ListGrievancesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListGrievancesVariables): QueryRef<ListGrievancesData, ListGrievancesVariables>;
}
export const listGrievancesRef: ListGrievancesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listGrievances(dc: DataConnect, vars?: ListGrievancesVariables, options?: ExecuteQueryOptions): QueryPromise<ListGrievancesData, ListGrievancesVariables>;

interface ListGrievancesRef {
  ...
  (dc: DataConnect, vars?: ListGrievancesVariables): QueryRef<ListGrievancesData, ListGrievancesVariables>;
}
export const listGrievancesRef: ListGrievancesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listGrievancesRef:
```typescript
const name = listGrievancesRef.operationName;
console.log(name);
```

### Variables
The `ListGrievances` query has an optional argument of type `ListGrievancesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListGrievancesVariables {
  status?: GrievanceStatus | null;
}
```
### Return Type
Recall that executing the `ListGrievances` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListGrievancesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListGrievances`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listGrievances, ListGrievancesVariables } from '@dataconnect/generated';

// The `ListGrievances` query has an optional argument of type `ListGrievancesVariables`:
const listGrievancesVars: ListGrievancesVariables = {
  status: ..., // optional
};

// Call the `listGrievances()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listGrievances(listGrievancesVars);
// Variables can be defined inline as well.
const { data } = await listGrievances({ status: ..., });
// Since all variables are optional for this query, you can omit the `ListGrievancesVariables` argument.
const { data } = await listGrievances();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listGrievances(dataConnect, listGrievancesVars);

console.log(data.grievances);

// Or, you can use the `Promise` API.
listGrievances(listGrievancesVars).then((response) => {
  const data = response.data;
  console.log(data.grievances);
});
```

### Using `ListGrievances`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listGrievancesRef, ListGrievancesVariables } from '@dataconnect/generated';

// The `ListGrievances` query has an optional argument of type `ListGrievancesVariables`:
const listGrievancesVars: ListGrievancesVariables = {
  status: ..., // optional
};

// Call the `listGrievancesRef()` function to get a reference to the query.
const ref = listGrievancesRef(listGrievancesVars);
// Variables can be defined inline as well.
const ref = listGrievancesRef({ status: ..., });
// Since all variables are optional for this query, you can omit the `ListGrievancesVariables` argument.
const ref = listGrievancesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listGrievancesRef(dataConnect, listGrievancesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.grievances);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.grievances);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUserFromFirebase
You can execute the `CreateUserFromFirebase` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUserFromFirebase(vars: CreateUserFromFirebaseVariables): MutationPromise<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;

interface CreateUserFromFirebaseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserFromFirebaseVariables): MutationRef<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;
}
export const createUserFromFirebaseRef: CreateUserFromFirebaseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUserFromFirebase(dc: DataConnect, vars: CreateUserFromFirebaseVariables): MutationPromise<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;

interface CreateUserFromFirebaseRef {
  ...
  (dc: DataConnect, vars: CreateUserFromFirebaseVariables): MutationRef<CreateUserFromFirebaseData, CreateUserFromFirebaseVariables>;
}
export const createUserFromFirebaseRef: CreateUserFromFirebaseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserFromFirebaseRef:
```typescript
const name = createUserFromFirebaseRef.operationName;
console.log(name);
```

### Variables
The `CreateUserFromFirebase` mutation requires an argument of type `CreateUserFromFirebaseVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserFromFirebaseVariables {
  firebaseUid: string;
  name: string;
  email: string;
  role: UserRole;
}
```
### Return Type
Recall that executing the `CreateUserFromFirebase` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserFromFirebaseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserFromFirebaseData {
  user_insert: User_Key;
}
```
### Using `CreateUserFromFirebase`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUserFromFirebase, CreateUserFromFirebaseVariables } from '@dataconnect/generated';

// The `CreateUserFromFirebase` mutation requires an argument of type `CreateUserFromFirebaseVariables`:
const createUserFromFirebaseVars: CreateUserFromFirebaseVariables = {
  firebaseUid: ..., 
  name: ..., 
  email: ..., 
  role: ..., 
};

// Call the `createUserFromFirebase()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUserFromFirebase(createUserFromFirebaseVars);
// Variables can be defined inline as well.
const { data } = await createUserFromFirebase({ firebaseUid: ..., name: ..., email: ..., role: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUserFromFirebase(dataConnect, createUserFromFirebaseVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUserFromFirebase(createUserFromFirebaseVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUserFromFirebase`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserFromFirebaseRef, CreateUserFromFirebaseVariables } from '@dataconnect/generated';

// The `CreateUserFromFirebase` mutation requires an argument of type `CreateUserFromFirebaseVariables`:
const createUserFromFirebaseVars: CreateUserFromFirebaseVariables = {
  firebaseUid: ..., 
  name: ..., 
  email: ..., 
  role: ..., 
};

// Call the `createUserFromFirebaseRef()` function to get a reference to the mutation.
const ref = createUserFromFirebaseRef(createUserFromFirebaseVars);
// Variables can be defined inline as well.
const ref = createUserFromFirebaseRef({ firebaseUid: ..., name: ..., email: ..., role: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserFromFirebaseRef(dataConnect, createUserFromFirebaseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## CreateShift
You can execute the `CreateShift` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createShift(vars: CreateShiftVariables): MutationPromise<CreateShiftData, CreateShiftVariables>;

interface CreateShiftRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateShiftVariables): MutationRef<CreateShiftData, CreateShiftVariables>;
}
export const createShiftRef: CreateShiftRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createShift(dc: DataConnect, vars: CreateShiftVariables): MutationPromise<CreateShiftData, CreateShiftVariables>;

interface CreateShiftRef {
  ...
  (dc: DataConnect, vars: CreateShiftVariables): MutationRef<CreateShiftData, CreateShiftVariables>;
}
export const createShiftRef: CreateShiftRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createShiftRef:
```typescript
const name = createShiftRef.operationName;
console.log(name);
```

### Variables
The `CreateShift` mutation requires an argument of type `CreateShiftVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateShift` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateShiftData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateShiftData {
  shift_insert: Shift_Key;
}
```
### Using `CreateShift`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createShift, CreateShiftVariables } from '@dataconnect/generated';

// The `CreateShift` mutation requires an argument of type `CreateShiftVariables`:
const createShiftVars: CreateShiftVariables = {
  workerId: ..., 
  platformId: ..., 
  workDate: ..., 
  hoursWorked: ..., // optional
  grossEarned: ..., 
  platformDeductions: ..., 
  netReceived: ..., 
};

// Call the `createShift()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createShift(createShiftVars);
// Variables can be defined inline as well.
const { data } = await createShift({ workerId: ..., platformId: ..., workDate: ..., hoursWorked: ..., grossEarned: ..., platformDeductions: ..., netReceived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createShift(dataConnect, createShiftVars);

console.log(data.shift_insert);

// Or, you can use the `Promise` API.
createShift(createShiftVars).then((response) => {
  const data = response.data;
  console.log(data.shift_insert);
});
```

### Using `CreateShift`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createShiftRef, CreateShiftVariables } from '@dataconnect/generated';

// The `CreateShift` mutation requires an argument of type `CreateShiftVariables`:
const createShiftVars: CreateShiftVariables = {
  workerId: ..., 
  platformId: ..., 
  workDate: ..., 
  hoursWorked: ..., // optional
  grossEarned: ..., 
  platformDeductions: ..., 
  netReceived: ..., 
};

// Call the `createShiftRef()` function to get a reference to the mutation.
const ref = createShiftRef(createShiftVars);
// Variables can be defined inline as well.
const ref = createShiftRef({ workerId: ..., platformId: ..., workDate: ..., hoursWorked: ..., grossEarned: ..., platformDeductions: ..., netReceived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createShiftRef(dataConnect, createShiftVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.shift_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.shift_insert);
});
```

## CreateGrievance
You can execute the `CreateGrievance` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createGrievance(vars: CreateGrievanceVariables): MutationPromise<CreateGrievanceData, CreateGrievanceVariables>;

interface CreateGrievanceRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateGrievanceVariables): MutationRef<CreateGrievanceData, CreateGrievanceVariables>;
}
export const createGrievanceRef: CreateGrievanceRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createGrievance(dc: DataConnect, vars: CreateGrievanceVariables): MutationPromise<CreateGrievanceData, CreateGrievanceVariables>;

interface CreateGrievanceRef {
  ...
  (dc: DataConnect, vars: CreateGrievanceVariables): MutationRef<CreateGrievanceData, CreateGrievanceVariables>;
}
export const createGrievanceRef: CreateGrievanceRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createGrievanceRef:
```typescript
const name = createGrievanceRef.operationName;
console.log(name);
```

### Variables
The `CreateGrievance` mutation requires an argument of type `CreateGrievanceVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateGrievance` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateGrievanceData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateGrievanceData {
  grievance_insert: Grievance_Key;
}
```
### Using `CreateGrievance`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createGrievance, CreateGrievanceVariables } from '@dataconnect/generated';

// The `CreateGrievance` mutation requires an argument of type `CreateGrievanceVariables`:
const createGrievanceVars: CreateGrievanceVariables = {
  workerId: ..., 
  platformId: ..., // optional
  isAnonymous: ..., 
  category: ..., 
  description: ..., 
  city: ..., // optional
  zone: ..., // optional
};

// Call the `createGrievance()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createGrievance(createGrievanceVars);
// Variables can be defined inline as well.
const { data } = await createGrievance({ workerId: ..., platformId: ..., isAnonymous: ..., category: ..., description: ..., city: ..., zone: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createGrievance(dataConnect, createGrievanceVars);

console.log(data.grievance_insert);

// Or, you can use the `Promise` API.
createGrievance(createGrievanceVars).then((response) => {
  const data = response.data;
  console.log(data.grievance_insert);
});
```

### Using `CreateGrievance`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createGrievanceRef, CreateGrievanceVariables } from '@dataconnect/generated';

// The `CreateGrievance` mutation requires an argument of type `CreateGrievanceVariables`:
const createGrievanceVars: CreateGrievanceVariables = {
  workerId: ..., 
  platformId: ..., // optional
  isAnonymous: ..., 
  category: ..., 
  description: ..., 
  city: ..., // optional
  zone: ..., // optional
};

// Call the `createGrievanceRef()` function to get a reference to the mutation.
const ref = createGrievanceRef(createGrievanceVars);
// Variables can be defined inline as well.
const ref = createGrievanceRef({ workerId: ..., platformId: ..., isAnonymous: ..., category: ..., description: ..., city: ..., zone: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createGrievanceRef(dataConnect, createGrievanceVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.grievance_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.grievance_insert);
});
```

## CreateIncomeCertificate
You can execute the `CreateIncomeCertificate` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createIncomeCertificate(vars: CreateIncomeCertificateVariables): MutationPromise<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;

interface CreateIncomeCertificateRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateIncomeCertificateVariables): MutationRef<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;
}
export const createIncomeCertificateRef: CreateIncomeCertificateRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createIncomeCertificate(dc: DataConnect, vars: CreateIncomeCertificateVariables): MutationPromise<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;

interface CreateIncomeCertificateRef {
  ...
  (dc: DataConnect, vars: CreateIncomeCertificateVariables): MutationRef<CreateIncomeCertificateData, CreateIncomeCertificateVariables>;
}
export const createIncomeCertificateRef: CreateIncomeCertificateRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createIncomeCertificateRef:
```typescript
const name = createIncomeCertificateRef.operationName;
console.log(name);
```

### Variables
The `CreateIncomeCertificate` mutation requires an argument of type `CreateIncomeCertificateVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateIncomeCertificate` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateIncomeCertificateData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateIncomeCertificateData {
  incomeCertificate_insert: IncomeCertificate_Key;
}
```
### Using `CreateIncomeCertificate`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createIncomeCertificate, CreateIncomeCertificateVariables } from '@dataconnect/generated';

// The `CreateIncomeCertificate` mutation requires an argument of type `CreateIncomeCertificateVariables`:
const createIncomeCertificateVars: CreateIncomeCertificateVariables = {
  workerId: ..., 
  fromDate: ..., 
  toDate: ..., 
  totalVerifiedEarnings: ..., // optional
  avgMonthlyIncome: ..., // optional
  totalVerifiedShifts: ..., // optional
  token: ..., 
};

// Call the `createIncomeCertificate()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createIncomeCertificate(createIncomeCertificateVars);
// Variables can be defined inline as well.
const { data } = await createIncomeCertificate({ workerId: ..., fromDate: ..., toDate: ..., totalVerifiedEarnings: ..., avgMonthlyIncome: ..., totalVerifiedShifts: ..., token: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createIncomeCertificate(dataConnect, createIncomeCertificateVars);

console.log(data.incomeCertificate_insert);

// Or, you can use the `Promise` API.
createIncomeCertificate(createIncomeCertificateVars).then((response) => {
  const data = response.data;
  console.log(data.incomeCertificate_insert);
});
```

### Using `CreateIncomeCertificate`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createIncomeCertificateRef, CreateIncomeCertificateVariables } from '@dataconnect/generated';

// The `CreateIncomeCertificate` mutation requires an argument of type `CreateIncomeCertificateVariables`:
const createIncomeCertificateVars: CreateIncomeCertificateVariables = {
  workerId: ..., 
  fromDate: ..., 
  toDate: ..., 
  totalVerifiedEarnings: ..., // optional
  avgMonthlyIncome: ..., // optional
  totalVerifiedShifts: ..., // optional
  token: ..., 
};

// Call the `createIncomeCertificateRef()` function to get a reference to the mutation.
const ref = createIncomeCertificateRef(createIncomeCertificateVars);
// Variables can be defined inline as well.
const ref = createIncomeCertificateRef({ workerId: ..., fromDate: ..., toDate: ..., totalVerifiedEarnings: ..., avgMonthlyIncome: ..., totalVerifiedShifts: ..., token: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createIncomeCertificateRef(dataConnect, createIncomeCertificateVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.incomeCertificate_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.incomeCertificate_insert);
});
```

