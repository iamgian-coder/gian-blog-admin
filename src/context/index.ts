import React from "react";
import { AppStore } from "../stores";

const appStore = AppStore.getAppStore();

export const storeContext = React.createContext({
  appStore,
  userStore: appStore.userStore,
  loginStore: appStore.loginStore,
  commonStore: appStore.commonStore,
  articleStore: appStore.articleStore,
});
