import React, { useRef } from "react";
import { runInAction, observable, action, computed } from "mobx";
import { Observer, useLocalStore } from "mobx-react-lite";
import {
  Tag,
  Button,
  Modal,
  Space,
  message,
  Table,
  Radio,
  Checkbox,
} from "antd";
import { TablePaginationConfig } from "antd/es/table";
import { TableRowSelection } from "antd/lib/table/interface";
import ProTable, { ProColumns, ActionType } from "@ant-design/pro-table";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppStore } from "../../../hooks/index";
import { regIsEmpty, getAntdSpin } from "../../../util/index";
import AddOrUpdatePage from "../edit/index";
import "./style.less";

const paginationConfig: TablePaginationConfig = {
  position: ["bottomRight", "topRight"],
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  responsive: true,
};

class LocalState {
  @observable.ref selectedRowKeys: React.ReactText[] = [];

  @action
  setSelectedRowKeys(keys: React.ReactText[]) {
    this.selectedRowKeys = keys;
  }

  @computed
  get rowSelection(): TableRowSelection<IListItem> {
    return {
      selectedRowKeys: this.selectedRowKeys,
      onChange: this.setSelectedRowKeys,
      selections: [
        Table.SELECTION_ALL,
        Table.SELECTION_INVERT,
        {
          key: "odd",
          text: "选择奇数行",
          onSelect: (changableRowKeys) => {
            let newSelectedRowKeys = [] as React.ReactText[];
            newSelectedRowKeys = changableRowKeys.filter((key, index) => {
              if (index % 2 !== 0) {
                return false;
              }
              return true;
            });
            this.setSelectedRowKeys(newSelectedRowKeys);
          },
        },
        {
          key: "even",
          text: "选择偶数行",
          onSelect: (changableRowKeys) => {
            let newSelectedRowKeys = [] as React.ReactText[];
            newSelectedRowKeys = changableRowKeys.filter((key, index) => {
              if (index % 2 !== 0) {
                return true;
              }
              return false;
            });
            this.setSelectedRowKeys(newSelectedRowKeys);
          },
        },
      ],
    };
  }
}

export default () => {
  const isNeedRefetchRef = useRef(false);

  const { articleStore, commonStore } = useAppStore();

  const { modalWithPageStore, sortArgObj } = articleStore;

  const closeModal = () => {
    modalWithPageStore.setIsShowThisModal(false);
  };

  const setIsNeedRefetch = (isNeedRefetch: boolean) => {
    isNeedRefetchRef.current = isNeedRefetch;
  };

  const getEnabledSortObj = () => {
    const sort = {};
    Object.keys(sortArgObj).forEach((key) => {
      sortArgObj[key].enabled && (sort[key] = sortArgObj[key].direction);
    });
    return sort;
  };

  const getArticles = (params) => {
    const { current, pageSize, ...where } = params;
    localState.setSelectedRowKeys([]);
    return articleStore
      .getArticlesByPage({
        page: current || 1,
        limit: pageSize,
        where,
        sort: getEnabledSortObj(),
      })
      .then((response) => {
        return response
          ? {
              data: response.docs,
              total: response.totalDocs,
              success: true,
            }
          : {
              data: [],
              success: true,
            };
      });
  };

  const columns: ProColumns<IListItem>[] = [
    {
      title: "序号",
      dataIndex: "index",
      valueType: "index",
      width: 60,
      responsive: ["lg"],
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      width: 170,
      ellipsis: true,
      copyable: true,
      fieldProps: {
        placeholder: "标题包含的关键字",
        allowClear: true,
      },
    },
    {
      title: "发布状态",
      dataIndex: "isPublished",
      key: "isPublished",
      width: 90,
      responsive: ["lg"],
      valueEnum: {
        true: {
          text: "已发布",
          status: "Success",
        },
        false: {
          text: "未发布",
          status: "Default",
        },
      },
      fieldProps: {
        placeholder: "全部",
      },
      order: 10,
    },
    {
      title: "删除状态",
      dataIndex: "isDeleted",
      key: "isDeleted",
      width: 118,
      responsive: ["lg"],
      valueEnum: {
        true: {
          text: "已标记删除",
          status: "Warning",
        },
        false: {
          text: "正常",
          status: "Success",
        },
      },
      fieldProps: {
        placeholder: "全部",
      },
      order: 9,
    },
    {
      title: "更新日期",
      dataIndex: "updateAt",
      valueType: "dateTimeRange",
      width: 95,
      responsive: ["lg"],
      render: (_, record) => {
        return regIsEmpty.test(record.updateAt) || !record.updateAt
          ? "-"
          : dayjs(record.updateAt).format("YYYY-MM-DD HH:mm:ss");
      },
      fieldProps: {
        showTime: false,
        format: "YYYY-MM-DD",
        placeholder: ["开始日期", "结束日期"],
      },
      order: 7,
    },
    {
      title: "添加日期",
      dataIndex: "postAt",
      valueType: "dateTimeRange",
      width: 95,
      responsive: ["lg"],
      render: (_, record) => {
        return regIsEmpty.test(record.postAt) || !record.postAt
          ? "-"
          : dayjs(record.postAt).format("YYYY-MM-DD HH:mm:ss");
      },
      fieldProps: {
        showTime: false,
        format: "YYYY-MM-DD",
        placeholder: ["开始日期", "结束日期"],
      },
      order: 8,
    },
    {
      title: "标签",
      dataIndex: "tags",
      key: "tags",
      responsive: ["lg"],
      render: (_, record) => {
        return record.tags.map((tag, index) => (
          <Tag key={index} className="mb8">
            {tag}
          </Tag>
        ));
      },
      fieldProps: {
        placeholder: "多个标签用分号(;)分隔",
        allowClear: true,
      },
    },
    {
      title: "操作",
      key: "option",
      width: 100,
      search: false,
      render: (_, record, index) => [
        <Space direction="vertical" key="action">
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              articleStore.showAddOrUpdatePage("UPDATE", record._id, index);
            }}
          >
            编辑
          </Button>

          <Button
            type="primary"
            onClick={() => {
              articleStore.togglePublishStatus(record).then((v) => {
                message[v ? "success" : "error"](
                  `序号【${index + 1}】${record.isPublished ? "" : "取消"}发布${
                    v ? "成功" : "失败"
                  }`
                );
                if (v) {
                  tableRef.current?.reload();
                }
              });
            }}
          >{`${record.isPublished ? "取消" : ""}发布`}</Button>

          <Button
            type="primary"
            onClick={() => {
              articleStore.toggleDeleteStatus(record).then((v) => {
                message[v ? "success" : "error"](
                  `序号【${index + 1}】${
                    record.isDeleted ? "" : "取消"
                  }标记删除${v ? "成功" : "失败"}`
                );
                if (v) {
                  tableRef.current?.reload();
                }
              });
            }}
          >{`${record.isDeleted ? "取消" : ""}删除`}</Button>
        </Space>,
      ],
    },
  ];

  const tableRef = useRef<ActionType>();

  const refetchArticles = () => {
    if (isNeedRefetchRef.current) {
      tableRef.current?.reload();
      isNeedRefetchRef.current = false;
    }
  };

  const localState = useLocalStore(() => new LocalState());

  const beforeSearchSubmit = (formValueObj) => {
    const keys = Object.keys(formValueObj);
    if (keys.includes("isPublished")) {
      const isPublished = formValueObj.isPublished;
      isPublished === "true"
        ? (formValueObj.isPublished = true)
        : isPublished === "false"
        ? (formValueObj.isPublished = false)
        : delete formValueObj.isPublished;
    }
    if (keys.includes("isDeleted")) {
      const isDeleted = formValueObj.isDeleted;
      isDeleted === "true"
        ? (formValueObj.isDeleted = true)
        : isDeleted === "false"
        ? (formValueObj.isDeleted = false)
        : delete formValueObj.isDeleted;
    }
    if (keys.includes("postAt")) {
      const postAt = formValueObj.postAt;
      postAt && postAt.length
        ? (formValueObj.postAt = formValueObj.postAt.map((date) =>
            date.substring(0, 10)
          ))
        : delete formValueObj.postAt;
    }
    if (keys.includes("updateAt")) {
      const updateAt = formValueObj.updateAt;
      updateAt && updateAt.length
        ? (formValueObj.updateAt = formValueObj.updateAt.map((date) =>
            date.substring(0, 10)
          ))
        : delete formValueObj.updateAt;
    }
    if (keys.includes("title")) {
      const title = formValueObj.title;
      if (regIsEmpty.test(title)) {
        delete formValueObj.title;
      }
    }
    if (keys.includes("tags")) {
      const tags = formValueObj.tags;
      if (tags && !regIsEmpty.test(tags)) {
        formValueObj.tags = tags
          .split(";")
          .filter((tag) => !regIsEmpty.test(tag));
      } else {
        delete formValueObj.tags;
      }
    }
    return formValueObj;
  };

  const optionsConfig = { fullScreen: false };

  const onFixSearchAreaChange = (e) => {
    articleStore.setHasFixedSearchArea(e.target.checked);
  };

  const toolBarRender = () => [
    <Button
      key="add"
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => articleStore.showAddOrUpdatePage("ADD")}
    >
      写文章
    </Button>,
  ];

  return (
    <>
      <Observer>
        {() => {
          return (
            <Modal
              wrapClassName="modalWrapperClass"
              destroyOnClose={true}
              closable={false}
              keyboard={false}
              footer={null}
              visible={modalWithPageStore.isShowThisModal}
              afterClose={refetchArticles}
            >
              <AddOrUpdatePage
                dataInfo={modalWithPageStore.innerPageData}
                closeModal={closeModal}
                setIsNeedRefetch={setIsNeedRefetch}
              />
            </Modal>
          );
        }}
      </Observer>

      <Observer>
        {() => {
          return articleStore.operationIsApplying
            ? getAntdSpin({
                tip: "正在应用操作...",
                wrapperStyleObj: {
                  position: "fixed",
                  zIndex: 100,
                  top: "0",
                  right: "0",
                  bottom: "0",
                  left: "0",
                  backgroundColor: "rgba(255,255,255,0.25)",
                  transform: "translate(0,0)",
                },
              })
            : null;
        }}
      </Observer>

      <Observer>
        {() => {
          return (
            <ProTable<IListItem>
              className={`${
                articleStore.hasFixedSearchArea ? "hasFixedSearchArea" : ""
              }  ${commonStore.shouldHasTop ? "shouldHasTop" : ""}`}
              tableClassName="fixSelectionExtra"
              headerTitle="文章列表"
              rowKey="_id"
              dateFormatter="string"
              options={optionsConfig}
              search={{
                defaultColsNumber: 4,
                optionRender: (_, __, dom) => {
                  return [
                    <div className="chkFixedSearchArea" key="chkFixed">
                      <Observer>
                        {() => {
                          return (
                            <Checkbox
                              checked={articleStore.hasFixedSearchArea}
                              onChange={onFixSearchAreaChange}
                            >
                              固定搜索区
                            </Checkbox>
                          );
                        }}
                      </Observer>
                    </div>,
                    dom,
                  ];
                },
              }}
              tableExtraRender={() => {
                return (
                  <Observer>
                    {() => {
                      return (
                        <div className="sortItemWrapper">
                          <div className="sortItem">
                            <Observer>
                              {() => (
                                <Checkbox
                                  checked={sortArgObj.updateAt.enabled}
                                  onClick={articleStore.toggleSortByUpdateAt}
                                >
                                  <span className="label">按更新时间排序</span>
                                  <Radio.Group
                                    value={sortArgObj.updateAt.direction}
                                    disabled={!sortArgObj.updateAt.enabled}
                                    onChange={(e) => {
                                      runInAction(() => {
                                        sortArgObj.updateAt.direction =
                                          e.target.value;
                                      });
                                    }}
                                  >
                                    <Radio value="ASCEND">升序</Radio>
                                    <Radio value="DESCEND">降序</Radio>
                                  </Radio.Group>
                                </Checkbox>
                              )}
                            </Observer>
                          </div>

                          <div className="sortItem">
                            <Observer>
                              {() => (
                                <Checkbox
                                  checked={sortArgObj.postAt.enabled}
                                  onClick={articleStore.toggleSortByPostAt}
                                >
                                  <span className="label">按添加时间排序</span>
                                  <Radio.Group
                                    value={sortArgObj.postAt.direction}
                                    disabled={!sortArgObj.postAt.enabled}
                                    onChange={(e) => {
                                      runInAction(() => {
                                        sortArgObj.postAt.direction =
                                          e.target.value;
                                      });
                                    }}
                                  >
                                    <Radio value="ASCEND">升序</Radio>
                                    <Radio value="DESCEND">降序</Radio>
                                  </Radio.Group>
                                </Checkbox>
                              )}
                            </Observer>
                          </div>
                        </div>
                      );
                    }}
                  </Observer>
                );
              }}
              toolBarRender={toolBarRender}
              actionRef={tableRef}
              columns={columns}
              request={getArticles}
              pagination={paginationConfig}
              rowSelection={localState.rowSelection}
              beforeSearchSubmit={beforeSearchSubmit}
            />
          );
        }}
      </Observer>
    </>
  );
};
