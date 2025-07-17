import { Admin, ListGuesser, Resource, ShowGuesser } from "react-admin";
import { Layout } from "./Layout";

import { apisixOidcAuthProvider, httpClient } from "@arte/ra-apisix-oidc";
import simpleRestDataProvider from "ra-data-simple-rest";

const dataProvider = simpleRestDataProvider(
  "http://127.0.0.1:9080/api",
  httpClient,
);
const apisixAuthProvider = apisixOidcAuthProvider();

export const App = () => (
  <Admin
    layout={Layout}
    dataProvider={dataProvider}
    authProvider={apisixAuthProvider}
    loginPage={false}
  >
    <Resource name="posts" list={ListGuesser} show={ShowGuesser} />
    <Resource name="users" list={ListGuesser} show={ShowGuesser} />
  </Admin>
);
