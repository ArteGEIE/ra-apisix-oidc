# @arte/ra-apisix-oidc

`@arte/ra-apisix-oidc` provides a React-Admin AuthProvider for authentication via APISIX OIDC endpoints.

This major version uses a session/cookie model: APISIX session state is authoritative, and this package no longer exports an HTTP client.

### Example

```tsx
import { Admin, ListGuesser, Resource, ShowGuesser } from "react-admin";
import { fetchUtils } from "ra-core";
import { apisixOidcAuthProvider } from "@arte/ra-apisix-oidc";
import simpleRestDataProvider from "ra-data-simple-rest";

const dataProvider = simpleRestDataProvider("http://localhost:9080/api");

const authProvider = apisixOidcAuthProvider();

export const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    loginPage={false}
  >
    <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    <Resource name="users" list={ListGuesser} show={ShowGuesser} />
  </Admin>
);
```

### `apisixOidcAuthProvider(options)`

You can customize the authentication provider with the following options:

- `loginURL` (string, default: `${window.location.origin}/oidc/login`): Login endpoint URL.
- `logoutURL` (string, default: `${window.location.origin}/oidc/logout`): Logout endpoint URL.
- `userInfoURL` (string, default: `${window.location.origin}/oidc/me`): User info endpoint URL.
- `storage` (Storage, default: `localStorage`): Storage used only to keep previous location.

Example usage:

```ts
import { apisixOidcAuthProvider } from "@arte/ra-apisix-oidc";

const authProvider = apisixOidcAuthProvider({
  loginURL: "http://localhost:9080/oidc/login",
  logoutURL: "http://localhost:9080/oidc/logout",
  userInfoURL: "http://localhost:9080/oidc/me",
});
```

## Migration notes (breaking major)

- `httpClient` has been removed from package exports in favor of the default one.
- Token-in-localStorage auth flow has been removed from `apisixOidcAuthProvider`.
- `handleCallback` is now a no-op because APISIX handles OIDC session flow.

## Configuration

APISIX and the upstream API should expose the following behavior:

### `/oidc/login`

- **Purpose:** Start OIDC login and redirect back to the admin app after successful authentication.
- **Behavior:**
  - Unauthenticated users are sent through OIDC authentication.
  - Authenticated users are redirected to app root.

### `/oidc/me`

- **Purpose:** Return user information for the current authenticated APISIX session.
- **Behavior:**
  - The apisix configuration should use the `unauth_action` to return a `401` status for unauthenticated requests to this endpoint.
  - Returns decoded `user` payload.
  - Returns 401 when unauthenticated.

### `/api`

- **Purpose:** The upstream API should accept authenticated requests based on the APISIX session cookie, without requiring a token in the request.
- **Behavior:**
  - The apisix configuration should use the `unauth_action` to return a `401` status for unauthenticated requests to this endpoint.