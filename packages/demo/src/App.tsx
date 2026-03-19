import { Admin, ListGuesser, Resource, ShowGuesser } from "react-admin";
import { Layout } from "./Layout";

import { apisixOidcAuthProvider } from "@arte/ra-apisix-oidc";
import { fetchUtils, type Options } from "ra-core";
import simpleRestDataProvider from "ra-data-simple-rest";

const sessionHttpClient = (url: string, options: Options = {}) =>
  fetchUtils.fetchJson(url, {
    ...options,
    credentials: "include",
  });

const dataProvider = simpleRestDataProvider(
  "http://localhost:9080/api",
  sessionHttpClient,
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
