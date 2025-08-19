# @arte/ra-apisix-oidc

## Usage

`@arte/ra-apisix-oidc` provides a React-Admin AuthProvider and HTTP client for authentication via APISIX OIDC endpoints. Use it in your React-Admin app to enable OpenID Connect authentication through APISIX.

### Example

```tsx
import { Admin, ListGuesser, Resource, ShowGuesser } from "react-admin";
import { apisixOidcAuthProvider, httpClient } from '@arte/ra-apisix-oidc';
import simpleRestDataProvider from 'ra-data-simple-rest';

const dataProvider = simpleRestDataProvider('http://localhost:9080/api', httpClient());
const authProvider = apisixOidcAuthProvider();

export const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={apisixAuthProvider}
    loginPage={false}
  >
    <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    <Resource name="users" list={ListGuesser} show={ShowGuesser} />
  </Admin>
);
```

### AuthProvider and HTTP Client Options

#### `apisixOidcAuthProvider(options)`

You can customize the authentication provider with the following options:

- `loginURL` (string, default: `${window.location.origin}/oidc/login`): Login endpoint URL.
- `logoutURL` (string, default: `${window.location.origin}/oidc/logout`): Logout endpoint URL.
- `userInfoURL` (string, default: `${window.location.origin}/oidc/me`): User info endpoint URL.
- `storage` (Storage, default: `localStorage`): Storage to use for tokens.

Example usage:
```ts
import { apisixOidcAuthProvider } from '@arte/ra-apisix-oidc';

const authProvider = apisixOidcAuthProvider({
  loginURL: 'http://localhost:9080/oidc/login',
  logoutURL: 'http://localhost:9080/oidc/logout',
  userInfoURL: 'http://localhost:9080/oidc/me',
  storage: localStorage,
});
```

#### `httpClient(storage?)`

The HTTP client automatically attaches authentication tokens to requests. You can customize its behavior with the following options:

- `storage` (Storage, default: `localStorage`): Storage to use for tokens. The access token is expected to be stored under the key `access_token`.

Example usage:
```ts
import { httpClient } from '@arte/ra-apisix-oidc';

const client = httpClient(localStorage);
client('http://localhost:9080/api/posts');
```


### Configuration

The API must implement the following routes to transmit the APISIX token to the frontend:

#### `/oidc/login`

- **Purpose:** Initiates the OIDC login flow. Should validate the presence of the `x-access-token` header and redirect the user to the React-Admin app (e.g., `/#/auth-callback`) to complete authentication and store the token in local storage.
- **Behavior:**
  - If `x-access-token` is missing, respond with 401 Unauthorized.
  - If present, redirect to the frontend callback route.

##### Example

```ts
app.get('/oidc/login', (req, res) => {
    const accessToken = req.headers['x-access-token'];
    if (!accessToken) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'You are not authorized to access this resource.',
        });
    }
    // redirect to the react-admin page to set the access token in the local storage
    res.redirect(`/#/auth-callback`);
});
```

#### `/oidc/me`

- **Purpose:** Returns user information and tokens for the authenticated user.
- **Behavior:**
  - Requires the `x-access-token` header.
  - Decodes the access token and returns user info, `accessToken`.
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
        accessToken
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