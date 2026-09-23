import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  OVERDUE = "OVERDUE",
};

export enum PatientType {
  ADULT = "ADULT",
  CHILD = "CHILD",
};

export enum ProfessionalType {
  NURSE = "NURSE",
  DOCTOR = "DOCTOR",
  NURSING_TECHNICIAN = "NURSING_TECHNICIAN",
  PHARMACIST = "PHARMACIST",
  OTHER = "OTHER",
};

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
};



export interface Application_Key {
  id: UUIDString;
  __typename?: 'Application_Key';
}

export interface Appointment_Key {
  id: UUIDString;
  __typename?: 'Appointment_Key';
}

export interface Batch_Key {
  id: UUIDString;
  __typename?: 'Batch_Key';
}

export interface CreateApplicationData {
  application_insert: Application_Key;
}

export interface CreateApplicationVariables {
  patientId: UUIDString;
  vaccineId: UUIDString;
  batchId?: UUIDString | null;
  appointmentId?: UUIDString | null;
  professionalId: UUIDString;
  ubsId: UUIDString;
  applicationDate: TimestampString;
  doseNumber?: number | null;
  notes?: string | null;
}

export interface CreateAppointmentData {
  appointment_insert: Appointment_Key;
}

export interface CreateAppointmentVariables {
  patientId: UUIDString;
  vaccineId: UUIDString;
  ubsId?: UUIDString | null;
  createdAt: TimestampString;
  scheduledAt: TimestampString;
  status: AppointmentStatus;
  notes?: string | null;
}

export interface CreateBatchData {
  batch_insert: Batch_Key;
}

export interface CreateBatchVariables {
  vaccineId: UUIDString;
  manufacturer: string;
  batchCode: string;
  initialQuantity: number;
  currentQuantity: number;
  manufacturingDate?: DateString | null;
  expirationDate: DateString;
}

export interface CreatePatientData {
  patient_insert: Patient_Key;
}

export interface CreatePatientVariables {
  userId: UUIDString;
  patientType: PatientType;
  responsibleId?: UUIDString | null;
  motherName?: string | null;
}

export interface CreateProfessionalData {
  professional_insert: Professional_Key;
}

export interface CreateProfessionalVariables {
  userId: UUIDString;
  professionalType: ProfessionalType;
  professionalRegistration?: string | null;
  ubsId?: UUIDString | null;
}

export interface CreateUbsData {
  uBS_insert: UBS_Key;
}

export interface CreateUbsVariables {
  name: string;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  name: string;
  birthDate: DateString;
  email: string;
  status: UserStatus;
  cpf: string;
  sex?: string | null;
}

export interface CreateVaccineData {
  vaccine_insert: Vaccine_Key;
}

export interface CreateVaccineVariables {
  name: string;
  description?: string | null;
  requiredDoses: number;
}

export interface DeleteApplicationData {
  application_delete?: Application_Key | null;
}

export interface DeleteApplicationVariables {
  id: UUIDString;
}

export interface DeleteAppointmentData {
  appointment_delete?: Appointment_Key | null;
}

export interface DeleteAppointmentVariables {
  id: UUIDString;
}

export interface DeleteBatchData {
  batch_delete?: Batch_Key | null;
}

export interface DeleteBatchVariables {
  id: UUIDString;
}

export interface DeletePatientData {
  patient_delete?: Patient_Key | null;
}

export interface DeletePatientVariables {
  id: UUIDString;
}

export interface DeleteProfessionalData {
  professional_delete?: Professional_Key | null;
}

export interface DeleteProfessionalVariables {
  id: UUIDString;
}

export interface DeleteUbsData {
  uBS_delete?: UBS_Key | null;
}

export interface DeleteUbsVariables {
  id: UUIDString;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface DeleteUserVariables {
  id: UUIDString;
}

export interface DeleteVaccineData {
  vaccine_delete?: Vaccine_Key | null;
}

export interface DeleteVaccineVariables {
  id: UUIDString;
}

export interface EmergencyContact_Key {
  userId: UUIDString;
  __typename?: 'EmergencyContact_Key';
}

export interface FamilyRelationship_Key {
  fromPatientId: UUIDString;
  toPatientId: UUIDString;
  __typename?: 'FamilyRelationship_Key';
}

export interface GetApplicationData {
  application?: {
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
    professional: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
      professionalType: ProfessionalType;
      professionalRegistration?: string | null;
    } & Professional_Key;
    ubs: {
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

export interface GetApplicationVariables {
  id: UUIDString;
}

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

export interface GetAppointmentVariables {
  id: UUIDString;
}

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

export interface GetBatchVariables {
  id: UUIDString;
}

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

export interface GetPatientByUserVariables {
  userId: UUIDString;
}

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

export interface GetPatientVariables {
  id: UUIDString;
}

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

export interface GetProfessionalByUserVariables {
  userId: UUIDString;
}

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

export interface GetProfessionalVariables {
  id: UUIDString;
}

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

export interface GetUbsVariables {
  id: UUIDString;
}

export interface GetUserByCpfData {
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

export interface GetUserByCpfVariables {
  cpf: string;
}

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

export interface GetUserByEmailVariables {
  email: string;
}

export interface GetUserData {
  user?: {
    id: UUIDString;
    name: string;
    birthDate: DateString;
    email?: string | null;
    status: UserStatus;
    cpf: string;
    sex?: string | null;
  } & User_Key;
}

export interface GetUserVariables {
  id: UUIDString;
}

export interface GetVaccineData {
  vaccine?: {
    id: UUIDString;
    name: string;
    description?: string | null;
    requiredDoses: number;
  } & Vaccine_Key;
}

export interface GetVaccineVariables {
  id: UUIDString;
}

export interface ListApplicationsByPatientData {
  applications: ({
    id: UUIDString;
    vaccine: {
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
    professional: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
      } & User_Key;
      professionalType: ProfessionalType;
      professionalRegistration?: string | null;
    } & Professional_Key;
    ubs: {
      id: UUIDString;
      name: string;
    } & UBS_Key;
    patient: {
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

export interface ListApplicationsByPatientVariables {
  patientId: UUIDString;
}

export interface ListApplicationsByVaccineData {
  applications: ({
    id: UUIDString;
    patient: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
        cpf: string;
      } & User_Key;
    } & Patient_Key;
    professional: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
      } & User_Key;
    } & Professional_Key;
    ubs: {
      id: UUIDString;
      name: string;
    } & UBS_Key;
    applicationDate: TimestampString;
    doseNumber?: number | null;
    notes?: string | null;
  } & Application_Key)[];
}

export interface ListApplicationsByVaccineVariables {
  vaccineId: UUIDString;
}

export interface ListApplicationsData {
  applications: ({
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
    professional: {
      id: UUIDString;
      user: {
        id: UUIDString;
        name: string;
      } & User_Key;
      professionalType: ProfessionalType;
      professionalRegistration?: string | null;
    } & Professional_Key;
    ubs: {
      id: UUIDString;
      name: string;
      cidade?: string | null;
    } & UBS_Key;
    applicationDate: TimestampString;
    doseNumber?: number | null;
    notes?: string | null;
  } & Application_Key)[];
}

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

export interface ListAppointmentsByPatientVariables {
  patientId: UUIDString;
}

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

export interface ListAppointmentsByStatusVariables {
  status: AppointmentStatus;
}

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

export interface ListBatchesByVaccineVariables {
  vaccineId: UUIDString;
}

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

export interface ListVaccinesData {
  vaccines: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    requiredDoses: number;
  } & Vaccine_Key)[];
}

export interface PatientAccess_Key {
  granteeAuthUid: string;
  patientId: UUIDString;
  __typename?: 'PatientAccess_Key';
}

export interface Patient_Key {
  id: UUIDString;
  __typename?: 'Patient_Key';
}

export interface Professional_Key {
  id: UUIDString;
  __typename?: 'Professional_Key';
}

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

export interface SearchUbsByNameVariables {
  name: string;
}

export interface SearchVaccinesByNameData {
  vaccines: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    requiredDoses: number;
  } & Vaccine_Key)[];
}

export interface SearchVaccinesByNameVariables {
  name: string;
}

export interface UBS_Key {
  id: UUIDString;
  __typename?: 'UBS_Key';
}

export interface UpdateApplicationData {
  application_update?: Application_Key | null;
}

export interface UpdateApplicationVariables {
  id: UUIDString;
  patientId?: UUIDString | null;
  vaccineId?: UUIDString | null;
  batchId?: UUIDString | null;
  appointmentId?: UUIDString | null;
  professionalId?: UUIDString | null;
  ubsId?: UUIDString | null;
  applicationDate?: TimestampString | null;
  doseNumber?: number | null;
  notes?: string | null;
}

export interface UpdateAppointmentData {
  appointment_update?: Appointment_Key | null;
}

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

export interface UpdateBatchData {
  batch_update?: Batch_Key | null;
}

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

export interface UpdatePatientData {
  patient_update?: Patient_Key | null;
}

export interface UpdatePatientVariables {
  id: UUIDString;
  patientType?: PatientType | null;
  responsibleId?: UUIDString | null;
  motherName?: string | null;
}

export interface UpdateProfessionalData {
  professional_update?: Professional_Key | null;
}

export interface UpdateProfessionalVariables {
  id: UUIDString;
  professionalType?: ProfessionalType | null;
  professionalRegistration?: string | null;
  ubsId?: UUIDString | null;
}

export interface UpdateUbsData {
  uBS_update?: UBS_Key | null;
}

export interface UpdateUbsVariables {
  id: UUIDString;
  name?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface UpdateUserVariables {
  id: UUIDString;
  name?: string | null;
  birthDate?: DateString | null;
  email?: string | null;
  status?: UserStatus | null;
  cpf?: string | null;
  sex?: string | null;
}

export interface UpdateVaccineData {
  vaccine_update?: Vaccine_Key | null;
}

export interface UpdateVaccineVariables {
  id: UUIDString;
  name?: string | null;
  description?: string | null;
  requiredDoses?: number | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Vaccine_Key {
  id: UUIDString;
  __typename?: 'Vaccine_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface UpdateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
  operationName: string;
}
export const updateUserRef: UpdateUserRef;

export function updateUser(vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;
export function updateUser(dc: DataConnect, vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface DeleteUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
  operationName: string;
}
export const deleteUserRef: DeleteUserRef;

export function deleteUser(vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;
export function deleteUser(dc: DataConnect, vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;

interface CreatePatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
  operationName: string;
}
export const createPatientRef: CreatePatientRef;

export function createPatient(vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;
export function createPatient(dc: DataConnect, vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;

interface UpdatePatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePatientVariables): MutationRef<UpdatePatientData, UpdatePatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePatientVariables): MutationRef<UpdatePatientData, UpdatePatientVariables>;
  operationName: string;
}
export const updatePatientRef: UpdatePatientRef;

export function updatePatient(vars: UpdatePatientVariables): MutationPromise<UpdatePatientData, UpdatePatientVariables>;
export function updatePatient(dc: DataConnect, vars: UpdatePatientVariables): MutationPromise<UpdatePatientData, UpdatePatientVariables>;

interface DeletePatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePatientVariables): MutationRef<DeletePatientData, DeletePatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeletePatientVariables): MutationRef<DeletePatientData, DeletePatientVariables>;
  operationName: string;
}
export const deletePatientRef: DeletePatientRef;

export function deletePatient(vars: DeletePatientVariables): MutationPromise<DeletePatientData, DeletePatientVariables>;
export function deletePatient(dc: DataConnect, vars: DeletePatientVariables): MutationPromise<DeletePatientData, DeletePatientVariables>;

interface CreateUbsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUbsVariables): MutationRef<CreateUbsData, CreateUbsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUbsVariables): MutationRef<CreateUbsData, CreateUbsVariables>;
  operationName: string;
}
export const createUbsRef: CreateUbsRef;

export function createUbs(vars: CreateUbsVariables): MutationPromise<CreateUbsData, CreateUbsVariables>;
export function createUbs(dc: DataConnect, vars: CreateUbsVariables): MutationPromise<CreateUbsData, CreateUbsVariables>;

interface UpdateUbsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUbsVariables): MutationRef<UpdateUbsData, UpdateUbsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUbsVariables): MutationRef<UpdateUbsData, UpdateUbsVariables>;
  operationName: string;
}
export const updateUbsRef: UpdateUbsRef;

export function updateUbs(vars: UpdateUbsVariables): MutationPromise<UpdateUbsData, UpdateUbsVariables>;
export function updateUbs(dc: DataConnect, vars: UpdateUbsVariables): MutationPromise<UpdateUbsData, UpdateUbsVariables>;

interface DeleteUbsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUbsVariables): MutationRef<DeleteUbsData, DeleteUbsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteUbsVariables): MutationRef<DeleteUbsData, DeleteUbsVariables>;
  operationName: string;
}
export const deleteUbsRef: DeleteUbsRef;

export function deleteUbs(vars: DeleteUbsVariables): MutationPromise<DeleteUbsData, DeleteUbsVariables>;
export function deleteUbs(dc: DataConnect, vars: DeleteUbsVariables): MutationPromise<DeleteUbsData, DeleteUbsVariables>;

interface CreateProfessionalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProfessionalVariables): MutationRef<CreateProfessionalData, CreateProfessionalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateProfessionalVariables): MutationRef<CreateProfessionalData, CreateProfessionalVariables>;
  operationName: string;
}
export const createProfessionalRef: CreateProfessionalRef;

export function createProfessional(vars: CreateProfessionalVariables): MutationPromise<CreateProfessionalData, CreateProfessionalVariables>;
export function createProfessional(dc: DataConnect, vars: CreateProfessionalVariables): MutationPromise<CreateProfessionalData, CreateProfessionalVariables>;

interface UpdateProfessionalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProfessionalVariables): MutationRef<UpdateProfessionalData, UpdateProfessionalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProfessionalVariables): MutationRef<UpdateProfessionalData, UpdateProfessionalVariables>;
  operationName: string;
}
export const updateProfessionalRef: UpdateProfessionalRef;

export function updateProfessional(vars: UpdateProfessionalVariables): MutationPromise<UpdateProfessionalData, UpdateProfessionalVariables>;
export function updateProfessional(dc: DataConnect, vars: UpdateProfessionalVariables): MutationPromise<UpdateProfessionalData, UpdateProfessionalVariables>;

interface DeleteProfessionalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteProfessionalVariables): MutationRef<DeleteProfessionalData, DeleteProfessionalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteProfessionalVariables): MutationRef<DeleteProfessionalData, DeleteProfessionalVariables>;
  operationName: string;
}
export const deleteProfessionalRef: DeleteProfessionalRef;

export function deleteProfessional(vars: DeleteProfessionalVariables): MutationPromise<DeleteProfessionalData, DeleteProfessionalVariables>;
export function deleteProfessional(dc: DataConnect, vars: DeleteProfessionalVariables): MutationPromise<DeleteProfessionalData, DeleteProfessionalVariables>;

interface CreateVaccineRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVaccineVariables): MutationRef<CreateVaccineData, CreateVaccineVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateVaccineVariables): MutationRef<CreateVaccineData, CreateVaccineVariables>;
  operationName: string;
}
export const createVaccineRef: CreateVaccineRef;

export function createVaccine(vars: CreateVaccineVariables): MutationPromise<CreateVaccineData, CreateVaccineVariables>;
export function createVaccine(dc: DataConnect, vars: CreateVaccineVariables): MutationPromise<CreateVaccineData, CreateVaccineVariables>;

interface UpdateVaccineRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateVaccineVariables): MutationRef<UpdateVaccineData, UpdateVaccineVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateVaccineVariables): MutationRef<UpdateVaccineData, UpdateVaccineVariables>;
  operationName: string;
}
export const updateVaccineRef: UpdateVaccineRef;

export function updateVaccine(vars: UpdateVaccineVariables): MutationPromise<UpdateVaccineData, UpdateVaccineVariables>;
export function updateVaccine(dc: DataConnect, vars: UpdateVaccineVariables): MutationPromise<UpdateVaccineData, UpdateVaccineVariables>;

interface DeleteVaccineRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteVaccineVariables): MutationRef<DeleteVaccineData, DeleteVaccineVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteVaccineVariables): MutationRef<DeleteVaccineData, DeleteVaccineVariables>;
  operationName: string;
}
export const deleteVaccineRef: DeleteVaccineRef;

export function deleteVaccine(vars: DeleteVaccineVariables): MutationPromise<DeleteVaccineData, DeleteVaccineVariables>;
export function deleteVaccine(dc: DataConnect, vars: DeleteVaccineVariables): MutationPromise<DeleteVaccineData, DeleteVaccineVariables>;

interface CreateBatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBatchVariables): MutationRef<CreateBatchData, CreateBatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateBatchVariables): MutationRef<CreateBatchData, CreateBatchVariables>;
  operationName: string;
}
export const createBatchRef: CreateBatchRef;

export function createBatch(vars: CreateBatchVariables): MutationPromise<CreateBatchData, CreateBatchVariables>;
export function createBatch(dc: DataConnect, vars: CreateBatchVariables): MutationPromise<CreateBatchData, CreateBatchVariables>;

interface UpdateBatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBatchVariables): MutationRef<UpdateBatchData, UpdateBatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateBatchVariables): MutationRef<UpdateBatchData, UpdateBatchVariables>;
  operationName: string;
}
export const updateBatchRef: UpdateBatchRef;

export function updateBatch(vars: UpdateBatchVariables): MutationPromise<UpdateBatchData, UpdateBatchVariables>;
export function updateBatch(dc: DataConnect, vars: UpdateBatchVariables): MutationPromise<UpdateBatchData, UpdateBatchVariables>;

interface DeleteBatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteBatchVariables): MutationRef<DeleteBatchData, DeleteBatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteBatchVariables): MutationRef<DeleteBatchData, DeleteBatchVariables>;
  operationName: string;
}
export const deleteBatchRef: DeleteBatchRef;

export function deleteBatch(vars: DeleteBatchVariables): MutationPromise<DeleteBatchData, DeleteBatchVariables>;
export function deleteBatch(dc: DataConnect, vars: DeleteBatchVariables): MutationPromise<DeleteBatchData, DeleteBatchVariables>;

interface CreateAppointmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
  operationName: string;
}
export const createAppointmentRef: CreateAppointmentRef;

export function createAppointment(vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;
export function createAppointment(dc: DataConnect, vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface UpdateAppointmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAppointmentVariables): MutationRef<UpdateAppointmentData, UpdateAppointmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAppointmentVariables): MutationRef<UpdateAppointmentData, UpdateAppointmentVariables>;
  operationName: string;
}
export const updateAppointmentRef: UpdateAppointmentRef;

export function updateAppointment(vars: UpdateAppointmentVariables): MutationPromise<UpdateAppointmentData, UpdateAppointmentVariables>;
export function updateAppointment(dc: DataConnect, vars: UpdateAppointmentVariables): MutationPromise<UpdateAppointmentData, UpdateAppointmentVariables>;

interface DeleteAppointmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAppointmentVariables): MutationRef<DeleteAppointmentData, DeleteAppointmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteAppointmentVariables): MutationRef<DeleteAppointmentData, DeleteAppointmentVariables>;
  operationName: string;
}
export const deleteAppointmentRef: DeleteAppointmentRef;

export function deleteAppointment(vars: DeleteAppointmentVariables): MutationPromise<DeleteAppointmentData, DeleteAppointmentVariables>;
export function deleteAppointment(dc: DataConnect, vars: DeleteAppointmentVariables): MutationPromise<DeleteAppointmentData, DeleteAppointmentVariables>;

interface CreateApplicationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateApplicationVariables): MutationRef<CreateApplicationData, CreateApplicationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateApplicationVariables): MutationRef<CreateApplicationData, CreateApplicationVariables>;
  operationName: string;
}
export const createApplicationRef: CreateApplicationRef;

export function createApplication(vars: CreateApplicationVariables): MutationPromise<CreateApplicationData, CreateApplicationVariables>;
export function createApplication(dc: DataConnect, vars: CreateApplicationVariables): MutationPromise<CreateApplicationData, CreateApplicationVariables>;

interface UpdateApplicationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateApplicationVariables): MutationRef<UpdateApplicationData, UpdateApplicationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateApplicationVariables): MutationRef<UpdateApplicationData, UpdateApplicationVariables>;
  operationName: string;
}
export const updateApplicationRef: UpdateApplicationRef;

export function updateApplication(vars: UpdateApplicationVariables): MutationPromise<UpdateApplicationData, UpdateApplicationVariables>;
export function updateApplication(dc: DataConnect, vars: UpdateApplicationVariables): MutationPromise<UpdateApplicationData, UpdateApplicationVariables>;

interface DeleteApplicationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteApplicationVariables): MutationRef<DeleteApplicationData, DeleteApplicationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteApplicationVariables): MutationRef<DeleteApplicationData, DeleteApplicationVariables>;
  operationName: string;
}
export const deleteApplicationRef: DeleteApplicationRef;

export function deleteApplication(vars: DeleteApplicationVariables): MutationPromise<DeleteApplicationData, DeleteApplicationVariables>;
export function deleteApplication(dc: DataConnect, vars: DeleteApplicationVariables): MutationPromise<DeleteApplicationData, DeleteApplicationVariables>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface GetUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  operationName: string;
}
export const getUserRef: GetUserRef;

export function getUser(vars: GetUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserData, GetUserVariables>;
export function getUser(dc: DataConnect, vars: GetUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserByCpfRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByCpfVariables): QueryRef<GetUserByCpfData, GetUserByCpfVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByCpfVariables): QueryRef<GetUserByCpfData, GetUserByCpfVariables>;
  operationName: string;
}
export const getUserByCpfRef: GetUserByCpfRef;

export function getUserByCpf(vars: GetUserByCpfVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByCpfData, GetUserByCpfVariables>;
export function getUserByCpf(dc: DataConnect, vars: GetUserByCpfVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByCpfData, GetUserByCpfVariables>;

interface GetUserByEmailRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
  operationName: string;
}
export const getUserByEmailRef: GetUserByEmailRef;

export function getUserByEmail(vars: GetUserByEmailVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;
export function getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface ListPatientsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPatientsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPatientsData, undefined>;
  operationName: string;
}
export const listPatientsRef: ListPatientsRef;

export function listPatients(options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, undefined>;
export function listPatients(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, undefined>;

interface GetPatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPatientVariables): QueryRef<GetPatientData, GetPatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPatientVariables): QueryRef<GetPatientData, GetPatientVariables>;
  operationName: string;
}
export const getPatientRef: GetPatientRef;

export function getPatient(vars: GetPatientVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientData, GetPatientVariables>;
export function getPatient(dc: DataConnect, vars: GetPatientVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientData, GetPatientVariables>;

interface GetPatientByUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPatientByUserVariables): QueryRef<GetPatientByUserData, GetPatientByUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPatientByUserVariables): QueryRef<GetPatientByUserData, GetPatientByUserVariables>;
  operationName: string;
}
export const getPatientByUserRef: GetPatientByUserRef;

export function getPatientByUser(vars: GetPatientByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientByUserData, GetPatientByUserVariables>;
export function getPatientByUser(dc: DataConnect, vars: GetPatientByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientByUserData, GetPatientByUserVariables>;

interface ListUbsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUbsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUbsData, undefined>;
  operationName: string;
}
export const listUbsRef: ListUbsRef;

export function listUbs(options?: ExecuteQueryOptions): QueryPromise<ListUbsData, undefined>;
export function listUbs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUbsData, undefined>;

interface GetUbsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUbsVariables): QueryRef<GetUbsData, GetUbsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUbsVariables): QueryRef<GetUbsData, GetUbsVariables>;
  operationName: string;
}
export const getUbsRef: GetUbsRef;

export function getUbs(vars: GetUbsVariables, options?: ExecuteQueryOptions): QueryPromise<GetUbsData, GetUbsVariables>;
export function getUbs(dc: DataConnect, vars: GetUbsVariables, options?: ExecuteQueryOptions): QueryPromise<GetUbsData, GetUbsVariables>;

interface SearchUbsByNameRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchUbsByNameVariables): QueryRef<SearchUbsByNameData, SearchUbsByNameVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SearchUbsByNameVariables): QueryRef<SearchUbsByNameData, SearchUbsByNameVariables>;
  operationName: string;
}
export const searchUbsByNameRef: SearchUbsByNameRef;

export function searchUbsByName(vars: SearchUbsByNameVariables, options?: ExecuteQueryOptions): QueryPromise<SearchUbsByNameData, SearchUbsByNameVariables>;
export function searchUbsByName(dc: DataConnect, vars: SearchUbsByNameVariables, options?: ExecuteQueryOptions): QueryPromise<SearchUbsByNameData, SearchUbsByNameVariables>;

interface ListProfessionalsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProfessionalsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProfessionalsData, undefined>;
  operationName: string;
}
export const listProfessionalsRef: ListProfessionalsRef;

export function listProfessionals(options?: ExecuteQueryOptions): QueryPromise<ListProfessionalsData, undefined>;
export function listProfessionals(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProfessionalsData, undefined>;

interface GetProfessionalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProfessionalVariables): QueryRef<GetProfessionalData, GetProfessionalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProfessionalVariables): QueryRef<GetProfessionalData, GetProfessionalVariables>;
  operationName: string;
}
export const getProfessionalRef: GetProfessionalRef;

export function getProfessional(vars: GetProfessionalVariables, options?: ExecuteQueryOptions): QueryPromise<GetProfessionalData, GetProfessionalVariables>;
export function getProfessional(dc: DataConnect, vars: GetProfessionalVariables, options?: ExecuteQueryOptions): QueryPromise<GetProfessionalData, GetProfessionalVariables>;

interface GetProfessionalByUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProfessionalByUserVariables): QueryRef<GetProfessionalByUserData, GetProfessionalByUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProfessionalByUserVariables): QueryRef<GetProfessionalByUserData, GetProfessionalByUserVariables>;
  operationName: string;
}
export const getProfessionalByUserRef: GetProfessionalByUserRef;

export function getProfessionalByUser(vars: GetProfessionalByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetProfessionalByUserData, GetProfessionalByUserVariables>;
export function getProfessionalByUser(dc: DataConnect, vars: GetProfessionalByUserVariables, options?: ExecuteQueryOptions): QueryPromise<GetProfessionalByUserData, GetProfessionalByUserVariables>;

interface ListVaccinesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListVaccinesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListVaccinesData, undefined>;
  operationName: string;
}
export const listVaccinesRef: ListVaccinesRef;

export function listVaccines(options?: ExecuteQueryOptions): QueryPromise<ListVaccinesData, undefined>;
export function listVaccines(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListVaccinesData, undefined>;

interface GetVaccineRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetVaccineVariables): QueryRef<GetVaccineData, GetVaccineVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetVaccineVariables): QueryRef<GetVaccineData, GetVaccineVariables>;
  operationName: string;
}
export const getVaccineRef: GetVaccineRef;

export function getVaccine(vars: GetVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<GetVaccineData, GetVaccineVariables>;
export function getVaccine(dc: DataConnect, vars: GetVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<GetVaccineData, GetVaccineVariables>;

interface SearchVaccinesByNameRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchVaccinesByNameVariables): QueryRef<SearchVaccinesByNameData, SearchVaccinesByNameVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SearchVaccinesByNameVariables): QueryRef<SearchVaccinesByNameData, SearchVaccinesByNameVariables>;
  operationName: string;
}
export const searchVaccinesByNameRef: SearchVaccinesByNameRef;

export function searchVaccinesByName(vars: SearchVaccinesByNameVariables, options?: ExecuteQueryOptions): QueryPromise<SearchVaccinesByNameData, SearchVaccinesByNameVariables>;
export function searchVaccinesByName(dc: DataConnect, vars: SearchVaccinesByNameVariables, options?: ExecuteQueryOptions): QueryPromise<SearchVaccinesByNameData, SearchVaccinesByNameVariables>;

interface ListBatchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBatchesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListBatchesData, undefined>;
  operationName: string;
}
export const listBatchesRef: ListBatchesRef;

export function listBatches(options?: ExecuteQueryOptions): QueryPromise<ListBatchesData, undefined>;
export function listBatches(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBatchesData, undefined>;

interface GetBatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBatchVariables): QueryRef<GetBatchData, GetBatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBatchVariables): QueryRef<GetBatchData, GetBatchVariables>;
  operationName: string;
}
export const getBatchRef: GetBatchRef;

export function getBatch(vars: GetBatchVariables, options?: ExecuteQueryOptions): QueryPromise<GetBatchData, GetBatchVariables>;
export function getBatch(dc: DataConnect, vars: GetBatchVariables, options?: ExecuteQueryOptions): QueryPromise<GetBatchData, GetBatchVariables>;

interface ListBatchesByVaccineRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListBatchesByVaccineVariables): QueryRef<ListBatchesByVaccineData, ListBatchesByVaccineVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListBatchesByVaccineVariables): QueryRef<ListBatchesByVaccineData, ListBatchesByVaccineVariables>;
  operationName: string;
}
export const listBatchesByVaccineRef: ListBatchesByVaccineRef;

export function listBatchesByVaccine(vars: ListBatchesByVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<ListBatchesByVaccineData, ListBatchesByVaccineVariables>;
export function listBatchesByVaccine(dc: DataConnect, vars: ListBatchesByVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<ListBatchesByVaccineData, ListBatchesByVaccineVariables>;

interface ListAppointmentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAppointmentsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAppointmentsData, undefined>;
  operationName: string;
}
export const listAppointmentsRef: ListAppointmentsRef;

export function listAppointments(options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsData, undefined>;
export function listAppointments(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsData, undefined>;

interface GetAppointmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAppointmentVariables): QueryRef<GetAppointmentData, GetAppointmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAppointmentVariables): QueryRef<GetAppointmentData, GetAppointmentVariables>;
  operationName: string;
}
export const getAppointmentRef: GetAppointmentRef;

export function getAppointment(vars: GetAppointmentVariables, options?: ExecuteQueryOptions): QueryPromise<GetAppointmentData, GetAppointmentVariables>;
export function getAppointment(dc: DataConnect, vars: GetAppointmentVariables, options?: ExecuteQueryOptions): QueryPromise<GetAppointmentData, GetAppointmentVariables>;

interface ListAppointmentsByPatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAppointmentsByPatientVariables): QueryRef<ListAppointmentsByPatientData, ListAppointmentsByPatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAppointmentsByPatientVariables): QueryRef<ListAppointmentsByPatientData, ListAppointmentsByPatientVariables>;
  operationName: string;
}
export const listAppointmentsByPatientRef: ListAppointmentsByPatientRef;

export function listAppointmentsByPatient(vars: ListAppointmentsByPatientVariables, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsByPatientData, ListAppointmentsByPatientVariables>;
export function listAppointmentsByPatient(dc: DataConnect, vars: ListAppointmentsByPatientVariables, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsByPatientData, ListAppointmentsByPatientVariables>;

interface ListAppointmentsByStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAppointmentsByStatusVariables): QueryRef<ListAppointmentsByStatusData, ListAppointmentsByStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAppointmentsByStatusVariables): QueryRef<ListAppointmentsByStatusData, ListAppointmentsByStatusVariables>;
  operationName: string;
}
export const listAppointmentsByStatusRef: ListAppointmentsByStatusRef;

export function listAppointmentsByStatus(vars: ListAppointmentsByStatusVariables, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsByStatusData, ListAppointmentsByStatusVariables>;
export function listAppointmentsByStatus(dc: DataConnect, vars: ListAppointmentsByStatusVariables, options?: ExecuteQueryOptions): QueryPromise<ListAppointmentsByStatusData, ListAppointmentsByStatusVariables>;

interface ListApplicationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListApplicationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListApplicationsData, undefined>;
  operationName: string;
}
export const listApplicationsRef: ListApplicationsRef;

export function listApplications(options?: ExecuteQueryOptions): QueryPromise<ListApplicationsData, undefined>;
export function listApplications(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListApplicationsData, undefined>;

interface GetApplicationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetApplicationVariables): QueryRef<GetApplicationData, GetApplicationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetApplicationVariables): QueryRef<GetApplicationData, GetApplicationVariables>;
  operationName: string;
}
export const getApplicationRef: GetApplicationRef;

export function getApplication(vars: GetApplicationVariables, options?: ExecuteQueryOptions): QueryPromise<GetApplicationData, GetApplicationVariables>;
export function getApplication(dc: DataConnect, vars: GetApplicationVariables, options?: ExecuteQueryOptions): QueryPromise<GetApplicationData, GetApplicationVariables>;

interface ListApplicationsByPatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListApplicationsByPatientVariables): QueryRef<ListApplicationsByPatientData, ListApplicationsByPatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListApplicationsByPatientVariables): QueryRef<ListApplicationsByPatientData, ListApplicationsByPatientVariables>;
  operationName: string;
}
export const listApplicationsByPatientRef: ListApplicationsByPatientRef;

export function listApplicationsByPatient(vars: ListApplicationsByPatientVariables, options?: ExecuteQueryOptions): QueryPromise<ListApplicationsByPatientData, ListApplicationsByPatientVariables>;
export function listApplicationsByPatient(dc: DataConnect, vars: ListApplicationsByPatientVariables, options?: ExecuteQueryOptions): QueryPromise<ListApplicationsByPatientData, ListApplicationsByPatientVariables>;

interface ListApplicationsByVaccineRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListApplicationsByVaccineVariables): QueryRef<ListApplicationsByVaccineData, ListApplicationsByVaccineVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListApplicationsByVaccineVariables): QueryRef<ListApplicationsByVaccineData, ListApplicationsByVaccineVariables>;
  operationName: string;
}
export const listApplicationsByVaccineRef: ListApplicationsByVaccineRef;

export function listApplicationsByVaccine(vars: ListApplicationsByVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<ListApplicationsByVaccineData, ListApplicationsByVaccineVariables>;
export function listApplicationsByVaccine(dc: DataConnect, vars: ListApplicationsByVaccineVariables, options?: ExecuteQueryOptions): QueryPromise<ListApplicationsByVaccineData, ListApplicationsByVaccineVariables>;

