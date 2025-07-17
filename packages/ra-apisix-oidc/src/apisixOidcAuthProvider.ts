import { type AuthProvider, PreviousLocationStorageKey } from "ra-core";

// current host
const oidcUrl = window.location.origin;

export const apisixOidcAuthProvider: AuthProvider = {
  login: () => {
    return Promise.reject();
  },
  logout: async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      return Promise.resolve();
    }
    localStorage.removeItem("access_token");
    return Promise.resolve(`${oidcUrl}/oidc/logout`);
  },
  checkError: (error) => {
    if (error.status === 401) {
      saveCurrentLocation();
      localStorage.removeItem("access_token");
      window.location.href = `${oidcUrl}/oidc/login`;
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      return Promise.reject({
        redirectTo: `${oidcUrl}/oidc/login`,
      });
    }
    return Promise.resolve();
  },
  getIdentity: async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      return Promise.reject();
    }
    const response = await fetch(`${oidcUrl}/oidc/me`, {
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
    const response = await fetch(`${oidcUrl}/oidc/me`);
    if (!response.ok) {
      return Promise.reject();
    }
    const body = await response.json();
    if (!body.accessToken) {
      return Promise.reject();
    }
    localStorage.setItem("access_token", body.accessToken);
  },
};

const saveCurrentLocation = () => {
  if (window.location.href.includes("login")) {
    return; // Do not save the location if it's the login page
  }
  const locationToSave = window.location.href
    .replace(window.location.origin, "")
    .replace("/#/", "/");
  localStorage.setItem(PreviousLocationStorageKey, locationToSave);
};
