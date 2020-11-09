import UserStore from "./userStore";
import LoginStore from "./loginStore";
import CommonStore from "./commonStore";
import ArticleStore from "./articleStore";

export class AppStore {
  userStore: UserStore;
  loginStore: LoginStore;
  commonStore: CommonStore;
  articleStore: ArticleStore;

  static getAppStore(): AppStore {
    const appStore = new AppStore();
    return appStore;
  }

  constructor() {
    this.userStore = UserStore.getFromStorageOrNew();
    this.loginStore = new LoginStore(this.userStore);
    this.commonStore = new CommonStore();
    this.articleStore = new ArticleStore();
  }
}
