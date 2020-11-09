/// <reference types="react-scripts" />

declare module "*.less" {
  const string: string;
  export default string;
}

type UserInfoType = Partial<{ name: string; nickName: string }>

interface IAddOrUpdatePageData {
  _id: string;
  title: string;
  tags: string[];
  markdown: string;
  isPublished: boolean;
  isDeleted: boolean;
}

interface IListItem extends IAddOrUpdatePageData {
  postAt: string;
  updateAt: string;
  views: number;
  liked: number;
}

type EditPageType = "ADD" | "UPDATE";

type AddOrUpdatePageProps = {
  closeModal: () => void;
  setIsNeedRefetch: (isNeedRefetch: boolean) => void;
  dataInfo: {
    pageType: EditPageType;
    index?: number;
    id?: string;
  };
};
