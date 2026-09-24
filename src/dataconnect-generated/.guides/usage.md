# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, updateUser, deleteUnlinkedUser, createPatient, updatePatient, archivePatient, createUbs, updateUbs, archiveUbs, createProfessional } from '@dataconnect/generated';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation UpdateUser:  For variables, look at type UpdateUserVars in ../index.d.ts
const { data } = await UpdateUser(dataConnect, updateUserVars);

// Operation DeleteUnlinkedUser:  For variables, look at type DeleteUnlinkedUserVars in ../index.d.ts
const { data } = await DeleteUnlinkedUser(dataConnect, deleteUnlinkedUserVars);

// Operation CreatePatient:  For variables, look at type CreatePatientVars in ../index.d.ts
const { data } = await CreatePatient(dataConnect, createPatientVars);

// Operation UpdatePatient:  For variables, look at type UpdatePatientVars in ../index.d.ts
const { data } = await UpdatePatient(dataConnect, updatePatientVars);

// Operation ArchivePatient:  For variables, look at type ArchivePatientVars in ../index.d.ts
const { data } = await ArchivePatient(dataConnect, archivePatientVars);

// Operation CreateUbs:  For variables, look at type CreateUbsVars in ../index.d.ts
const { data } = await CreateUbs(dataConnect, createUbsVars);

// Operation UpdateUbs:  For variables, look at type UpdateUbsVars in ../index.d.ts
const { data } = await UpdateUbs(dataConnect, updateUbsVars);

// Operation ArchiveUbs:  For variables, look at type ArchiveUbsVars in ../index.d.ts
const { data } = await ArchiveUbs(dataConnect, archiveUbsVars);

// Operation CreateProfessional:  For variables, look at type CreateProfessionalVars in ../index.d.ts
const { data } = await CreateProfessional(dataConnect, createProfessionalVars);


```