import { observable, action, computed } from "mobx";
import gql from "graphql-tag";
import UserStore from "./userStore";
import { apolloClient } from "../apolloClient";

const gql_authenticate = gql`
  query authenticate($userName: String!, $password: String!) {
    authenticate(userName: $userName, password: $password) {
      name
      nickName
    }
  }
`;

export default class AuthenticationStore {
  @observable isShowingGreeting: boolean = false;

  @observable isShowingBlindfold: boolean = false;

  @observable isAuthenticating: boolean = false;

  @observable.ref userStore: UserStore;

  constructor(userStore: UserStore) {
    this.userStore = userStore;
  }

  @action
  setCutePandaIsShowingGreeting(isShowingGreeting: boolean) {
    this.isShowingGreeting = isShowingGreeting;
    return this;
  }

  @action
  setCutePandaIsShowingBlindfold(isShowingBlindfold: boolean) {
    this.isShowingBlindfold = isShowingBlindfold;
    return this;
  }

  @action
  setIsAuthenticating(isAuthenticating: boolean) {
    this.isAuthenticating = isAuthenticating;
    return this;
  }

  @action
  async authenticate(values) {
    try {
      this.setCutePandaIsShowingGreeting(false)
        .setCutePandaIsShowingBlindfold(false)
        .setIsAuthenticating(true);
      const { data } = await apolloClient.query({
        query: gql_authenticate,
        variables: values,
      });
      this.setIsAuthenticating(false).userStore.setCurrentUser(
        data.authenticate as UserInfoType
      );
      return true;
    } catch {
      this.setIsAuthenticating(false);
      return false;
    }
  }

  @action.bound
  onNameFocus() {
    this.setCutePandaIsShowingBlindfold(false).setCutePandaIsShowingGreeting(
      true
    );
  }

  @action.bound
  onPwdFocus() {
    this.setCutePandaIsShowingGreeting(false).setCutePandaIsShowingBlindfold(
      true
    );
  }

  @action
  logout() {
    this.userStore.removeCurrentUser();
  }

  @computed get isAuthenticated() {
    const currentUser = this.userStore.currentUser;
    return !!currentUser && !!currentUser.name;
  }
}
