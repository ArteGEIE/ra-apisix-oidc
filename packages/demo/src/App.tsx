import { Admin, EditGuesser, ListGuesser, Resource, ShowGuesser } from "react-admin";
import { Layout } from "./Layout";

import simpleRestDataProvider from "ra-data-simple-rest";
import { httpClient, apisixOidcAuthProvider } from "@arte/ra-apisix-oidc";

const dataProvider = simpleRestDataProvider(
  "http://127.0.0.1:9080/api",
  httpClient,
);

export const App = () => (
  <Admin
    layout={Layout}
    dataProvider={dataProvider}
    authProvider={apisixOidcAuthProvider}
    loginPage={false}
  >
    <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    <Resource name="users" list={ListGuesser} show={ShowGuesser} />
  </Admin>
);
