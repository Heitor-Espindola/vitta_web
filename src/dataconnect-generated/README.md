# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListUsers*](#listusers)
  - [*GetUser*](#getuser)
  - [*GetCurrentPortalUser*](#getcurrentportaluser)
  - [*GetAdminPatientByCpf*](#getadminpatientbycpf)
  - [*GetUserByEmail*](#getuserbyemail)
  - [*ListPatients*](#listpatients)
  - [*ListAccessiblePatients*](#listaccessiblepatients)
  - [*GetAuthorizedPatientByCpf*](#getauthorizedpatientbycpf)
  - [*GetPatient*](#getpatient)
  - [*GetAdminPatient*](#getadminpatient)
  - [*GetPatientByUser*](#getpatientbyuser)
  - [*ListUbs*](#listubs)
  - [*GetUbs*](#getubs)
  - [*SearchUbsByName*](#searchubsbyname)
  - [*ListProfessionals*](#listprofessionals)
  - [*GetProfessional*](#getprofessional)
  - [*GetProfessionalByUser*](#getprofessionalbyuser)
  - [*ListVaccines*](#listvaccines)
  - [*GetVaccine*](#getvaccine)
  - [*SearchVaccinesByName*](#searchvaccinesbyname)
  - [*ListBatches*](#listbatches)
  - [*GetBatch*](#getbatch)
  - [*ListBatchesByVaccine*](#listbatchesbyvaccine)
  - [*ListAppointments*](#listappointments)
  - [*ListAccessibleAppointments*](#listaccessibleappointments)
  - [*GetAppointment*](#getappointment)
  - [*ListAppointmentsByPatient*](#listappointmentsbypatient)
  - [*ListAppointmentsByStatus*](#listappointmentsbystatus)
  - [*ListApplications*](#listapplications)
  - [*ListCurrentProfessionalApplications*](#listcurrentprofessionalapplications)
  - [*GetApplication*](#getapplication)
  - [*ListApplicationsByPatient*](#listapplicationsbypatient)
  - [*ListAdminApplicationsByPatient*](#listadminapplicationsbypatient)
  - [*ListApplicationsByVaccine*](#listapplicationsbyvaccine)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateUser*](#updateuser)
  - [*DeleteUnlinkedUser*](#deleteunlinkeduser)
  - [*CreatePatient*](#createpatient)
  - [*UpdatePatient*](#updatepatient)
  - [*ArchivePatient*](#archivepatient)
  - [*CreateUbs*](#createubs)
  - [*UpdateUbs*](#updateubs)
  - [*ArchiveUbs*](#archiveubs)
  - [*CreateProfessional*](#createprofessional)
  - [*UpdateProfessional*](#updateprofessional)
  - [*ArchiveProfessional*](#archiveprofessional)
  - [*CreateVaccine*](#createvaccine)
  - [*UpdateVaccine*](#updatevaccine)
  - [*ArchiveVaccine*](#archivevaccine)
  - [*CreateBatch*](#createbatch)
  - [*UpdateBatch*](#updatebatch)
  - [*DeleteBatch*](#deletebatch)
  - [*CreateAppointment*](#createappointment)
  - [*UpdateAppointment*](#updateappointment)
  - [*DeleteAppointment*](#deleteappointment)
  - [*CreateApplication*](#createapplication)
  - [*UpdateApplication*](#updateapplication)
  - [*VoidApplication*](#voidapplication)
  - [*VoidLegacyApplication*](#voidlegacyapplication)

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

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query has no variables.
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUsersData {
  users: ({
    id: UUIDString;
    name: string;
    birthDate: DateString;
    email?: string | null;
    status: UserStatus;
    cpf: string;
    sex?: string | null;
  } & User_Key)[];
}
```
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers } from '@dataconnect/generated';


// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef } from '@dataconnect/generated';


// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetUser
You can execute the `GetUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUser(vars: GetUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUser(dc: DataConnect, vars: GetUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRef:
```typescript
const name = getUserRef.operationName;
console.log(name);
```

### Variables
The `GetUser` query requires an argument of type `GetUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserData {
  user?: {
    id: UUIDString;
    name: string;
    birthDate: DateString;
    email?: string | null;
    status: UserStatus;
    cpf: string;
    sex?: string | null;
    phone?: string | null;
  } & User_Key;
}
```
### Using `GetUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUser, GetUserVariables } from '@dataconnect/generated';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  id: ..., 
};

// Call the `getUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUser(getUserVars);
// Variables can be defined inline as well.
const { data } = await getUser({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUser(dataConnect, getUserVars);

console.log(data.user);

// Or, you can use the `Promise` API.
getUser(getUserVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRef, GetUserVariables } from '@dataconnect/generated';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  id: ..., 
};

// Call the `getUserRef()` function to get a reference to the query.
const ref = getUserRef(getUserVars);
// Variables can be defined inline as well.
const ref = getUserRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRef(dataConnect, getUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetCurrentPortalUser
You can execute the `GetCurrentPortalUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCurrentPortalUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentPortalUserData, undefined>;

interface GetCurrentPortalUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentPortalUserData, undefined>;
}
export const getCurrentPortalUserRef: GetCurrentPortalUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentPortalUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentPortalUserData, undefined>;

interface GetCurrentPortalUserRef {
  ...
  (dc: DataConnect): QueryRef<GetCurrentPortalUserData, undefined>;
}
export const getCurrentPortalUserRef: GetCurrentPortalUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentPortalUserRef:
```typescript
const name = getCurrentPortalUserRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentPortalUser` query has no variables.
### Return Type
Recall that executing the `GetCurrentPortalUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentPortalUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCurrentPortalUserData {
  users: ({
    id: UUIDString;
    name: string;
    birthDate: DateString;
    email?: string | null;
    authUid?: string | null;
    status: UserStatus;
    cpf: string;
    sex?: string | null;
    phone?: string | null;
    photoUrl?: string | null;
    portalRole?: PortalRole | null;
    professional_on_user?: {
      id: UUIDString;
      active: boolean;
      professionalType: ProfessionalType;
      professionalRegistration?: string | null;
      ubs?: {
        id: UUIDString;
        name: string;
      } & UBS_Key;
    } & Professional_Key;
  } & User_Key)[];
}
```
### Using `GetCurrentPortalUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentPortalUser } from '@dataconnect/generated';


// Call the `getCurrentPortalUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentPortalUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentPortalUser(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
getCurrentPortalUser().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetCurrentPortalUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentPortalUserRef } from '@dataconnect/generated';


// Call the `getCurrentPortalUserRef()` function to get a reference to the query.
const ref = getCurrentPortalUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentPortalUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetAdminPatientByCpf
You can execute the `GetAdminPatientByCpf` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getAdminPatientByCpf(vars: GetAdminPatientByCpfVariables, options?: ExecuteQueryOptions): QueryPromise<GetAdminPatientByCpfData, GetAdminPatientByCpfVariables>;

interface GetAdminPatientByCpfRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAdminPatientByCpfVariables): QueryRef<GetAdminPatientByCpfData, GetAdminPatientByCpfVariables>;
}
export const getAdminPatientByCpfRef: GetAdminPatientByCpfRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAdminPatientByCpf(dc: DataConnect, vars: GetAdminPatientByCpfVariables, options?: ExecuteQueryOptions): QueryPromise<GetAdminPatientByCpfData, GetAdminPatientByCpfVariables>;

interface GetAdminPatientByCpfRef {
  ...
  (dc: DataConnect, vars: GetAdminPatientByCpfVariables): QueryRef<GetAdminPatientByCpfData, GetAdminPatientByCpfVariables>;
}
export const getAdminPatientByCpfRef: GetAdminPatientByCpfRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAdminPatientByCpfRef:
```typescript
const name = getAdminPatientByCpfRef.operationName;
console.log(name);
```

### Variables
The `GetAdminPatientByCpf` query requires an argument of type `GetAdminPatientByCpfVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAdminPatientByCpfVariables {
  cpf: string;
}
```
### Return Type
Recall that executing the `GetAdminPatientByCpf` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAdminPatientByCpfData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAdminPatientByCpfData {
  patients: ({
    id: UUIDString;
    motherName?: string | null;
    patientType: PatientType;
    user: {
      id: UUIDString;
      name: string;
      birthDate: DateString;
      email?: string | null;
      cpf: string;
      sex?: string | null;
      status: UserStatus;
    } & User_Key;
    responsible?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
  } & Patient_Key)[];
}
```
### Using `GetAdminPatientByCpf`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAdminPatientByCpf, GetAdminPatientByCpfVariables } from '@dataconnect/generated';

// The `GetAdminPatientByCpf` query requires an argument of type `GetAdminPatientByCpfVariables`:
const getAdminPatientByCpfVars: GetAdminPatientByCpfVariables = {
  cpf: ..., 
};

// Call the `getAdminPatientByCpf()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAdminPatientByCpf(getAdminPatientByCpfVars);
// Variables can be defined inline as well.
const { data } = await getAdminPatientByCpf({ cpf: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAdminPatientByCpf(dataConnect, getAdminPatientByCpfVars);

console.log(data.patients);

// Or, you can use the `Promise` API.
getAdminPatientByCpf(getAdminPatientByCpfVars).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

### Using `GetAdminPatientByCpf`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAdminPatientByCpfRef, GetAdminPatientByCpfVariables } from '@dataconnect/generated';

// The `GetAdminPatientByCpf` query requires an argument of type `GetAdminPatientByCpfVariables`:
const getAdminPatientByCpfVars: GetAdminPatientByCpfVariables = {
  cpf: ..., 
};

// Call the `getAdminPatientByCpfRef()` function to get a reference to the query.
const ref = getAdminPatientByCpfRef(getAdminPatientByCpfVars);
// Variables can be defined inline as well.
const ref = getAdminPatientByCpfRef({ cpf: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAdminPatientByCpfRef(dataConnect, getAdminPatientByCpfVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

## GetUserByEmail
You can execute the `GetUserByEmail` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserByEmail(vars: GetUserByEmailVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserByEmailRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
}
export const getUserByEmailRef: GetUserByEmailRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserByEmailRef {
  ...
  (dc: DataConnect, vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
}
export const getUserByEmailRef: GetUserByEmailRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserByEmailRef:
```typescript
const name = getUserByEmailRef.operationName;
console.log(name);
```

### Variables
The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserByEmailVariables {
  email: string;
}
```
### Return Type
Recall that executing the `GetUserByEmail` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserByEmailData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserByEmailData {
  users: ({
    id: UUIDString;
    name: string;
    birthDate: DateString;
    email?: string | null;
    status: UserStatus;
    cpf: string;
    sex?: string | null;
  } & User_Key)[];
}
```
### Using `GetUserByEmail`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserByEmail, GetUserByEmailVariables } from '@dataconnect/generated';

// The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`:
const getUserByEmailVars: GetUserByEmailVariables = {
  email: ..., 
};

// Call the `getUserByEmail()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserByEmail(getUserByEmailVars);
// Variables can be defined inline as well.
const { data } = await getUserByEmail({ email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserByEmail(dataConnect, getUserByEmailVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getUserByEmail(getUserByEmailVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetUserByEmail`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserByEmailRef, GetUserByEmailVariables } from '@dataconnect/generated';

// The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`:
const getUserByEmailVars: GetUserByEmailVariables = {
  email: ..., 
};

// Call the `getUserByEmailRef()` function to get a reference to the query.
const ref = getUserByEmailRef(getUserByEmailVars);
// Variables can be defined inline as well.
const ref = getUserByEmailRef({ email: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserByEmailRef(dataConnect, getUserByEmailVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## ListPatients
You can execute the `ListPatients` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPatients(options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, undefined>;

interface ListPatientsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPatientsData, undefined>;
}
export const listPatientsRef: ListPatientsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPatients(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, undefined>;

interface ListPatientsRef {
  ...
  (dc: DataConnect): QueryRef<ListPatientsData, undefined>;
}
export const listPatientsRef: ListPatientsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPatientsRef:
```typescript
const name = listPatientsRef.operationName;
console.log(name);
```

### Variables
The `ListPatients` query has no variables.
### Return Type
Recall that executing the `ListPatients` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPatientsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPatientsData {
  patients: ({
    id: UUIDString;
    motherName?: string | null;
    user: {
      id: UUIDString;
      name: string;
      birthDate: DateString;
      email?: string | null;
      cpf: string;
      sex?: string | null;
      status: UserStatus;
    } & User_Key;
    patientType: PatientType;
    responsible?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
  } & Patient_Key)[];
}
```
### Using `ListPatients`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPatients } from '@dataconnect/generated';


// Call the `listPatients()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPatients();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPatients(dataConnect);

console.log(data.patients);

// Or, you can use the `Promise` API.
listPatients().then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

### Using `ListPatients`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPatientsRef } from '@dataconnect/generated';


// Call the `listPatientsRef()` function to get a reference to the query.
const ref = listPatientsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPatientsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

## ListAccessiblePatients
You can execute the `ListAccessiblePatients` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAccessiblePatients(options?: ExecuteQueryOptions): QueryPromise<ListAccessiblePatientsData, undefined>;

interface ListAccessiblePatientsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAccessiblePatientsData, undefined>;
}
export const listAccessiblePatientsRef: ListAccessiblePatientsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAccessiblePatients(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAccessiblePatientsData, undefined>;

interface ListAccessiblePatientsRef {
  ...
  (dc: DataConnect): QueryRef<ListAccessiblePatientsData, undefined>;
}
export const listAccessiblePatientsRef: ListAccessiblePatientsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAccessiblePatientsRef:
```typescript
const name = listAccessiblePatientsRef.operationName;
console.log(name);
```

### Variables
The `ListAccessiblePatients` query has no variables.
### Return Type
Recall that executing the `ListAccessiblePatients` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAccessiblePatientsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAccessiblePatientsData {
  patientAccesses: ({
    patient: {
      id: UUIDString;
      motherName?: string | null;
      patientType: PatientType;
      user: {
        id: UUIDString;
        name: string;
        birthDate: DateString;
        email?: string | null;
        cpf: string;
        sex?: string | null;
        status: UserStatus;
      } & User_Key;
      responsible?: {
        id: UUIDString;
        user: {
          id: UUIDString;
          name: string;
          cpf: string;
        } & User_Key;
      } & Patient_Key;
    } & Patient_Key;
  })[];
}
```
### Using `ListAccessiblePatients`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAccessiblePatients } from '@dataconnect/generated';


// Call the `listAccessiblePatients()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAccessiblePatients();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAccessiblePatients(dataConnect);

console.log(data.patientAccesses);

// Or, you can use the `Promise` API.
listAccessiblePatients().then((response) => {
  const data = response.data;
  console.log(data.patientAccesses);
});
```

### Using `ListAccessiblePatients`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAccessiblePatientsRef } from '@dataconnect/generated';


// Call the `listAccessiblePatientsRef()` function to get a reference to the query.
const ref = listAccessiblePatientsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAccessiblePatientsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patientAccesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patientAccesses);
});
```

## GetAuthorizedPatientByCpf
You can execute the `GetAuthorizedPatientByCpf` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getAuthorizedPatientByCpf(vars: GetAuthorizedPatientByCpfVariables, options?: ExecuteQueryOptions): QueryPromise<GetAuthorizedPatientByCpfData, GetAuthorizedPatientByCpfVariables>;

interface GetAuthorizedPatientByCpfRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAuthorizedPatientByCpfVariables): QueryRef<GetAuthorizedPatientByCpfData, GetAuthorizedPatientByCpfVariables>;
}
export const getAuthorizedPatientByCpfRef: GetAuthorizedPatientByCpfRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAuthorizedPatientByCpf(dc: DataConnect, vars: GetAuthorizedPatientByCpfVariables, options?: ExecuteQueryOptions): QueryPromise<GetAuthorizedPatientByCpfData, GetAuthorizedPatientByCpfVariables>;

interface GetAuthorizedPatientByCpfRef {
  ...
  (dc: DataConnect, vars: GetAuthorizedPatientByCpfVariables): QueryRef<GetAuthorizedPatientByCpfData, GetAuthorizedPatientByCpfVariables>;
}
export const getAuthorizedPatientByCpfRef: GetAuthorizedPatientByCpfRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAuthorizedPatientByCpfRef:
```typescript
const name = getAuthorizedPatientByCpfRef.operationName;
console.log(name);
```

### Variables
The `GetAuthorizedPatientByCpf` query requires an argument of type `GetAuthorizedPatientByCpfVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAuthorizedPatientByCpfVariables {
  cpf: string;
}
```
### Return Type
Recall that executing the `GetAuthorizedPatientByCpf` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAuthorizedPatientByCpfData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAuthorizedPatientByCpfData {
  patientAccesses: ({
    patient: {
      id: UUIDString;
      motherName?: string | null;
      patientType: PatientType;
      user: {
        id: UUIDString;
        name: string;
        birthDate: DateString;
        email?: string | null;
        cpf: string;
        sex?: string | null;
        status: UserStatus;
      } & User_Key;
      responsible?: {
        id: UUIDString;
        user: {
          id: UUIDString;
          name: string;
          cpf: string;
        } & User_Key;
      } & Patient_Key;
    } & Patient_Key;
  })[];
}
```
### Using `GetAuthorizedPatientByCpf`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAuthorizedPatientByCpf, GetAuthorizedPatientByCpfVariables } from '@dataconnect/generated';

// The `GetAuthorizedPatientByCpf` query requires an argument of type `GetAuthorizedPatientByCpfVariables`:
const getAuthorizedPatientByCpfVars: GetAuthorizedPatientByCpfVariables = {
  cpf: ..., 
};

// Call the `getAuthorizedPatientByCpf()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAuthorizedPatientByCpf(getAuthorizedPatientByCpfVars);
// Variables can be defined inline as well.
const { data } = await getAuthorizedPatientByCpf({ cpf: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAuthorizedPatientByCpf(dataConnect, getAuthorizedPatientByCpfVars);

console.log(data.patientAccesses);

// Or, you can use the `Promise` API.
getAuthorizedPatientByCpf(getAuthorizedPatientByCpfVars).then((response) => {
  const data = response.data;
  console.log(data.patientAccesses);
});
```

### Using `GetAuthorizedPatientByCpf`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAuthorizedPatientByCpfRef, GetAuthorizedPatientByCpfVariables } from '@dataconnect/generated';

// The `GetAuthorizedPatientByCpf` query requires an argument of type `GetAuthorizedPatientByCpfVariables`:
const getAuthorizedPatientByCpfVars: GetAuthorizedPatientByCpfVariables = {
  cpf: ..., 
};

// Call the `getAuthorizedPatientByCpfRef()` function to get a reference to the query.
const ref = getAuthorizedPatientByCpfRef(getAuthorizedPatientByCpfVars);
// Variables can be defined inline as well.
const ref = getAuthorizedPatientByCpfRef({ cpf: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAuthorizedPatientByCpfRef(dataConnect, getAuthorizedPatientByCpfVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patientAccesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patientAccesses);
});
```

## GetPatient
You can execute the `GetPatient` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPatient(vars: GetPatientVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientData, GetPatientVariables>;

interface GetPatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPatientVariables): QueryRef<GetPatientData, GetPatientVariables>;
}
export const getPatientRef: GetPatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPatient(dc: DataConnect, vars: GetPatientVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientData, GetPatientVariables>;

interface GetPatientRef {
  ...
  (dc: DataConnect, vars: GetPatientVariables): QueryRef<GetPatientData, GetPatientVariables>;
}
export const getPatientRef: GetPatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPatientRef:
```typescript
const name = getPatientRef.operationName;
console.log(name);
```

### Variables
The `GetPatient` query requires an argument of type `GetPatientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPatientVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetPatient` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPatientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPatientData {
  patient?: {
    id: UUIDString;
    motherName?: string | null;
    user: {
      id: UUIDString;
      name: string;
      birthDate: DateString;
      email?: string | null;
      cpf: string;
      sex?: string | null;
      status: UserStatus;
    } & User_Key;
    patientType: PatientType;
    responsible?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
  } & Patient_Key;
}
```
### Using `GetPatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPatient, GetPatientVariables } from '@dataconnect/generated';

// The `GetPatient` query requires an argument of type `GetPatientVariables`:
const getPatientVars: GetPatientVariables = {
  id: ..., 
};

// Call the `getPatient()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPatient(getPatientVars);
// Variables can be defined inline as well.
const { data } = await getPatient({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPatient(dataConnect, getPatientVars);

console.log(data.patient);

// Or, you can use the `Promise` API.
getPatient(getPatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient);
});
```

### Using `GetPatient`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPatientRef, GetPatientVariables } from '@dataconnect/generated';

// The `GetPatient` query requires an argument of type `GetPatientVariables`:
const getPatientVars: GetPatientVariables = {
  id: ..., 
};

// Call the `getPatientRef()` function to get a reference to the query.
const ref = getPatientRef(getPatientVars);
// Variables can be defined inline as well.
const ref = getPatientRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPatientRef(dataConnect, getPatientVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patient);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patient);
});
```

## GetAdminPatient
You can execute the `GetAdminPatient` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getAdminPatient(vars: GetAdminPatientVariables, options?: ExecuteQueryOptions): QueryPromise<GetAdminPatientData, GetAdminPatientVariables>;

interface GetAdminPatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAdminPatientVariables): QueryRef<GetAdminPatientData, GetAdminPatientVariables>;
}
export const getAdminPatientRef: GetAdminPatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAdminPatient(dc: DataConnect, vars: GetAdminPatientVariables, options?: ExecuteQueryOptions): QueryPromise<GetAdminPatientData, GetAdminPatientVariables>;

interface GetAdminPatientRef {
  ...
  (dc: DataConnect, vars: GetAdminPatientVariables): QueryRef<GetAdminPatientData, GetAdminPatientVariables>;
}
export const getAdminPatientRef: GetAdminPatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAdminPatientRef:
```typescript
const name = getAdminPatientRef.operationName;
console.log(name);
```

### Variables
The `GetAdminPatient` query requires an argument of type `GetAdminPatientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAdminPatientVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetAdminPatient` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAdminPatientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAdminPatientData {
  patient?: {
    id: UUIDString;
    motherName?: string | null;
    user: {
      id: UUIDString;
      name: string;
      birthDate: DateString;
      email?: string | null;
      cpf: string;
      sex?: string | null;
      status: UserStatus;
    } & User_Key;
    patientType: PatientType;
    responsible?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
  } & Patient_Key;
}
```
### Using `GetAdminPatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAdminPatient, GetAdminPatientVariables } from '@dataconnect/generated';

// The `GetAdminPatient` query requires an argument of type `GetAdminPatientVariables`:
const getAdminPatientVars: GetAdminPatientVariables = {
  id: ..., 
};

// Call the `getAdminPatient()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAdminPatient(getAdminPatientVars);
// Variables can be defined inline as well.
const { data } = await getAdminPatient({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAdminPatient(dataConnect, getAdminPatientVars);

console.log(data.patient);

// Or, you can use the `Promise` API.
getAdminPatient(getAdminPatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient);
});
```

### Using `GetAdminPatient`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAdminPatientRef, GetAdminPatientVariables } from '@dataconnect/generated';

// The `GetAdminPatient` query requires an argument of type `GetAdminPatientVariables`:
const getAdminPatientVars: GetAdminPatientVariables = {
  id: ..., 
};

// Call the `getAdminPatientRef()` function to get a reference to the query.
const ref = getAdminPatientRef(getAdminPatientVars);
// Variables can be defined inline as well.
const ref = getAdminPatientRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAdminPatientRef(dataConnect, getAdminPatientVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patient);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patient);
});
```

## GetPatientByUser
You can execute the `GetPatientByUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPatientByUser(vars: GetPatientByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientByUserData, GetPatientByUserVariables>;

interface GetPatientByUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPatientByUserVariables): QueryRef<GetPatientByUserData, GetPatientByUserVariables>;
}
export const getPatientByUserRef: GetPatientByUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPatientByUser(dc: DataConnect, vars: GetPatientByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientByUserData, GetPatientByUserVariables>;

interface GetPatientByUserRef {
  ...
  (dc: DataConnect, vars: GetPatientByUserVariables): QueryRef<GetPatientByUserData, GetPatientByUserVariables>;
}
export const getPatientByUserRef: GetPatientByUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPatientByUserRef:
```typescript
const name = getPatientByUserRef.operationName;
console.log(name);
```

### Variables
The `GetPatientByUser` query requires an argument of type `GetPatientByUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPatientByUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetPatientByUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPatientByUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPatientByUserData {
  patients: ({
    id: UUIDString;
    motherName?: string | null;
    user: {
      id: UUIDString;
      name: string;
      birthDate: DateString;
      email?: string | null;
      cpf: string;
      sex?: string | null;
      status: UserStatus;
    } & User_Key;
    patientType: PatientType;
    responsible?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
  } & Patient_Key)[];
}
```
### Using `GetPatientByUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPatientByUser, GetPatientByUserVariables } from '@dataconnect/generated';

// The `GetPatientByUser` query requires an argument of type `GetPatientByUserVariables`:
const getPatientByUserVars: GetPatientByUserVariables = {
  userId: ..., 
};

// Call the `getPatientByUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPatientByUser(getPatientByUserVars);
// Variables can be defined inline as well.
const { data } = await getPatientByUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPatientByUser(dataConnect, getPatientByUserVars);

console.log(data.patients);

// Or, you can use the `Promise` API.
getPatientByUser(getPatientByUserVars).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

### Using `GetPatientByUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPatientByUserRef, GetPatientByUserVariables } from '@dataconnect/generated';

// The `GetPatientByUser` query requires an argument of type `GetPatientByUserVariables`:
const getPatientByUserVars: GetPatientByUserVariables = {
  userId: ..., 
};

// Call the `getPatientByUserRef()` function to get a reference to the query.
const ref = getPatientByUserRef(getPatientByUserVars);
// Variables can be defined inline as well.
const ref = getPatientByUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPatientByUserRef(dataConnect, getPatientByUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

## ListUbs
You can execute the `ListUbs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUbs(options?: ExecuteQueryOptions): QueryPromise<ListUbsData, undefined>;

interface ListUbsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUbsData, undefined>;
}
export const listUbsRef: ListUbsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUbs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUbsData, undefined>;

interface ListUbsRef {
  ...
  (dc: DataConnect): QueryRef<ListUbsData, undefined>;
}
export const listUbsRef: ListUbsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUbsRef:
```typescript
const name = listUbsRef.operationName;
console.log(name);
```

### Variables
The `ListUbs` query has no variables.
### Return Type
Recall that executing the `ListUbs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUbsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUbsData {
  uBSs: ({
    id: UUIDString;
    name: string;
    logradouro?: string | null;
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    cep?: string | null;
  } & UBS_Key)[];
}
```
### Using `ListUbs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUbs } from '@dataconnect/generated';


// Call the `listUbs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUbs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUbs(dataConnect);

console.log(data.uBSs);

// Or, you can use the `Promise` API.
listUbs().then((response) => {
  const data = response.data;
  console.log(data.uBSs);
});
```

### Using `ListUbs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUbsRef } from '@dataconnect/generated';


// Call the `listUbsRef()` function to get a reference to the query.
const ref = listUbsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUbsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.uBSs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.uBSs);
});
```

## GetUbs
You can execute the `GetUbs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUbs(vars: GetUbsVariables, options?: ExecuteQueryOptions): QueryPromise<GetUbsData, GetUbsVariables>;

interface GetUbsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUbsVariables): QueryRef<GetUbsData, GetUbsVariables>;
}
export const getUbsRef: GetUbsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUbs(dc: DataConnect, vars: GetUbsVariables, options?: ExecuteQueryOptions): QueryPromise<GetUbsData, GetUbsVariables>;

interface GetUbsRef {
  ...
  (dc: DataConnect, vars: GetUbsVariables): QueryRef<GetUbsData, GetUbsVariables>;
}
export const getUbsRef: GetUbsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUbsRef:
```typescript
const name = getUbsRef.operationName;
console.log(name);
```

### Variables
The `GetUbs` query requires an argument of type `GetUbsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUbsVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetUbs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUbsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUbsData {
  uBS?: {
    id: UUIDString;
    name: string;
    logradouro?: string | null;
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    cep?: string | null;
  } & UBS_Key;
}
```
### Using `GetUbs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUbs, GetUbsVariables } from '@dataconnect/generated';

// The `GetUbs` query requires an argument of type `GetUbsVariables`:
const getUbsVars: GetUbsVariables = {
  id: ..., 
};

// Call the `getUbs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUbs(getUbsVars);
// Variables can be defined inline as well.
const { data } = await getUbs({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUbs(dataConnect, getUbsVars);

console.log(data.uBS);

// Or, you can use the `Promise` API.
getUbs(getUbsVars).then((response) => {
  const data = response.data;
  console.log(data.uBS);
});
```

### Using `GetUbs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUbsRef, GetUbsVariables } from '@dataconnect/generated';

// The `GetUbs` query requires an argument of type `GetUbsVariables`:
const getUbsVars: GetUbsVariables = {
  id: ..., 
};

// Call the `getUbsRef()` function to get a reference to the query.
const ref = getUbsRef(getUbsVars);
// Variables can be defined inline as well.
const ref = getUbsRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUbsRef(dataConnect, getUbsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.uBS);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.uBS);
});
```

## SearchUbsByName
You can execute the `SearchUbsByName` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
searchUbsByName(vars: SearchUbsByNameVariables, options?: ExecuteQueryOptions): QueryPromise<SearchUbsByNameData, SearchUbsByNameVariables>;

interface SearchUbsByNameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchUbsByNameVariables): QueryRef<SearchUbsByNameData, SearchUbsByNameVariables>;
}
export const searchUbsByNameRef: SearchUbsByNameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchUbsByName(dc: DataConnect, vars: SearchUbsByNameVariables, options?: ExecuteQueryOptions): QueryPromise<SearchUbsByNameData, SearchUbsByNameVariables>;

interface SearchUbsByNameRef {
  ...
  (dc: DataConnect, vars: SearchUbsByNameVariables): QueryRef<SearchUbsByNameData, SearchUbsByNameVariables>;
}
export const searchUbsByNameRef: SearchUbsByNameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchUbsByNameRef:
```typescript
const name = searchUbsByNameRef.operationName;
console.log(name);
```

### Variables
The `SearchUbsByName` query requires an argument of type `SearchUbsByNameVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SearchUbsByNameVariables {
  name: string;
}
```
### Return Type
Recall that executing the `SearchUbsByName` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchUbsByNameData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SearchUbsByNameData {
  uBSs: ({
    id: UUIDString;
    name: string;
    logradouro?: string | null;
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    cep?: string | null;
  } & UBS_Key)[];
}
```
### Using `SearchUbsByName`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchUbsByName, SearchUbsByNameVariables } from '@dataconnect/generated';

// The `SearchUbsByName` query requires an argument of type `SearchUbsByNameVariables`:
const searchUbsByNameVars: SearchUbsByNameVariables = {
  name: ..., 
};

// Call the `searchUbsByName()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchUbsByName(searchUbsByNameVars);
// Variables can be defined inline as well.
const { data } = await searchUbsByName({ name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchUbsByName(dataConnect, searchUbsByNameVars);

console.log(data.uBSs);

// Or, you can use the `Promise` API.
searchUbsByName(searchUbsByNameVars).then((response) => {
  const data = response.data;
  console.log(data.uBSs);
});
```

### Using `SearchUbsByName`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchUbsByNameRef, SearchUbsByNameVariables } from '@dataconnect/generated';

// The `SearchUbsByName` query requires an argument of type `SearchUbsByNameVariables`:
const searchUbsByNameVars: SearchUbsByNameVariables = {
  name: ..., 
};

// Call the `searchUbsByNameRef()` function to get a reference to the query.
const ref = searchUbsByNameRef(searchUbsByNameVars);
// Variables can be defined inline as well.
const ref = searchUbsByNameRef({ name: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchUbsByNameRef(dataConnect, searchUbsByNameVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.uBSs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.uBSs);
});
```

## ListProfessionals
You can execute the `ListProfessionals` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listProfessionals(options?: ExecuteQueryOptions): QueryPromise<ListProfessionalsData, undefined>;

interface ListProfessionalsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProfessionalsData, undefined>;
}
export const listProfessionalsRef: ListProfessionalsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listProfessionals(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProfessionalsData, undefined>;

interface ListProfessionalsRef {
  ...
  (dc: DataConnect): QueryRef<ListProfessionalsData, undefined>;
}
export const listProfessionalsRef: ListProfessionalsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listProfessionalsRef:
```typescript
const name = listProfessionalsRef.operationName;
console.log(name);
```

### Variables
The `ListProfessionals` query has no variables.
### Return Type
Recall that executing the `ListProfessionals` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListProfessionalsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListProfessionalsData {
  professionals: ({
    id: UUIDString;
    user: {
      id: UUIDString;
      name: string;
      birthDate: DateString;
      email?: string | null;
      cpf: string;
      sex?: string | null;
      status: UserStatus;
    } & User_Key;
    professionalType: ProfessionalType;
    professionalRegistration?: string | null;
    ubs?: {
      id: UUIDString;
      name: string;
      cidade?: string | null;
      bairro?: string | null;
    } & UBS_Key;
  } & Professional_Key)[];
}
```
### Using `ListProfessionals`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listProfessionals } from '@dataconnect/generated';


// Call the `listProfessionals()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listProfessionals();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listProfessionals(dataConnect);

console.log(data.professionals);

// Or, you can use the `Promise` API.
listProfessionals().then((response) => {
  const data = response.data;
  console.log(data.professionals);
});
```

### Using `ListProfessionals`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listProfessionalsRef } from '@dataconnect/generated';


// Call the `listProfessionalsRef()` function to get a reference to the query.
const ref = listProfessionalsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listProfessionalsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.professionals);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.professionals);
});
```

## GetProfessional
You can execute the `GetProfessional` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getProfessional(vars: GetProfessionalVariables, options?: ExecuteQueryOptions): QueryPromise<GetProfessionalData, GetProfessionalVariables>;

interface GetProfessionalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProfessionalVariables): QueryRef<GetProfessionalData, GetProfessionalVariables>;
}
export const getProfessionalRef: GetProfessionalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getProfessional(dc: DataConnect, vars: GetProfessionalVariables, options?: ExecuteQueryOptions): QueryPromise<GetProfessionalData, GetProfessionalVariables>;

interface GetProfessionalRef {
  ...
  (dc: DataConnect, vars: GetProfessionalVariables): QueryRef<GetProfessionalData, GetProfessionalVariables>;
}
export const getProfessionalRef: GetProfessionalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getProfessionalRef:
```typescript
const name = getProfessionalRef.operationName;
console.log(name);
```

### Variables
The `GetProfessional` query requires an argument of type `GetProfessionalVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetProfessionalVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetProfessional` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetProfessionalData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetProfessionalData {
  professional?: {
    id: UUIDString;
    user: {
      id: UUIDString;
      name: string;
      birthDate: DateString;
      email?: string | null;
      cpf: string;
      sex?: string | null;
      status: UserStatus;
    } & User_Key;
    professionalType: ProfessionalType;
    professionalRegistration?: string | null;
    ubs?: {
      id: UUIDString;
      name: string;
      logradouro?: string | null;
      numero?: string | null;
      bairro?: string | null;
      cidade?: string | null;
      cep?: string | null;
    } & UBS_Key;
  } & Professional_Key;
}
```
### Using `GetProfessional`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getProfessional, GetProfessionalVariables } from '@dataconnect/generated';

// The `GetProfessional` query requires an argument of type `GetProfessionalVariables`:
const getProfessionalVars: GetProfessionalVariables = {
  id: ..., 
};

// Call the `getProfessional()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getProfessional(getProfessionalVars);
// Variables can be defined inline as well.
const { data } = await getProfessional({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getProfessional(dataConnect, getProfessionalVars);

console.log(data.professional);

// Or, you can use the `Promise` API.
getProfessional(getProfessionalVars).then((response) => {
  const data = response.data;
  console.log(data.professional);
});
```

### Using `GetProfessional`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getProfessionalRef, GetProfessionalVariables } from '@dataconnect/generated';

// The `GetProfessional` query requires an argument of type `GetProfessionalVariables`:
const getProfessionalVars: GetProfessionalVariables = {
  id: ..., 
};

// Call the `getProfessionalRef()` function to get a reference to the query.
const ref = getProfessionalRef(getProfessionalVars);
// Variables can be defined inline as well.
const ref = getProfessionalRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getProfessionalRef(dataConnect, getProfessionalVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.professional);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.professional);
});
```

## GetProfessionalByUser
You can execute the `GetProfessionalByUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getProfessionalByUser(vars: GetProfessionalByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetProfessionalByUserData, GetProfessionalByUserVariables>;

interface GetProfessionalByUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProfessionalByUserVariables): QueryRef<GetProfessionalByUserData, GetProfessionalByUserVariables>;
}
export const getProfessionalByUserRef: GetProfessionalByUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getProfessionalByUser(dc: DataConnect, vars: GetProfessionalByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetProfessionalByUserData, GetProfessionalByUserVariables>;

interface GetProfessionalByUserRef {
  ...
  (dc: DataConnect, vars: GetProfessionalByUserVariables): QueryRef<GetProfessionalByUserData, GetProfessionalByUserVariables>;
}
export const getProfessionalByUserRef: GetProfessionalByUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getProfessionalByUserRef:
```typescript
const name = getProfessionalByUserRef.operationName;
console.log(name);
```

### Variables
The `GetProfessionalByUser` query requires an argument of type `GetProfessionalByUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetProfessionalByUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetProfessionalByUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetProfessionalByUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetProfessionalByUserData {
  professionals: ({
    id: UUIDString;
    user: {
      id: UUIDString;
      name: string;
      email?: string | null;
      cpf: string;
    } & User_Key;
    professionalType: ProfessionalType;
    professionalRegistration?: string | null;
    ubs?: {
      id: UUIDString;
      name: string;
    } & UBS_Key;
  } & Professional_Key)[];
}
```
### Using `GetProfessionalByUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getProfessionalByUser, GetProfessionalByUserVariables } from '@dataconnect/generated';

// The `GetProfessionalByUser` query requires an argument of type `GetProfessionalByUserVariables`:
const getProfessionalByUserVars: GetProfessionalByUserVariables = {
  userId: ..., 
};

// Call the `getProfessionalByUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getProfessionalByUser(getProfessionalByUserVars);
// Variables can be defined inline as well.
const { data } = await getProfessionalByUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getProfessionalByUser(dataConnect, getProfessionalByUserVars);

console.log(data.professionals);

// Or, you can use the `Promise` API.
getProfessionalByUser(getProfessionalByUserVars).then((response) => {
  const data = response.data;
  console.log(data.professionals);
});
```

### Using `GetProfessionalByUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getProfessionalByUserRef, GetProfessionalByUserVariables } from '@dataconnect/generated';

// The `GetProfessionalByUser` query requires an argument of type `GetProfessionalByUserVariables`:
const getProfessionalByUserVars: GetProfessionalByUserVariables = {
  userId: ..., 
};

// Call the `getProfessionalByUserRef()` function to get a reference to the query.
const ref = getProfessionalByUserRef(getProfessionalByUserVars);
// Variables can be defined inline as well.
const ref = getProfessionalByUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getProfessionalByUserRef(dataConnect, getProfessionalByUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.professionals);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.professionals);
});
```

## ListVaccines
You can execute the `ListVaccines` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listVaccines(options?: ExecuteQueryOptions): QueryPromise<ListVaccinesData, undefined>;

interface ListVaccinesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListVaccinesData, undefined>;
}
export const listVaccinesRef: ListVaccinesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listVaccines(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListVaccinesData, undefined>;

interface ListVaccinesRef {
  ...
  (dc: DataConnect): QueryRef<ListVaccinesData, undefined>;
}
export const listVaccinesRef: ListVaccinesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listVaccinesRef:
```typescript
const name = listVaccinesRef.operationName;
console.log(name);
```

### Variables
The `ListVaccines` query has no variables.
### Return Type
Recall that executing the `ListVaccines` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListVaccinesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListVaccinesData {
  vaccines: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    requiredDoses: number;
  } & Vaccine_Key)[];
}
```
### Using `ListVaccines`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listVaccines } from '@dataconnect/generated';


// Call the `listVaccines()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listVaccines();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listVaccines(dataConnect);

console.log(data.vaccines);

// Or, you can use the `Promise` API.
listVaccines().then((response) => {
  const data = response.data;
  console.log(data.vaccines);
});
```

### Using `ListVaccines`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listVaccinesRef } from '@dataconnect/generated';


// Call the `listVaccinesRef()` function to get a reference to the query.
const ref = listVaccinesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listVaccinesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.vaccines);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.vaccines);
});
```

## GetVaccine
You can execute the `GetVaccine` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getVaccine(vars: GetVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<GetVaccineData, GetVaccineVariables>;

interface GetVaccineRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetVaccineVariables): QueryRef<GetVaccineData, GetVaccineVariables>;
}
export const getVaccineRef: GetVaccineRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getVaccine(dc: DataConnect, vars: GetVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<GetVaccineData, GetVaccineVariables>;

interface GetVaccineRef {
  ...
  (dc: DataConnect, vars: GetVaccineVariables): QueryRef<GetVaccineData, GetVaccineVariables>;
}
export const getVaccineRef: GetVaccineRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getVaccineRef:
```typescript
const name = getVaccineRef.operationName;
console.log(name);
```

### Variables
The `GetVaccine` query requires an argument of type `GetVaccineVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetVaccineVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetVaccine` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetVaccineData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetVaccineData {
  vaccine?: {
    id: UUIDString;
    name: string;
    description?: string | null;
    requiredDoses: number;
  } & Vaccine_Key;
}
```
### Using `GetVaccine`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getVaccine, GetVaccineVariables } from '@dataconnect/generated';

// The `GetVaccine` query requires an argument of type `GetVaccineVariables`:
const getVaccineVars: GetVaccineVariables = {
  id: ..., 
};

// Call the `getVaccine()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getVaccine(getVaccineVars);
// Variables can be defined inline as well.
const { data } = await getVaccine({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getVaccine(dataConnect, getVaccineVars);

console.log(data.vaccine);

// Or, you can use the `Promise` API.
getVaccine(getVaccineVars).then((response) => {
  const data = response.data;
  console.log(data.vaccine);
});
```

### Using `GetVaccine`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getVaccineRef, GetVaccineVariables } from '@dataconnect/generated';

// The `GetVaccine` query requires an argument of type `GetVaccineVariables`:
const getVaccineVars: GetVaccineVariables = {
  id: ..., 
};

// Call the `getVaccineRef()` function to get a reference to the query.
const ref = getVaccineRef(getVaccineVars);
// Variables can be defined inline as well.
const ref = getVaccineRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getVaccineRef(dataConnect, getVaccineVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.vaccine);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.vaccine);
});
```

## SearchVaccinesByName
You can execute the `SearchVaccinesByName` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
searchVaccinesByName(vars: SearchVaccinesByNameVariables, options?: ExecuteQueryOptions): QueryPromise<SearchVaccinesByNameData, SearchVaccinesByNameVariables>;

interface SearchVaccinesByNameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchVaccinesByNameVariables): QueryRef<SearchVaccinesByNameData, SearchVaccinesByNameVariables>;
}
export const searchVaccinesByNameRef: SearchVaccinesByNameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchVaccinesByName(dc: DataConnect, vars: SearchVaccinesByNameVariables, options?: ExecuteQueryOptions): QueryPromise<SearchVaccinesByNameData, SearchVaccinesByNameVariables>;

interface SearchVaccinesByNameRef {
  ...
  (dc: DataConnect, vars: SearchVaccinesByNameVariables): QueryRef<SearchVaccinesByNameData, SearchVaccinesByNameVariables>;
}
export const searchVaccinesByNameRef: SearchVaccinesByNameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchVaccinesByNameRef:
```typescript
const name = searchVaccinesByNameRef.operationName;
console.log(name);
```

### Variables
The `SearchVaccinesByName` query requires an argument of type `SearchVaccinesByNameVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SearchVaccinesByNameVariables {
  name: string;
}
```
### Return Type
Recall that executing the `SearchVaccinesByName` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchVaccinesByNameData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SearchVaccinesByNameData {
  vaccines: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    requiredDoses: number;
  } & Vaccine_Key)[];
}
```
### Using `SearchVaccinesByName`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchVaccinesByName, SearchVaccinesByNameVariables } from '@dataconnect/generated';

// The `SearchVaccinesByName` query requires an argument of type `SearchVaccinesByNameVariables`:
const searchVaccinesByNameVars: SearchVaccinesByNameVariables = {
  name: ..., 
};

// Call the `searchVaccinesByName()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchVaccinesByName(searchVaccinesByNameVars);
// Variables can be defined inline as well.
const { data } = await searchVaccinesByName({ name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchVaccinesByName(dataConnect, searchVaccinesByNameVars);

console.log(data.vaccines);

// Or, you can use the `Promise` API.
searchVaccinesByName(searchVaccinesByNameVars).then((response) => {
  const data = response.data;
  console.log(data.vaccines);
});
```

### Using `SearchVaccinesByName`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchVaccinesByNameRef, SearchVaccinesByNameVariables } from '@dataconnect/generated';

// The `SearchVaccinesByName` query requires an argument of type `SearchVaccinesByNameVariables`:
const searchVaccinesByNameVars: SearchVaccinesByNameVariables = {
  name: ..., 
};

// Call the `searchVaccinesByNameRef()` function to get a reference to the query.
const ref = searchVaccinesByNameRef(searchVaccinesByNameVars);
// Variables can be defined inline as well.
const ref = searchVaccinesByNameRef({ name: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchVaccinesByNameRef(dataConnect, searchVaccinesByNameVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.vaccines);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.vaccines);
});
```

## ListBatches
You can execute the `ListBatches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listBatches(options?: ExecuteQueryOptions): QueryPromise<ListBatchesData, undefined>;

interface ListBatchesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBatchesData, undefined>;
}
export const listBatchesRef: ListBatchesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listBatches(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBatchesData, undefined>;

interface ListBatchesRef {
  ...
  (dc: DataConnect): QueryRef<ListBatchesData, undefined>;
}
export const listBatchesRef: ListBatchesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listBatchesRef:
```typescript
const name = listBatchesRef.operationName;
console.log(name);
```

### Variables
The `ListBatches` query has no variables.
### Return Type
Recall that executing the `ListBatches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListBatchesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListBatchesData {
  batches: ({
    id: UUIDString;
    vaccine: {
      id: UUIDString;
      name: string;
      requiredDoses: number;
    } & Vaccine_Key;
    manufacturer: string;
    batchCode: string;
    initialQuantity: number;
    currentQuantity: number;
    manufacturingDate?: DateString | null;
    expirationDate: DateString;
  } & Batch_Key)[];
}
```
### Using `ListBatches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listBatches } from '@dataconnect/generated';


// Call the `listBatches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listBatches();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listBatches(dataConnect);

console.log(data.batches);

// Or, you can use the `Promise` API.
listBatches().then((response) => {
  const data = response.data;
  console.log(data.batches);
});
```

### Using `ListBatches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listBatchesRef } from '@dataconnect/generated';


// Call the `listBatchesRef()` function to get a reference to the query.
const ref = listBatchesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listBatchesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.batches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.batches);
});
```

## GetBatch
You can execute the `GetBatch` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getBatch(vars: GetBatchVariables, options?: ExecuteQueryOptions): QueryPromise<GetBatchData, GetBatchVariables>;

interface GetBatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBatchVariables): QueryRef<GetBatchData, GetBatchVariables>;
}
export const getBatchRef: GetBatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getBatch(dc: DataConnect, vars: GetBatchVariables, options?: ExecuteQueryOptions): QueryPromise<GetBatchData, GetBatchVariables>;

interface GetBatchRef {
  ...
  (dc: DataConnect, vars: GetBatchVariables): QueryRef<GetBatchData, GetBatchVariables>;
}
export const getBatchRef: GetBatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getBatchRef:
```typescript
const name = getBatchRef.operationName;
console.log(name);
```

### Variables
The `GetBatch` query requires an argument of type `GetBatchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetBatchVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetBatch` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetBatchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetBatchData {
  batch?: {
    id: UUIDString;
    vaccine: {
      id: UUIDString;
      name: string;
      description?: string | null;
      requiredDoses: number;
    } & Vaccine_Key;
    manufacturer: string;
    batchCode: string;
    initialQuantity: number;
    currentQuantity: number;
    manufacturingDate?: DateString | null;
    expirationDate: DateString;
  } & Batch_Key;
}
```
### Using `GetBatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getBatch, GetBatchVariables } from '@dataconnect/generated';

// The `GetBatch` query requires an argument of type `GetBatchVariables`:
const getBatchVars: GetBatchVariables = {
  id: ..., 
};

// Call the `getBatch()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getBatch(getBatchVars);
// Variables can be defined inline as well.
const { data } = await getBatch({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getBatch(dataConnect, getBatchVars);

console.log(data.batch);

// Or, you can use the `Promise` API.
getBatch(getBatchVars).then((response) => {
  const data = response.data;
  console.log(data.batch);
});
```

### Using `GetBatch`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getBatchRef, GetBatchVariables } from '@dataconnect/generated';

// The `GetBatch` query requires an argument of type `GetBatchVariables`:
const getBatchVars: GetBatchVariables = {
  id: ..., 
};

// Call the `getBatchRef()` function to get a reference to the query.
const ref = getBatchRef(getBatchVars);
// Variables can be defined inline as well.
const ref = getBatchRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getBatchRef(dataConnect, getBatchVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.batch);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.batch);
});
```

## ListBatchesByVaccine
You can execute the `ListBatchesByVaccine` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listBatchesByVaccine(vars: ListBatchesByVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<ListBatchesByVaccineData, ListBatchesByVaccineVariables>;

interface ListBatchesByVaccineRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListBatchesByVaccineVariables): QueryRef<ListBatchesByVaccineData, ListBatchesByVaccineVariables>;
}
export const listBatchesByVaccineRef: ListBatchesByVaccineRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listBatchesByVaccine(dc: DataConnect, vars: ListBatchesByVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<ListBatchesByVaccineData, ListBatchesByVaccineVariables>;

interface ListBatchesByVaccineRef {
  ...
  (dc: DataConnect, vars: ListBatchesByVaccineVariables): QueryRef<ListBatchesByVaccineData, ListBatchesByVaccineVariables>;
}
export const listBatchesByVaccineRef: ListBatchesByVaccineRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listBatchesByVaccineRef:
```typescript
const name = listBatchesByVaccineRef.operationName;
console.log(name);
```

### Variables
The `ListBatchesByVaccine` query requires an argument of type `ListBatchesByVaccineVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListBatchesByVaccineVariables {
  vaccineId: UUIDString;
}
```
### Return Type
Recall that executing the `ListBatchesByVaccine` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListBatchesByVaccineData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListBatchesByVaccineData {
  batches: ({
    id: UUIDString;
    vaccine: {
      id: UUIDString;
      name: string;
    } & Vaccine_Key;
    manufacturer: string;
    batchCode: string;
    initialQuantity: number;
    currentQuantity: number;
    manufacturingDate?: DateString | null;
    expirationDate: DateString;
  } & Batch_Key)[];
}
```
### Using `ListBatchesByVaccine`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listBatchesByVaccine, ListBatchesByVaccineVariables } from '@dataconnect/generated';

// The `ListBatchesByVaccine` query requires an argument of type `ListBatchesByVaccineVariables`:
const listBatchesByVaccineVars: ListBatchesByVaccineVariables = {
  vaccineId: ..., 
};

// Call the `listBatchesByVaccine()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listBatchesByVaccine(listBatchesByVaccineVars);
// Variables can be defined inline as well.
const { data } = await listBatchesByVaccine({ vaccineId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listBatchesByVaccine(dataConnect, listBatchesByVaccineVars);

console.log(data.batches);

// Or, you can use the `Promise` API.
listBatchesByVaccine(listBatchesByVaccineVars).then((response) => {
  const data = response.data;
  console.log(data.batches);
});
```

### Using `ListBatchesByVaccine`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listBatchesByVaccineRef, ListBatchesByVaccineVariables } from '@dataconnect/generated';

// The `ListBatchesByVaccine` query requires an argument of type `ListBatchesByVaccineVariables`:
const listBatchesByVaccineVars: ListBatchesByVaccineVariables = {
  vaccineId: ..., 
};

// Call the `listBatchesByVaccineRef()` function to get a reference to the query.
const ref = listBatchesByVaccineRef(listBatchesByVaccineVars);
// Variables can be defined inline as well.
const ref = listBatchesByVaccineRef({ vaccineId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listBatchesByVaccineRef(dataConnect, listBatchesByVaccineVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.batches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.batches);
});
```

## ListAppointments
You can execute the `ListAppointments` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAppointments(options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsData, undefined>;

interface ListAppointmentsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAppointmentsData, undefined>;
}
export const listAppointmentsRef: ListAppointmentsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAppointments(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsData, undefined>;

interface ListAppointmentsRef {
  ...
  (dc: DataConnect): QueryRef<ListAppointmentsData, undefined>;
}
export const listAppointmentsRef: ListAppointmentsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAppointmentsRef:
```typescript
const name = listAppointmentsRef.operationName;
console.log(name);
```

### Variables
The `ListAppointments` query has no variables.
### Return Type
Recall that executing the `ListAppointments` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAppointmentsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAppointmentsData {
  appointments: ({
    id: UUIDString;
    patient: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
    vaccine: {
      id: UUIDString;
      name: string;
      requiredDoses: number;
    } & Vaccine_Key;
    ubs?: {
      id: UUIDString;
      name: string;
      cidade?: string | null;
    } & UBS_Key;
    createdAt: TimestampString;
    scheduledAt: TimestampString;
    status: AppointmentStatus;
    notes?: string | null;
  } & Appointment_Key)[];
}
```
### Using `ListAppointments`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAppointments } from '@dataconnect/generated';


// Call the `listAppointments()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAppointments();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAppointments(dataConnect);

console.log(data.appointments);

// Or, you can use the `Promise` API.
listAppointments().then((response) => {
  const data = response.data;
  console.log(data.appointments);
});
```

### Using `ListAppointments`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAppointmentsRef } from '@dataconnect/generated';


// Call the `listAppointmentsRef()` function to get a reference to the query.
const ref = listAppointmentsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAppointmentsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.appointments);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.appointments);
});
```

## ListAccessibleAppointments
You can execute the `ListAccessibleAppointments` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAccessibleAppointments(options?: ExecuteQueryOptions): QueryPromise<ListAccessibleAppointmentsData, undefined>;

interface ListAccessibleAppointmentsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAccessibleAppointmentsData, undefined>;
}
export const listAccessibleAppointmentsRef: ListAccessibleAppointmentsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAccessibleAppointments(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAccessibleAppointmentsData, undefined>;

interface ListAccessibleAppointmentsRef {
  ...
  (dc: DataConnect): QueryRef<ListAccessibleAppointmentsData, undefined>;
}
export const listAccessibleAppointmentsRef: ListAccessibleAppointmentsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAccessibleAppointmentsRef:
```typescript
const name = listAccessibleAppointmentsRef.operationName;
console.log(name);
```

### Variables
The `ListAccessibleAppointments` query has no variables.
### Return Type
Recall that executing the `ListAccessibleAppointments` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAccessibleAppointmentsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAccessibleAppointmentsData {
  patientAccesses: ({
    patient: {
      appointments: ({
        id: UUIDString;
        patient: {
          id: UUIDString;
          user: {
            id: UUIDString;
            name: string;
            cpf: string;
          } & User_Key;
        } & Patient_Key;
        vaccine: {
          id: UUIDString;
          name: string;
          requiredDoses: number;
        } & Vaccine_Key;
        ubs?: {
          id: UUIDString;
          name: string;
          cidade?: string | null;
        } & UBS_Key;
        createdAt: TimestampString;
        scheduledAt: TimestampString;
        status: AppointmentStatus;
        notes?: string | null;
      } & Appointment_Key)[];
    };
  })[];
}
```
### Using `ListAccessibleAppointments`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAccessibleAppointments } from '@dataconnect/generated';


// Call the `listAccessibleAppointments()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAccessibleAppointments();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAccessibleAppointments(dataConnect);

console.log(data.patientAccesses);

// Or, you can use the `Promise` API.
listAccessibleAppointments().then((response) => {
  const data = response.data;
  console.log(data.patientAccesses);
});
```

### Using `ListAccessibleAppointments`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAccessibleAppointmentsRef } from '@dataconnect/generated';


// Call the `listAccessibleAppointmentsRef()` function to get a reference to the query.
const ref = listAccessibleAppointmentsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAccessibleAppointmentsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patientAccesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patientAccesses);
});
```

## GetAppointment
You can execute the `GetAppointment` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getAppointment(vars: GetAppointmentVariables, options?: ExecuteQueryOptions): QueryPromise<GetAppointmentData, GetAppointmentVariables>;

interface GetAppointmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAppointmentVariables): QueryRef<GetAppointmentData, GetAppointmentVariables>;
}
export const getAppointmentRef: GetAppointmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAppointment(dc: DataConnect, vars: GetAppointmentVariables, options?: ExecuteQueryOptions): QueryPromise<GetAppointmentData, GetAppointmentVariables>;

interface GetAppointmentRef {
  ...
  (dc: DataConnect, vars: GetAppointmentVariables): QueryRef<GetAppointmentData, GetAppointmentVariables>;
}
export const getAppointmentRef: GetAppointmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAppointmentRef:
```typescript
const name = getAppointmentRef.operationName;
console.log(name);
```

### Variables
The `GetAppointment` query requires an argument of type `GetAppointmentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAppointmentVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetAppointment` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAppointmentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAppointmentData {
  appointment?: {
    id: UUIDString;
    patient: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        birthDate: DateString;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
    vaccine: {
      id: UUIDString;
      name: string;
      description?: string | null;
      requiredDoses: number;
    } & Vaccine_Key;
    ubs?: {
      id: UUIDString;
      name: string;
      logradouro?: string | null;
      numero?: string | null;
      bairro?: string | null;
      cidade?: string | null;
      cep?: string | null;
    } & UBS_Key;
    createdAt: TimestampString;
    scheduledAt: TimestampString;
    status: AppointmentStatus;
    notes?: string | null;
  } & Appointment_Key;
}
```
### Using `GetAppointment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAppointment, GetAppointmentVariables } from '@dataconnect/generated';

// The `GetAppointment` query requires an argument of type `GetAppointmentVariables`:
const getAppointmentVars: GetAppointmentVariables = {
  id: ..., 
};

// Call the `getAppointment()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAppointment(getAppointmentVars);
// Variables can be defined inline as well.
const { data } = await getAppointment({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAppointment(dataConnect, getAppointmentVars);

console.log(data.appointment);

// Or, you can use the `Promise` API.
getAppointment(getAppointmentVars).then((response) => {
  const data = response.data;
  console.log(data.appointment);
});
```

### Using `GetAppointment`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAppointmentRef, GetAppointmentVariables } from '@dataconnect/generated';

// The `GetAppointment` query requires an argument of type `GetAppointmentVariables`:
const getAppointmentVars: GetAppointmentVariables = {
  id: ..., 
};

// Call the `getAppointmentRef()` function to get a reference to the query.
const ref = getAppointmentRef(getAppointmentVars);
// Variables can be defined inline as well.
const ref = getAppointmentRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAppointmentRef(dataConnect, getAppointmentVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.appointment);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment);
});
```

## ListAppointmentsByPatient
You can execute the `ListAppointmentsByPatient` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAppointmentsByPatient(vars: ListAppointmentsByPatientVariables, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsByPatientData, ListAppointmentsByPatientVariables>;

interface ListAppointmentsByPatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAppointmentsByPatientVariables): QueryRef<ListAppointmentsByPatientData, ListAppointmentsByPatientVariables>;
}
export const listAppointmentsByPatientRef: ListAppointmentsByPatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAppointmentsByPatient(dc: DataConnect, vars: ListAppointmentsByPatientVariables, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsByPatientData, ListAppointmentsByPatientVariables>;

interface ListAppointmentsByPatientRef {
  ...
  (dc: DataConnect, vars: ListAppointmentsByPatientVariables): QueryRef<ListAppointmentsByPatientData, ListAppointmentsByPatientVariables>;
}
export const listAppointmentsByPatientRef: ListAppointmentsByPatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAppointmentsByPatientRef:
```typescript
const name = listAppointmentsByPatientRef.operationName;
console.log(name);
```

### Variables
The `ListAppointmentsByPatient` query requires an argument of type `ListAppointmentsByPatientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAppointmentsByPatientVariables {
  patientId: UUIDString;
}
```
### Return Type
Recall that executing the `ListAppointmentsByPatient` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAppointmentsByPatientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAppointmentsByPatientData {
  appointments: ({
    id: UUIDString;
    patient: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
    vaccine: {
      id: UUIDString;
      name: string;
    } & Vaccine_Key;
    ubs?: {
      id: UUIDString;
      name: string;
    } & UBS_Key;
    createdAt: TimestampString;
    scheduledAt: TimestampString;
    status: AppointmentStatus;
    notes?: string | null;
  } & Appointment_Key)[];
}
```
### Using `ListAppointmentsByPatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAppointmentsByPatient, ListAppointmentsByPatientVariables } from '@dataconnect/generated';

// The `ListAppointmentsByPatient` query requires an argument of type `ListAppointmentsByPatientVariables`:
const listAppointmentsByPatientVars: ListAppointmentsByPatientVariables = {
  patientId: ..., 
};

// Call the `listAppointmentsByPatient()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAppointmentsByPatient(listAppointmentsByPatientVars);
// Variables can be defined inline as well.
const { data } = await listAppointmentsByPatient({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAppointmentsByPatient(dataConnect, listAppointmentsByPatientVars);

console.log(data.appointments);

// Or, you can use the `Promise` API.
listAppointmentsByPatient(listAppointmentsByPatientVars).then((response) => {
  const data = response.data;
  console.log(data.appointments);
});
```

### Using `ListAppointmentsByPatient`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAppointmentsByPatientRef, ListAppointmentsByPatientVariables } from '@dataconnect/generated';

// The `ListAppointmentsByPatient` query requires an argument of type `ListAppointmentsByPatientVariables`:
const listAppointmentsByPatientVars: ListAppointmentsByPatientVariables = {
  patientId: ..., 
};

// Call the `listAppointmentsByPatientRef()` function to get a reference to the query.
const ref = listAppointmentsByPatientRef(listAppointmentsByPatientVars);
// Variables can be defined inline as well.
const ref = listAppointmentsByPatientRef({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAppointmentsByPatientRef(dataConnect, listAppointmentsByPatientVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.appointments);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.appointments);
});
```

## ListAppointmentsByStatus
You can execute the `ListAppointmentsByStatus` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAppointmentsByStatus(vars: ListAppointmentsByStatusVariables, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsByStatusData, ListAppointmentsByStatusVariables>;

interface ListAppointmentsByStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAppointmentsByStatusVariables): QueryRef<ListAppointmentsByStatusData, ListAppointmentsByStatusVariables>;
}
export const listAppointmentsByStatusRef: ListAppointmentsByStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAppointmentsByStatus(dc: DataConnect, vars: ListAppointmentsByStatusVariables, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsByStatusData, ListAppointmentsByStatusVariables>;

interface ListAppointmentsByStatusRef {
  ...
  (dc: DataConnect, vars: ListAppointmentsByStatusVariables): QueryRef<ListAppointmentsByStatusData, ListAppointmentsByStatusVariables>;
}
export const listAppointmentsByStatusRef: ListAppointmentsByStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAppointmentsByStatusRef:
```typescript
const name = listAppointmentsByStatusRef.operationName;
console.log(name);
```

### Variables
The `ListAppointmentsByStatus` query requires an argument of type `ListAppointmentsByStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAppointmentsByStatusVariables {
  status: AppointmentStatus;
}
```
### Return Type
Recall that executing the `ListAppointmentsByStatus` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAppointmentsByStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAppointmentsByStatusData {
  appointments: ({
    id: UUIDString;
    patient: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
    vaccine: {
      id: UUIDString;
      name: string;
    } & Vaccine_Key;
    ubs?: {
      id: UUIDString;
      name: string;
    } & UBS_Key;
    scheduledAt: TimestampString;
    status: AppointmentStatus;
    notes?: string | null;
  } & Appointment_Key)[];
}
```
### Using `ListAppointmentsByStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAppointmentsByStatus, ListAppointmentsByStatusVariables } from '@dataconnect/generated';

// The `ListAppointmentsByStatus` query requires an argument of type `ListAppointmentsByStatusVariables`:
const listAppointmentsByStatusVars: ListAppointmentsByStatusVariables = {
  status: ..., 
};

// Call the `listAppointmentsByStatus()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAppointmentsByStatus(listAppointmentsByStatusVars);
// Variables can be defined inline as well.
const { data } = await listAppointmentsByStatus({ status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAppointmentsByStatus(dataConnect, listAppointmentsByStatusVars);

console.log(data.appointments);

// Or, you can use the `Promise` API.
listAppointmentsByStatus(listAppointmentsByStatusVars).then((response) => {
  const data = response.data;
  console.log(data.appointments);
});
```

### Using `ListAppointmentsByStatus`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAppointmentsByStatusRef, ListAppointmentsByStatusVariables } from '@dataconnect/generated';

// The `ListAppointmentsByStatus` query requires an argument of type `ListAppointmentsByStatusVariables`:
const listAppointmentsByStatusVars: ListAppointmentsByStatusVariables = {
  status: ..., 
};

// Call the `listAppointmentsByStatusRef()` function to get a reference to the query.
const ref = listAppointmentsByStatusRef(listAppointmentsByStatusVars);
// Variables can be defined inline as well.
const ref = listAppointmentsByStatusRef({ status: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAppointmentsByStatusRef(dataConnect, listAppointmentsByStatusVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.appointments);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.appointments);
});
```

## ListApplications
You can execute the `ListApplications` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listApplications(options?: ExecuteQueryOptions): QueryPromise<ListApplicationsData, undefined>;

interface ListApplicationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListApplicationsData, undefined>;
}
export const listApplicationsRef: ListApplicationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listApplications(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListApplicationsData, undefined>;

interface ListApplicationsRef {
  ...
  (dc: DataConnect): QueryRef<ListApplicationsData, undefined>;
}
export const listApplicationsRef: ListApplicationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listApplicationsRef:
```typescript
const name = listApplicationsRef.operationName;
console.log(name);
```

### Variables
The `ListApplications` query has no variables.
### Return Type
Recall that executing the `ListApplications` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListApplicationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListApplicationsData {
  applications: ({
    id: UUIDString;
    patientIdSnapshot: UUIDString;
    patientLegacyPersonIdSnapshot?: string | null;
    patientNameSnapshot: string;
    vaccineNameSnapshot: string;
    lotSnapshot?: string | null;
    manufacturerSnapshot?: string | null;
    facilityNameSnapshot: string;
    professionalNameSnapshot: string;
    professionalRegistrationSnapshot?: string | null;
    doseLabel?: string | null;
    nextDoseAt?: TimestampString | null;
    source?: string | null;
    voidedAt?: TimestampString | null;
    voidedByAuthUid?: string | null;
    voidReason?: string | null;
    patient?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
    vaccine?: {
      id: UUIDString;
      name: string;
      requiredDoses: number;
    } & Vaccine_Key;
    batch?: {
      id: UUIDString;
      manufacturer: string;
      batchCode: string;
      expirationDate: DateString;
    } & Batch_Key;
    appointment?: {
      id: UUIDString;
      scheduledAt: TimestampString;
      status: AppointmentStatus;
    } & Appointment_Key;
    professional?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
      } & User_Key;
      professionalType: ProfessionalType;
      professionalRegistration?: string | null;
    } & Professional_Key;
    ubs?: {
      id: UUIDString;
      name: string;
      cidade?: string | null;
    } & UBS_Key;
    applicationDate: TimestampString;
    doseNumber?: number | null;
    notes?: string | null;
  } & Application_Key)[];
}
```
### Using `ListApplications`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listApplications } from '@dataconnect/generated';


// Call the `listApplications()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listApplications();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listApplications(dataConnect);

console.log(data.applications);

// Or, you can use the `Promise` API.
listApplications().then((response) => {
  const data = response.data;
  console.log(data.applications);
});
```

### Using `ListApplications`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listApplicationsRef } from '@dataconnect/generated';


// Call the `listApplicationsRef()` function to get a reference to the query.
const ref = listApplicationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listApplicationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.applications);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.applications);
});
```

## ListCurrentProfessionalApplications
You can execute the `ListCurrentProfessionalApplications` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCurrentProfessionalApplications(options?: ExecuteQueryOptions): QueryPromise<ListCurrentProfessionalApplicationsData, undefined>;

interface ListCurrentProfessionalApplicationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCurrentProfessionalApplicationsData, undefined>;
}
export const listCurrentProfessionalApplicationsRef: ListCurrentProfessionalApplicationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCurrentProfessionalApplications(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCurrentProfessionalApplicationsData, undefined>;

interface ListCurrentProfessionalApplicationsRef {
  ...
  (dc: DataConnect): QueryRef<ListCurrentProfessionalApplicationsData, undefined>;
}
export const listCurrentProfessionalApplicationsRef: ListCurrentProfessionalApplicationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCurrentProfessionalApplicationsRef:
```typescript
const name = listCurrentProfessionalApplicationsRef.operationName;
console.log(name);
```

### Variables
The `ListCurrentProfessionalApplications` query has no variables.
### Return Type
Recall that executing the `ListCurrentProfessionalApplications` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCurrentProfessionalApplicationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListCurrentProfessionalApplicationsData {
  applications: ({
    id: UUIDString;
    patientIdSnapshot: UUIDString;
    patientLegacyPersonIdSnapshot?: string | null;
    patientNameSnapshot: string;
    vaccineNameSnapshot: string;
    lotSnapshot?: string | null;
    manufacturerSnapshot?: string | null;
    facilityNameSnapshot: string;
    professionalNameSnapshot: string;
    professionalRegistrationSnapshot?: string | null;
    doseLabel?: string | null;
    nextDoseAt?: TimestampString | null;
    source?: string | null;
    voidedAt?: TimestampString | null;
    voidedByAuthUid?: string | null;
    voidReason?: string | null;
    patient?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
    vaccine?: {
      id: UUIDString;
      name: string;
      requiredDoses: number;
    } & Vaccine_Key;
    batch?: {
      id: UUIDString;
      manufacturer: string;
      batchCode: string;
      expirationDate: DateString;
    } & Batch_Key;
    appointment?: {
      id: UUIDString;
      scheduledAt: TimestampString;
      status: AppointmentStatus;
    } & Appointment_Key;
    professional?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
      } & User_Key;
      professionalType: ProfessionalType;
      professionalRegistration?: string | null;
    } & Professional_Key;
    ubs?: {
      id: UUIDString;
      name: string;
      cidade?: string | null;
    } & UBS_Key;
    applicationDate: TimestampString;
    doseNumber?: number | null;
    notes?: string | null;
  } & Application_Key)[];
}
```
### Using `ListCurrentProfessionalApplications`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCurrentProfessionalApplications } from '@dataconnect/generated';


// Call the `listCurrentProfessionalApplications()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCurrentProfessionalApplications();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCurrentProfessionalApplications(dataConnect);

console.log(data.applications);

// Or, you can use the `Promise` API.
listCurrentProfessionalApplications().then((response) => {
  const data = response.data;
  console.log(data.applications);
});
```

### Using `ListCurrentProfessionalApplications`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCurrentProfessionalApplicationsRef } from '@dataconnect/generated';


// Call the `listCurrentProfessionalApplicationsRef()` function to get a reference to the query.
const ref = listCurrentProfessionalApplicationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCurrentProfessionalApplicationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.applications);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.applications);
});
```

## GetApplication
You can execute the `GetApplication` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getApplication(vars: GetApplicationVariables, options?: ExecuteQueryOptions): QueryPromise<GetApplicationData, GetApplicationVariables>;

interface GetApplicationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetApplicationVariables): QueryRef<GetApplicationData, GetApplicationVariables>;
}
export const getApplicationRef: GetApplicationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getApplication(dc: DataConnect, vars: GetApplicationVariables, options?: ExecuteQueryOptions): QueryPromise<GetApplicationData, GetApplicationVariables>;

interface GetApplicationRef {
  ...
  (dc: DataConnect, vars: GetApplicationVariables): QueryRef<GetApplicationData, GetApplicationVariables>;
}
export const getApplicationRef: GetApplicationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getApplicationRef:
```typescript
const name = getApplicationRef.operationName;
console.log(name);
```

### Variables
The `GetApplication` query requires an argument of type `GetApplicationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetApplicationVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetApplication` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetApplicationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetApplicationData {
  application?: {
    id: UUIDString;
    patientIdSnapshot: UUIDString;
    patientLegacyPersonIdSnapshot?: string | null;
    patientNameSnapshot: string;
    vaccineNameSnapshot: string;
    lotSnapshot?: string | null;
    manufacturerSnapshot?: string | null;
    facilityNameSnapshot: string;
    professionalNameSnapshot: string;
    professionalRegistrationSnapshot?: string | null;
    doseLabel?: string | null;
    nextDoseAt?: TimestampString | null;
    source?: string | null;
    voidedAt?: TimestampString | null;
    voidedByAuthUid?: string | null;
    voidReason?: string | null;
    patient?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        birthDate: DateString;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
    vaccine?: {
      id: UUIDString;
      name: string;
      description?: string | null;
      requiredDoses: number;
    } & Vaccine_Key;
    batch?: {
      id: UUIDString;
      manufacturer: string;
      batchCode: string;
      initialQuantity: number;
      currentQuantity: number;
      manufacturingDate?: DateString | null;
      expirationDate: DateString;
    } & Batch_Key;
    appointment?: {
      id: UUIDString;
      scheduledAt: TimestampString;
      status: AppointmentStatus;
    } & Appointment_Key;
    professional?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
      professionalType: ProfessionalType;
      professionalRegistration?: string | null;
    } & Professional_Key;
    ubs?: {
      id: UUIDString;
      name: string;
      logradouro?: string | null;
      numero?: string | null;
      bairro?: string | null;
      cidade?: string | null;
      cep?: string | null;
    } & UBS_Key;
    applicationDate: TimestampString;
    doseNumber?: number | null;
    notes?: string | null;
  } & Application_Key;
}
```
### Using `GetApplication`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getApplication, GetApplicationVariables } from '@dataconnect/generated';

// The `GetApplication` query requires an argument of type `GetApplicationVariables`:
const getApplicationVars: GetApplicationVariables = {
  id: ..., 
};

// Call the `getApplication()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getApplication(getApplicationVars);
// Variables can be defined inline as well.
const { data } = await getApplication({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getApplication(dataConnect, getApplicationVars);

console.log(data.application);

// Or, you can use the `Promise` API.
getApplication(getApplicationVars).then((response) => {
  const data = response.data;
  console.log(data.application);
});
```

### Using `GetApplication`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getApplicationRef, GetApplicationVariables } from '@dataconnect/generated';

// The `GetApplication` query requires an argument of type `GetApplicationVariables`:
const getApplicationVars: GetApplicationVariables = {
  id: ..., 
};

// Call the `getApplicationRef()` function to get a reference to the query.
const ref = getApplicationRef(getApplicationVars);
// Variables can be defined inline as well.
const ref = getApplicationRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getApplicationRef(dataConnect, getApplicationVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.application);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.application);
});
```

## ListApplicationsByPatient
You can execute the `ListApplicationsByPatient` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listApplicationsByPatient(vars: ListApplicationsByPatientVariables, options?: ExecuteQueryOptions): QueryPromise<ListApplicationsByPatientData, ListApplicationsByPatientVariables>;

interface ListApplicationsByPatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListApplicationsByPatientVariables): QueryRef<ListApplicationsByPatientData, ListApplicationsByPatientVariables>;
}
export const listApplicationsByPatientRef: ListApplicationsByPatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listApplicationsByPatient(dc: DataConnect, vars: ListApplicationsByPatientVariables, options?: ExecuteQueryOptions): QueryPromise<ListApplicationsByPatientData, ListApplicationsByPatientVariables>;

interface ListApplicationsByPatientRef {
  ...
  (dc: DataConnect, vars: ListApplicationsByPatientVariables): QueryRef<ListApplicationsByPatientData, ListApplicationsByPatientVariables>;
}
export const listApplicationsByPatientRef: ListApplicationsByPatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listApplicationsByPatientRef:
```typescript
const name = listApplicationsByPatientRef.operationName;
console.log(name);
```

### Variables
The `ListApplicationsByPatient` query requires an argument of type `ListApplicationsByPatientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListApplicationsByPatientVariables {
  patientId: UUIDString;
}
```
### Return Type
Recall that executing the `ListApplicationsByPatient` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListApplicationsByPatientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListApplicationsByPatientData {
  applications: ({
    id: UUIDString;
    patientIdSnapshot: UUIDString;
    patientLegacyPersonIdSnapshot?: string | null;
    patientNameSnapshot: string;
    vaccineNameSnapshot: string;
    lotSnapshot?: string | null;
    manufacturerSnapshot?: string | null;
    facilityNameSnapshot: string;
    professionalNameSnapshot: string;
    professionalRegistrationSnapshot?: string | null;
    doseLabel?: string | null;
    nextDoseAt?: TimestampString | null;
    source?: string | null;
    voidedAt?: TimestampString | null;
    voidedByAuthUid?: string | null;
    voidReason?: string | null;
    vaccine?: {
      id: UUIDString;
      name: string;
      requiredDoses: number;
    } & Vaccine_Key;
    batch?: {
      id: UUIDString;
      manufacturer: string;
      batchCode: string;
      expirationDate: DateString;
    } & Batch_Key;
    appointment?: {
      id: UUIDString;
      scheduledAt: TimestampString;
      status: AppointmentStatus;
    } & Appointment_Key;
    professional?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
      } & User_Key;
      professionalType: ProfessionalType;
      professionalRegistration?: string | null;
    } & Professional_Key;
    ubs?: {
      id: UUIDString;
      name: string;
    } & UBS_Key;
    patient?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
    applicationDate: TimestampString;
    doseNumber?: number | null;
    notes?: string | null;
  } & Application_Key)[];
}
```
### Using `ListApplicationsByPatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listApplicationsByPatient, ListApplicationsByPatientVariables } from '@dataconnect/generated';

// The `ListApplicationsByPatient` query requires an argument of type `ListApplicationsByPatientVariables`:
const listApplicationsByPatientVars: ListApplicationsByPatientVariables = {
  patientId: ..., 
};

// Call the `listApplicationsByPatient()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listApplicationsByPatient(listApplicationsByPatientVars);
// Variables can be defined inline as well.
const { data } = await listApplicationsByPatient({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listApplicationsByPatient(dataConnect, listApplicationsByPatientVars);

console.log(data.applications);

// Or, you can use the `Promise` API.
listApplicationsByPatient(listApplicationsByPatientVars).then((response) => {
  const data = response.data;
  console.log(data.applications);
});
```

### Using `ListApplicationsByPatient`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listApplicationsByPatientRef, ListApplicationsByPatientVariables } from '@dataconnect/generated';

// The `ListApplicationsByPatient` query requires an argument of type `ListApplicationsByPatientVariables`:
const listApplicationsByPatientVars: ListApplicationsByPatientVariables = {
  patientId: ..., 
};

// Call the `listApplicationsByPatientRef()` function to get a reference to the query.
const ref = listApplicationsByPatientRef(listApplicationsByPatientVars);
// Variables can be defined inline as well.
const ref = listApplicationsByPatientRef({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listApplicationsByPatientRef(dataConnect, listApplicationsByPatientVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.applications);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.applications);
});
```

## ListAdminApplicationsByPatient
You can execute the `ListAdminApplicationsByPatient` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAdminApplicationsByPatient(vars: ListAdminApplicationsByPatientVariables, options?: ExecuteQueryOptions): QueryPromise<ListAdminApplicationsByPatientData, ListAdminApplicationsByPatientVariables>;

interface ListAdminApplicationsByPatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAdminApplicationsByPatientVariables): QueryRef<ListAdminApplicationsByPatientData, ListAdminApplicationsByPatientVariables>;
}
export const listAdminApplicationsByPatientRef: ListAdminApplicationsByPatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAdminApplicationsByPatient(dc: DataConnect, vars: ListAdminApplicationsByPatientVariables, options?: ExecuteQueryOptions): QueryPromise<ListAdminApplicationsByPatientData, ListAdminApplicationsByPatientVariables>;

interface ListAdminApplicationsByPatientRef {
  ...
  (dc: DataConnect, vars: ListAdminApplicationsByPatientVariables): QueryRef<ListAdminApplicationsByPatientData, ListAdminApplicationsByPatientVariables>;
}
export const listAdminApplicationsByPatientRef: ListAdminApplicationsByPatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAdminApplicationsByPatientRef:
```typescript
const name = listAdminApplicationsByPatientRef.operationName;
console.log(name);
```

### Variables
The `ListAdminApplicationsByPatient` query requires an argument of type `ListAdminApplicationsByPatientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAdminApplicationsByPatientVariables {
  patientId: UUIDString;
}
```
### Return Type
Recall that executing the `ListAdminApplicationsByPatient` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAdminApplicationsByPatientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAdminApplicationsByPatientData {
  applications: ({
    id: UUIDString;
    patientIdSnapshot: UUIDString;
    patientLegacyPersonIdSnapshot?: string | null;
    patientNameSnapshot: string;
    vaccineNameSnapshot: string;
    lotSnapshot?: string | null;
    manufacturerSnapshot?: string | null;
    facilityNameSnapshot: string;
    professionalNameSnapshot: string;
    professionalRegistrationSnapshot?: string | null;
    doseLabel?: string | null;
    nextDoseAt?: TimestampString | null;
    source?: string | null;
    voidedAt?: TimestampString | null;
    voidedByAuthUid?: string | null;
    voidReason?: string | null;
    vaccine?: {
      id: UUIDString;
      name: string;
      requiredDoses: number;
    } & Vaccine_Key;
    batch?: {
      id: UUIDString;
      manufacturer: string;
      batchCode: string;
      expirationDate: DateString;
    } & Batch_Key;
    appointment?: {
      id: UUIDString;
      scheduledAt: TimestampString;
      status: AppointmentStatus;
    } & Appointment_Key;
    professional?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
      } & User_Key;
      professionalType: ProfessionalType;
      professionalRegistration?: string | null;
    } & Professional_Key;
    ubs?: {
      id: UUIDString;
      name: string;
    } & UBS_Key;
    patient?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
    applicationDate: TimestampString;
    doseNumber?: number | null;
    notes?: string | null;
  } & Application_Key)[];
}
```
### Using `ListAdminApplicationsByPatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAdminApplicationsByPatient, ListAdminApplicationsByPatientVariables } from '@dataconnect/generated';

// The `ListAdminApplicationsByPatient` query requires an argument of type `ListAdminApplicationsByPatientVariables`:
const listAdminApplicationsByPatientVars: ListAdminApplicationsByPatientVariables = {
  patientId: ..., 
};

// Call the `listAdminApplicationsByPatient()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAdminApplicationsByPatient(listAdminApplicationsByPatientVars);
// Variables can be defined inline as well.
const { data } = await listAdminApplicationsByPatient({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAdminApplicationsByPatient(dataConnect, listAdminApplicationsByPatientVars);

console.log(data.applications);

// Or, you can use the `Promise` API.
listAdminApplicationsByPatient(listAdminApplicationsByPatientVars).then((response) => {
  const data = response.data;
  console.log(data.applications);
});
```

### Using `ListAdminApplicationsByPatient`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAdminApplicationsByPatientRef, ListAdminApplicationsByPatientVariables } from '@dataconnect/generated';

// The `ListAdminApplicationsByPatient` query requires an argument of type `ListAdminApplicationsByPatientVariables`:
const listAdminApplicationsByPatientVars: ListAdminApplicationsByPatientVariables = {
  patientId: ..., 
};

// Call the `listAdminApplicationsByPatientRef()` function to get a reference to the query.
const ref = listAdminApplicationsByPatientRef(listAdminApplicationsByPatientVars);
// Variables can be defined inline as well.
const ref = listAdminApplicationsByPatientRef({ patientId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAdminApplicationsByPatientRef(dataConnect, listAdminApplicationsByPatientVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.applications);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.applications);
});
```

## ListApplicationsByVaccine
You can execute the `ListApplicationsByVaccine` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listApplicationsByVaccine(vars: ListApplicationsByVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<ListApplicationsByVaccineData, ListApplicationsByVaccineVariables>;

interface ListApplicationsByVaccineRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListApplicationsByVaccineVariables): QueryRef<ListApplicationsByVaccineData, ListApplicationsByVaccineVariables>;
}
export const listApplicationsByVaccineRef: ListApplicationsByVaccineRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listApplicationsByVaccine(dc: DataConnect, vars: ListApplicationsByVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<ListApplicationsByVaccineData, ListApplicationsByVaccineVariables>;

interface ListApplicationsByVaccineRef {
  ...
  (dc: DataConnect, vars: ListApplicationsByVaccineVariables): QueryRef<ListApplicationsByVaccineData, ListApplicationsByVaccineVariables>;
}
export const listApplicationsByVaccineRef: ListApplicationsByVaccineRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listApplicationsByVaccineRef:
```typescript
const name = listApplicationsByVaccineRef.operationName;
console.log(name);
```

### Variables
The `ListApplicationsByVaccine` query requires an argument of type `ListApplicationsByVaccineVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListApplicationsByVaccineVariables {
  vaccineId: UUIDString;
}
```
### Return Type
Recall that executing the `ListApplicationsByVaccine` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListApplicationsByVaccineData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListApplicationsByVaccineData {
  applications: ({
    id: UUIDString;
    patientIdSnapshot: UUIDString;
    patientLegacyPersonIdSnapshot?: string | null;
    patientNameSnapshot: string;
    vaccineNameSnapshot: string;
    facilityNameSnapshot: string;
    professionalNameSnapshot: string;
    professionalRegistrationSnapshot?: string | null;
    voidedAt?: TimestampString | null;
    voidReason?: string | null;
    patient?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
    professional?: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
      } & User_Key;
    } & Professional_Key;
    ubs?: {
      id: UUIDString;
      name: string;
    } & UBS_Key;
    applicationDate: TimestampString;
    doseNumber?: number | null;
    notes?: string | null;
  } & Application_Key)[];
}
```
### Using `ListApplicationsByVaccine`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listApplicationsByVaccine, ListApplicationsByVaccineVariables } from '@dataconnect/generated';

// The `ListApplicationsByVaccine` query requires an argument of type `ListApplicationsByVaccineVariables`:
const listApplicationsByVaccineVars: ListApplicationsByVaccineVariables = {
  vaccineId: ..., 
};

// Call the `listApplicationsByVaccine()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listApplicationsByVaccine(listApplicationsByVaccineVars);
// Variables can be defined inline as well.
const { data } = await listApplicationsByVaccine({ vaccineId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listApplicationsByVaccine(dataConnect, listApplicationsByVaccineVars);

console.log(data.applications);

// Or, you can use the `Promise` API.
listApplicationsByVaccine(listApplicationsByVaccineVars).then((response) => {
  const data = response.data;
  console.log(data.applications);
});
```

### Using `ListApplicationsByVaccine`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listApplicationsByVaccineRef, ListApplicationsByVaccineVariables } from '@dataconnect/generated';

// The `ListApplicationsByVaccine` query requires an argument of type `ListApplicationsByVaccineVariables`:
const listApplicationsByVaccineVars: ListApplicationsByVaccineVariables = {
  vaccineId: ..., 
};

// Call the `listApplicationsByVaccineRef()` function to get a reference to the query.
const ref = listApplicationsByVaccineRef(listApplicationsByVaccineVars);
// Variables can be defined inline as well.
const ref = listApplicationsByVaccineRef({ vaccineId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listApplicationsByVaccineRef(dataConnect, listApplicationsByVaccineVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.applications);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.applications);
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

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  name: string;
  birthDate: DateString;
  email: string;
  status: UserStatus;
  cpf: string;
  sex?: string | null;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  name: ..., 
  birthDate: ..., 
  email: ..., 
  status: ..., 
  cpf: ..., 
  sex: ..., // optional
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ name: ..., birthDate: ..., email: ..., status: ..., cpf: ..., sex: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  name: ..., 
  birthDate: ..., 
  email: ..., 
  status: ..., 
  cpf: ..., 
  sex: ..., // optional
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ name: ..., birthDate: ..., email: ..., status: ..., cpf: ..., sex: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

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

## UpdateUser
You can execute the `UpdateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUser(vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface UpdateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
}
export const updateUserRef: UpdateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUser(dc: DataConnect, vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface UpdateUserRef {
  ...
  (dc: DataConnect, vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
}
export const updateUserRef: UpdateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserRef:
```typescript
const name = updateUserRef.operationName;
console.log(name);
```

### Variables
The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserVariables {
  id: UUIDString;
  name?: string | null;
  birthDate?: DateString | null;
  email?: string | null;
  status?: UserStatus | null;
  cpf?: string | null;
  sex?: string | null;
}
```
### Return Type
Recall that executing the `UpdateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUser, UpdateUserVariables } from '@dataconnect/generated';

// The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`:
const updateUserVars: UpdateUserVariables = {
  id: ..., 
  name: ..., // optional
  birthDate: ..., // optional
  email: ..., // optional
  status: ..., // optional
  cpf: ..., // optional
  sex: ..., // optional
};

// Call the `updateUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUser(updateUserVars);
// Variables can be defined inline as well.
const { data } = await updateUser({ id: ..., name: ..., birthDate: ..., email: ..., status: ..., cpf: ..., sex: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUser(dataConnect, updateUserVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUser(updateUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserRef, UpdateUserVariables } from '@dataconnect/generated';

// The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`:
const updateUserVars: UpdateUserVariables = {
  id: ..., 
  name: ..., // optional
  birthDate: ..., // optional
  email: ..., // optional
  status: ..., // optional
  cpf: ..., // optional
  sex: ..., // optional
};

// Call the `updateUserRef()` function to get a reference to the mutation.
const ref = updateUserRef(updateUserVars);
// Variables can be defined inline as well.
const ref = updateUserRef({ id: ..., name: ..., birthDate: ..., email: ..., status: ..., cpf: ..., sex: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserRef(dataConnect, updateUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## DeleteUnlinkedUser
You can execute the `DeleteUnlinkedUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteUnlinkedUser(vars: DeleteUnlinkedUserVariables): MutationPromise<DeleteUnlinkedUserData, DeleteUnlinkedUserVariables>;

interface DeleteUnlinkedUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUnlinkedUserVariables): MutationRef<DeleteUnlinkedUserData, DeleteUnlinkedUserVariables>;
}
export const deleteUnlinkedUserRef: DeleteUnlinkedUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUnlinkedUser(dc: DataConnect, vars: DeleteUnlinkedUserVariables): MutationPromise<DeleteUnlinkedUserData, DeleteUnlinkedUserVariables>;

interface DeleteUnlinkedUserRef {
  ...
  (dc: DataConnect, vars: DeleteUnlinkedUserVariables): MutationRef<DeleteUnlinkedUserData, DeleteUnlinkedUserVariables>;
}
export const deleteUnlinkedUserRef: DeleteUnlinkedUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUnlinkedUserRef:
```typescript
const name = deleteUnlinkedUserRef.operationName;
console.log(name);
```

### Variables
The `DeleteUnlinkedUser` mutation requires an argument of type `DeleteUnlinkedUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteUnlinkedUserVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteUnlinkedUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUnlinkedUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUnlinkedUserData {
  user_delete?: User_Key | null;
}
```
### Using `DeleteUnlinkedUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUnlinkedUser, DeleteUnlinkedUserVariables } from '@dataconnect/generated';

// The `DeleteUnlinkedUser` mutation requires an argument of type `DeleteUnlinkedUserVariables`:
const deleteUnlinkedUserVars: DeleteUnlinkedUserVariables = {
  id: ..., 
};

// Call the `deleteUnlinkedUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUnlinkedUser(deleteUnlinkedUserVars);
// Variables can be defined inline as well.
const { data } = await deleteUnlinkedUser({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUnlinkedUser(dataConnect, deleteUnlinkedUserVars);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
deleteUnlinkedUser(deleteUnlinkedUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

### Using `DeleteUnlinkedUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUnlinkedUserRef, DeleteUnlinkedUserVariables } from '@dataconnect/generated';

// The `DeleteUnlinkedUser` mutation requires an argument of type `DeleteUnlinkedUserVariables`:
const deleteUnlinkedUserVars: DeleteUnlinkedUserVariables = {
  id: ..., 
};

// Call the `deleteUnlinkedUserRef()` function to get a reference to the mutation.
const ref = deleteUnlinkedUserRef(deleteUnlinkedUserVars);
// Variables can be defined inline as well.
const ref = deleteUnlinkedUserRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUnlinkedUserRef(dataConnect, deleteUnlinkedUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

## CreatePatient
You can execute the `CreatePatient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPatient(vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;

interface CreatePatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
}
export const createPatientRef: CreatePatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPatient(dc: DataConnect, vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;

interface CreatePatientRef {
  ...
  (dc: DataConnect, vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
}
export const createPatientRef: CreatePatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPatientRef:
```typescript
const name = createPatientRef.operationName;
console.log(name);
```

### Variables
The `CreatePatient` mutation requires an argument of type `CreatePatientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePatientVariables {
  userId: UUIDString;
  patientType: PatientType;
  responsibleId?: UUIDString | null;
  motherName?: string | null;
}
```
### Return Type
Recall that executing the `CreatePatient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePatientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePatientData {
  patient_insert: Patient_Key;
}
```
### Using `CreatePatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPatient, CreatePatientVariables } from '@dataconnect/generated';

// The `CreatePatient` mutation requires an argument of type `CreatePatientVariables`:
const createPatientVars: CreatePatientVariables = {
  userId: ..., 
  patientType: ..., 
  responsibleId: ..., // optional
  motherName: ..., // optional
};

// Call the `createPatient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPatient(createPatientVars);
// Variables can be defined inline as well.
const { data } = await createPatient({ userId: ..., patientType: ..., responsibleId: ..., motherName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPatient(dataConnect, createPatientVars);

console.log(data.patient_insert);

// Or, you can use the `Promise` API.
createPatient(createPatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient_insert);
});
```

### Using `CreatePatient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPatientRef, CreatePatientVariables } from '@dataconnect/generated';

// The `CreatePatient` mutation requires an argument of type `CreatePatientVariables`:
const createPatientVars: CreatePatientVariables = {
  userId: ..., 
  patientType: ..., 
  responsibleId: ..., // optional
  motherName: ..., // optional
};

// Call the `createPatientRef()` function to get a reference to the mutation.
const ref = createPatientRef(createPatientVars);
// Variables can be defined inline as well.
const ref = createPatientRef({ userId: ..., patientType: ..., responsibleId: ..., motherName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPatientRef(dataConnect, createPatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patient_insert);
});
```

## UpdatePatient
You can execute the `UpdatePatient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePatient(vars: UpdatePatientVariables): MutationPromise<UpdatePatientData, UpdatePatientVariables>;

interface UpdatePatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePatientVariables): MutationRef<UpdatePatientData, UpdatePatientVariables>;
}
export const updatePatientRef: UpdatePatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePatient(dc: DataConnect, vars: UpdatePatientVariables): MutationPromise<UpdatePatientData, UpdatePatientVariables>;

interface UpdatePatientRef {
  ...
  (dc: DataConnect, vars: UpdatePatientVariables): MutationRef<UpdatePatientData, UpdatePatientVariables>;
}
export const updatePatientRef: UpdatePatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePatientRef:
```typescript
const name = updatePatientRef.operationName;
console.log(name);
```

### Variables
The `UpdatePatient` mutation requires an argument of type `UpdatePatientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePatientVariables {
  id: UUIDString;
  patientType?: PatientType | null;
  responsibleId?: UUIDString | null;
  motherName?: string | null;
}
```
### Return Type
Recall that executing the `UpdatePatient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePatientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePatientData {
  patient_update?: Patient_Key | null;
}
```
### Using `UpdatePatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePatient, UpdatePatientVariables } from '@dataconnect/generated';

// The `UpdatePatient` mutation requires an argument of type `UpdatePatientVariables`:
const updatePatientVars: UpdatePatientVariables = {
  id: ..., 
  patientType: ..., // optional
  responsibleId: ..., // optional
  motherName: ..., // optional
};

// Call the `updatePatient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePatient(updatePatientVars);
// Variables can be defined inline as well.
const { data } = await updatePatient({ id: ..., patientType: ..., responsibleId: ..., motherName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePatient(dataConnect, updatePatientVars);

console.log(data.patient_update);

// Or, you can use the `Promise` API.
updatePatient(updatePatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient_update);
});
```

### Using `UpdatePatient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePatientRef, UpdatePatientVariables } from '@dataconnect/generated';

// The `UpdatePatient` mutation requires an argument of type `UpdatePatientVariables`:
const updatePatientVars: UpdatePatientVariables = {
  id: ..., 
  patientType: ..., // optional
  responsibleId: ..., // optional
  motherName: ..., // optional
};

// Call the `updatePatientRef()` function to get a reference to the mutation.
const ref = updatePatientRef(updatePatientVars);
// Variables can be defined inline as well.
const ref = updatePatientRef({ id: ..., patientType: ..., responsibleId: ..., motherName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePatientRef(dataConnect, updatePatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patient_update);
});
```

## ArchivePatient
You can execute the `ArchivePatient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
archivePatient(vars: ArchivePatientVariables): MutationPromise<ArchivePatientData, ArchivePatientVariables>;

interface ArchivePatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ArchivePatientVariables): MutationRef<ArchivePatientData, ArchivePatientVariables>;
}
export const archivePatientRef: ArchivePatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
archivePatient(dc: DataConnect, vars: ArchivePatientVariables): MutationPromise<ArchivePatientData, ArchivePatientVariables>;

interface ArchivePatientRef {
  ...
  (dc: DataConnect, vars: ArchivePatientVariables): MutationRef<ArchivePatientData, ArchivePatientVariables>;
}
export const archivePatientRef: ArchivePatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the archivePatientRef:
```typescript
const name = archivePatientRef.operationName;
console.log(name);
```

### Variables
The `ArchivePatient` mutation requires an argument of type `ArchivePatientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ArchivePatientVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `ArchivePatient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ArchivePatientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ArchivePatientData {
  patient_update?: Patient_Key | null;
}
```
### Using `ArchivePatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, archivePatient, ArchivePatientVariables } from '@dataconnect/generated';

// The `ArchivePatient` mutation requires an argument of type `ArchivePatientVariables`:
const archivePatientVars: ArchivePatientVariables = {
  id: ..., 
};

// Call the `archivePatient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await archivePatient(archivePatientVars);
// Variables can be defined inline as well.
const { data } = await archivePatient({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await archivePatient(dataConnect, archivePatientVars);

console.log(data.patient_update);

// Or, you can use the `Promise` API.
archivePatient(archivePatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient_update);
});
```

### Using `ArchivePatient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, archivePatientRef, ArchivePatientVariables } from '@dataconnect/generated';

// The `ArchivePatient` mutation requires an argument of type `ArchivePatientVariables`:
const archivePatientVars: ArchivePatientVariables = {
  id: ..., 
};

// Call the `archivePatientRef()` function to get a reference to the mutation.
const ref = archivePatientRef(archivePatientVars);
// Variables can be defined inline as well.
const ref = archivePatientRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = archivePatientRef(dataConnect, archivePatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patient_update);
});
```

## CreateUbs
You can execute the `CreateUbs` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUbs(vars: CreateUbsVariables): MutationPromise<CreateUbsData, CreateUbsVariables>;

interface CreateUbsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUbsVariables): MutationRef<CreateUbsData, CreateUbsVariables>;
}
export const createUbsRef: CreateUbsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUbs(dc: DataConnect, vars: CreateUbsVariables): MutationPromise<CreateUbsData, CreateUbsVariables>;

interface CreateUbsRef {
  ...
  (dc: DataConnect, vars: CreateUbsVariables): MutationRef<CreateUbsData, CreateUbsVariables>;
}
export const createUbsRef: CreateUbsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUbsRef:
```typescript
const name = createUbsRef.operationName;
console.log(name);
```

### Variables
The `CreateUbs` mutation requires an argument of type `CreateUbsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUbsVariables {
  name: string;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
}
```
### Return Type
Recall that executing the `CreateUbs` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUbsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUbsData {
  uBS_insert: UBS_Key;
}
```
### Using `CreateUbs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUbs, CreateUbsVariables } from '@dataconnect/generated';

// The `CreateUbs` mutation requires an argument of type `CreateUbsVariables`:
const createUbsVars: CreateUbsVariables = {
  name: ..., 
  logradouro: ..., // optional
  numero: ..., // optional
  bairro: ..., // optional
  cidade: ..., // optional
  cep: ..., // optional
};

// Call the `createUbs()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUbs(createUbsVars);
// Variables can be defined inline as well.
const { data } = await createUbs({ name: ..., logradouro: ..., numero: ..., bairro: ..., cidade: ..., cep: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUbs(dataConnect, createUbsVars);

console.log(data.uBS_insert);

// Or, you can use the `Promise` API.
createUbs(createUbsVars).then((response) => {
  const data = response.data;
  console.log(data.uBS_insert);
});
```

### Using `CreateUbs`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUbsRef, CreateUbsVariables } from '@dataconnect/generated';

// The `CreateUbs` mutation requires an argument of type `CreateUbsVariables`:
const createUbsVars: CreateUbsVariables = {
  name: ..., 
  logradouro: ..., // optional
  numero: ..., // optional
  bairro: ..., // optional
  cidade: ..., // optional
  cep: ..., // optional
};

// Call the `createUbsRef()` function to get a reference to the mutation.
const ref = createUbsRef(createUbsVars);
// Variables can be defined inline as well.
const ref = createUbsRef({ name: ..., logradouro: ..., numero: ..., bairro: ..., cidade: ..., cep: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUbsRef(dataConnect, createUbsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.uBS_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.uBS_insert);
});
```

## UpdateUbs
You can execute the `UpdateUbs` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUbs(vars: UpdateUbsVariables): MutationPromise<UpdateUbsData, UpdateUbsVariables>;

interface UpdateUbsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUbsVariables): MutationRef<UpdateUbsData, UpdateUbsVariables>;
}
export const updateUbsRef: UpdateUbsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUbs(dc: DataConnect, vars: UpdateUbsVariables): MutationPromise<UpdateUbsData, UpdateUbsVariables>;

interface UpdateUbsRef {
  ...
  (dc: DataConnect, vars: UpdateUbsVariables): MutationRef<UpdateUbsData, UpdateUbsVariables>;
}
export const updateUbsRef: UpdateUbsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUbsRef:
```typescript
const name = updateUbsRef.operationName;
console.log(name);
```

### Variables
The `UpdateUbs` mutation requires an argument of type `UpdateUbsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUbsVariables {
  id: UUIDString;
  name?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
}
```
### Return Type
Recall that executing the `UpdateUbs` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUbsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUbsData {
  uBS_update?: UBS_Key | null;
}
```
### Using `UpdateUbs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUbs, UpdateUbsVariables } from '@dataconnect/generated';

// The `UpdateUbs` mutation requires an argument of type `UpdateUbsVariables`:
const updateUbsVars: UpdateUbsVariables = {
  id: ..., 
  name: ..., // optional
  logradouro: ..., // optional
  numero: ..., // optional
  bairro: ..., // optional
  cidade: ..., // optional
  cep: ..., // optional
};

// Call the `updateUbs()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUbs(updateUbsVars);
// Variables can be defined inline as well.
const { data } = await updateUbs({ id: ..., name: ..., logradouro: ..., numero: ..., bairro: ..., cidade: ..., cep: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUbs(dataConnect, updateUbsVars);

console.log(data.uBS_update);

// Or, you can use the `Promise` API.
updateUbs(updateUbsVars).then((response) => {
  const data = response.data;
  console.log(data.uBS_update);
});
```

### Using `UpdateUbs`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUbsRef, UpdateUbsVariables } from '@dataconnect/generated';

// The `UpdateUbs` mutation requires an argument of type `UpdateUbsVariables`:
const updateUbsVars: UpdateUbsVariables = {
  id: ..., 
  name: ..., // optional
  logradouro: ..., // optional
  numero: ..., // optional
  bairro: ..., // optional
  cidade: ..., // optional
  cep: ..., // optional
};

// Call the `updateUbsRef()` function to get a reference to the mutation.
const ref = updateUbsRef(updateUbsVars);
// Variables can be defined inline as well.
const ref = updateUbsRef({ id: ..., name: ..., logradouro: ..., numero: ..., bairro: ..., cidade: ..., cep: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUbsRef(dataConnect, updateUbsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.uBS_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.uBS_update);
});
```

## ArchiveUbs
You can execute the `ArchiveUbs` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
archiveUbs(vars: ArchiveUbsVariables): MutationPromise<ArchiveUbsData, ArchiveUbsVariables>;

interface ArchiveUbsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ArchiveUbsVariables): MutationRef<ArchiveUbsData, ArchiveUbsVariables>;
}
export const archiveUbsRef: ArchiveUbsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
archiveUbs(dc: DataConnect, vars: ArchiveUbsVariables): MutationPromise<ArchiveUbsData, ArchiveUbsVariables>;

interface ArchiveUbsRef {
  ...
  (dc: DataConnect, vars: ArchiveUbsVariables): MutationRef<ArchiveUbsData, ArchiveUbsVariables>;
}
export const archiveUbsRef: ArchiveUbsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the archiveUbsRef:
```typescript
const name = archiveUbsRef.operationName;
console.log(name);
```

### Variables
The `ArchiveUbs` mutation requires an argument of type `ArchiveUbsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ArchiveUbsVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `ArchiveUbs` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ArchiveUbsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ArchiveUbsData {
  uBS_update?: UBS_Key | null;
}
```
### Using `ArchiveUbs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, archiveUbs, ArchiveUbsVariables } from '@dataconnect/generated';

// The `ArchiveUbs` mutation requires an argument of type `ArchiveUbsVariables`:
const archiveUbsVars: ArchiveUbsVariables = {
  id: ..., 
};

// Call the `archiveUbs()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await archiveUbs(archiveUbsVars);
// Variables can be defined inline as well.
const { data } = await archiveUbs({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await archiveUbs(dataConnect, archiveUbsVars);

console.log(data.uBS_update);

// Or, you can use the `Promise` API.
archiveUbs(archiveUbsVars).then((response) => {
  const data = response.data;
  console.log(data.uBS_update);
});
```

### Using `ArchiveUbs`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, archiveUbsRef, ArchiveUbsVariables } from '@dataconnect/generated';

// The `ArchiveUbs` mutation requires an argument of type `ArchiveUbsVariables`:
const archiveUbsVars: ArchiveUbsVariables = {
  id: ..., 
};

// Call the `archiveUbsRef()` function to get a reference to the mutation.
const ref = archiveUbsRef(archiveUbsVars);
// Variables can be defined inline as well.
const ref = archiveUbsRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = archiveUbsRef(dataConnect, archiveUbsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.uBS_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.uBS_update);
});
```

## CreateProfessional
You can execute the `CreateProfessional` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createProfessional(vars: CreateProfessionalVariables): MutationPromise<CreateProfessionalData, CreateProfessionalVariables>;

interface CreateProfessionalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProfessionalVariables): MutationRef<CreateProfessionalData, CreateProfessionalVariables>;
}
export const createProfessionalRef: CreateProfessionalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createProfessional(dc: DataConnect, vars: CreateProfessionalVariables): MutationPromise<CreateProfessionalData, CreateProfessionalVariables>;

interface CreateProfessionalRef {
  ...
  (dc: DataConnect, vars: CreateProfessionalVariables): MutationRef<CreateProfessionalData, CreateProfessionalVariables>;
}
export const createProfessionalRef: CreateProfessionalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createProfessionalRef:
```typescript
const name = createProfessionalRef.operationName;
console.log(name);
```

### Variables
The `CreateProfessional` mutation requires an argument of type `CreateProfessionalVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateProfessionalVariables {
  userId: UUIDString;
  professionalType: ProfessionalType;
  professionalRegistration?: string | null;
  ubsId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `CreateProfessional` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateProfessionalData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateProfessionalData {
  professional_insert: Professional_Key;
}
```
### Using `CreateProfessional`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createProfessional, CreateProfessionalVariables } from '@dataconnect/generated';

// The `CreateProfessional` mutation requires an argument of type `CreateProfessionalVariables`:
const createProfessionalVars: CreateProfessionalVariables = {
  userId: ..., 
  professionalType: ..., 
  professionalRegistration: ..., // optional
  ubsId: ..., // optional
};

// Call the `createProfessional()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createProfessional(createProfessionalVars);
// Variables can be defined inline as well.
const { data } = await createProfessional({ userId: ..., professionalType: ..., professionalRegistration: ..., ubsId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createProfessional(dataConnect, createProfessionalVars);

console.log(data.professional_insert);

// Or, you can use the `Promise` API.
createProfessional(createProfessionalVars).then((response) => {
  const data = response.data;
  console.log(data.professional_insert);
});
```

### Using `CreateProfessional`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createProfessionalRef, CreateProfessionalVariables } from '@dataconnect/generated';

// The `CreateProfessional` mutation requires an argument of type `CreateProfessionalVariables`:
const createProfessionalVars: CreateProfessionalVariables = {
  userId: ..., 
  professionalType: ..., 
  professionalRegistration: ..., // optional
  ubsId: ..., // optional
};

// Call the `createProfessionalRef()` function to get a reference to the mutation.
const ref = createProfessionalRef(createProfessionalVars);
// Variables can be defined inline as well.
const ref = createProfessionalRef({ userId: ..., professionalType: ..., professionalRegistration: ..., ubsId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createProfessionalRef(dataConnect, createProfessionalVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.professional_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.professional_insert);
});
```

## UpdateProfessional
You can execute the `UpdateProfessional` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateProfessional(vars: UpdateProfessionalVariables): MutationPromise<UpdateProfessionalData, UpdateProfessionalVariables>;

interface UpdateProfessionalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProfessionalVariables): MutationRef<UpdateProfessionalData, UpdateProfessionalVariables>;
}
export const updateProfessionalRef: UpdateProfessionalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateProfessional(dc: DataConnect, vars: UpdateProfessionalVariables): MutationPromise<UpdateProfessionalData, UpdateProfessionalVariables>;

interface UpdateProfessionalRef {
  ...
  (dc: DataConnect, vars: UpdateProfessionalVariables): MutationRef<UpdateProfessionalData, UpdateProfessionalVariables>;
}
export const updateProfessionalRef: UpdateProfessionalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateProfessionalRef:
```typescript
const name = updateProfessionalRef.operationName;
console.log(name);
```

### Variables
The `UpdateProfessional` mutation requires an argument of type `UpdateProfessionalVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateProfessionalVariables {
  id: UUIDString;
  professionalType?: ProfessionalType | null;
  professionalRegistration?: string | null;
  ubsId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `UpdateProfessional` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateProfessionalData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateProfessionalData {
  professional_update?: Professional_Key | null;
}
```
### Using `UpdateProfessional`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateProfessional, UpdateProfessionalVariables } from '@dataconnect/generated';

// The `UpdateProfessional` mutation requires an argument of type `UpdateProfessionalVariables`:
const updateProfessionalVars: UpdateProfessionalVariables = {
  id: ..., 
  professionalType: ..., // optional
  professionalRegistration: ..., // optional
  ubsId: ..., // optional
};

// Call the `updateProfessional()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateProfessional(updateProfessionalVars);
// Variables can be defined inline as well.
const { data } = await updateProfessional({ id: ..., professionalType: ..., professionalRegistration: ..., ubsId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateProfessional(dataConnect, updateProfessionalVars);

console.log(data.professional_update);

// Or, you can use the `Promise` API.
updateProfessional(updateProfessionalVars).then((response) => {
  const data = response.data;
  console.log(data.professional_update);
});
```

### Using `UpdateProfessional`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateProfessionalRef, UpdateProfessionalVariables } from '@dataconnect/generated';

// The `UpdateProfessional` mutation requires an argument of type `UpdateProfessionalVariables`:
const updateProfessionalVars: UpdateProfessionalVariables = {
  id: ..., 
  professionalType: ..., // optional
  professionalRegistration: ..., // optional
  ubsId: ..., // optional
};

// Call the `updateProfessionalRef()` function to get a reference to the mutation.
const ref = updateProfessionalRef(updateProfessionalVars);
// Variables can be defined inline as well.
const ref = updateProfessionalRef({ id: ..., professionalType: ..., professionalRegistration: ..., ubsId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateProfessionalRef(dataConnect, updateProfessionalVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.professional_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.professional_update);
});
```

## ArchiveProfessional
You can execute the `ArchiveProfessional` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
archiveProfessional(vars: ArchiveProfessionalVariables): MutationPromise<ArchiveProfessionalData, ArchiveProfessionalVariables>;

interface ArchiveProfessionalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ArchiveProfessionalVariables): MutationRef<ArchiveProfessionalData, ArchiveProfessionalVariables>;
}
export const archiveProfessionalRef: ArchiveProfessionalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
archiveProfessional(dc: DataConnect, vars: ArchiveProfessionalVariables): MutationPromise<ArchiveProfessionalData, ArchiveProfessionalVariables>;

interface ArchiveProfessionalRef {
  ...
  (dc: DataConnect, vars: ArchiveProfessionalVariables): MutationRef<ArchiveProfessionalData, ArchiveProfessionalVariables>;
}
export const archiveProfessionalRef: ArchiveProfessionalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the archiveProfessionalRef:
```typescript
const name = archiveProfessionalRef.operationName;
console.log(name);
```

### Variables
The `ArchiveProfessional` mutation requires an argument of type `ArchiveProfessionalVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ArchiveProfessionalVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `ArchiveProfessional` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ArchiveProfessionalData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ArchiveProfessionalData {
  professional_update?: Professional_Key | null;
}
```
### Using `ArchiveProfessional`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, archiveProfessional, ArchiveProfessionalVariables } from '@dataconnect/generated';

// The `ArchiveProfessional` mutation requires an argument of type `ArchiveProfessionalVariables`:
const archiveProfessionalVars: ArchiveProfessionalVariables = {
  id: ..., 
};

// Call the `archiveProfessional()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await archiveProfessional(archiveProfessionalVars);
// Variables can be defined inline as well.
const { data } = await archiveProfessional({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await archiveProfessional(dataConnect, archiveProfessionalVars);

console.log(data.professional_update);

// Or, you can use the `Promise` API.
archiveProfessional(archiveProfessionalVars).then((response) => {
  const data = response.data;
  console.log(data.professional_update);
});
```

### Using `ArchiveProfessional`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, archiveProfessionalRef, ArchiveProfessionalVariables } from '@dataconnect/generated';

// The `ArchiveProfessional` mutation requires an argument of type `ArchiveProfessionalVariables`:
const archiveProfessionalVars: ArchiveProfessionalVariables = {
  id: ..., 
};

// Call the `archiveProfessionalRef()` function to get a reference to the mutation.
const ref = archiveProfessionalRef(archiveProfessionalVars);
// Variables can be defined inline as well.
const ref = archiveProfessionalRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = archiveProfessionalRef(dataConnect, archiveProfessionalVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.professional_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.professional_update);
});
```

## CreateVaccine
You can execute the `CreateVaccine` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createVaccine(vars: CreateVaccineVariables): MutationPromise<CreateVaccineData, CreateVaccineVariables>;

interface CreateVaccineRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVaccineVariables): MutationRef<CreateVaccineData, CreateVaccineVariables>;
}
export const createVaccineRef: CreateVaccineRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createVaccine(dc: DataConnect, vars: CreateVaccineVariables): MutationPromise<CreateVaccineData, CreateVaccineVariables>;

interface CreateVaccineRef {
  ...
  (dc: DataConnect, vars: CreateVaccineVariables): MutationRef<CreateVaccineData, CreateVaccineVariables>;
}
export const createVaccineRef: CreateVaccineRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createVaccineRef:
```typescript
const name = createVaccineRef.operationName;
console.log(name);
```

### Variables
The `CreateVaccine` mutation requires an argument of type `CreateVaccineVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateVaccineVariables {
  name: string;
  description?: string | null;
  requiredDoses: number;
}
```
### Return Type
Recall that executing the `CreateVaccine` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateVaccineData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateVaccineData {
  vaccine_insert: Vaccine_Key;
}
```
### Using `CreateVaccine`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createVaccine, CreateVaccineVariables } from '@dataconnect/generated';

// The `CreateVaccine` mutation requires an argument of type `CreateVaccineVariables`:
const createVaccineVars: CreateVaccineVariables = {
  name: ..., 
  description: ..., // optional
  requiredDoses: ..., 
};

// Call the `createVaccine()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createVaccine(createVaccineVars);
// Variables can be defined inline as well.
const { data } = await createVaccine({ name: ..., description: ..., requiredDoses: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createVaccine(dataConnect, createVaccineVars);

console.log(data.vaccine_insert);

// Or, you can use the `Promise` API.
createVaccine(createVaccineVars).then((response) => {
  const data = response.data;
  console.log(data.vaccine_insert);
});
```

### Using `CreateVaccine`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createVaccineRef, CreateVaccineVariables } from '@dataconnect/generated';

// The `CreateVaccine` mutation requires an argument of type `CreateVaccineVariables`:
const createVaccineVars: CreateVaccineVariables = {
  name: ..., 
  description: ..., // optional
  requiredDoses: ..., 
};

// Call the `createVaccineRef()` function to get a reference to the mutation.
const ref = createVaccineRef(createVaccineVars);
// Variables can be defined inline as well.
const ref = createVaccineRef({ name: ..., description: ..., requiredDoses: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createVaccineRef(dataConnect, createVaccineVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.vaccine_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.vaccine_insert);
});
```

## UpdateVaccine
You can execute the `UpdateVaccine` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateVaccine(vars: UpdateVaccineVariables): MutationPromise<UpdateVaccineData, UpdateVaccineVariables>;

interface UpdateVaccineRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateVaccineVariables): MutationRef<UpdateVaccineData, UpdateVaccineVariables>;
}
export const updateVaccineRef: UpdateVaccineRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateVaccine(dc: DataConnect, vars: UpdateVaccineVariables): MutationPromise<UpdateVaccineData, UpdateVaccineVariables>;

interface UpdateVaccineRef {
  ...
  (dc: DataConnect, vars: UpdateVaccineVariables): MutationRef<UpdateVaccineData, UpdateVaccineVariables>;
}
export const updateVaccineRef: UpdateVaccineRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateVaccineRef:
```typescript
const name = updateVaccineRef.operationName;
console.log(name);
```

### Variables
The `UpdateVaccine` mutation requires an argument of type `UpdateVaccineVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateVaccineVariables {
  id: UUIDString;
  name?: string | null;
  description?: string | null;
  requiredDoses?: number | null;
}
```
### Return Type
Recall that executing the `UpdateVaccine` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateVaccineData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateVaccineData {
  vaccine_update?: Vaccine_Key | null;
}
```
### Using `UpdateVaccine`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateVaccine, UpdateVaccineVariables } from '@dataconnect/generated';

// The `UpdateVaccine` mutation requires an argument of type `UpdateVaccineVariables`:
const updateVaccineVars: UpdateVaccineVariables = {
  id: ..., 
  name: ..., // optional
  description: ..., // optional
  requiredDoses: ..., // optional
};

// Call the `updateVaccine()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateVaccine(updateVaccineVars);
// Variables can be defined inline as well.
const { data } = await updateVaccine({ id: ..., name: ..., description: ..., requiredDoses: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateVaccine(dataConnect, updateVaccineVars);

console.log(data.vaccine_update);

// Or, you can use the `Promise` API.
updateVaccine(updateVaccineVars).then((response) => {
  const data = response.data;
  console.log(data.vaccine_update);
});
```

### Using `UpdateVaccine`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateVaccineRef, UpdateVaccineVariables } from '@dataconnect/generated';

// The `UpdateVaccine` mutation requires an argument of type `UpdateVaccineVariables`:
const updateVaccineVars: UpdateVaccineVariables = {
  id: ..., 
  name: ..., // optional
  description: ..., // optional
  requiredDoses: ..., // optional
};

// Call the `updateVaccineRef()` function to get a reference to the mutation.
const ref = updateVaccineRef(updateVaccineVars);
// Variables can be defined inline as well.
const ref = updateVaccineRef({ id: ..., name: ..., description: ..., requiredDoses: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateVaccineRef(dataConnect, updateVaccineVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.vaccine_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.vaccine_update);
});
```

## ArchiveVaccine
You can execute the `ArchiveVaccine` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
archiveVaccine(vars: ArchiveVaccineVariables): MutationPromise<ArchiveVaccineData, ArchiveVaccineVariables>;

interface ArchiveVaccineRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ArchiveVaccineVariables): MutationRef<ArchiveVaccineData, ArchiveVaccineVariables>;
}
export const archiveVaccineRef: ArchiveVaccineRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
archiveVaccine(dc: DataConnect, vars: ArchiveVaccineVariables): MutationPromise<ArchiveVaccineData, ArchiveVaccineVariables>;

interface ArchiveVaccineRef {
  ...
  (dc: DataConnect, vars: ArchiveVaccineVariables): MutationRef<ArchiveVaccineData, ArchiveVaccineVariables>;
}
export const archiveVaccineRef: ArchiveVaccineRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the archiveVaccineRef:
```typescript
const name = archiveVaccineRef.operationName;
console.log(name);
```

### Variables
The `ArchiveVaccine` mutation requires an argument of type `ArchiveVaccineVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ArchiveVaccineVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `ArchiveVaccine` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ArchiveVaccineData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ArchiveVaccineData {
  vaccine_update?: Vaccine_Key | null;
}
```
### Using `ArchiveVaccine`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, archiveVaccine, ArchiveVaccineVariables } from '@dataconnect/generated';

// The `ArchiveVaccine` mutation requires an argument of type `ArchiveVaccineVariables`:
const archiveVaccineVars: ArchiveVaccineVariables = {
  id: ..., 
};

// Call the `archiveVaccine()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await archiveVaccine(archiveVaccineVars);
// Variables can be defined inline as well.
const { data } = await archiveVaccine({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await archiveVaccine(dataConnect, archiveVaccineVars);

console.log(data.vaccine_update);

// Or, you can use the `Promise` API.
archiveVaccine(archiveVaccineVars).then((response) => {
  const data = response.data;
  console.log(data.vaccine_update);
});
```

### Using `ArchiveVaccine`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, archiveVaccineRef, ArchiveVaccineVariables } from '@dataconnect/generated';

// The `ArchiveVaccine` mutation requires an argument of type `ArchiveVaccineVariables`:
const archiveVaccineVars: ArchiveVaccineVariables = {
  id: ..., 
};

// Call the `archiveVaccineRef()` function to get a reference to the mutation.
const ref = archiveVaccineRef(archiveVaccineVars);
// Variables can be defined inline as well.
const ref = archiveVaccineRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = archiveVaccineRef(dataConnect, archiveVaccineVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.vaccine_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.vaccine_update);
});
```

## CreateBatch
You can execute the `CreateBatch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createBatch(vars: CreateBatchVariables): MutationPromise<CreateBatchData, CreateBatchVariables>;

interface CreateBatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBatchVariables): MutationRef<CreateBatchData, CreateBatchVariables>;
}
export const createBatchRef: CreateBatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createBatch(dc: DataConnect, vars: CreateBatchVariables): MutationPromise<CreateBatchData, CreateBatchVariables>;

interface CreateBatchRef {
  ...
  (dc: DataConnect, vars: CreateBatchVariables): MutationRef<CreateBatchData, CreateBatchVariables>;
}
export const createBatchRef: CreateBatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createBatchRef:
```typescript
const name = createBatchRef.operationName;
console.log(name);
```

### Variables
The `CreateBatch` mutation requires an argument of type `CreateBatchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateBatchVariables {
  vaccineId: UUIDString;
  manufacturer: string;
  batchCode: string;
  initialQuantity: number;
  currentQuantity: number;
  manufacturingDate?: DateString | null;
  expirationDate: DateString;
}
```
### Return Type
Recall that executing the `CreateBatch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateBatchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateBatchData {
  batch_insert: Batch_Key;
}
```
### Using `CreateBatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createBatch, CreateBatchVariables } from '@dataconnect/generated';

// The `CreateBatch` mutation requires an argument of type `CreateBatchVariables`:
const createBatchVars: CreateBatchVariables = {
  vaccineId: ..., 
  manufacturer: ..., 
  batchCode: ..., 
  initialQuantity: ..., 
  currentQuantity: ..., 
  manufacturingDate: ..., // optional
  expirationDate: ..., 
};

// Call the `createBatch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createBatch(createBatchVars);
// Variables can be defined inline as well.
const { data } = await createBatch({ vaccineId: ..., manufacturer: ..., batchCode: ..., initialQuantity: ..., currentQuantity: ..., manufacturingDate: ..., expirationDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createBatch(dataConnect, createBatchVars);

console.log(data.batch_insert);

// Or, you can use the `Promise` API.
createBatch(createBatchVars).then((response) => {
  const data = response.data;
  console.log(data.batch_insert);
});
```

### Using `CreateBatch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createBatchRef, CreateBatchVariables } from '@dataconnect/generated';

// The `CreateBatch` mutation requires an argument of type `CreateBatchVariables`:
const createBatchVars: CreateBatchVariables = {
  vaccineId: ..., 
  manufacturer: ..., 
  batchCode: ..., 
  initialQuantity: ..., 
  currentQuantity: ..., 
  manufacturingDate: ..., // optional
  expirationDate: ..., 
};

// Call the `createBatchRef()` function to get a reference to the mutation.
const ref = createBatchRef(createBatchVars);
// Variables can be defined inline as well.
const ref = createBatchRef({ vaccineId: ..., manufacturer: ..., batchCode: ..., initialQuantity: ..., currentQuantity: ..., manufacturingDate: ..., expirationDate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createBatchRef(dataConnect, createBatchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.batch_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.batch_insert);
});
```

## UpdateBatch
You can execute the `UpdateBatch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateBatch(vars: UpdateBatchVariables): MutationPromise<UpdateBatchData, UpdateBatchVariables>;

interface UpdateBatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBatchVariables): MutationRef<UpdateBatchData, UpdateBatchVariables>;
}
export const updateBatchRef: UpdateBatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateBatch(dc: DataConnect, vars: UpdateBatchVariables): MutationPromise<UpdateBatchData, UpdateBatchVariables>;

interface UpdateBatchRef {
  ...
  (dc: DataConnect, vars: UpdateBatchVariables): MutationRef<UpdateBatchData, UpdateBatchVariables>;
}
export const updateBatchRef: UpdateBatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateBatchRef:
```typescript
const name = updateBatchRef.operationName;
console.log(name);
```

### Variables
The `UpdateBatch` mutation requires an argument of type `UpdateBatchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateBatchVariables {
  id: UUIDString;
  vaccineId?: UUIDString | null;
  manufacturer?: string | null;
  batchCode?: string | null;
  initialQuantity?: number | null;
  currentQuantity?: number | null;
  manufacturingDate?: DateString | null;
  expirationDate?: DateString | null;
}
```
### Return Type
Recall that executing the `UpdateBatch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateBatchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateBatchData {
  batch_update?: Batch_Key | null;
}
```
### Using `UpdateBatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateBatch, UpdateBatchVariables } from '@dataconnect/generated';

// The `UpdateBatch` mutation requires an argument of type `UpdateBatchVariables`:
const updateBatchVars: UpdateBatchVariables = {
  id: ..., 
  vaccineId: ..., // optional
  manufacturer: ..., // optional
  batchCode: ..., // optional
  initialQuantity: ..., // optional
  currentQuantity: ..., // optional
  manufacturingDate: ..., // optional
  expirationDate: ..., // optional
};

// Call the `updateBatch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateBatch(updateBatchVars);
// Variables can be defined inline as well.
const { data } = await updateBatch({ id: ..., vaccineId: ..., manufacturer: ..., batchCode: ..., initialQuantity: ..., currentQuantity: ..., manufacturingDate: ..., expirationDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateBatch(dataConnect, updateBatchVars);

console.log(data.batch_update);

// Or, you can use the `Promise` API.
updateBatch(updateBatchVars).then((response) => {
  const data = response.data;
  console.log(data.batch_update);
});
```

### Using `UpdateBatch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateBatchRef, UpdateBatchVariables } from '@dataconnect/generated';

// The `UpdateBatch` mutation requires an argument of type `UpdateBatchVariables`:
const updateBatchVars: UpdateBatchVariables = {
  id: ..., 
  vaccineId: ..., // optional
  manufacturer: ..., // optional
  batchCode: ..., // optional
  initialQuantity: ..., // optional
  currentQuantity: ..., // optional
  manufacturingDate: ..., // optional
  expirationDate: ..., // optional
};

// Call the `updateBatchRef()` function to get a reference to the mutation.
const ref = updateBatchRef(updateBatchVars);
// Variables can be defined inline as well.
const ref = updateBatchRef({ id: ..., vaccineId: ..., manufacturer: ..., batchCode: ..., initialQuantity: ..., currentQuantity: ..., manufacturingDate: ..., expirationDate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateBatchRef(dataConnect, updateBatchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.batch_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.batch_update);
});
```

## DeleteBatch
You can execute the `DeleteBatch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteBatch(vars: DeleteBatchVariables): MutationPromise<DeleteBatchData, DeleteBatchVariables>;

interface DeleteBatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteBatchVariables): MutationRef<DeleteBatchData, DeleteBatchVariables>;
}
export const deleteBatchRef: DeleteBatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteBatch(dc: DataConnect, vars: DeleteBatchVariables): MutationPromise<DeleteBatchData, DeleteBatchVariables>;

interface DeleteBatchRef {
  ...
  (dc: DataConnect, vars: DeleteBatchVariables): MutationRef<DeleteBatchData, DeleteBatchVariables>;
}
export const deleteBatchRef: DeleteBatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteBatchRef:
```typescript
const name = deleteBatchRef.operationName;
console.log(name);
```

### Variables
The `DeleteBatch` mutation requires an argument of type `DeleteBatchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteBatchVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteBatch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteBatchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteBatchData {
  batch_delete?: Batch_Key | null;
}
```
### Using `DeleteBatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteBatch, DeleteBatchVariables } from '@dataconnect/generated';

// The `DeleteBatch` mutation requires an argument of type `DeleteBatchVariables`:
const deleteBatchVars: DeleteBatchVariables = {
  id: ..., 
};

// Call the `deleteBatch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteBatch(deleteBatchVars);
// Variables can be defined inline as well.
const { data } = await deleteBatch({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteBatch(dataConnect, deleteBatchVars);

console.log(data.batch_delete);

// Or, you can use the `Promise` API.
deleteBatch(deleteBatchVars).then((response) => {
  const data = response.data;
  console.log(data.batch_delete);
});
```

### Using `DeleteBatch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteBatchRef, DeleteBatchVariables } from '@dataconnect/generated';

// The `DeleteBatch` mutation requires an argument of type `DeleteBatchVariables`:
const deleteBatchVars: DeleteBatchVariables = {
  id: ..., 
};

// Call the `deleteBatchRef()` function to get a reference to the mutation.
const ref = deleteBatchRef(deleteBatchVars);
// Variables can be defined inline as well.
const ref = deleteBatchRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteBatchRef(dataConnect, deleteBatchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.batch_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.batch_delete);
});
```

## CreateAppointment
You can execute the `CreateAppointment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createAppointment(vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface CreateAppointmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
}
export const createAppointmentRef: CreateAppointmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAppointment(dc: DataConnect, vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface CreateAppointmentRef {
  ...
  (dc: DataConnect, vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
}
export const createAppointmentRef: CreateAppointmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAppointmentRef:
```typescript
const name = createAppointmentRef.operationName;
console.log(name);
```

### Variables
The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAppointmentVariables {
  patientId: UUIDString;
  vaccineId: UUIDString;
  ubsId?: UUIDString | null;
  createdAt: TimestampString;
  scheduledAt: TimestampString;
  status: AppointmentStatus;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `CreateAppointment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAppointmentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAppointmentData {
  appointment_insert: Appointment_Key;
}
```
### Using `CreateAppointment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAppointment, CreateAppointmentVariables } from '@dataconnect/generated';

// The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`:
const createAppointmentVars: CreateAppointmentVariables = {
  patientId: ..., 
  vaccineId: ..., 
  ubsId: ..., // optional
  createdAt: ..., 
  scheduledAt: ..., 
  status: ..., 
  notes: ..., // optional
};

// Call the `createAppointment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAppointment(createAppointmentVars);
// Variables can be defined inline as well.
const { data } = await createAppointment({ patientId: ..., vaccineId: ..., ubsId: ..., createdAt: ..., scheduledAt: ..., status: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAppointment(dataConnect, createAppointmentVars);

console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
createAppointment(createAppointmentVars).then((response) => {
  const data = response.data;
  console.log(data.appointment_insert);
});
```

### Using `CreateAppointment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAppointmentRef, CreateAppointmentVariables } from '@dataconnect/generated';

// The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`:
const createAppointmentVars: CreateAppointmentVariables = {
  patientId: ..., 
  vaccineId: ..., 
  ubsId: ..., // optional
  createdAt: ..., 
  scheduledAt: ..., 
  status: ..., 
  notes: ..., // optional
};

// Call the `createAppointmentRef()` function to get a reference to the mutation.
const ref = createAppointmentRef(createAppointmentVars);
// Variables can be defined inline as well.
const ref = createAppointmentRef({ patientId: ..., vaccineId: ..., ubsId: ..., createdAt: ..., scheduledAt: ..., status: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAppointmentRef(dataConnect, createAppointmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment_insert);
});
```

## UpdateAppointment
You can execute the `UpdateAppointment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateAppointment(vars: UpdateAppointmentVariables): MutationPromise<UpdateAppointmentData, UpdateAppointmentVariables>;

interface UpdateAppointmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAppointmentVariables): MutationRef<UpdateAppointmentData, UpdateAppointmentVariables>;
}
export const updateAppointmentRef: UpdateAppointmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateAppointment(dc: DataConnect, vars: UpdateAppointmentVariables): MutationPromise<UpdateAppointmentData, UpdateAppointmentVariables>;

interface UpdateAppointmentRef {
  ...
  (dc: DataConnect, vars: UpdateAppointmentVariables): MutationRef<UpdateAppointmentData, UpdateAppointmentVariables>;
}
export const updateAppointmentRef: UpdateAppointmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateAppointmentRef:
```typescript
const name = updateAppointmentRef.operationName;
console.log(name);
```

### Variables
The `UpdateAppointment` mutation requires an argument of type `UpdateAppointmentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateAppointmentVariables {
  id: UUIDString;
  patientId?: UUIDString | null;
  vaccineId?: UUIDString | null;
  ubsId?: UUIDString | null;
  createdAt?: TimestampString | null;
  scheduledAt?: TimestampString | null;
  status?: AppointmentStatus | null;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `UpdateAppointment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateAppointmentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateAppointmentData {
  appointment_update?: Appointment_Key | null;
}
```
### Using `UpdateAppointment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateAppointment, UpdateAppointmentVariables } from '@dataconnect/generated';

// The `UpdateAppointment` mutation requires an argument of type `UpdateAppointmentVariables`:
const updateAppointmentVars: UpdateAppointmentVariables = {
  id: ..., 
  patientId: ..., // optional
  vaccineId: ..., // optional
  ubsId: ..., // optional
  createdAt: ..., // optional
  scheduledAt: ..., // optional
  status: ..., // optional
  notes: ..., // optional
};

// Call the `updateAppointment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateAppointment(updateAppointmentVars);
// Variables can be defined inline as well.
const { data } = await updateAppointment({ id: ..., patientId: ..., vaccineId: ..., ubsId: ..., createdAt: ..., scheduledAt: ..., status: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateAppointment(dataConnect, updateAppointmentVars);

console.log(data.appointment_update);

// Or, you can use the `Promise` API.
updateAppointment(updateAppointmentVars).then((response) => {
  const data = response.data;
  console.log(data.appointment_update);
});
```

### Using `UpdateAppointment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateAppointmentRef, UpdateAppointmentVariables } from '@dataconnect/generated';

// The `UpdateAppointment` mutation requires an argument of type `UpdateAppointmentVariables`:
const updateAppointmentVars: UpdateAppointmentVariables = {
  id: ..., 
  patientId: ..., // optional
  vaccineId: ..., // optional
  ubsId: ..., // optional
  createdAt: ..., // optional
  scheduledAt: ..., // optional
  status: ..., // optional
  notes: ..., // optional
};

// Call the `updateAppointmentRef()` function to get a reference to the mutation.
const ref = updateAppointmentRef(updateAppointmentVars);
// Variables can be defined inline as well.
const ref = updateAppointmentRef({ id: ..., patientId: ..., vaccineId: ..., ubsId: ..., createdAt: ..., scheduledAt: ..., status: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateAppointmentRef(dataConnect, updateAppointmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment_update);
});
```

## DeleteAppointment
You can execute the `DeleteAppointment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteAppointment(vars: DeleteAppointmentVariables): MutationPromise<DeleteAppointmentData, DeleteAppointmentVariables>;

interface DeleteAppointmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAppointmentVariables): MutationRef<DeleteAppointmentData, DeleteAppointmentVariables>;
}
export const deleteAppointmentRef: DeleteAppointmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteAppointment(dc: DataConnect, vars: DeleteAppointmentVariables): MutationPromise<DeleteAppointmentData, DeleteAppointmentVariables>;

interface DeleteAppointmentRef {
  ...
  (dc: DataConnect, vars: DeleteAppointmentVariables): MutationRef<DeleteAppointmentData, DeleteAppointmentVariables>;
}
export const deleteAppointmentRef: DeleteAppointmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteAppointmentRef:
```typescript
const name = deleteAppointmentRef.operationName;
console.log(name);
```

### Variables
The `DeleteAppointment` mutation requires an argument of type `DeleteAppointmentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteAppointmentVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteAppointment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteAppointmentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteAppointmentData {
  appointment_delete?: Appointment_Key | null;
}
```
### Using `DeleteAppointment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteAppointment, DeleteAppointmentVariables } from '@dataconnect/generated';

// The `DeleteAppointment` mutation requires an argument of type `DeleteAppointmentVariables`:
const deleteAppointmentVars: DeleteAppointmentVariables = {
  id: ..., 
};

// Call the `deleteAppointment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteAppointment(deleteAppointmentVars);
// Variables can be defined inline as well.
const { data } = await deleteAppointment({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteAppointment(dataConnect, deleteAppointmentVars);

console.log(data.appointment_delete);

// Or, you can use the `Promise` API.
deleteAppointment(deleteAppointmentVars).then((response) => {
  const data = response.data;
  console.log(data.appointment_delete);
});
```

### Using `DeleteAppointment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteAppointmentRef, DeleteAppointmentVariables } from '@dataconnect/generated';

// The `DeleteAppointment` mutation requires an argument of type `DeleteAppointmentVariables`:
const deleteAppointmentVars: DeleteAppointmentVariables = {
  id: ..., 
};

// Call the `deleteAppointmentRef()` function to get a reference to the mutation.
const ref = deleteAppointmentRef(deleteAppointmentVars);
// Variables can be defined inline as well.
const ref = deleteAppointmentRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteAppointmentRef(dataConnect, deleteAppointmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment_delete);
});
```

## CreateApplication
You can execute the `CreateApplication` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createApplication(vars: CreateApplicationVariables): MutationPromise<CreateApplicationData, CreateApplicationVariables>;

interface CreateApplicationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateApplicationVariables): MutationRef<CreateApplicationData, CreateApplicationVariables>;
}
export const createApplicationRef: CreateApplicationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createApplication(dc: DataConnect, vars: CreateApplicationVariables): MutationPromise<CreateApplicationData, CreateApplicationVariables>;

interface CreateApplicationRef {
  ...
  (dc: DataConnect, vars: CreateApplicationVariables): MutationRef<CreateApplicationData, CreateApplicationVariables>;
}
export const createApplicationRef: CreateApplicationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createApplicationRef:
```typescript
const name = createApplicationRef.operationName;
console.log(name);
```

### Variables
The `CreateApplication` mutation requires an argument of type `CreateApplicationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateApplicationVariables {
  patientId: UUIDString;
  vaccineId: UUIDString;
  batchId: UUIDString;
  appointmentId?: UUIDString | null;
  professionalId: UUIDString;
  ubsId: UUIDString;
  applicationDate: TimestampString;
  doseNumber?: number | null;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `CreateApplication` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateApplicationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateApplicationData {
  application_insert: Application_Key;
  batch_updateMany: number;
}
```
### Using `CreateApplication`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createApplication, CreateApplicationVariables } from '@dataconnect/generated';

// The `CreateApplication` mutation requires an argument of type `CreateApplicationVariables`:
const createApplicationVars: CreateApplicationVariables = {
  patientId: ..., 
  vaccineId: ..., 
  batchId: ..., 
  appointmentId: ..., // optional
  professionalId: ..., 
  ubsId: ..., 
  applicationDate: ..., 
  doseNumber: ..., // optional
  notes: ..., // optional
};

// Call the `createApplication()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createApplication(createApplicationVars);
// Variables can be defined inline as well.
const { data } = await createApplication({ patientId: ..., vaccineId: ..., batchId: ..., appointmentId: ..., professionalId: ..., ubsId: ..., applicationDate: ..., doseNumber: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createApplication(dataConnect, createApplicationVars);

console.log(data.application_insert);
console.log(data.batch_updateMany);

// Or, you can use the `Promise` API.
createApplication(createApplicationVars).then((response) => {
  const data = response.data;
  console.log(data.application_insert);
  console.log(data.batch_updateMany);
});
```

### Using `CreateApplication`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createApplicationRef, CreateApplicationVariables } from '@dataconnect/generated';

// The `CreateApplication` mutation requires an argument of type `CreateApplicationVariables`:
const createApplicationVars: CreateApplicationVariables = {
  patientId: ..., 
  vaccineId: ..., 
  batchId: ..., 
  appointmentId: ..., // optional
  professionalId: ..., 
  ubsId: ..., 
  applicationDate: ..., 
  doseNumber: ..., // optional
  notes: ..., // optional
};

// Call the `createApplicationRef()` function to get a reference to the mutation.
const ref = createApplicationRef(createApplicationVars);
// Variables can be defined inline as well.
const ref = createApplicationRef({ patientId: ..., vaccineId: ..., batchId: ..., appointmentId: ..., professionalId: ..., ubsId: ..., applicationDate: ..., doseNumber: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createApplicationRef(dataConnect, createApplicationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.application_insert);
console.log(data.batch_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.application_insert);
  console.log(data.batch_updateMany);
});
```

## UpdateApplication
You can execute the `UpdateApplication` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateApplication(vars: UpdateApplicationVariables): MutationPromise<UpdateApplicationData, UpdateApplicationVariables>;

interface UpdateApplicationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateApplicationVariables): MutationRef<UpdateApplicationData, UpdateApplicationVariables>;
}
export const updateApplicationRef: UpdateApplicationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateApplication(dc: DataConnect, vars: UpdateApplicationVariables): MutationPromise<UpdateApplicationData, UpdateApplicationVariables>;

interface UpdateApplicationRef {
  ...
  (dc: DataConnect, vars: UpdateApplicationVariables): MutationRef<UpdateApplicationData, UpdateApplicationVariables>;
}
export const updateApplicationRef: UpdateApplicationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateApplicationRef:
```typescript
const name = updateApplicationRef.operationName;
console.log(name);
```

### Variables
The `UpdateApplication` mutation requires an argument of type `UpdateApplicationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateApplicationVariables {
  id: UUIDString;
  doseNumber?: number | null;
  doseLabel?: string | null;
  nextDoseAt?: TimestampString | null;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `UpdateApplication` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateApplicationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateApplicationData {
  application_update?: Application_Key | null;
}
```
### Using `UpdateApplication`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateApplication, UpdateApplicationVariables } from '@dataconnect/generated';

// The `UpdateApplication` mutation requires an argument of type `UpdateApplicationVariables`:
const updateApplicationVars: UpdateApplicationVariables = {
  id: ..., 
  doseNumber: ..., // optional
  doseLabel: ..., // optional
  nextDoseAt: ..., // optional
  notes: ..., // optional
};

// Call the `updateApplication()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateApplication(updateApplicationVars);
// Variables can be defined inline as well.
const { data } = await updateApplication({ id: ..., doseNumber: ..., doseLabel: ..., nextDoseAt: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateApplication(dataConnect, updateApplicationVars);

console.log(data.application_update);

// Or, you can use the `Promise` API.
updateApplication(updateApplicationVars).then((response) => {
  const data = response.data;
  console.log(data.application_update);
});
```

### Using `UpdateApplication`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateApplicationRef, UpdateApplicationVariables } from '@dataconnect/generated';

// The `UpdateApplication` mutation requires an argument of type `UpdateApplicationVariables`:
const updateApplicationVars: UpdateApplicationVariables = {
  id: ..., 
  doseNumber: ..., // optional
  doseLabel: ..., // optional
  nextDoseAt: ..., // optional
  notes: ..., // optional
};

// Call the `updateApplicationRef()` function to get a reference to the mutation.
const ref = updateApplicationRef(updateApplicationVars);
// Variables can be defined inline as well.
const ref = updateApplicationRef({ id: ..., doseNumber: ..., doseLabel: ..., nextDoseAt: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateApplicationRef(dataConnect, updateApplicationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.application_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.application_update);
});
```

## VoidApplication
You can execute the `VoidApplication` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
voidApplication(vars: VoidApplicationVariables): MutationPromise<VoidApplicationData, VoidApplicationVariables>;

interface VoidApplicationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: VoidApplicationVariables): MutationRef<VoidApplicationData, VoidApplicationVariables>;
}
export const voidApplicationRef: VoidApplicationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
voidApplication(dc: DataConnect, vars: VoidApplicationVariables): MutationPromise<VoidApplicationData, VoidApplicationVariables>;

interface VoidApplicationRef {
  ...
  (dc: DataConnect, vars: VoidApplicationVariables): MutationRef<VoidApplicationData, VoidApplicationVariables>;
}
export const voidApplicationRef: VoidApplicationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the voidApplicationRef:
```typescript
const name = voidApplicationRef.operationName;
console.log(name);
```

### Variables
The `VoidApplication` mutation requires an argument of type `VoidApplicationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface VoidApplicationVariables {
  id: UUIDString;
  batchId: UUIDString;
  reason: string;
}
```
### Return Type
Recall that executing the `VoidApplication` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `VoidApplicationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface VoidApplicationData {
  application_update?: Application_Key | null;
  batch_updateMany: number;
}
```
### Using `VoidApplication`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, voidApplication, VoidApplicationVariables } from '@dataconnect/generated';

// The `VoidApplication` mutation requires an argument of type `VoidApplicationVariables`:
const voidApplicationVars: VoidApplicationVariables = {
  id: ..., 
  batchId: ..., 
  reason: ..., 
};

// Call the `voidApplication()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await voidApplication(voidApplicationVars);
// Variables can be defined inline as well.
const { data } = await voidApplication({ id: ..., batchId: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await voidApplication(dataConnect, voidApplicationVars);

console.log(data.application_update);
console.log(data.batch_updateMany);

// Or, you can use the `Promise` API.
voidApplication(voidApplicationVars).then((response) => {
  const data = response.data;
  console.log(data.application_update);
  console.log(data.batch_updateMany);
});
```

### Using `VoidApplication`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, voidApplicationRef, VoidApplicationVariables } from '@dataconnect/generated';

// The `VoidApplication` mutation requires an argument of type `VoidApplicationVariables`:
const voidApplicationVars: VoidApplicationVariables = {
  id: ..., 
  batchId: ..., 
  reason: ..., 
};

// Call the `voidApplicationRef()` function to get a reference to the mutation.
const ref = voidApplicationRef(voidApplicationVars);
// Variables can be defined inline as well.
const ref = voidApplicationRef({ id: ..., batchId: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = voidApplicationRef(dataConnect, voidApplicationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.application_update);
console.log(data.batch_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.application_update);
  console.log(data.batch_updateMany);
});
```

## VoidLegacyApplication
You can execute the `VoidLegacyApplication` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
voidLegacyApplication(vars: VoidLegacyApplicationVariables): MutationPromise<VoidLegacyApplicationData, VoidLegacyApplicationVariables>;

interface VoidLegacyApplicationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: VoidLegacyApplicationVariables): MutationRef<VoidLegacyApplicationData, VoidLegacyApplicationVariables>;
}
export const voidLegacyApplicationRef: VoidLegacyApplicationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
voidLegacyApplication(dc: DataConnect, vars: VoidLegacyApplicationVariables): MutationPromise<VoidLegacyApplicationData, VoidLegacyApplicationVariables>;

interface VoidLegacyApplicationRef {
  ...
  (dc: DataConnect, vars: VoidLegacyApplicationVariables): MutationRef<VoidLegacyApplicationData, VoidLegacyApplicationVariables>;
}
export const voidLegacyApplicationRef: VoidLegacyApplicationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the voidLegacyApplicationRef:
```typescript
const name = voidLegacyApplicationRef.operationName;
console.log(name);
```

### Variables
The `VoidLegacyApplication` mutation requires an argument of type `VoidLegacyApplicationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface VoidLegacyApplicationVariables {
  id: UUIDString;
  reason: string;
}
```
### Return Type
Recall that executing the `VoidLegacyApplication` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `VoidLegacyApplicationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface VoidLegacyApplicationData {
  application_update?: Application_Key | null;
}
```
### Using `VoidLegacyApplication`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, voidLegacyApplication, VoidLegacyApplicationVariables } from '@dataconnect/generated';

// The `VoidLegacyApplication` mutation requires an argument of type `VoidLegacyApplicationVariables`:
const voidLegacyApplicationVars: VoidLegacyApplicationVariables = {
  id: ..., 
  reason: ..., 
};

// Call the `voidLegacyApplication()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await voidLegacyApplication(voidLegacyApplicationVars);
// Variables can be defined inline as well.
const { data } = await voidLegacyApplication({ id: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await voidLegacyApplication(dataConnect, voidLegacyApplicationVars);

console.log(data.application_update);

// Or, you can use the `Promise` API.
voidLegacyApplication(voidLegacyApplicationVars).then((response) => {
  const data = response.data;
  console.log(data.application_update);
});
```

### Using `VoidLegacyApplication`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, voidLegacyApplicationRef, VoidLegacyApplicationVariables } from '@dataconnect/generated';

// The `VoidLegacyApplication` mutation requires an argument of type `VoidLegacyApplicationVariables`:
const voidLegacyApplicationVars: VoidLegacyApplicationVariables = {
  id: ..., 
  reason: ..., 
};

// Call the `voidLegacyApplicationRef()` function to get a reference to the mutation.
const ref = voidLegacyApplicationRef(voidLegacyApplicationVars);
// Variables can be defined inline as well.
const ref = voidLegacyApplicationRef({ id: ..., reason: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = voidLegacyApplicationRef(dataConnect, voidLegacyApplicationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.application_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.application_update);
});
```

