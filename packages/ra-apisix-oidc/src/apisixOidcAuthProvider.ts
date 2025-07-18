import { type AuthProvider, PreviousLocationStorageKey } from "ra-core";


export type ApisixAuthProviderParams = {
  loginURL?: string;
  logoutURL?: string;
  userInfoURL?: string;
  storage?: Storage;
};

/**
 * AuthProvider for react-admin using APISIX OIDC endpoints.
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.loginURL] - Login endpoint URL (default: `${window.location.origin}/oidc/login`)
 * @param {string} [options.logoutURL] - Logout endpoint URL (default: `${window.location.origin}/oidc/logout`)
 * @param {string} [options.meURL] - User info endpoint URL (default: `${window.location.origin}/oidc/me`)
 * @param {Storage} [options.storage] - Storage to use for tokens (default: localStorage)
 * @returns {AuthProvider} A react-admin AuthProvider implementation
 *
 * @example
 * import { apisixOidcAuthProvider } from './apisixOidcAuthProvider';
 *
 * const authProvider = apisixOidcAuthProvider({
 *   loginURL: 'http://localhost:9080/oidc/login',
 *   logoutURL: 'http://localhost:9080/oidc/logout',
 *   meURL: 'http://localhost:9080/oidc/me',
 * });
 */
export const apisixOidcAuthProvider: (options?: ApisixAuthProviderParams) => AuthProvider = (options) => {
  const {
    loginURL = `${window.location.origin}/oidc/login`,
    logoutURL = `${window.location.origin}/oidc/logout`,
    userInfoURL = `${window.location.origin}/oidc/me`,
    storage = localStorage,
  } = options || {};
  let isRedirecting = false;
  return {
    login: () => {
      return Promise.reject();
    },
    logout: async () => {
      const accessToken = storage.getItem("access_token");
      if (!accessToken) {
        return Promise.resolve();
      }
      storage.removeItem("access_token");
      return Promise.resolve(logoutURL);
    },
    checkError: (error) => {
      if (error.status === 401) {
        saveCurrentLocation(storage);
        storage.removeItem("access_token");
        window.location.href = loginURL;
        return Promise.reject({ logoutUser: false, redirectTo: loginURL });
      }
      return Promise.resolve();
    },
    checkAuth: async () => {
      const accessToken = storage.getItem("access_token");
      if (!accessToken) {
        if (!isRedirecting) {
          isRedirecting = true;
          saveCurrentLocation(storage);
          setTimeout(() => {
            window.location.href = loginURL;
          }, 100);
        }
        return Promise.reject({ redirectTo: false });
      }
      return Promise.resolve();
    },
    getIdentity: async () => {
      const accessToken = storage.getItem("access_token");
      if (!accessToken) {
        return Promise.reject();
      }
      const response = await fetch(userInfoURL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        return Promise.reject();
      }
      const userInfo = await response.json();
      const { user } = userInfo;
      if (!user) {
        return Promise.reject();
      }
      const identity = {
        id: user.sub,
        fullName: user.preferred_username || user.name || "",
        avatar: user.picture || "",
        email: user.email || "",
        roles: user.roles || [],
      };
      return Promise.resolve(identity);
    },
    handleCallback: async () => {
      const response = await fetch(userInfoURL);
      if (!response.ok) {
        return Promise.reject();
      }
      const body = await response.json();
      if (!body.accessToken) {
        return Promise.reject();
      }
      storage.setItem("access_token", body.accessToken);
    },
  }
};

const saveCurrentLocation = (storage: Storage) => {
  if (window.location.href.includes("login")) {
    return; // Do not save the location if it's the login page
  }
  const locationToSave = window.location.href
    .replace(window.location.origin, "")
    .replace("/#/", "/");
  storage.setItem(PreviousLocationStorageKey, locationToSave);
};
