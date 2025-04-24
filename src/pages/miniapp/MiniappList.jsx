import { useState, useRef } from "react";
import { ProTable } from "@ant-design/pro-components";
import {
  Button,
  Avatar,
  Modal,
  Select,
  message,
  Space,
  App,
  Checkbox,
  Tabs,
  Card,
  Tag,
  Descriptions,
  Typography,
  Timeline,
  Pagination,
  Alert,
  Input,
  Form,
  Empty,
  Image,
  Table,
  Dropdown,
} from "antd";

import {
  AuditOutlined,
  RollbackOutlined,
  SendOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  QrcodeOutlined,
  DownOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

// 模拟模板数据
const templateOptions = Array.from({ length: 10 }).map((_, index) => ({
  value: `tpl_${index}`,
  label: `模板${index + 1} (v${Math.floor(Math.random() * 10)}.${Math.floor(
    Math.random() * 10
  )}.${Math.floor(Math.random() * 10)})`,
}));

// 模拟小程序数据
const mockData = Array.from({ length: 10 }).map((_, index) => ({
  id: `miniapp_${index + 1}`,
  icon: `https://api.dicebear.com/7.x/bottts/svg?seed=${index}`,
  name: `测试小程序${index + 1}`,
  appid: `wx${Math.random().toString().slice(2, 12)}`,
  vendor: `媒体商${index + 1}`,
  subject: `主体${index + 1}`,
  appkey: Math.random().toString(36).slice(2, 10).toUpperCase(),
  status: Math.floor(Math.random() * 3).toString(), // 生成 "0", "1", "2"
  admin: `管理员${index + 1}`,
  template:
    templateOptions[Math.floor(Math.random() * templateOptions.length)].value,
}));

console.log("mockData", mockData);

// 版本状态配置
const versionConfig = {
  test: {
    title: "测试版本",
    icon: <ExperimentOutlined />,
    color: "#722ED1",
  },
  audit: {
    title: "审核版本",
    icon: <ClockCircleOutlined />,
    color: "#FA8C16",
  },
  gray: {
    title: "灰度版本",
    icon: <ExperimentOutlined />,
    color: "#1890FF",
  },
  current: {
    title: "线上版本",
    icon: <GlobalOutlined />,
    color: "#52C41A",
  },
};

// 添加审核状态配置
const auditStatusConfig = {
  0: { text: "审核中", color: "processing", icon: <ClockCircleOutlined /> },
  1: { text: "通过", color: "success", icon: <CheckCircleOutlined /> },
  2: { text: "不通过", color: "error", icon: <CloseCircleOutlined /> },
  3: { text: "已撤回", color: "default", icon: <RollbackOutlined /> },
};

// 添加默认域名配置
const defaultDomainConfig = {
  requestDomains: ["https://api.example.com", "https://api.service.com"],
  socketDomains: ["wss://socket.example.com"],
  uploadDomains: ["https://upload.example.com", "https://storage.service.com"],
  downloadDomains: ["https://download.example.com", "https://cdn.service.com"],
  webviewDomains: ["https://h5.example.com", "https://web.service.com"],
};

// 版本信息展示组件
const VersionInfo = ({ data, type }) => {
  if (!data) return null;

  const config = versionConfig[type];

  return (
    <Card
      title={
        <Space>
          {config.icon}
          <span style={{ color: config.color }}>{config.title}</span>
          {data.version && <Tag color={config.color}>v{data.version}</Tag>}
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      <Descriptions column={2} size="small" bordered>
        {/* 基础信息 */}
        <Descriptions.Item label="版本号" span={1}>
          {data.version || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间" span={1}>
          {data.ctime
            ? dayjs(data.ctime * 1000).format("YYYY-MM-DD HH:mm:ss")
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="版本描述" span={2}>
          {data.summary || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="开发者ID" span={1}>
          {data.developer_id || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="开发者名称" span={1}>
          {data.developer_name || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="开发者头像" span={2}>
          {data.developer_avatar ? <Avatar src={data.developer_avatar} /> : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="类目" span={2}>
          {data.categories?.map(cat => <Tag key={cat}>{cat}</Tag>) || "-"}
        </Descriptions.Item>

        {/* 审核版本特有字段 */}
        {type === "audit" && (
          <>
            <Descriptions.Item label="审核状态" span={2}>
              <Space>
                <Tag color={auditStatusConfig[data.status]?.color}>
                  {auditStatusConfig[data.status]?.text || "未知状态"}
                </Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="已通过平台" span={2}>
              {data.approved_apps?.map(app => (
                <Tag key={app} color="success">
                  {app}
                </Tag>
              )) || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="附加信息" span={2}>
              {Object.entries(data.attachInfo || {}).map(([key, value]) => (
                <div key={key}>
                  {key}: <a href={value}>{value}</a>
                </div>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="是否已发布" span={1}>
              <Tag color={data.has_publish ? "success" : "default"}>
                {data.has_publish ? "是" : "否"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="是否违规版本" span={1}>
              <Tag color={data.is_illegal_version ? "error" : "success"}>
                {data.is_illegal_version ? "是" : "否"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="审核结果" span={2}>
              <Text type="danger">{data.reason || "-"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="详细原因" span={2}>
              {Object.entries(data.reason_detail || {}).map(
                ([platform, reasons]) => (
                  <div key={platform} style={{ marginBottom: 8 }}>
                    <Text strong>{platform}:</Text>
                    <ul style={{ margin: "4px 0" }}>
                      {reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </Descriptions.Item>
          </>
        )}

        {/* 线上版本特有字段 */}
        {type === "current" && (
          <>
            <Descriptions.Item label="已下架" span={1}>
              <Tag color={data.has_down ? "error" : "success"}>
                {data.has_down ? "是" : "否"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="用户ID" span={1}>
              {data.uid || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="未通过平台" span={2}>
              {data.not_approved_apps?.map(app => (
                <Tag key={app} color="error">
                  {app}
                </Tag>
              )) || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="版本回退" span={2}>
              {data.rollback?.can_rollback ? (
                <Space>
                  <Text>可回退到 v{data.rollback.last_version}</Text>
                  <Button size="small" type="link">
                    回退版本
                  </Button>
                </Space>
              ) : (
                <Text type="secondary">暂无可回退版本</Text>
              )}
            </Descriptions.Item>
            {(data.reason ||
              (data.reason_detail &&
                Object.keys(data.reason_detail).length > 0)) && (
              <Descriptions.Item label="审核结果" span={2}>
                {data.reason && (
                  <div style={{ marginBottom: 8 }}>
                    <Text type="danger">{data.reason}</Text>
                  </div>
                )}
                {data.reason_detail &&
                  Object.keys(data.reason_detail).length > 0 && (
                    <div>
                      {Object.entries(data.reason_detail).map(
                        ([platform, reasons]) => (
                          <div key={platform} style={{ marginBottom: 8 }}>
                            <Text strong>{platform}:</Text>
                            <ul style={{ margin: "4px 0" }}>
                              {reasons.map((reason, index) => (
                                <li key={index}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </Descriptions.Item>
            )}
          </>
        )}

        {/* 灰度版本特有字段 */}
        {type === "gray" && (
          <>
            <Descriptions.Item label="灰度配置" span={2}>
              {Object.keys(data.host_gray_scale || {}).length > 0 ? (
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(data.host_gray_scale, null, 2)}
                </pre>
              ) : (
                "-"
              )}
            </Descriptions.Item>
          </>
        )}

        {/* 测试版本特有字段 */}
        {type === "test" && (
          <>
            <Descriptions.Item label="是否已提审" span={1}>
              <Tag color={data.has_audit ? "processing" : "default"}>
                {data.has_audit ? "是" : "否"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="截图" span={2}>
              {data.screenshot ? (
                <img
                  src={data.screenshot}
                  alt="版本截图"
                  style={{ maxWidth: 200, maxHeight: 200 }}
                />
              ) : (
                "-"
              )}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>
    </Card>
  );
};

// 添加审核记录组件
const AuditHistory = ({ history }) => {
  if (!history?.length) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>暂无审核记录</div>
    );
  }

  return (
    <Timeline>
      {history.map(item => (
        <Timeline.Item
          key={item.ctime}
          color={auditStatusConfig[item.status]?.color || "gray"}
          dot={auditStatusConfig[item.status]?.icon}
        >
          <Card size="small" style={{ marginBottom: 16 }}>
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="版本号" span={1}>
                v{item.version}
              </Descriptions.Item>
              <Descriptions.Item label="审核时间" span={1}>
                {dayjs(item.ctime * 1000).format("YYYY-MM-DD HH:mm:ss")}
              </Descriptions.Item>
              <Descriptions.Item label="审核状态" span={2}>
                <Tag color={auditStatusConfig[item.status]?.color}>
                  {auditStatusConfig[item.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="开发者" span={2}>
                {item.developer_name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="已通过平台" span={2}>
                {item.approved_apps?.map(app => (
                  <Tag key={app} color="success">
                    {app}
                  </Tag>
                )) || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="未通过平台" span={2}>
                {item.not_approved_apps?.map(app => (
                  <Tag key={app} color="error">
                    {app}
                  </Tag>
                )) || "-"}
              </Descriptions.Item>
              {item.reason && (
                <Descriptions.Item label="审核结果" span={2}>
                  <Text type="danger">{item.reason}</Text>
                </Descriptions.Item>
              )}
              {item.reason_detail &&
                Object.keys(item.reason_detail).length > 0 && (
                  <Descriptions.Item label="详细原因" span={2}>
                    {Object.entries(item.reason_detail).map(
                      ([platform, reasons]) => (
                        <div key={platform} style={{ marginBottom: 8 }}>
                          <Text strong>{platform}:</Text>
                          <ul style={{ margin: "4px 0" }}>
                            {reasons.map((reason, index) => (
                              <li key={index}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </Descriptions.Item>
                )}
            </Descriptions>
          </Card>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

function MiniappList() {
  const [operationModalVisible, setOperationModalVisible] = useState(false);
  const [operationType, setOperationType] = useState("submit"); // 默认为提交审核
  const [loading, setLoading] = useState(false); // 添加 loading 状态
  const [selectedApps, setSelectedApps] = useState([]);
  const [bindModalVisible, setBindModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [bindingMiniapps, setBindingMiniapps] = useState([]);
  const [currentMiniapp, setCurrentMiniapp] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [versionData, setVersionData] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [auditHistoryLoading, setAuditHistoryLoading] = useState(false);
  const [auditHistoryPagination, setAuditHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { modal } = App.useApp();
  const [devSettingsVisible, setDevSettingsVisible] = useState(false);
  const [domainConfig, setDomainConfig] = useState(defaultDomainConfig);
  const [currentEditDomain, setCurrentEditDomain] = useState("requestDomains");
  const [form] = Form.useForm();
  const [baseInfoVisible, setBaseInfoVisible] = useState(false);
  const [qrcodeVisible, setQrcodeVisible] = useState(false);
  const [qrcodePath, setQrcodePath] = useState("");
  const [qrcodeVersion, setQrcodeVersion] = useState("online");
  const [qrcodeUrl, setQrcodeUrl] = useState("");
  const actionRef = useRef();

  // 1. 先定义所有处理函数
  const handleBindTemplate = async () => {
    if (!selectedTemplate) {
      message.error("请选择模板版本");
      return;
    }

    try {
      setLoading(true);
      // 这里模拟批量绑定请求
      await Promise.all(
        bindingMiniapps.map(app =>
          new Promise((resolve, reject) => {
            // 模拟成功率 90%
            if (Math.random() > 0.1) {
              setTimeout(resolve, 1000);
            } else {
              reject(new Error(`${app.name} 绑定失败`));
            }
          }).catch(error => ({ error, app }))
        )
      ).then(results => {
        const failures = results.filter(r => r?.error);

        if (failures.length > 0) {
          modal.error({
            title: "部分小程序绑定失败",
            content: (
              <div>
                {failures.map(({ error, app }) => (
                  <div key={app.id}>
                    {app.name}: {error.message}
                  </div>
                ))}
              </div>
            ),
          });
        } else {
          message.success(`成功绑定 ${bindingMiniapps.length} 个小程序`);
        }
      });

      setBindModalVisible(false);
      setSelectedTemplate(null);
      setBindingMiniapps([]);
      // 刷新列表
      actionRef.current?.reload();
    } catch (error) {
      message.error("绑定失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 修改 operationConfig 对象，添加模板和版本检查
  const operationConfig = {
    submit: {
      title: "提交审核",
      desc: "请选择要提交审核的小程序",
      options: mockData
        .filter(item => item.status === "0" || item.status === "2")
        .map(item => ({
          ...item,
          templateInfo:
            templateOptions.find(t => t.value === item.template)?.label ||
            "未绑定模板",
        })),
      mockResult: {
        success: true,
        message: "提交审核成功",
        data: {
          total: 5,
          success: 5,
          failed: 0,
          failedList: [],
        },
      },
    },
    withdraw: {
      title: "撤回提审",
      desc: "请选择要撤回提审的小程序",
      options: mockData
        .filter(item => {
          // 模拟有审核版本的小程序
          return item.status === "1" && Math.random() > 0.5;
        })
        .map(item => ({
          ...item,
          templateInfo:
            templateOptions.find(t => t.value === item.template)?.label ||
            "未绑定模板",
        })),
      mockResult: {
        success: true,
        message: "撤回提审成功",
        data: {
          total: 3,
          success: 2,
          failed: 1,
          failedList: [
            {
              appid: "wx123456789",
              name: "测试小程序3",
              reason: "该小程序已经审核通过，无法撤回",
            },
          ],
        },
      },
    },
    publish: {
      title: "发布上线",
      desc: "请选择要发布上线的小程序",
      options: mockData
        .filter(item => {
          // 模拟有审核通过版本的小程序
          return item.status === "0" && Math.random() > 0.3;
        })
        .map(item => ({
          ...item,
          templateInfo:
            templateOptions.find(t => t.value === item.template)?.label ||
            "未绑定模板",
          auditPassed: true, // 确保所有可选项都是审核通过的
        })),
      // 固定的未通过审核小程序列表，不受选择影响
      notPassedList: (() => {
        // 使用立即执行函数生成固定的列表
        return mockData
          .filter(item => {
            return item.status === "0" && Math.random() <= 0.3;
          })
          .map(item => ({
            ...item,
            templateInfo:
              templateOptions.find(t => t.value === item.template)?.label ||
              "未绑定模板",
            reason: ["审核未通过", "版本不兼容", "功能异常"][
              Math.floor(Math.random() * 3)
            ],
          }));
      })(),
      mockResult: {
        success: true,
        message: "发布上线成功",
        data: {
          total: 4,
          success: 3,
          failed: 1,
          failedList: [
            {
              appid: "wx987654321",
              name: "测试小程序7",
              reason: "该小程序没有审核通过的版本",
            },
          ],
        },
      },
    },
    rollback: {
      title: "回退版本",
      desc: "请选择要回退版本的小程序",
      options: mockData
        .filter(item => {
          // 模拟可回退的小程序
          return item.status === "1" && Math.random() > 0.5;
        })
        .map(item => ({
          ...item,
          templateInfo:
            templateOptions.find(t => t.value === item.template)?.label ||
            "未绑定模板",
        })),
      mockResult: {
        success: true,
        message: "回退版本成功",
        data: {
          total: 2,
          success: 2,
          failed: 0,
          failedList: [],
        },
      },
    },
  };

  // 修改 showOperationModal 函数，确保每次打开弹窗时未通过审核列表不变
  const showOperationModal = type => {
    setOperationType(type);
    setSelectedApps([]);

    // 如果是发布上线操作，确保未通过审核列表已准备好
    if (type === "publish" && !operationConfig.publish.notPassedListFixed) {
      // 这里可以添加额外逻辑，确保未通过审核列表是固定的
      operationConfig.publish.notPassedListFixed = true;
    }

    setOperationModalVisible(true);
  };

  // 处理全选
  const handleSelectAll = checked => {
    if (checked) {
      setSelectedApps(
        operationConfig[operationType].options.map(item => item.id)
      );
    } else {
      setSelectedApps([]);
    }
  };

  // 修改处理批量操作函数，添加模板和版本检查
  const handleBatchOperation = async () => {
    if (!selectedApps.length) {
      message.warning("请选择小程序");
      return;
    }

    // 检查所选小程序的模板是否一致
    const selectedOptions = operationConfig[operationType].options.filter(opt =>
      selectedApps.includes(opt.id)
    );

    const templates = [...new Set(selectedOptions.map(opt => opt.template))];
    const isTemplateConsistent =
      templates.length === 1 && templates[0] !== undefined;

    // 如果模板不一致，显示二次确认
    if (!isTemplateConsistent) {
      modal.confirm({
        title: "模板不一致提醒",
        content: (
          <div>
            <p>您选择的小程序使用了不同的模板版本：</p>
            <ul>
              {templates.map((template, index) => (
                <li key={index}>
                  {template
                    ? templateOptions.find(t => t.value === template)?.label ||
                      template
                    : "未绑定模板"}
                  ：
                  {
                    selectedOptions.filter(opt => opt.template === template)
                      .length
                  }
                  个小程序
                </li>
              ))}
            </ul>
            <p>不同模板版本的小程序可能会导致操作结果不一致，是否继续？</p>
          </div>
        ),
        onOk: () => performBatchOperation(),
      });
    } else {
      // 模板一致，直接执行操作
      performBatchOperation();
    }
  };

  // 提取实际执行操作的函数
  const performBatchOperation = async () => {
    setLoading(true); // 开始加载
    try {
      // 这里模拟接口调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 使用模拟结果数据
      const result = operationConfig[operationType].mockResult;

      if (result.success) {
        if (result.data.failed > 0) {
          modal.info({
            title: `${operationConfig[operationType].title}结果`,
            content: (
              <div>
                <p>
                  总计: {result.data.total}个，成功: {result.data.success}
                  个，失败: {result.data.failed}个
                </p>
                {result.data.failedList.length > 0 && (
                  <div>
                    <p>失败列表:</p>
                    <ul>
                      {result.data.failedList.map(item => (
                        <li key={item.appid}>
                          {item.name} ({item.appid}): {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ),
          });
        } else {
          message.success(result.message);
        }
      } else {
        message.error(result.message || "操作失败");
      }

      setOperationModalVisible(false);
      setSelectedApps([]);
      // 实际场景中这里需要刷新列表
    } catch (err) {
      message.error("操作失败，请重试");
    } finally {
      setLoading(false); // 结束加载
    }
  };

  // 添加显示绑定弹窗的函数
  const showBindModal = (miniapps = []) => {
    setBindingMiniapps(Array.isArray(miniapps) ? miniapps : [miniapps]);
    setBindModalVisible(true);
  };

  // 修改模拟获取版本详情数据的函数
  const fetchVersionData = () => {
    const mockVersionData = {
      current: {
        version: "1.0.0",
        ctime: 1585727678,
        developer_avatar: null,
        developer_id: null,
        developer_name: null,
        categories: ["服务类-快递、物流-查件"],
        summary: "测试版本1.0.0",
        uid: 123232323234324,
        has_down: 0,
        approved_apps: [],
        not_approved_apps: [],
        attachInfo: {},
        reason: "",
        reason_detail: {
          今日头条: [
            "无法进入小程序",
            "小程序页面存在闪退、卡顿、黑屏等功能异常问题",
          ],
          今日头条lite: ["无法进入小程序"],
        },
        rollback: {
          can_rollback: true,
          last_version: "0.9.9",
        },
      },
      audit: {
        version: "1.0.1",
        ctime: 1591019952,
        developer_avatar: "xxx",
        developer_id: "xxx",
        developer_name: "xxx",
        categories: ["服务类-快递、物流-查件"],
        summary: "今天是5月30日",
        approved_apps: ["抖音"],
        attachInfo: {
          今日头条: "http://xxxx",
          今日头条lite: "http://xxxx",
        },
        has_publish: 0,
        is_illegal_version: false,
        status: 2, // 审核状态：0:审核中，1:通过，2:不通过，3：撤回审核
        reason:
          "今日头条: 无法进入小程序;小程序页面存在闪退、卡顿、黑屏等功能异常问题;今日头条lite: 无法进入小程序",
        reason_detail: {
          今日头条: [
            "无法进入小程序",
            "小程序页面存在闪退、卡顿、黑屏等功能异常问题",
          ],
          今日头条lite: ["无法进入小程序"],
        },
      },
      gray: {
        version: "1.0.1",
        ctime: 1590755478,
        developer_avatar: "xxx",
        developer_id: "xxx",
        developer_name: "xxx",
        categories: ["服务类-快递、物流-查件"],
        summary: "今天是5月30日",
        has_audit: 1,
        screenshot: "",
        host_gray_scale: {
          _key: "抖音",
          _val: 30,
        },
      },
      latest: {
        version: "1.0.2",
        ctime: 1590755478,
        developer_avatar: "xxx",
        developer_id: "xxx",
        developer_name: "xxx",
        categories: ["服务类-快递、物流-查件"],
        summary: "今天是5月30日",
        has_audit: 1,
        screenshot: "https://example.com/screenshot.png", // 添加一个示例截图URL
      },
    };

    // 模拟审核历史记录
    const mockAuditHistory = [
      {
        version: "1.0.1",
        ctime: 1591019952,
        status: 2,
        reason:
          "今日头条: 无法进入小程序;小程序页面存在闪退、卡顿、黑屏等功能异常问题;今日头条lite: 无法进入小程序",
        developer_name: "xxx",
        approved_apps: ["抖音"],
        not_approved_apps: ["今日头条", "今日头条lite"],
      },
      {
        version: "1.0.0",
        ctime: 1585727678,
        status: 1,
        developer_name: "xxx",
        approved_apps: ["抖音", "今日头条", "今日头条lite"],
        not_approved_apps: [],
      },
    ];

    setVersionData(mockVersionData);
    setAuditHistory(mockAuditHistory);
  };

  // 获取审核记录
  const fetchAuditHistory = async (appid, page = 1, pageSize = 10) => {
    setAuditHistoryLoading(true);
    try {
      // 这里替换为实际的接口调用
      const response = await fetch(
        `/api/miniapp/${appid}/audit-history?page=${page}&pageSize=${pageSize}`
      );
      const data = await response.json();
      setAuditHistory(data.list);
      setAuditHistoryPagination({
        current: page,
        pageSize,
        total: data.total,
      });
    } catch (error) {
      message.error("获取审核记录失败");
    } finally {
      setAuditHistoryLoading(false);
    }
  };

  // 修改打开详情弹窗的处理函数
  const handleShowDetail = record => {
    setCurrentMiniapp(record);
    fetchVersionData(record); // 获取版本详情数据
    setDetailModalVisible(true);
  };

  // 处理域名更新
  const handleDomainChange = (type, values) => {
    setDomainConfig(prev => ({
      ...prev,
      [type]: values,
    }));
  };

  // 修改保存配置的处理函数
  const handleSaveDevSettings = async () => {
    try {
      const values = await form.validateFields();
      // 处理每个域名字符串，转换为数组
      const formattedValues = Object.keys(values).reduce((acc, key) => {
        acc[key] = values[key].split("\n").filter(item => item.trim());
        return acc;
      }, {});

      // 这里模拟保存配置
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success("配置保存成功");
      setDevSettingsVisible(false);
      form.resetFields();
    } catch {
      message.error("配置保存失败");
    }
  };

  const columns = [
    {
      title: "图标",
      dataIndex: "icon",
      search: false,
      render: icon => <Avatar src={icon} shape="square" size="large" />,
    },
    {
      title: "小程序名称",
      dataIndex: "name",
      search: true,
    },
    {
      title: "小程序ID",
      dataIndex: "appid",
      copyable: true,
      search: true,
    },
    {
      title: "媒体厂商",
      dataIndex: "vendor",
      search: true,
    },
    {
      title: "小程序主体",
      dataIndex: "subject",
      search: true,
    },
    {
      title: "AppKey",
      dataIndex: "appkey",
      copyable: true,
      search: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      valueEnum: {
        0: { text: "未发布", status: "Default" },
        1: { text: "已发布", status: "Success" },
        2: { text: "已下线", status: "Error" },
      },
      search: true,
      render: (_, record) => {
        const statusConfig = {
          0: { text: "未发布", color: "#999999" },
          1: { text: "已发布", color: "#52c41a" },
          2: { text: "已下线", color: "#ff4d4f" },
        };

        return (
          <span style={{ color: statusConfig[record.status]?.color }}>
            {statusConfig[record.status]?.text}
          </span>
        );
      },
    },
    {
      title: "管理员",
      dataIndex: "admin",
      search: true,
    },
    {
      title: "操作",
      valueType: "option",
      width: 180,
      render: (_, record) => {
        return (
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Space size={4} wrap>
              <Button
                key="baseInfo"
                type="link"
                size="small"
                onClick={() => {
                  setCurrentMiniapp(record);
                  setBaseInfoVisible(true);
                  form.setFieldsValue({
                    name: record.name,
                    shortName: record.shortName || "",
                    icon: record.icon,
                    vendor: record.vendor,
                    subject: record.subject,
                    appid: record.appid,
                    merchantId: record.merchantId || "",
                    admin: record.admin,
                  });
                }}
              >
                基础信息
              </Button>

              <Button
                key="business"
                type="link"
                size="small"
                onClick={() => {
                  setCurrentMiniapp(record);
                  // 这里可以添加业务配置的处理逻辑
                  message.info(`${record.name} 的业务配置功能开发中`);
                }}
              >
                业务配置
              </Button>
            </Space>
            <Space size={4} wrap>
              <Button
                key="runtime"
                type="link"
                size="small"
                onClick={() => {
                  setCurrentMiniapp(record);
                  // 这里可以添加运行时配置的处理逻辑
                  message.info(`${record.name} 的运行时配置功能开发中`);
                }}
              >
                运行时配置
              </Button>
              <Button
                key="settings"
                type="link"
                size="small"
                onClick={() => {
                  setCurrentMiniapp(record);
                  setDevSettingsVisible(true);
                  setDomainConfig(defaultDomainConfig);
                }}
              >
                开发设置
              </Button>
            </Space>
            <Space size={4} wrap>
              <Button
                key="detail"
                type="link"
                size="small"
                onClick={() => handleShowDetail(record)}
              >
                版本信息
              </Button>
              <Button
                key="bind"
                type="link"
                size="small"
                onClick={() => showBindModal(record)}
              >
                绑定模板
              </Button>
            </Space>
            <Space size={4} wrap>
              <Button
                key="qrcode"
                type="link"
                size="small"
                onClick={() => {
                  setCurrentMiniapp(record);
                  setQrcodeVisible(true);
                  setQrcodePath("");
                  setQrcodeVersion("online");
                }}
              >
                二维码
              </Button>
            </Space>
          </Space>
        );
      },
    },
  ];

  // 修改工具栏按钮配置
  const toolbarButtons = [
    <Space size="middle" key="toolbar-buttons">
      <Button onClick={() => showBindModal(mockData)}>批量绑定模板</Button>
      <Button onClick={() => showOperationModal("submit")}>批量提交审核</Button>
      <Button onClick={() => showOperationModal("withdraw")}>
        批量撤回提审
      </Button>
      <Button onClick={() => showOperationModal("publish")}>
        批量发布上线
      </Button>
      <Button onClick={() => showOperationModal("rollback")}>
        批量回退版本
      </Button>
    </Space>,
  ];

  return (
    <div className="page-container">
      <ProTable
        columns={columns}
        dataSource={mockData}
        rowKey="id"
        search={{
          labelWidth: "auto",
          defaultCollapsed: false,
          span: {
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
          },
        }}
        dateFormatter="string"
        headerTitle="小程序列表"
        toolBarRender={() => <Space>{toolbarButtons}</Space>}
      />

      {/* 批量操作弹窗 */}
      <Modal
        title={operationConfig[operationType]?.title || "批量操作"}
        open={operationModalVisible}
        onOk={handleBatchOperation}
        onCancel={() => setOperationModalVisible(false)}
        confirmLoading={loading}
        width={operationType === "publish" ? 800 : 600}
        bodyStyle={{ maxHeight: "70vh", overflow: "auto" }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Alert
            type="info"
            message={
              operationConfig[operationType]?.desc || "请选择要操作的小程序"
            }
            style={{ marginBottom: 8 }}
          />

          {/* 选择框上方的全选功能 */}
          {operationType &&
            operationConfig[operationType].options.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Checkbox
                  checked={
                    operationType &&
                    selectedApps.length ===
                      operationConfig[operationType].options.length
                  }
                  indeterminate={
                    operationType &&
                    selectedApps.length > 0 &&
                    selectedApps.length <
                      operationConfig[operationType].options.length
                  }
                  onChange={e => handleSelectAll(e.target.checked)}
                >
                  全选
                </Checkbox>
                <Text type="secondary">
                  已选择 {selectedApps.length}/
                  {operationConfig[operationType].options.length} 个小程序
                </Text>
              </div>
            )}

          {/* 小程序选择框 */}
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="请选择小程序"
            value={selectedApps}
            onChange={setSelectedApps}
            optionFilterProp="label"
            maxTagCount={5}
            listHeight={250}
            options={(operationConfig[operationType]?.options || []).map(
              item => ({
                label: (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "4px 0",
                    }}
                  >
                    <Space>
                      <Avatar size="small" src={item.icon} />
                      <span>{item.name}</span>
                      <Tag>{item.appid}</Tag>
                    </Space>
                    <Space>
                      <span style={{ color: "#1890ff" }}>
                        {item.templateInfo}
                      </span>
                      {operationType === "publish" && (
                        <Tag color="success">审核已通过</Tag>
                      )}
                    </Space>
                  </div>
                ),
                value: item.id,
                searchValue: `${item.name} ${item.appid} ${item.templateInfo}`,
              })
            )}
          />

          {/* 无可操作小程序时的提示 */}
          {operationType &&
            operationConfig[operationType].options.length === 0 && (
              <Empty
                description={`暂无可${operationConfig[operationType].title}的小程序`}
                style={{ margin: "20px 0" }}
              />
            )}

          {/* 发布上线时显示未通过审核的小程序列表 */}
          {operationType === "publish" &&
            operationConfig.publish.notPassedList &&
            operationConfig.publish.notPassedList.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Alert
                  type="warning"
                  message={`${operationConfig.publish.notPassedList.length}个小程序未通过审核，无法发布上线`}
                  style={{ marginBottom: 8 }}
                />
                <Table
                  dataSource={operationConfig.publish.notPassedList}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: "小程序名称",
                      dataIndex: "name",
                      ellipsis: true,
                      render: (text, record) => (
                        <Space>
                          <Avatar size="small" src={record.icon} />
                          <span>{text}</span>
                        </Space>
                      ),
                    },
                    {
                      title: "AppID",
                      dataIndex: "appid",
                      width: 120,
                      ellipsis: true,
                    },
                    {
                      title: "模板版本",
                      dataIndex: "templateInfo",
                      width: 180,
                      ellipsis: true,
                      render: text => (
                        <span style={{ color: "#1890ff" }}>{text}</span>
                      ),
                    },
                    {
                      title: "未通过原因",
                      dataIndex: "reason",
                      ellipsis: true,
                      render: text => <Text type="danger">{text}</Text>,
                    },
                  ]}
                  scroll={{ y: 180 }}
                />
              </div>
            )}
        </Space>
      </Modal>

      {/* 绑定模板弹窗 */}
      <Modal
        title="绑定模板版本"
        open={bindModalVisible}
        confirmLoading={loading}
        onOk={handleBindTemplate}
        onCancel={() => {
          setBindModalVisible(false);
          setSelectedTemplate(null);
          setBindingMiniapps([]);
        }}
        width={800}
      >
        <Form layout="vertical">
          <Form.Item
            label="选择模板版本"
            required
            extra="选择的模板版本将作为所选小程序的测试版本"
          >
            <Select
              value={selectedTemplate}
              onChange={setSelectedTemplate}
              options={templateOptions}
              placeholder="请选择模板版本"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="待绑定的小程序">
            <Table
              size="small"
              dataSource={bindingMiniapps}
              rowKey="id"
              columns={[
                {
                  title: "小程序名称",
                  dataIndex: "name",
                  render: (text, record) => (
                    <Space>
                      <Avatar size="small" src={record.icon} />
                      <Text>{text}</Text>
                      <Tag>{record.appid}</Tag>
                    </Space>
                  ),
                },
                {
                  title: "当前模板版本",
                  dataIndex: "template",
                  render: template => {
                    const tpl = templateOptions.find(t => t.value === template);
                    return tpl ? tpl.label : "-";
                  },
                },
              ]}
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Form.Item>

          <Alert
            type="info"
            message="绑定说明"
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>绑定后将自动生成测试版本</li>
                <li>可以基于测试版本提交审核或发布上线</li>
                <li>建议先在单个小程序验证后再批量绑定</li>
                <li>批量绑定时请确保所选小程序都适用于该模板</li>
              </ul>
            }
            style={{ marginTop: 16 }}
          />
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title={`${currentMiniapp?.name || ""} - 版本详情`}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setVersionData(null); // 关闭弹窗时清空数据
          setAuditHistory([]);
        }}
        footer={null}
        width={800}
      >
        <Tabs
          items={[
            {
              key: "versions",
              label: "版本信息",
              children: versionData ? ( // 添加数据检查
                <>
                  <VersionInfo data={versionData.current} type="current" />
                  <VersionInfo data={versionData.audit} type="audit" />
                  <VersionInfo data={versionData.gray} type="gray" />
                  <VersionInfo data={versionData.latest} type="test" />
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  加载中...
                </div>
              ),
            },
            {
              key: "audit-history",
              label: "审核记录",
              children: (
                <div>
                  <AuditHistory history={auditHistory} />
                  {auditHistoryPagination.total >
                    auditHistoryPagination.pageSize && (
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                      <Pagination
                        {...auditHistoryPagination}
                        onChange={(page, pageSize) => {
                          fetchAuditHistory(
                            currentMiniapp.appid,
                            page,
                            pageSize
                          );
                        }}
                        onShowSizeChange={(current, size) => {
                          fetchAuditHistory(currentMiniapp.appid, 1, size);
                        }}
                      />
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {/* 开发设置弹窗 */}
      <Modal
        title={`${currentMiniapp?.name || ""} - 开发设置`}
        open={devSettingsVisible}
        onOk={handleSaveDevSettings}
        onCancel={() => {
          setDevSettingsVisible(false);
          form.resetFields();
        }}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            requestDomains: defaultDomainConfig.requestDomains.join("\n"),
            socketDomains: defaultDomainConfig.socketDomains.join("\n"),
            uploadDomains: defaultDomainConfig.uploadDomains.join("\n"),
            downloadDomains: defaultDomainConfig.downloadDomains.join("\n"),
            webviewDomains: defaultDomainConfig.webviewDomains.join("\n"),
          }}
        >
          <Form.Item
            label="request合法域名"
            name="requestDomains"
            rules={[
              { required: true, message: "请输入request合法域名" },
              {
                validator: (_, value) => {
                  const domains = value.split("\n").filter(item => item.trim());
                  const isValid = domains.every(
                    domain =>
                      domain.startsWith("http://") ||
                      domain.startsWith("https://")
                  );
                  return isValid
                    ? Promise.resolve()
                    : Promise.reject("域名必须以 http:// 或 https:// 开头");
                },
              },
            ]}
            extra="每行一个域名，必须以 http:// 或 https:// 开头"
          >
            <TextArea
              placeholder="请输入request合法域名，每行一个"
              autoSize={{ minRows: 3, maxRows: 10 }}
            />
          </Form.Item>

          <Form.Item
            label="socket合法域名"
            name="socketDomains"
            rules={[
              { required: true, message: "请输入socket合法域名" },
              {
                validator: (_, value) => {
                  const domains = value.split("\n").filter(item => item.trim());
                  const isValid = domains.every(
                    domain =>
                      domain.startsWith("ws://") || domain.startsWith("wss://")
                  );
                  return isValid
                    ? Promise.resolve()
                    : Promise.reject("域名必须以 ws:// 或 wss:// 开头");
                },
              },
            ]}
            extra="每行一个域名，必须以 ws:// 或 wss:// 开头"
          >
            <TextArea
              placeholder="请输入socket合法域名，每行一个"
              autoSize={{ minRows: 2, maxRows: 5 }}
            />
          </Form.Item>

          <Form.Item
            label="uploadFile合法域名"
            name="uploadDomains"
            rules={[
              { required: true, message: "请输入uploadFile合法域名" },
              {
                validator: (_, value) => {
                  const domains = value.split("\n").filter(item => item.trim());
                  const isValid = domains.every(
                    domain =>
                      domain.startsWith("http://") ||
                      domain.startsWith("https://")
                  );
                  return isValid
                    ? Promise.resolve()
                    : Promise.reject("域名必须以 http:// 或 https:// 开头");
                },
              },
            ]}
            extra="每行一个域名，必须以 http:// 或 https:// 开头"
          >
            <TextArea
              placeholder="请输入uploadFile合法域名，每行一个"
              autoSize={{ minRows: 2, maxRows: 5 }}
            />
          </Form.Item>

          <Form.Item
            label="downloadFile合法域名"
            name="downloadDomains"
            rules={[
              { required: true, message: "请输入downloadFile合法域名" },
              {
                validator: (_, value) => {
                  const domains = value.split("\n").filter(item => item.trim());
                  const isValid = domains.every(
                    domain =>
                      domain.startsWith("http://") ||
                      domain.startsWith("https://")
                  );
                  return isValid
                    ? Promise.resolve()
                    : Promise.reject("域名必须以 http:// 或 https:// 开头");
                },
              },
            ]}
            extra="每行一个域名，必须以 http:// 或 https:// 开头"
          >
            <TextArea
              placeholder="请输入downloadFile合法域名，每行一个"
              autoSize={{ minRows: 2, maxRows: 5 }}
            />
          </Form.Item>

          <Form.Item
            label="web-view域名"
            name="webviewDomains"
            rules={[
              { required: true, message: "请输入web-view域名" },
              {
                validator: (_, value) => {
                  const domains = value.split("\n").filter(item => item.trim());
                  const isValid = domains.every(
                    domain =>
                      domain.startsWith("http://") ||
                      domain.startsWith("https://")
                  );
                  return isValid
                    ? Promise.resolve()
                    : Promise.reject("域名必须以 http:// 或 https:// 开头");
                },
              },
            ]}
            extra="每行一个域名，必须以 http:// 或 https:// 开头"
          >
            <TextArea
              placeholder="请输入web-view域名，每行一个"
              autoSize={{ minRows: 2, maxRows: 5 }}
            />
          </Form.Item>
        </Form>

        <Alert
          type="info"
          message="域名配置说明"
          description={
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li>
                所有域名必须以 http:// 或 https:// 开头（socket域名以 ws:// 或
                wss:// 开头）
              </li>
              <li>域名不能使用 IP 地址或 localhost</li>
              <li>域名必须经过 ICP 备案</li>
              <li>同一域名只能配置一次</li>
              <li>每行输入一个域名</li>
            </ul>
          }
        />
      </Modal>

      {/* 基础信息弹窗 */}
      <Modal
        title={`${currentMiniapp?.name || ""} - 基础信息`}
        open={baseInfoVisible}
        onOk={async () => {
          try {
            const values = await form.validateFields();
            // 这里模拟保存配置
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success("保存成功");
            setBaseInfoVisible(false);
          } catch {
            message.error("保存失败");
          }
        }}
        onCancel={() => {
          setBaseInfoVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="小程序名称"
            name="name"
            rules={[{ required: true, message: "请输入小程序名称" }]}
          >
            <Input placeholder="请输入小程序名称" />
          </Form.Item>

          <Form.Item
            label="小程序简称"
            name="shortName"
            rules={[{ required: true, message: "请输入小程序简称" }]}
          >
            <Input placeholder="请输入小程序简称" />
          </Form.Item>

          <Form.Item
            label="小程序ICON"
            name="icon"
            rules={[{ required: true, message: "请上传小程序ICON" }]}
          >
            <Input.TextArea
              placeholder="请输入图片URL或上传图片"
              autoSize={{ minRows: 2 }}
            />
            {/* 实际项目中这里应该是上传组件 */}
          </Form.Item>

          <Form.Item
            label="媒体厂商"
            name="vendor"
            rules={[{ required: true, message: "请输入媒体厂商" }]}
          >
            <Input placeholder="请输入媒体厂商" />
          </Form.Item>

          <Form.Item
            label="小程序主体"
            name="subject"
            rules={[{ required: true, message: "请输入小程序主体" }]}
          >
            <Input placeholder="请输入小程序主体" />
          </Form.Item>

          <Form.Item
            label="AppID"
            name="appid"
            rules={[{ required: true, message: "请输入AppID" }]}
          >
            <Input placeholder="请输入AppID" disabled />
          </Form.Item>

          <Form.Item label="商户号" name="merchantId">
            <Input placeholder="请输入商户号" />
          </Form.Item>

          <Form.Item
            label="管理员"
            name="admin"
            rules={[{ required: true, message: "请输入管理员" }]}
          >
            <Input placeholder="请输入管理员" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 二维码弹窗 */}
      <Modal
        title={`${currentMiniapp?.name || ""} - 小程序码`}
        open={qrcodeVisible}
        onCancel={() => setQrcodeVisible(false)}
        footer={null}
        width={500}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Form layout="vertical">
            <Form.Item label="版本选择">
              <Select
                value={qrcodeVersion}
                onChange={setQrcodeVersion}
                options={[
                  { label: "线上版本", value: "online" },
                  { label: "审核版本", value: "audit" },
                  { label: "测试版本", value: "test" },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="启动参数"
              extra="可选，示例：pages/index/index?id=123"
            >
              <Input
                value={qrcodePath}
                onChange={e => setQrcodePath(e.target.value)}
                placeholder="请输入小程序启动参数"
              />
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", padding: "20px 0" }}>
            {qrcodeUrl ? (
              <Image src={qrcodeUrl} alt="小程序码" style={{ maxWidth: 200 }} />
            ) : (
              <Empty description="请选择版本生成小程序码" />
            )}
          </div>

          <Alert
            type="info"
            message="说明"
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>扫描二维码可直接进入对应版本的小程序</li>
                <li>可通过启动参数配置小程序的打开场景</li>
                <li>建议使用微信扫码访问</li>
              </ul>
            }
          />
        </Space>
      </Modal>
    </div>
  );
}

export default MiniappList;
