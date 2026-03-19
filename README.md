# @arte/ra-apisix-oidc

## Usage

`@arte/ra-apisix-oidc` provides a React-Admin AuthProvider for authentication via APISIX OIDC endpoints.

This major version uses a session/cookie model: APISIX session state is authoritative, and this package no longer exports an HTTP client.

### Example

```tsx
import { Admin, ListGuesser, Resource, ShowGuesser } from "react-admin";
import { fetchUtils } from 'ra-core';
import { apisixOidcAuthProvider } from '@arte/ra-apisix-oidc';
import simpleRestDataProvider from 'ra-data-simple-rest';

const dataProvider = simpleRestDataProvider('http://localhost:9080/api', (url, options = {}) =>
  fetchUtils.fetchJson(url, {
    ...options,
    credentials: 'include',
  })
);
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

### AuthProvider Options

#### `apisixOidcAuthProvider(options)`

You can customize the authentication provider with the following options:

- `loginURL` (string, default: `${window.location.origin}/oidc/login`): Login endpoint URL.
- `logoutURL` (string, default: `${window.location.origin}/oidc/logout`): Logout endpoint URL.
- `userInfoURL` (string, default: `${window.location.origin}/oidc/me`): User info endpoint URL.
- `credentials` (`RequestCredentials`, default: `include`): Credentials mode for auth provider requests.
- `storage` (Storage, default: `localStorage`): Storage used only for preserving previous location.

Example usage:
```ts
import { apisixOidcAuthProvider } from '@arte/ra-apisix-oidc';

const authProvider = apisixOidcAuthProvider({
  loginURL: 'http://localhost:9080/oidc/login',
  logoutURL: 'http://localhost:9080/oidc/logout',
  userInfoURL: 'http://localhost:9080/oidc/me',
  credentials: 'include',
});
```

### Migration notes (breaking major)

- `httpClient` has been removed from package exports.
- Token-in-localStorage auth flow has been removed from `apisixOidcAuthProvider`.
- `handleCallback` is now a no-op because APISIX manages the OIDC session flow.
- Consumers should use their own React-Admin data provider client configured with cookie credentials.


### Configuration

APISIX and the upstream API should expose the following behavior:

#### `/oidc/login`

- **Purpose:** Start OIDC login and redirect back to the app after authentication.
- **Behavior:**
  - Unauthenticated users are sent through OIDC login.
  - Authenticated users are redirected to app root.

##### Example

```ts
app.get('/oidc/login', (req, res) => {
  res.redirect(`/`);
});
```

#### `/oidc/me`

- **Purpose:** Returns user information for the current authenticated APISIX session.
- **Behavior:**
  - Requires the `x-access-token` header propagated by APISIX.
  - Decodes the access token and returns user info.
  - If the token is missing or invalid, respond with 401 Unauthorized.

##### Example

```ts
app.get('/oidc/me', (req, res) => {
    const accessToken = req.headers['x-access-token'];
    if (!accessToken) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'You are not authorized to access this resource.',
        });
    }

    const user = jwt.decode(accessToken as string) as jwt.JwtPayload;
    return res.status(200).json({
      user,
    });
});
```

## Demo

This repository includes a demo environment to showcase authentication and API integration.

### Architecture Overview

- **APISIX**: Acts as the API gateway, handling OIDC authentication and proxying requests.
- **Keycloak**: Provides the OIDC identity provider for authentication.
- **Demo API**: A simple Express server serving `/api/posts` and `/api/users` endpoints for React-Admin.
- **React-Admin Demo**: Frontend app using `ra-apisix-oidc` for authentication and data access.

All services are orchestrated via Docker Compose.

### How to Start the Demo

1. **Install dependencies and build packages:**
   ```sh
   make install
   ```
2. **Start all demo services:**
   ```sh
   make start-demo
   ```
3. **Access the demo app:**
   - Open [http://localhost:9080](http://localhost:9080)
   - Login/password : user1/password

4. **Stop the demo:**
   ```sh
   make stop-demo
   ```

### Credits

This extension was developed by Marmelab for the Arte GEIE team in Strasbourg, France. External contributions and suggestions are welcome. Feel free to open an issue or submit a pull request.

### License

This extension is licensed under the Apache License, Version 2.0. You can find the full license text in the LICENSE file.