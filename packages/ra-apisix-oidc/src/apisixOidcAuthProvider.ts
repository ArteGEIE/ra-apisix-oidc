import { type AuthProvider, PreviousLocationStorageKey } from 'ra-core';

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
 * @param {string} [options.userInfoURL] - User info endpoint URL (default: `${window.location.origin}/oidc/me`)
 * @param {Storage} [options.storage] - Storage used only to save previous location (default: localStorage)
 * @returns {AuthProvider} A react-admin AuthProvider implementation
 *
 * @example
 * import { apisixOidcAuthProvider } from './apisixOidcAuthProvider';
 *
 * const authProvider = apisixOidcAuthProvider({
 *   loginURL: 'http://localhost:9080/oidc/login',
 *   logoutURL: 'http://localhost:9080/oidc/logout',
 *   userInfoURL: 'http://localhost:9080/oidc/me',
 * });
 */
export const apisixOidcAuthProvider = (
  options?: ApisixAuthProviderParams
): AuthProvider => {
  const {
    loginURL = `${window.location.origin}/oidc/login`,
    logoutURL = `${window.location.origin}/oidc/logout`,
    userInfoURL = `${window.location.origin}/oidc/me`,
    storage = localStorage,
  } = options || {};
  return {
    login: () => {
      return Promise.resolve();
    },
    logout: async () => {
      const response = await fetch(userInfoURL);
      if (response.status === 401) {
        saveCurrentLocation(storage);
        window.location.href = loginURL;
        return Promise.resolve();
      }
      window.location.href = logoutURL;
      return Promise.reject();
    },
    checkError: error => {
      if (error.status === 401) {
        saveCurrentLocation(storage);
        window.location.href = loginURL;
        return Promise.resolve();
      }
      return Promise.resolve();
    },
    checkAuth: async () => {
      const response = await fetch(userInfoURL);
      if (response.status === 401) {
        saveCurrentLocation(storage);
        window.location.href = loginURL;
        return Promise.resolve();
      }
      return Promise.resolve();
    },
    getIdentity: async () => {
      const response = await fetch(userInfoURL);
      if (!response.ok) {
        return Promise.resolve();
      }
      const userInfo = await response.json();
      const { user } = userInfo;
      if (!user) {
        return Promise.resolve();
      }
      const identity = {
        ...user,
        id: user.sub,
        fullName: user.preferred_username || user.name || '',
        avatar: user.picture || '',
        email: user.email || '',
        roles: user.roles || [],
      };
      return Promise.resolve(identity);
    },
    handleCallback: async () => {
      return Promise.resolve();
    },
  };
};

const saveCurrentLocation = (storage: Storage) => {
  if (window.location.href.includes('login')) {
    return; // Do not save the location if it's the login page
  }
  const locationToSave = window.location.href
    .replace(window.location.origin, '')
    .replace('/#/', '/');
  storage.setItem(PreviousLocationStorageKey, locationToSave);
};
