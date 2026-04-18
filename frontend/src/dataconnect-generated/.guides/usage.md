# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateUserFromFirebase, useCreateShift, useCreateGrievance, useCreateIncomeCertificate, useListPlatforms, useWorkerDashboardSummary, useCityMedianCommission, useListGrievances } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateUserFromFirebase(createUserFromFirebaseVars);

const { data, isPending, isSuccess, isError, error } = useCreateShift(createShiftVars);

const { data, isPending, isSuccess, isError, error } = useCreateGrievance(createGrievanceVars);

const { data, isPending, isSuccess, isError, error } = useCreateIncomeCertificate(createIncomeCertificateVars);

const { data, isPending, isSuccess, isError, error } = useListPlatforms();

const { data, isPending, isSuccess, isError, error } = useWorkerDashboardSummary(workerDashboardSummaryVars);

const { data, isPending, isSuccess, isError, error } = useCityMedianCommission(cityMedianCommissionVars);

const { data, isPending, isSuccess, isError, error } = useListGrievances(listGrievancesVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUserFromFirebase, createShift, createGrievance, createIncomeCertificate, listPlatforms, workerDashboardSummary, cityMedianCommission, listGrievances } from '@dataconnect/generated';


// Operation CreateUserFromFirebase:  For variables, look at type CreateUserFromFirebaseVars in ../index.d.ts
const { data } = await CreateUserFromFirebase(dataConnect, createUserFromFirebaseVars);

// Operation CreateShift:  For variables, look at type CreateShiftVars in ../index.d.ts
const { data } = await CreateShift(dataConnect, createShiftVars);

// Operation CreateGrievance:  For variables, look at type CreateGrievanceVars in ../index.d.ts
const { data } = await CreateGrievance(dataConnect, createGrievanceVars);

// Operation CreateIncomeCertificate:  For variables, look at type CreateIncomeCertificateVars in ../index.d.ts
const { data } = await CreateIncomeCertificate(dataConnect, createIncomeCertificateVars);

// Operation ListPlatforms: 
const { data } = await ListPlatforms(dataConnect);

// Operation WorkerDashboardSummary:  For variables, look at type WorkerDashboardSummaryVars in ../index.d.ts
const { data } = await WorkerDashboardSummary(dataConnect, workerDashboardSummaryVars);

// Operation CityMedianCommission:  For variables, look at type CityMedianCommissionVars in ../index.d.ts
const { data } = await CityMedianCommission(dataConnect, cityMedianCommissionVars);

// Operation ListGrievances:  For variables, look at type ListGrievancesVars in ../index.d.ts
const { data } = await ListGrievances(dataConnect, listGrievancesVars);


```