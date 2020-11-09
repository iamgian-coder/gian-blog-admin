import { observable, action } from "mobx";
import gql from "graphql-tag";
import { apolloClient } from "../apolloClient";

const gql_getArticleById = gql`
  query getArticleById($id: ID!) {
    getArticleById(id: $id) {
      _id
      title
      tags
      markdown
      isDeleted
      isPublished
    }
  }
`;

const gql_updateArticle = gql`
  mutation updateArticle($id: ID!, $data: AddOrUpdateArticleInput!) {
    updateArticle(id: $id, data: $data) {
      _id @include(if: false)
    }
  }
`;

const gql_addArticle = gql`
  mutation addArticle($data: AddOrUpdateArticleInput!) {
    addArticle(data: $data) {
      _id @include(if: false)
    }
  }
`;

const gql_getArticlesByPage = gql`
  query getArticlesByPage(
    $page: Int!
    $limit: Int!
    $where: QueryWhereInput
    $sort: SortInput
  ) {
    getArticlesByPage(page: $page, limit: $limit, where: $where, sort: $sort) {
      docs {
        _id
        title
        markdown
        tags
        postAt
        updateAt
        views
        liked
        isPublished
        isDeleted
      }
      totalDocs
      hasNextPage
      nextPage
      page
      limit
    }
  }
`;

const gql_updateDeleteStatus = gql`
  mutation updateDeleteStatus($id: ID!, $newStatus: Boolean!) {
    updateDeleteStatus(id: $id, newStatus: $newStatus) {
      _id
      isDeleted
    }
  }
`;

const gql_updatePublishStatus = gql`
  mutation updatePublishStatus($id: ID!, $newStatus: Boolean!) {
    updatePublishStatus(id: $id, newStatus: $newStatus) {
      _id
      isPublished
    }
  }
`;

class ModalWithPageStore {
  innerPageData: { pageType: EditPageType; index: number; id: string } = {
    pageType: "ADD",
    index: -1,
    id: "",
  };

  @observable isShowThisModal: boolean = false;

  @action.bound
  setIsShowThisModal(isShowThisModal: boolean) {
    this.isShowThisModal = isShowThisModal;
    return this;
  }
}

type SortDirection = "ASCEND" | "DESCEND";

export default class ArticleStore {
  @observable modalWithPageStore = new ModalWithPageStore();

  @observable hasFixedSearchArea: boolean = false;

  @observable operationIsApplying: boolean = false;

  @observable sortArgObj: {
    postAt: { enabled: boolean; direction: SortDirection };
    updateAt: { enabled: boolean; direction: SortDirection };
  } = {
    postAt: { enabled: true, direction: "DESCEND" },
    updateAt: { enabled: false, direction: "DESCEND" },
  };

  @action.bound
  setHasFixedSearchArea(hasFixedSearchArea: boolean) {
    this.hasFixedSearchArea = hasFixedSearchArea;
  }

  @action.bound
  setOperationIsApplying(isApplying) {
    this.operationIsApplying = isApplying;
  }

  @action.bound
  toggleSortByPostAt() {
    this.sortArgObj.postAt.enabled = !this.sortArgObj.postAt.enabled;
  }

  @action.bound
  toggleSortByUpdateAt() {
    this.sortArgObj.updateAt.enabled = !this.sortArgObj.updateAt.enabled;
  }

  getArticleById(id: string) {
    return apolloClient
      .query({ query: gql_getArticleById, variables: { id } })
      .then(({ data }) => data.getArticleById)
      .catch(() => false);
  }

  getArticlesByPage({ page, limit, where, sort }) {
    return apolloClient
      .query({
        query: gql_getArticlesByPage,
        variables: {
          page,
          limit,
          where,
          sort,
        },
      })
      .then(({ data }) => data.getArticlesByPage)
      .catch(() => false);
  }

  updateArticle({ _id, ...rest }: IAddOrUpdatePageData) {
    return apolloClient
      .mutate({
        mutation: gql_updateArticle,
        variables: {
          id: _id,
          data: rest,
        },
      })
      .then(() => true)
      .catch(() => false);
  }

  addArticle({ _id, ...rest }: IAddOrUpdatePageData) {
    return apolloClient
      .mutate({
        mutation: gql_addArticle,
        variables: {
          data: rest,
        },
      })
      .then(() => true)
      .catch(() => false);
  }

  togglePublishStatus(doc: IListItem) {
    this.setOperationIsApplying(true);
    return apolloClient
      .mutate({
        mutation: gql_updatePublishStatus,
        variables: {
          id: doc._id,
          newStatus: !doc.isPublished,
        },
      })
      .then(({ data }) => {
        doc.isPublished = data.updatePublishStatus.isPublished;
        return true;
      })
      .catch(() => false)
      .finally(() => {
        this.setOperationIsApplying(false);
      });
  }

  toggleDeleteStatus(doc: IListItem) {
    this.setOperationIsApplying(true);
    return apolloClient
      .mutate({
        mutation: gql_updateDeleteStatus,
        variables: {
          id: doc._id,
          newStatus: !doc.isDeleted,
        },
      })
      .then(({ data }) => {
        doc.isDeleted = data.updateDeleteStatus.isDeleted;
        return true;
      })
      .catch(() => false)
      .finally(() => {
        this.setOperationIsApplying(false);
      });
  }

  showAddOrUpdatePage(
    pageType: EditPageType,
    id: string = "",
    index: number = -1
  ) {
    this.modalWithPageStore.innerPageData = { pageType, id, index };
    this.modalWithPageStore.setIsShowThisModal(true);
  }
}
