const officialConfig = {
  apiKey: "AIzaSyCwH4dDAfqZznP11hjspsLtTrbB0hAE5GY",
  authDomain: "vitta-5ec1e.firebaseapp.com",
  projectId: "vitta-5ec1e",
  storageBucket: "vitta-5ec1e.firebasestorage.app",
  messagingSenderId: "733443225670",
  appId: "1:733443225670:web:9334e443d9f13b0092b247",
};

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || officialConfig.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || officialConfig.authDomain,
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || officialConfig.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    officialConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    officialConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || officialConfig.appId,
};

if (firebaseConfig.projectId !== "vitta-5ec1e") {
  throw new Error(
    "Configuração inválida: o Vitta Web deve usar o projeto vitta-5ec1e.",
  );
}

export const useFirebaseEmulators =
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";
