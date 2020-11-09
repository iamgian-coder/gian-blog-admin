import { observable, action, computed } from "mobx";
import { ProSettings } from "@ant-design/pro-layout";

export default class CommonStore {
  @observable proSettings: Partial<ProSettings> = {
    layout: "mix",
    fixedHeader: true,
    contentWidth: "Fluid",
    title: "I am Gian",
    navTheme: "realDark",
  };

  @action.bound
  setProSettings({ navTheme, ...rest }: Partial<ProSettings>) {
    this.proSettings = rest;
  }

  @computed
  get shouldHasTop() {
    const { layout, fixedHeader, headerRender } = this.proSettings;
    if (headerRender === undefined || headerRender) {
      return layout && layout === "mix"
        ? true
        : fixedHeader && fixedHeader
        ? true
        : false;
    } else if (headerRender === false) {
      return false;
    }
    return true;
  }
}
