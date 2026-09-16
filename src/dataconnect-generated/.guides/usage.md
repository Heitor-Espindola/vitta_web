# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, updateUser, deleteUser, createPatient, updatePatient, deletePatient, createUbs, updateUbs, deleteUbs, createProfessional } from '@dataconnect/generated';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation UpdateUser:  For variables, look at type UpdateUserVars in ../index.d.ts
const { data } = await UpdateUser(dataConnect, updateUserVars);

// Operation DeleteUser:  For variables, look at type DeleteUserVars in ../index.d.ts
const { data } = await DeleteUser(dataConnect, deleteUserVars);

// Operation CreatePatient:  For variables, look at type CreatePatientVars in ../index.d.ts
const { data } = await CreatePatient(dataConnect, createPatientVars);

// Operation UpdatePatient:  For variables, look at type UpdatePatientVars in ../index.d.ts
const { data } = await UpdatePatient(dataConnect, updatePatientVars);

// Operation DeletePatient:  For variables, look at type DeletePatientVars in ../index.d.ts
const { data } = await DeletePatient(dataConnect, deletePatientVars);

// Operation CreateUbs:  For variables, look at type CreateUbsVars in ../index.d.ts
const { data } = await CreateUbs(dataConnect, createUbsVars);

// Operation UpdateUbs:  For variables, look at type UpdateUbsVars in ../index.d.ts
const { data } = await UpdateUbs(dataConnect, updateUbsVars);

// Operation DeleteUbs:  For variables, look at type DeleteUbsVars in ../index.d.ts
const { data } = await DeleteUbs(dataConnect, deleteUbsVars);

// Operation CreateProfessional:  For variables, look at type CreateProfessionalVars in ../index.d.ts
const { data } = await CreateProfessional(dataConnect, createProfessionalVars);


```