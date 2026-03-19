import { Admin, ListGuesser, Resource, ShowGuesser } from "react-admin";
import { Layout } from "./Layout";

import { apisixOidcAuthProvider } from "@arte/ra-apisix-oidc";
import simpleRestDataProvider from "ra-data-simple-rest";

const dataProvider = simpleRestDataProvider("http://localhost:9080/api");
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
