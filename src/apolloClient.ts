import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import { onError } from "apollo-link-error";
import { HttpLink } from "apollo-link-http";
import { notification } from "antd";
import randomstring from "randomstring";
import crypto from "crypto";

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers }) => {
    const genSign = (id, stamp, nonce) => {
      const hmac = crypto.createHmac(
        "sha256",
        process.env.REACT_APP_CLIENT_SECRET!
      );
      hmac.update(`${nonce}${id}${stamp}`);
      return hmac.digest("hex");
    };
    const id = process.env.REACT_APP_CLIENT_ID!;
    const stamp = Date.now();
    const nonce = randomstring.generate();
    const extraHeaders = {
      id,
      stamp,
      nonce,
      sign: genSign(id, stamp, nonce),
    };
    if (process.env.NODE_ENV !== "production") {
      extraHeaders["from-admin"] = true;
    }
    return {
      headers: {
        ...headers,
        ...extraHeaders,
      },
    };
  });
  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    onError(({ graphQLErrors, networkError }) => {
      if (networkError) {
        notification.error({
          message: "Network Error",
          description: networkError.message,
        });
      }
      if (graphQLErrors) {
        graphQLErrors.forEach((err) => {
          notification.error({
            message: err.extensions?.code || err.name || "出错了",
            description: err.message,
          });
        });
      }
    }),
    new HttpLink({ uri: "/api" }),
  ]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache",
    },
  },
});

export { apolloClient };
