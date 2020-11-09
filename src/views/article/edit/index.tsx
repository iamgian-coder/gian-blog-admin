import React, { useEffect, useCallback, useRef } from "react";
import { observable, action } from "mobx";
import { useLocalStore, Observer } from "mobx-react-lite";
import { message, Button, Input, Tag, Modal, notification, Radio } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import MarkdownIt from "markdown-it";
import emoji from "markdown-it-emoji";
import anchor from "markdown-it-anchor";
import anchorRightThere from "markdown-it-toc-done-right";
import hljs from "highlight.js";
import MDEditor from "react-markdown-editor-lite";
import { useAppStore } from "../../../hooks";
import { regIsEmpty, getAntdSpin } from "../../../util/index";
import "react-markdown-editor-lite/lib/index.css";
import "highlight.js/styles/atom-one-light.css";
import "./mdeditor.less";
import "./style.less";

const mdEditorStyleObj = {
  width: "100%",
  height: "100%",
  color: "inherit",
  backgroundColor: "inherit",
};

const waittingHolderStyleObj = { width: 0, height: 0, display: "none" };

function pickPropsFromTarget<T, P extends keyof T>(
  target: T & { [key: string]: any },
  keys: P[]
): T {
  const obj = {} as T;
  keys.forEach((key) => {
    obj[key] = target[key];
  });
  return obj;
}

class PageDataStore implements IAddOrUpdatePageData {
  _id = "";
  @observable title = "";
  @observable tags = [] as string[];
  @observable isDeleted = false;
  @observable isPublished = false;
  @observable markdown = "";

  @action
  setTitle(title: string) {
    this.title = title;
  }

  @action
  removeTagByIndex(index: number) {
    this.tags.splice(index, 1);
  }

  @action
  mergeTags(tags: string[]) {
    this.tags = Array.from(new Set(this.tags.concat(tags)));
  }

  @action
  setIsDeleted(isDeleted: boolean) {
    this.isDeleted = isDeleted;
  }

  @action
  setIsPublished(isPublished: boolean) {
    this.isPublished = isPublished;
  }

  @action
  setMarkdown(text: string) {
    this.markdown = text;
  }
}

class LocalStateStore {
  pageData: PageDataStore = new PageDataStore();
  @observable isLoading: boolean = true;
  @observable isApplying: boolean = false;
  @observable isShowTagInput: boolean = false;
  @observable isShowShorcutModal: boolean = false;
  @observable isValid: boolean = false;

  @action
  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  @action
  setIsApplying(isApplying: boolean) {
    this.isApplying = isApplying;
  }

  @action
  setShouldShowTagInput(v: boolean) {
    this.isShowTagInput = v;
  }

  @action
  setShouldShowShorcutModal(v: boolean) {
    this.isShowShorcutModal = v;
  }

  @action
  setIsValid(isValid: boolean) {
    this.isValid = isValid;
  }

  @action
  setIsLoadingDone(data: IAddOrUpdatePageData) {
    Object.assign(this.pageData, data);
    this.setIsLoading(false);
    this.setIsValid(true);
  }

  checkData() {
    if (
      regIsEmpty.test(this.pageData.title) ||
      regIsEmpty.test(this.pageData.markdown)
    ) {
      if (this.isValid) {
        this.setIsValid(false);
        notification.error({
          message: "内容格式错误",
          description: "带有星号(*)是必填项",
          duration: 0,
          placement: "bottomRight",
        });
      }
    } else {
      if (!this.isValid) {
        notification.destroy();
        this.setIsValid(true);
      }
    }
  }

  runCheckAfterTargetFn(target: Function) {
    return (...args) => {
      target.apply(null, args);
      this.checkData();
    };
  }
}

const addOrUpdateSpinWrapperStyle = {
  backgroundColor: "hsla(0,0%,0%,0.75)",
};

const AddOrUpdatePage: React.FC<AddOrUpdatePageProps> = ({
  dataInfo,
  closeModal,
  setIsNeedRefetch,
}) => {
  const localState = useLocalStore(() => new LocalStateStore());

  const { articleStore } = useAppStore();

  const { pageType } = dataInfo;

  const editorRef = useRef<MDEditor>(null);

  const tagInputRef = useRef<Input>(null);

  const closeUpdatePage = useCallback(() => {
    !localState.isValid && notification.destroy();
    closeModal();
  }, [closeModal, localState]);

  const titleInputOnChange = localState.runCheckAfterTargetFn((e) => {
    localState.pageData.setTitle(e.target.value);
  });

  const tagOnClose = (e, index: number) => {
    e.preventDefault();
    localState.pageData.removeTagByIndex(index);
  };

  const addTagOnClick = () => {
    localState.setShouldShowTagInput(true);
  };

  const confimTag = () => {
    const tagInput = tagInputRef.current;
    const { pageData } = localState;
    if (tagInput) {
      let tags = tagInput.state.value;
      if (tags && !regIsEmpty.test(tags)) {
        tags = tags.split(";").filter((tag) => !regIsEmpty.test(tag));
        pageData.mergeTags(tags);
      }
    }
    localState.setShouldShowTagInput(false);
  };

  const showShortcut = () => {
    localState.setShouldShowShorcutModal(true);
  };

  const hideShortcut = () => {
    localState.setShouldShowShorcutModal(false);
  };

  const applyAction = useCallback(async () => {
    if (localState.isValid) {
      localState.setIsApplying(true);
      if (pageType === "UPDATE") {
        articleStore.updateArticle(localState.pageData).then((v) => {
          localState.setIsApplying(false);
          if (v) {
            setIsNeedRefetch(true);
            message.success("更新成功");
            closeModal();
          } else {
            message.error("添加失败");
          }
        });
      } else {
        articleStore.addArticle(localState.pageData).then((v) => {
          localState.setIsApplying(false);
          if (v) {
            setIsNeedRefetch(true);
            message.success("添加成功");
            closeModal();
          } else {
            message.error("添加失败");
          }
        });
      }
    }
  }, [setIsNeedRefetch, closeModal, articleStore, pageType, localState]);

  const fullscreenCB = useCallback(
    (isFullScreen) => {
      if (isFullScreen) {
        message.info({ duration: 1, content: "ESC退出全屏" });
      }
      editorRef.current?.getMdElement()?.focus();
    },
    [editorRef]
  );

  const keydownCB = useCallback(
    (e) => {
      const editor = editorRef.current;
      if (editor) {
        const isFullScreen = editor.isFullScreen();
        const keyCode = e.keyCode;
        if (keyCode === 27) {
          if (localState.isShowShorcutModal) {
            localState.setShouldShowShorcutModal(false);
          } else if (isFullScreen) {
            editor.fullScreen(false);
          } else {
            closeUpdatePage();
          }
        } else if (keyCode === 13) {
          if (e.ctrlKey) {
            !isFullScreen && editor.fullScreen(true);
          } else if (e.shiftKey) {
            editor.getMdElement()?.blur();
            applyAction();
          } else if (e.altKey) {
            !localState.isShowShorcutModal &&
              localState.setShouldShowShorcutModal(true);
          }
        }
      }
    },
    [editorRef, closeUpdatePage, applyAction, localState]
  );

  useEffect(() => {
    const editor = editorRef.current;
    editor?.on("fullscreen", fullscreenCB);
    window.addEventListener("keydown", keydownCB);
    return () => {
      editor?.off("fullscreen", fullscreenCB);
      window.removeEventListener("keydown", keydownCB);
    };
  }, [editorRef, localState, fullscreenCB, keydownCB]);

  useEffect(() => {
    if (dataInfo.pageType === "UPDATE") {
      const { id } = dataInfo;
      localState.setIsLoading(true);
      articleStore.getArticleById(id!).then((response) => {
        localState.setIsLoadingDone(
          pickPropsFromTarget<IAddOrUpdatePageData, keyof IAddOrUpdatePageData>(
            response,
            ["_id", "title", "tags", "markdown", "isDeleted", "isPublished"]
          )
        );
      });
    } else {
      localState.setIsLoading(false);
    }
  }, [dataInfo, articleStore, localState]);

  const editorOnChange = localState.runCheckAfterTargetFn(({ text }) => {
    localState.pageData.setMarkdown(text);
  });

  const renderHTML = (html) => {
    return mdParser.render(html);
  };

  const mdParser = new MarkdownIt({
    preset: "default",
    breaks: true,
    typographer: true,
    linkify: false,
    html: false,
    xhtmlOut: false,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (__) {}
      }
      return "";
    },
  })
    .use(emoji)
    .use(anchor, {
      level: 1,
      permalink: true,
      permalinkSymbol: "§",
      permalinkBefore: true,
    })
    .use(anchorRightThere);

  return (
    <div className="addOrUpdatePageWrapper">
      <Observer>
        {() => {
          return localState.isLoading ? (
            getAntdSpin({ wrapperStyleObj: addOrUpdateSpinWrapperStyle })
          ) : localState.isApplying ? (
            getAntdSpin({
              tip: pageType === "UPDATE" ? "正在更新..." : "正在添加...",
              wrapperStyleObj: addOrUpdateSpinWrapperStyle,
            })
          ) : (
            <span style={waittingHolderStyleObj}></span>
          );
        }}
      </Observer>

      <Observer>
        {() => {
          return (
            <Modal
              centered={true}
              closable={false}
              keyboard={false}
              destroyOnClose={false}
              visible={localState.isShowShorcutModal}
              title="ESC关闭本组件"
              footer={
                <Button type="primary" onClick={hideShortcut}>
                  关闭
                </Button>
              }
            >
              <ul className="shortcutDescWrapper">
                <li className="shortcutItem">
                  <div className="key">Alt+回车</div>
                  <div className="operation">显示本组件</div>
                </li>
                <li className="shortcutItem">
                  <div className="key">Ctrl+回车</div>
                  <div className="operation">进入全屏</div>
                </li>
                <li className="shortcutItem">
                  <div className="key">Shift+回车</div>
                  <div className="operation">
                    确定{pageType === "UPDATE" ? "更新" : "添加"}
                  </div>
                </li>
                <li className="shortcutItem">
                  <div className="key">ESC</div>
                  <div className="operation">
                    1.本组件显示状态下,关闭本组件
                    <br />
                    2.全屏状态下,退出全屏
                    <br />
                    3.其他状态下,关闭页面
                  </div>
                </li>
              </ul>
            </Modal>
          );
        }}
      </Observer>

      <div className="articleHeader">
        {pageType === "UPDATE" && (
          <div className="articleID">
            <span className="label">编号</span>
            <span>{dataInfo.id}</span>
          </div>
        )}

        <div className="titleActionBarWrapper">
          <Observer>
            {() => {
              return (
                <div
                  className={`title ${!localState.isValid ? "required" : ""}`}
                >
                  <span className="label">标题</span>
                  <Input
                    className="titleInput"
                    placeholder="文章标题"
                    value={localState.pageData.title}
                    onChange={titleInputOnChange}
                  />
                </div>
              );
            }}
          </Observer>

          <div className="actionBar">
            <Button type="primary" className="action" onClick={showShortcut}>
              查看快捷键
            </Button>

            <Observer>
              {() => {
                return (
                  <Button
                    type="primary"
                    className="action"
                    loading={localState.isApplying}
                    disabled={!localState.isValid}
                    onClick={applyAction}
                  >
                    {pageType === "UPDATE" ? "更新" : "添加"}
                  </Button>
                );
              }}
            </Observer>

            <Button type="primary" className="action" onClick={closeUpdatePage}>
              关闭
            </Button>
          </div>
        </div>

        <div className="statusWrapper">
          <span className="label">状态</span>
          <div className="allStatus">
            <div className="status">
              <Observer>
                {() => {
                  return (
                    <Radio.Group
                      buttonStyle="outline"
                      value={localState.pageData.isPublished}
                      onChange={(e) => {
                        localState.pageData.setIsPublished(e.target.value);
                      }}
                    >
                      <Radio.Button value={true}>
                        {pageType === "UPDATE" ? "已发布" : "标记为发布"}
                      </Radio.Button>
                      <Radio.Button value={false}>
                        {pageType === "UPDATE" ? "未发布" : "标记为未发布"}
                      </Radio.Button>
                    </Radio.Group>
                  );
                }}
              </Observer>
            </div>
            <div className="status">
              <Observer>
                {() => {
                  return (
                    <Radio.Group
                      buttonStyle="outline"
                      value={localState.pageData.isDeleted}
                      onChange={(e) => {
                        localState.pageData.setIsDeleted(e.target.value);
                      }}
                    >
                      <Radio.Button value={true}>
                        {pageType === "UPDATE" ? "已标记为删除" : "标记为删除"}
                      </Radio.Button>
                      <Radio.Button value={false}>
                        {pageType === "UPDATE" ? "正常" : "标记为正常"}
                      </Radio.Button>
                    </Radio.Group>
                  );
                }}
              </Observer>
            </div>
          </div>
        </div>

        <div className="articleTagsWrapper">
          <span className="label">标签</span>
          <Observer>
            {() => {
              return (
                <div className="tags">
                  {localState.pageData.tags.map((tag, index) => (
                    <Tag
                      className="closable-tag"
                      closable
                      key={index}
                      onClose={(e) => {
                        tagOnClose(e, index);
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                  {localState.isShowTagInput ? (
                    <Input
                      type="text"
                      className="tag-input"
                      placeholder="多个标签用分号(;)隔开"
                      autoFocus={true}
                      ref={tagInputRef}
                      onPressEnter={confimTag}
                      onBlur={confimTag}
                    />
                  ) : (
                    <Tag className="plus-tag" onClick={addTagOnClick}>
                      <PlusOutlined /> 新增标签
                    </Tag>
                  )}
                </div>
              );
            }}
          </Observer>
        </div>
      </div>

      <Observer>
        {() => {
          return (
            <div className="editorWrapper">
              <span className={`label ${localState.isValid ? "" : "required"}`}>
                内容
              </span>
              <MDEditor
                ref={editorRef}
                style={mdEditorStyleObj}
                value={localState.pageData.markdown}
                markdownClass="markdownSourceClass"
                htmlClass="parsedHtmlClass"
                onChange={editorOnChange}
                renderHTML={renderHTML}
              />
            </div>
          );
        }}
      </Observer>
    </div>
  );
};

export default AddOrUpdatePage;
