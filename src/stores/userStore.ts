const UKEY = "appUser";

export default class UserStore {
  static getFromStorageOrNew(): UserStore {
    const userStore = new UserStore();
    const localUserInfo = localStorage.getItem(UKEY);
    if (localUserInfo) {
      userStore.currentUser = JSON.parse(localUserInfo!);
    }
    return userStore;
  }
  currentUser: UserInfoType = {};
  setUserName(name: string) {
    this.currentUser.name = name;
  }
  setUserNickName(nickName: string) {
    this.currentUser.nickName = nickName;
  }
  setCurrentUser(user: UserInfoType, persist: boolean = true) {
    this.currentUser = user;
    persist ? this.persistCurrentUser() : void 0;
  }
  persistCurrentUser() {
    localStorage.setItem(UKEY, JSON.stringify(this.currentUser));
  }
  removeCurrentUser() {
    this.currentUser = {};
    localStorage.removeItem(UKEY);
  }
}
