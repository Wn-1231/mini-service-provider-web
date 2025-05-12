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
  Tooltip,
  Divider,
  Radio,
} from "antd";

import {
  RollbackOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  FilterFilled,
  EditOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import SelectionTable from "../../components/SelectionTable";
import RenderConfigModal from "../../components/RenderConfigModal";

const { Text } = Typography;
const { TextArea } = Input;

// 修改模板数据的结构，添加版本号
const templateOptions = Array.from({ length: 10 }).map((_, index) => {
  const version = `${Math.floor(Math.random() * 5)}.${Math.floor(
    Math.random() * 10
  )}.${Math.floor(Math.random() * 10)}`;
  return {
    value: `tpl_${index}`,
    label: `模板名称${index + 1}`,
    version: version,
  };
});

// 修改状态配置
const statusConfig = {
  AUDITING: {
    value: "AUDITING",
    text: "审核中",
    color: "processing",
    icon: <ClockCircleOutlined />,
  },
  PUBLISHED: {
    value: "PUBLISHED",
    text: "已发布",
    color: "success",
    icon: <CheckCircleOutlined />,
  },
  UNPUBLISHED: {
    value: "UNPUBLISHED",
    text: "未发布",
    color: "default",
    icon: <InfoCircleOutlined />,
  },
  REJECT: {
    value: "REJECT",
    text: "审核失败",
    color: "error",
    icon: <CloseCircleOutlined />,
  },
};

// 修改小程序数据结构
const mockData = Array.from({ length: 5 }).map((_, index) => {
  const template =
    templateOptions[Math.floor(Math.random() * templateOptions.length)];
  // 随机生成状态
  const statusList = Object.keys(statusConfig);
  const status = statusList[Math.floor(Math.random() * statusList.length)];

  // 生成版本号的辅助函数
  const generateVersion = () => {
    return `${Math.floor(Math.random() * 5)}.${Math.floor(
      Math.random() * 10
    )}.${Math.floor(Math.random() * 10)}`;
  };

  return {
    id: `miniapp_${index + 1}`,
    icon: `https://api.dicebear.com/7.x/bottts/svg?seed=${index}`,
    name: `测试小程序${index + 1}`,
    appid: `wx${Math.random().toString().slice(2, 12)}`,
    vendor: `媒体商${index + 1}`,
    subject: `主体${index + 1}`,
    appkey: Math.random().toString(36).slice(2, 10).toUpperCase(),
    status: status,
    rejectReason:
      status === "REJECT"
        ? "小程序违反相关规范，具体原因：1. 服务类目不符合要求；2. 小程序名称不规范"
        : null,
    admin: `管理员${index + 1}`,
    template: template.value,
    templateVersion: generateVersion(), // 测试版本
    currentVersion: status === "PUBLISHED" ? generateVersion() : null, // 线上版本
    auditVersion: ["AUDITING", "REJECT"].includes(status)
      ? generateVersion()
      : null, // 审核版本
    auditStatus: status === "AUDITING" ? 0 : status === "REJECT" ? 2 : null, // 添加审核状态
  };
});

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

// 添加版本比较函数
const compareVersion = (v1, v2) => {
  if (!v1 || !v2) return false;
  const v1Parts = v1.split(".").map(Number);
  const v2Parts = v2.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] > v2Parts[i]) return 1;
    if (v1Parts[i] < v2Parts[i]) return -1;
  }
  return 0;
};

// 创建通用的版本过滤下拉框组件
const VersionFilterDropdown = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
}) => (
  <div style={{ padding: 8 }}>
    <Input
      placeholder="输入版本号 (x.y.z)"
      value={selectedKeys[0]}
      onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
      style={{ width: 188, marginBottom: 8, display: "block" }}
    />
    <Space>
      <Button
        type="primary"
        onClick={() => confirm({ closeDropdown: true })}
        size="small"
        style={{ width: 90 }}
      >
        确定
      </Button>
      <Button
        onClick={() => {
          clearFilters();
          confirm({ closeDropdown: true });
        }}
        size="small"
        style={{ width: 90 }}
      >
        重置
      </Button>
    </Space>
    <Divider style={{ margin: "8px 0" }} />
    <div style={{ padding: "4px 0" }}>过滤方式：</div>
    <Radio.Group
      value={selectedKeys[1] || "eq"}
      onChange={e =>
        setSelectedKeys(
          selectedKeys[0] ? [selectedKeys[0], e.target.value] : []
        )
      }
      size="small"
    >
      <Space direction="vertical">
        <Radio value="eq">等于</Radio>
        <Radio value="gt">大于</Radio>
        <Radio value="gte">大于等于</Radio>
        <Radio value="lt">小于</Radio>
        <Radio value="lte">小于等于</Radio>
      </Space>
    </Radio.Group>
  </div>
);

// 创建通用的版本列配置生成函数
const getVersionColumn = (dataIndex, title, color = "success") => ({
  title,
  dataIndex,
  width: 150,
  render: version =>
    version ? (
      <Tag color={color}>v{version}</Tag>
    ) : (
      <Text type="secondary">-</Text>
    ),
  filterDropdown: VersionFilterDropdown,
  filterIcon: filtered => (
    <FilterFilled style={{ color: filtered ? "#1890ff" : undefined }} />
  ),
  onFilter: (value, record, filterBy = "eq") => {
    if (!record[dataIndex]) return false;
    const compareResult = compareVersion(record[dataIndex], value);
    switch (filterBy) {
      case "gt":
        return compareResult > 0;
      case "gte":
        return compareResult >= 0;
      case "lt":
        return compareResult < 0;
      case "lte":
        return compareResult <= 0;
      default:
        return compareResult === 0;
    }
  },
});

// 在弹窗中使用通用的表格列配置
const getCommonTableColumns = () => [
  {
    title: "小程序名称",
    dataIndex: "name",
    fixed: "left",
    width: 200,
    render: (text, record) => (
      <Space>
        <Avatar size="small" src={record.icon} shape="square" />
        <span>{text}</span>
      </Space>
    ),
    filterMode: "menu",
    filterSearch: true,
    filters: Array.from(new Set(mockData.map(item => item.name))).map(name => ({
      text: name,
      value: name,
    })),
    onFilter: (value, record) => record.name.includes(value),
  },
  {
    title: "小程序ID",
    dataIndex: "appid",
    width: 150,
    filterMode: "menu",
    filterSearch: true,
    filters: Array.from(new Set(mockData.map(item => item.appid))).map(
      appid => ({
        text: appid,
        value: appid,
      })
    ),
    onFilter: (value, record) => record.appid.includes(value),
  },
  getVersionColumn("currentVersion", "线上版本", "success"),
  getVersionColumn("auditVersion", "审核版本", "warning"),
  getVersionColumn("templateVersion", "测试版本", "purple"),
  {
    title: "状态",
    dataIndex: "status",
    width: 120,
    render: (status, record) => {
      const config = statusConfig[status];
      return (
        <Space>
          {config.icon}
          <Tag color={config.color}>{config.text}</Tag>
          {status === "REJECT" && (
            <Tooltip title={record.rejectReason}>
              <InfoCircleOutlined
                style={{ color: "#ff4d4f", cursor: "pointer" }}
              />
            </Tooltip>
          )}
        </Space>
      );
    },
    filters: Object.values(statusConfig).map(item => ({
      text: item.text,
      value: item.value,
    })),
    onFilter: (value, record) => record.status === value,
  },
];

// 在所有批量操作弹窗中使用相同的表格配置
const commonTableProps = {
  size: "small",
  scroll: { y: 400 },
  pagination: false,
  columns: getCommonTableColumns(),
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
  const [batchDevSettingsVisible, setBatchDevSettingsVisible] = useState(false);
  const [selectedMiniappsForSettings, setSelectedMiniappsForSettings] =
    useState([]);
  const [batchSettingsForm] = Form.useForm();
  const [configVisible, setConfigVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [bindTestTemplateVisible, setBindTestTemplateVisible] = useState(false);
  const [devConfigVisible, setDevConfigVisible] = useState(false);
  // 添加失败结果的状态管理
  const [failedResults, setFailedResults] = useState([]);
  const [failedModalVisible, setFailedModalVisible] = useState(false);
  const [renderConfigVisible, setRenderConfigVisible] = useState(false);

  // 配置schema定义
  const configSchema = {
    type: 'object',
    properties: {
      primaryColor: {
        type: 'string',
        title: '主题色',
        format: 'color',
        default: '#1890ff',
        description: '整个应用的主色调',
        extra: '主色调，默认为蓝色 #1890ff'
      },
      darkColor: {
        type: 'string',
        title: '主题深色',
        format: 'color',
        default: '#001529',
        description: '用于导航等深色区域',
        extra: '用于导航等深色区域，默认为 #001529'
      },
      warningColor: {
        type: 'string',
        title: '提醒色',
        format: 'color',
        default: '#faad14',
        description: '警告、提示等颜色',
        extra: '警告、提示等颜色，默认为黄色 #faad14'
      },
      linkColor: {
        type: 'string',
        title: '链接色',
        format: 'color',
        default: '#1890ff',
        description: '超链接颜色',
        extra: '超链接颜色，默认为蓝色 #1890ff'
      }
    },
    required: ['primaryColor', 'darkColor', 'warningColor', 'linkColor']
  };
  
  // 处理保存配置
  const handleSaveConfig = (values) => {
    console.log("保存配置:", values);
    // 这里可以调用API保存配置
    
    // 更新本地状态以模拟保存效果
    if (currentMiniapp) {
      setCurrentMiniapp({
        ...currentMiniapp,
        draftRenderConfig: values
      });
    }
  };
  
  // 处理发布小程序
  const handlePublishMiniapp = () => {
    console.log("发布小程序:", currentMiniapp?.id);
    message.success("发布请求已提交");
    
    // 更新本地状态以模拟发布效果
    if (currentMiniapp?.draftRenderConfig) {
      setCurrentMiniapp({
        ...currentMiniapp,
        renderConfig: currentMiniapp.draftRenderConfig,
        draftRenderConfig: null
      });
    }
    
    setRenderConfigVisible(false);
  };

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
    // 如果是提交审核，先验证备注信息
    if (operationType === "submit") {
      try {
        await form.validateFields();
      } catch (error) {
        return; // 如果验证失败，直接返回
      }
    }

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

  // 修改实际执行操作的函数
  const performBatchOperation = async () => {
    setLoading(true);
    try {
      // 获取提审备注（如果是提交审核操作）
      const auditRemark =
        operationType === "submit" ? form.getFieldValue("auditRemark") : null;

      // 这里模拟接口调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 使用模拟结果数据
      const result = {
        ...operationConfig[operationType].mockResult,
        data: {
          ...operationConfig[operationType].mockResult.data,
          auditRemark,
          // 模拟部分失败的情况
          failedList: [
            {
              id: "miniapp_1",
              name: "测试小程序1",
              appid: "wx123456",
              reason: "接口调用失败",
              retryable: true,
            },
            {
              id: "miniapp_2",
              name: "测试小程序2",
              appid: "wx234567",
              reason: "版本号错误",
              retryable: false,
            },
          ],
        },
      };

      if (result.success) {
        // 如果有失败的项目，显示失败结果弹窗
        if (result.data.failedList?.length > 0) {
          setFailedResults(result.data.failedList);
          setFailedModalVisible(true);
          Modal.confirm({
            title: "操作结果",
            width: 800,
            content: (
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                <Alert
                  message={`总计: ${result.data.total}个，成功: ${result.data.success}个，失败: ${result.data.failedList.length}个`}
                  type="warning"
                  showIcon
                />
                <Table
                  dataSource={result.data.failedList}
                  columns={[
                    {
                      title: "小程序名称",
                      dataIndex: "name",
                      width: 200,
                    },
                    {
                      title: "AppID",
                      dataIndex: "appid",
                      width: 150,
                    },
                    {
                      title: "失败原因",
                      dataIndex: "reason",
                    },
                    {
                      title: "操作",
                      width: 120,
                      render: (_, record) =>
                        record.retryable ? (
                          <Button
                            type="link"
                            onClick={() => handleRetryOperation([record])}
                          >
                            重试
                          </Button>
                        ) : (
                          <Tooltip title="当前错误无法通过重试解决">
                            <Text type="secondary">不可重试</Text>
                          </Tooltip>
                        ),
                    },
                  ]}
                  rowKey="id"
                  pagination={false}
                />
                <Space>
                  <Button
                    type="primary"
                    onClick={() =>
                      handleRetryOperation(
                        result.data.failedList.filter(item => item.retryable)
                      )
                    }
                    disabled={
                      !result.data.failedList.some(item => item.retryable)
                    }
                  >
                    全部重试
                  </Button>
                  <Button onClick={() => setFailedModalVisible(false)}>
                    关闭
                  </Button>
                </Space>
              </Space>
            ),
            footer: null,
          });
        } else {
          message.success(result.message);
        }
      } else {
        message.error(result.message || "操作失败");
      }

      setOperationModalVisible(false);
      setSelectedApps([]);
      form.resetFields();
    } catch (err) {
      message.error("操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 添加重试操作的处理函数
  const handleRetryOperation = async failedItems => {
    setLoading(true);
    try {
      // 这里调用重试接口
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 更新失败结果列表
      setFailedResults(prev =>
        prev.filter(item => !failedItems.find(f => f.id === item.id))
      );

      message.success(`重试成功: ${failedItems.length}个`);

      // 如果所有失败项都已处理完，关闭弹窗
      if (failedResults.length === failedItems.length) {
        setFailedModalVisible(false);
      }
    } catch (error) {
      message.error("重试失败，请稍后再试");
    } finally {
      setLoading(false);
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

  // 处理批量开发设置
  const handleBatchDevSettings = async () => {
    try {
      const values = await batchSettingsForm.validateFields();
      // 处理每个域名字符串，转换为数组
      const formattedValues = Object.keys(values).reduce((acc, key) => {
        if (key !== "miniapps") {
          // 排除小程序选择字段
          acc[key] = values[key].split("\n").filter(item => item.trim());
        }
        return acc;
      }, {});

      // 这里模拟保存配置
      setLoading(true);
      await Promise.all(
        selectedMiniappsForSettings.map(appId =>
          new Promise((resolve, reject) => {
            // 模拟成功率 95%
            if (Math.random() > 0.05) {
              setTimeout(resolve, 1000);
            } else {
              reject(new Error(`小程序 ${appId} 配置失败`));
            }
          }).catch(error => ({ error, appId }))
        )
      ).then(results => {
        const failures = results.filter(r => r?.error);

        if (failures.length > 0) {
          modal.error({
            title: "部分小程序配置失败",
            content: (
              <div>
                {failures.map(({ error, appId }) => {
                  const app = mockData.find(item => item.id === appId);
                  return (
                    <div key={appId}>
                      {app?.name || appId}: {error.message}
                    </div>
                  );
                })}
              </div>
            ),
          });
        } else {
          message.success(
            `成功配置 ${selectedMiniappsForSettings.length} 个小程序`
          );
        }
      });

      setBatchDevSettingsVisible(false);
      setSelectedMiniappsForSettings([]);
      batchSettingsForm.resetFields();
    } catch {
      message.error("配置保存失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理全选小程序
  const handleSelectAllMiniapps = checked => {
    if (checked) {
      setSelectedMiniappsForSettings(mockData.map(item => item.id));
    } else {
      setSelectedMiniappsForSettings([]);
    }
  };

  // 显示批量设置弹窗
  const showBatchDevSettings = () => {
    Modal.confirm({
      title: "批量开发设置",
      width: 800,
      content: (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Alert
            message="批量设置说明"
            description="选择需要配置的小程序，设置将应用到所有选中的小程序。此操作会覆盖小程序现有的域名配置。"
            type="info"
            showIcon
          />
          <SelectionTable
            dataSource={mockData}
            selectedRowKeys={selectedRowKeys}
            onSelectChange={setSelectedRowKeys}
            showVersions={false}
          />
          <Divider>域名配置</Divider>
          <Form
            form={batchSettingsForm}
            layout="vertical"
            initialValues={{
              requestDomains: defaultDomainConfig.requestDomains.join("\n"),
              socketDomains: defaultDomainConfig.socketDomains.join("\n"),
              uploadDomains: defaultDomainConfig.uploadDomains.join("\n"),
              downloadDomains: defaultDomainConfig.downloadDomains.join("\n"),
              webviewDomains: defaultDomainConfig.webviewDomains.join("\n"),
            }}
          >
            <Tabs
              type="card"
              size="small"
              defaultActiveKey="request"
              tabBarStyle={{ marginBottom: 16 }}
              tabBarGutter={8}
              items={[
                {
                  key: "request",
                  label: "request域名",
                  children: (
                    <Form.Item
                      name="requestDomains"
                      rules={[
                        { required: true, message: "请输入request合法域名" },
                        {
                          validator: (_, value) => {
                            const domains = value
                              .split("\n")
                              .filter(item => item.trim());
                            const isValid = domains.every(
                              domain =>
                                domain.startsWith("http://") ||
                                domain.startsWith("https://")
                            );
                            return isValid
                              ? Promise.resolve()
                              : Promise.reject(
                                  "域名必须以 http:// 或 https:// 开头"
                                );
                          },
                        },
                      ]}
                      extra="每行一个域名，必须以 http:// 或 https:// 开头"
                    >
                      <TextArea
                        placeholder="请输入request合法域名，每行一个"
                        autoSize={{ minRows: 4, maxRows: 6 }}
                        style={{ backgroundColor: "#fafafa" }}
                      />
                    </Form.Item>
                  ),
                },
                {
                  key: "socket",
                  label: "socket域名",
                  children: (
                    <Form.Item
                      name="socketDomains"
                      rules={[
                        { required: true, message: "请输入socket合法域名" },
                        {
                          validator: (_, value) => {
                            const domains = value
                              .split("\n")
                              .filter(item => item.trim());
                            const isValid = domains.every(
                              domain =>
                                domain.startsWith("ws://") ||
                                domain.startsWith("wss://")
                            );
                            return isValid
                              ? Promise.resolve()
                              : Promise.reject(
                                  "域名必须以 ws:// 或 wss:// 开头"
                                );
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
                  ),
                },
                {
                  key: "upload",
                  label: "上传域名",
                  children: (
                    <Form.Item
                      name="uploadDomains"
                      rules={[
                        { required: true, message: "请输入uploadFile合法域名" },
                        {
                          validator: (_, value) => {
                            const domains = value
                              .split("\n")
                              .filter(item => item.trim());
                            const isValid = domains.every(
                              domain =>
                                domain.startsWith("http://") ||
                                domain.startsWith("https://")
                            );
                            return isValid
                              ? Promise.resolve()
                              : Promise.reject(
                                  "域名必须以 http:// 或 https:// 开头"
                                );
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
                  ),
                },
                {
                  key: "download",
                  label: "下载域名",
                  children: (
                    <Form.Item
                      name="downloadDomains"
                      rules={[
                        {
                          required: true,
                          message: "请输入downloadFile合法域名",
                        },
                        {
                          validator: (_, value) => {
                            const domains = value
                              .split("\n")
                              .filter(item => item.trim());
                            const isValid = domains.every(
                              domain =>
                                domain.startsWith("http://") ||
                                domain.startsWith("https://")
                            );
                            return isValid
                              ? Promise.resolve()
                              : Promise.reject(
                                  "域名必须以 http:// 或 https:// 开头"
                                );
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
                  ),
                },
                {
                  key: "webview",
                  label: "web-view域名",
                  children: (
                    <Form.Item
                      name="webviewDomains"
                      rules={[
                        { required: true, message: "请输入web-view域名" },
                        {
                          validator: (_, value) => {
                            const domains = value
                              .split("\n")
                              .filter(item => item.trim());
                            const isValid = domains.every(
                              domain =>
                                domain.startsWith("http://") ||
                                domain.startsWith("https://")
                            );
                            return isValid
                              ? Promise.resolve()
                              : Promise.reject(
                                  "域名必须以 http:// 或 https:// 开头"
                                );
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
                  ),
                },
              ]}
            />
          </Form>
          <div
            style={{
              backgroundColor: "#fffbe6",
              padding: "12px 16px",
              borderRadius: 4,
            }}
          >
            <Alert
              type="warning"
              message="注意事项"
              showIcon
              description={
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>
                    所有域名必须以 http:// 或 https:// 开头（socket域名以 ws://
                    或 wss:// 开头）
                  </li>
                  <li>域名不能使用 IP 地址或 localhost</li>
                  <li>域名必须经过 ICP 备案</li>
                  <li>同一域名只能配置一次</li>
                  <li>批量设置将覆盖所选小程序的现有配置</li>
                </ul>
              }
            />
          </div>
        </Space>
      ),
      okText: "确认设置",
      cancelText: "取消",
      maskClosable: false,
      onOk: handleBatchDevSettings,
    });
  };

  // 显示配置弹窗
  const showConfigModal = record => {
    // 模拟获取小程序配置
    const config = {
      requestDomains: defaultDomainConfig.requestDomains,
      socketDomains: defaultDomainConfig.socketDomains,
      uploadDomains: defaultDomainConfig.uploadDomains,
      downloadDomains: defaultDomainConfig.downloadDomains,
      webviewDomains: defaultDomainConfig.webviewDomains,
    };
    setCurrentConfig(config);
    setCurrentMiniapp(record);
    setConfigVisible(true);
  };

  // 修改操作按钮
  const actionButtons = record => (
    <Space direction="vertical" size={4} style={{ width: "100%" }}>
      <Space size="middle">
        <Button
          type="link"
          size="small"
          onClick={() => showBindTestTemplateModal(record)}
        >
          绑定测试模板
        </Button>
        <Button
          key="baseInfo"
          type="link"
          size="small"
          onClick={() => {
            setCurrentMiniapp(record);
            setBaseInfoVisible(true);
            form.setFieldsValue({
              name: record.name,
              shortName: record.name,
              icon: record.icon,
              vendor: record.vendor,
              subject: record.subject,
              appid: record.appid,
              merchantId: "",
              admin: record.admin,
            });
          }}
        >
          基础信息
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

  // 修改工具栏按钮配置，添加批量开发设置按钮
  const toolbarButtons = [
    <Space size="middle" key="toolbar-buttons">
      <Button type="primary" onClick={showBatchDevSettings}>
        批量开发设置
      </Button>
      <Button type="primary" onClick={() => showBindModal(mockData)}>
        批量绑定模板
      </Button>
      <Button type="primary" onClick={() => showOperationModal("submit")}>
        批量提交审核
      </Button>
      <Button
        type="primary"
        danger
        onClick={() => showOperationModal("withdraw")}
      >
        批量撤回提审
      </Button>
      <Button
        type="primary"
        danger
        onClick={() => showOperationModal("publish")}
      >
        批量发布上线
      </Button>
      <Button
        type="primary"
        danger
        onClick={() => showOperationModal("rollback")}
      >
        批量回退版本
      </Button>
    </Space>,
  ];

  // 显示绑定测试模板弹窗
  const showBindTestTemplateModal = record => {
    setCurrentMiniapp(record);
    setSelectedTemplate(null);
    setBindTestTemplateVisible(true);
  };

  // 处理绑定测试模板
  const handleBindTestTemplate = async () => {
    if (!selectedTemplate) {
      message.error("请选择要绑定的模板版本");
      return;
    }

    try {
      // 这里添加绑定测试模板的接口调用
      message.success("绑定测试模板成功");
      setBindTestTemplateVisible(false);
      setCurrentMiniapp(null);
      setSelectedTemplate(null);
      // 刷新列表
      actionRef.current?.reload();
    } catch (error) {
      message.error("绑定测试模板失败");
    }
  };

  // 添加 ProTable 的列配置
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
      title: "版本信息",
      dataIndex: "versions",
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{ width: "100%" }}>
          <Space>
            <Text type="secondary" style={{ width: 70 }}>
              线上版本:
            </Text>
            {record.currentVersion ? (
              <Tag color="success">v{record.currentVersion}</Tag>
            ) : (
              <Text type="secondary">-</Text>
            )}
          </Space>
          <Space>
            <Text type="secondary" style={{ width: 70 }}>
              审核版本:
            </Text>
            {record.auditVersion ? (
              <Tag color="warning">v{record.auditVersion}</Tag>
            ) : (
              <Text type="secondary">-</Text>
            )}
          </Space>
          <Space>
            <Text type="secondary" style={{ width: 70 }}>
              测试版本:
            </Text>
            {record.templateVersion ? (
              <Tag color="purple">v{record.templateVersion}</Tag>
            ) : (
              <Text type="secondary">-</Text>
            )}
          </Space>
        </Space>
      ),
      filterDropdown: VersionFilterDropdown,
      filterIcon: filtered => (
        <FilterFilled style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record, filterBy = "eq") => {
        // 在所有版本中查找匹配的版本
        const versions = [
          record.currentVersion,
          record.auditVersion,
          record.templateVersion,
        ].filter(Boolean);

        return versions.some(version => {
          const compareResult = compareVersion(version, value);
          switch (filterBy) {
            case "gt":
              return compareResult > 0;
            case "gte":
              return compareResult >= 0;
            case "lt":
              return compareResult < 0;
            case "lte":
              return compareResult <= 0;
            default:
              return compareResult === 0;
          }
        });
      },
    },
    // {
    //   title: "媒体厂商",
    //   dataIndex: "vendor",
    //   search: true,
    // },
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
      width: 120,
      render: (status, record) => {
        const config = statusConfig[status];
        return (
          <Space>
            {config.icon}
            <Tag color={config.color}>{config.text}</Tag>
            {status === "REJECT" && (
              <Tooltip title={record.rejectReason}>
                <InfoCircleOutlined
                  style={{ color: "#ff4d4f", cursor: "pointer" }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
      filters: Object.values(statusConfig).map(item => ({
        text: item.text,
        value: item.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "管理员",
      dataIndex: "admin",
      search: true,
    },
    {
      title: "产品操作",
      valueType: "option",
      width: 80,
      align: "center",
      fixed: "right",
      render: (_, record) => productActionButtons(record),
    },
    {
      title: "研发操作",
      valueType: "option",
      width: 80,
      align: "center",
      fixed: "right",
      render: (_, record) => devActionButtons(record),
    },
  ];

  // 产品操作按钮
  const productActionButtons = record => (
    <Space
      direction="vertical"
      size={4}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Button
        key="baseInfo"
        type="link"
        size="small"
        onClick={() => {
          setCurrentMiniapp(record);
          setBaseInfoVisible(true);
          form.setFieldsValue({
            name: record.name,
            shortName: record.name,
            icon: record.icon,
            vendor: record.vendor,
            subject: record.subject,
            appid: record.appid,
            merchantId: "",
            admin: record.admin,
          });
        }}
      >
        基础信息
      </Button>
      <Button
        key="renderConfig"
        type="link"
        size="small"
        onClick={() => {
          setCurrentMiniapp(record);
          setRenderConfigVisible(true);
        }}
      >
        渲染配置
      </Button>
      <Button key="operationConfig" type="link" size="small">
        运营配置
      </Button>
      <Button key="privacyManage" type="link" size="small">
        隐私管理
      </Button>
    </Space>
  );

  // 研发操作按钮
  const devActionButtons = record => (
    <Space
      direction="vertical"
      size={4}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Button
        key="config"
        type="link"
        size="small"
        onClick={() => showDevConfig(record)}
      >
        查看开发配置
      </Button>
      <Button
        key="bindTemplate"
        type="link"
        size="small"
        onClick={() => showBindTestTemplateModal(record)}
      >
        绑定测试模板
      </Button>
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
        生成二维码
      </Button>
      <Button
        key="detail"
        type="link"
        size="small"
        onClick={() => handleShowDetail(record)}
      >
        版本信息
      </Button>
    </Space>
  );

  // 查看开发配置
  const showDevConfig = record => {
    // 模拟获取当前小程序的开发配置
    const config = {
      requestDomains: ["https://api.example.com", "https://api2.example.com"],
      socketDomains: ["wss://socket.example.com"],
      uploadDomains: ["https://upload.example.com"],
      downloadDomains: ["https://download.example.com"],
      webviewDomains: ["https://webview.example.com"],
    };
    setCurrentConfig(config);
    setDevConfigVisible(true);
  };

  // 添加开发配置查看弹窗
  const DevConfigModal = () => (
    <Modal
      title="开发配置"
      open={devConfigVisible}
      onCancel={() => {
        setDevConfigVisible(false);
        setCurrentConfig(null);
      }}
      footer={null}
      width={800}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* request域名 */}
        <div>
          <Alert
            message="request合法域名"
            type="info"
            showIcon
            style={{ marginBottom: 8 }}
          />
          <div
            style={{
              backgroundColor: "#fafafa",
              padding: 16,
              borderRadius: 4,
            }}
          >
            {currentConfig?.requestDomains.map((domain, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <Text copyable>{domain}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* socket域名 */}
        <div>
          <Alert
            message="socket合法域名"
            type="info"
            showIcon
            style={{ marginBottom: 8 }}
          />
          <div
            style={{
              backgroundColor: "#fafafa",
              padding: 16,
              borderRadius: 4,
            }}
          >
            {currentConfig?.socketDomains.map((domain, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <Text copyable>{domain}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* 上传域名 */}
        <div>
          <Alert
            message="上传合法域名"
            type="info"
            showIcon
            style={{ marginBottom: 8 }}
          />
          <div
            style={{
              backgroundColor: "#fafafa",
              padding: 16,
              borderRadius: 4,
            }}
          >
            {currentConfig?.uploadDomains.map((domain, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <Text copyable>{domain}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* 下载域名 */}
        <div>
          <Alert
            message="下载合法域名"
            type="info"
            showIcon
            style={{ marginBottom: 8 }}
          />
          <div
            style={{
              backgroundColor: "#fafafa",
              padding: 16,
              borderRadius: 4,
            }}
          >
            {currentConfig?.downloadDomains.map((domain, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <Text copyable>{domain}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* web-view域名 */}
        <div>
          <Alert
            message="web-view合法域名"
            type="info"
            showIcon
            style={{ marginBottom: 8 }}
          />
          <div
            style={{
              backgroundColor: "#fafafa",
              padding: 16,
              borderRadius: 4,
            }}
          >
            {currentConfig?.webviewDomains.map((domain, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <Text copyable>{domain}</Text>
              </div>
            ))}
          </div>
        </div>
      </Space>
    </Modal>
  );

  return (
    <div className="page-container">
      <ProTable
        scroll={{
          x: "max-content", // 使用 max-content 确保内容不会被压缩
          scrollToFirstRowOnChange: true, // 翻页时滚动到第一行
        }}
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
        sticky // 添加表头固定
      />

      {/* 批量操作弹窗 */}
      <Modal
        title={
          {
            submit: "批量提交审核",
            withdraw: "批量撤回审核",
            publish: "批量发布上线",
            rollback: "批量回退版本",
          }[operationType]
        }
        open={operationModalVisible}
        onOk={handleBatchOperation}
        onCancel={() => {
          setOperationModalVisible(false);
          setSelectedApps([]);
        }}
        width={1000}
        confirmLoading={loading}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Alert
            message={
              {
                submit: "提交审核说明",
                withdraw: "撤回审核说明",
                publish: "发布上线说明",
                rollback: "回退版本说明",
              }[operationType]
            }
            description={
              {
                submit: "选择需要提交审核的小程序，提交后将进入审核流程",
                withdraw: "选择需要撤回审核的小程序，撤回后可重新提交",
                publish: "选择需要发布的小程序，发布后将更新线上版本",
                rollback: "选择需要回退的小程序，回退后将恢复到上一个版本",
              }[operationType]
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Checkbox
                checked={selectedApps.length === mockData.length}
                indeterminate={
                  selectedApps.length > 0 &&
                  selectedApps.length < mockData.length
                }
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedApps(mockData);
                  } else {
                    setSelectedApps([]);
                  }
                }}
              >
                全选
              </Checkbox>
              <Text type="secondary">
                已选择 {selectedApps.length}/{mockData.length} 个小程序
              </Text>
            </div>

            <Table
              {...commonTableProps}
              rowSelection={{
                selectedRowKeys: selectedApps.map(item => item.id),
                onChange: (selectedRowKeys, selectedRows) => {
                  setSelectedApps(selectedRows);
                },
              }}
              dataSource={mockData.filter(item => {
                // 根据操作类型过滤可选的小程序
                switch (operationType) {
                  case "submit":
                    return ["UNPUBLISHED", "REJECT"].includes(item.status);
                  case "withdraw":
                    return item.status === "AUDITING";
                  case "publish":
                    return item.status === "PUBLISHED";
                  case "rollback":
                    return item.status === "PUBLISHED" && item.currentVersion;
                  default:
                    return true;
                }
              })}
              rowKey="id"
            />
          </div>

          {/* 提审备注 - 仅在提交审核时显示 */}
          {operationType === "submit" && (
            <Form form={form}>
              <Form.Item
                name="auditRemark"
                label="提审备注"
                rules={[{ required: true, message: "请输入提审备注" }]}
                extra="建议填写本次提审的主要改动内容，方便后续追踪和管理"
              >
                <TextArea
                  placeholder="请输入本次提审的备注信息"
                  autoSize={{ minRows: 3, maxRows: 5 }}
                  style={{ backgroundColor: "#fafafa" }}
                />
              </Form.Item>
            </Form>
          )}

          <Alert
            type="warning"
            message="注意事项"
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {
                  {
                    submit: (
                      <>
                        <li>提交审核后将无法修改小程序配置</li>
                        <li>审核周期通常为1-3个工作日</li>
                      </>
                    ),
                    withdraw: (
                      <>
                        <li>撤回审核后需要重新提交才能发布</li>
                        <li>建议在发现问题时及时撤回</li>
                      </>
                    ),
                    publish: (
                      <>
                        <li>发布后将立即更新线上版本</li>
                        <li>请确保已完成相关测试</li>
                      </>
                    ),
                    rollback: (
                      <>
                        <li>回退后将恢复到上一个版本</li>
                        <li>回退操作不可逆，请谨慎操作</li>
                      </>
                    ),
                  }[operationType]
                }
              </ul>
            }
          />
        </Space>
      </Modal>

      {/* 绑定模板弹窗 */}
      <Modal
        title="批量绑定模板"
        open={bindModalVisible}
        onOk={handleBindTemplate}
        onCancel={() => {
          setBindModalVisible(false);
          setSelectedTemplate(null);
          setBindingMiniapps([]);
        }}
        width={1000}
        confirmLoading={loading}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Alert
            message="批量绑定说明"
            description="选择需要绑定的小程序和目标模板版本，绑定后将更新所选小程序的模板配置。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item label="选择模板版本" required style={{ marginBottom: 24 }}>
            <Select
              placeholder="请选择要绑定的模板版本"
              value={selectedTemplate}
              onChange={setSelectedTemplate}
              style={{ width: "100%" }}
              options={templateOptions.map(tpl => ({
                value: tpl.value,
                label: (
                  <Space>
                    <span>{tpl.label}</span>
                    <Tag color="purple">v{tpl.version}</Tag>
                  </Space>
                ),
              }))}
            />
          </Form.Item>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Checkbox
                checked={bindingMiniapps.length === mockData.length}
                indeterminate={
                  bindingMiniapps.length > 0 &&
                  bindingMiniapps.length < mockData.length
                }
                onChange={e => {
                  if (e.target.checked) {
                    setBindingMiniapps(mockData);
                  } else {
                    setBindingMiniapps([]);
                  }
                }}
              >
                全选
              </Checkbox>
              <Text type="secondary">
                已选择 {bindingMiniapps.length}/{mockData.length} 个小程序
              </Text>
            </div>

            <Table
              rowSelection={{
                selectedRowKeys: bindingMiniapps.map(item => item.id),
                onChange: (selectedRowKeys, selectedRows) => {
                  setBindingMiniapps(selectedRows);
                },
              }}
              dataSource={mockData}
              rowKey="id"
              size="small"
              scroll={{ y: 400 }}
              pagination={false}
              columns={[
                {
                  title: "小程序名称",
                  dataIndex: "name",
                  fixed: "left",
                  width: 200,
                  render: (text, record) => (
                    <Space>
                      <Avatar size="small" src={record.icon} shape="square" />
                      <span>{text}</span>
                    </Space>
                  ),
                  filterMode: "menu",
                  filterSearch: true,
                  filters: Array.from(
                    new Set(mockData.map(item => item.name))
                  ).map(name => ({
                    text: name,
                    value: name,
                  })),
                  onFilter: (value, record) => record.name.includes(value),
                },
                {
                  title: "小程序ID",
                  dataIndex: "appid",
                  width: 150,
                  filterMode: "menu",
                  filterSearch: true,
                  filters: Array.from(
                    new Set(mockData.map(item => item.appid))
                  ).map(appid => ({
                    text: appid,
                    value: appid,
                  })),
                  onFilter: (value, record) => record.appid.includes(value),
                },
                {
                  title: "线上版本",
                  dataIndex: "currentVersion",
                  width: 120,
                  render: version =>
                    version ? (
                      <Tag color="success">v{version}</Tag>
                    ) : (
                      <Text type="secondary">-</Text>
                    ),
                  filters: [
                    { text: "有线上版本", value: "has" },
                    { text: "无线上版本", value: "none" },
                  ],
                  onFilter: (value, record) =>
                    value === "has"
                      ? !!record.currentVersion
                      : !record.currentVersion,
                },
                {
                  title: "审核版本",
                  dataIndex: "auditVersion",
                  width: 200,
                  render: (version, record) => {
                    if (!version) return <Text type="secondary">-</Text>;

                    const statusConfig = {
                      0: { color: "processing", text: "审核中" },
                      1: { color: "success", text: "已通过" },
                      2: { color: "error", text: "未通过" },
                    };

                    const status = record.auditStatus
                      ? statusConfig[record.auditStatus]
                      : null;

                    return (
                      <Space>
                        <Tag color="warning">v{version}</Tag>
                        {status && (
                          <Tag color={status.color}>{status.text}</Tag>
                        )}
                      </Space>
                    );
                  },
                  filters: [
                    { text: "有审核版本", value: "has" },
                    { text: "无审核版本", value: "none" },
                    { text: "审核中", value: "0" },
                    { text: "已通过", value: "1" },
                    { text: "未通过", value: "2" },
                  ],
                  onFilter: (value, record) => {
                    if (value === "has") return !!record.auditVersion;
                    if (value === "none") return !record.auditVersion;
                    return record.auditStatus === value;
                  },
                },
                {
                  title: "测试版本",
                  dataIndex: "template",
                  width: 200,
                  render: (template, record) => {
                    const templateInfo = templateOptions.find(
                      t => t.value === template
                    );
                    return (
                      <Space>
                        <Tag color="purple">v{templateInfo?.version}</Tag>
                        <Text type="secondary">({templateInfo?.label})</Text>
                      </Space>
                    );
                  },
                  filters: [
                    { text: "有测试版本", value: "has" },
                    { text: "无测试版本", value: "none" },
                  ],
                  onFilter: (value, record) => {
                    if (value === "has") return !!record.template;
                    if (value === "none") return !record.template;
                    return true;
                  },
                },
                {
                  title: "当前模板",
                  dataIndex: "template",
                  width: 200,
                  render: template => {
                    const templateInfo = templateOptions.find(
                      t => t.value === template
                    );
                    return templateInfo ? templateInfo.label : "-";
                  },
                  filterMode: "menu",
                  filterSearch: true,
                  filters: templateOptions.map(template => ({
                    text: template.label,
                    value: template.value,
                  })),
                  onFilter: (value, record) => record.template === value,
                },
                {
                  title: "状态",
                  dataIndex: "status",
                  width: 120,
                  render: (status, record) => {
                    const config = statusConfig[status];
                    return (
                      <Space>
                        {config.icon}
                        <Tag color={config.color}>{config.text}</Tag>
                        {status === "REJECT" && (
                          <Tooltip title={record.rejectReason}>
                            <InfoCircleOutlined
                              style={{ color: "#ff4d4f", cursor: "pointer" }}
                            />
                          </Tooltip>
                        )}
                      </Space>
                    );
                  },
                  filters: Object.values(statusConfig).map(item => ({
                    text: item.text,
                    value: item.value,
                  })),
                  onFilter: (value, record) => record.status === value,
                },
              ]}
            />
          </div>

          <Alert
            type="warning"
            message="注意事项"
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>绑定模板后，将更新所选小程序的模板配置</li>
                <li>请确保所选小程序适用于目标模板版本</li>
                <li>建议在绑定前备份相关配置</li>
              </ul>
            }
          />
        </Space>
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

      {/* 查看配置弹窗 */}
      <Modal
        title={`${currentMiniapp?.name || ""} - 开发配置`}
        open={configVisible}
        onCancel={() => setConfigVisible(false)}
        footer={null}
        width={800}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* request域名 */}
          <div>
            <Alert
              message="request合法域名"
              type="info"
              showIcon
              style={{ marginBottom: 8 }}
            />
            <div
              style={{
                background: "#f5f5f5",
                padding: 16,
                borderRadius: 4,
              }}
            >
              {currentConfig?.requestDomains.map((domain, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <Text copyable>{domain}</Text>
                </div>
              ))}
            </div>
          </div>

          {/* socket域名 */}
          <div>
            <Alert
              message="socket合法域名"
              type="info"
              showIcon
              style={{ marginBottom: 8 }}
            />
            <div
              style={{
                background: "#f5f5f5",
                padding: 16,
                borderRadius: 4,
              }}
            >
              {currentConfig?.socketDomains.map((domain, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <Text copyable>{domain}</Text>
                </div>
              ))}
            </div>
          </div>

          {/* 上传域名 */}
          <div>
            <Alert
              message="上传合法域名"
              type="info"
              showIcon
              style={{ marginBottom: 8 }}
            />
            <div
              style={{
                background: "#f5f5f5",
                padding: 16,
                borderRadius: 4,
              }}
            >
              {currentConfig?.uploadDomains.map((domain, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <Text copyable>{domain}</Text>
                </div>
              ))}
            </div>
          </div>

          {/* 下载域名 */}
          <div>
            <Alert
              message="下载合法域名"
              type="info"
              showIcon
              style={{ marginBottom: 8 }}
            />
            <div
              style={{
                background: "#f5f5f5",
                padding: 16,
                borderRadius: 4,
              }}
            >
              {currentConfig?.downloadDomains.map((domain, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <Text copyable>{domain}</Text>
                </div>
              ))}
            </div>
          </div>

          {/* web-view域名 */}
          <div>
            <Alert
              message="web-view合法域名"
              type="info"
              showIcon
              style={{ marginBottom: 8 }}
            />
            <div
              style={{
                background: "#f5f5f5",
                padding: 16,
                borderRadius: 4,
              }}
            >
              {currentConfig?.webviewDomains.map((domain, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <Text copyable>{domain}</Text>
                </div>
              ))}
            </div>
          </div>
        </Space>
      </Modal>

      {/* 批量开发设置弹窗 */}
      <Modal
        title="批量开发设置"
        open={batchDevSettingsVisible}
        onOk={handleBatchDevSettings}
        onCancel={() => {
          setBatchDevSettingsVisible(false);
          setSelectedMiniappsForSettings([]);
          batchSettingsForm.resetFields();
        }}
        width={900}
        confirmLoading={loading}
      >
        <Form
          form={batchSettingsForm}
          layout="vertical"
          initialValues={{
            requestDomains: defaultDomainConfig.requestDomains.join("\n"),
            socketDomains: defaultDomainConfig.socketDomains.join("\n"),
            uploadDomains: defaultDomainConfig.uploadDomains.join("\n"),
            downloadDomains: defaultDomainConfig.downloadDomains.join("\n"),
            webviewDomains: defaultDomainConfig.webviewDomains.join("\n"),
          }}
        >
          <Alert
            message="批量设置说明"
            description="选择需要配置的小程序，设置将应用到所有选中的小程序。此操作会覆盖小程序现有的域名配置。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="选择小程序"
            name="miniapps"
            rules={[{ required: true, message: "请选择至少一个小程序" }]}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Checkbox
                  checked={
                    selectedMiniappsForSettings.length === mockData.length
                  }
                  indeterminate={
                    selectedMiniappsForSettings.length > 0 &&
                    selectedMiniappsForSettings.length < mockData.length
                  }
                  onChange={e => handleSelectAllMiniapps(e.target.checked)}
                >
                  全选
                </Checkbox>
                <Text type="secondary">
                  已选择 {selectedMiniappsForSettings.length}/{mockData.length}{" "}
                  个小程序
                </Text>
              </div>

              <Table
                rowSelection={{
                  selectedRowKeys: selectedMiniappsForSettings,
                  onChange: setSelectedMiniappsForSettings,
                }}
                dataSource={mockData}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ y: 240 }}
                columns={[
                  {
                    title: "小程序名称",
                    dataIndex: "name",
                    render: (text, record) => (
                      <Space>
                        <Avatar size="small" src={record.icon} shape="square" />
                        <span>{text}</span>
                      </Space>
                    ),
                  },
                  {
                    title: "小程序ID",
                    dataIndex: "appid",
                    width: 150,
                  },
                  {
                    title: "媒体厂商",
                    dataIndex: "vendor",
                    width: 120,
                  },
                ]}
              />
            </div>
          </Form.Item>

          <Tabs
            defaultActiveKey="request"
            items={[
              {
                key: "request",
                label: "request域名",
                children: (
                  <Form.Item
                    name="requestDomains"
                    rules={[
                      { required: true, message: "请输入request合法域名" },
                      {
                        validator: (_, value) => {
                          const domains = value
                            .split("\n")
                            .filter(item => item.trim());
                          const isValid = domains.every(
                            domain =>
                              domain.startsWith("http://") ||
                              domain.startsWith("https://")
                          );
                          return isValid
                            ? Promise.resolve()
                            : Promise.reject(
                                "域名必须以 http:// 或 https:// 开头"
                              );
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
                ),
              },
              {
                key: "socket",
                label: "socket域名",
                children: (
                  <Form.Item
                    name="socketDomains"
                    rules={[
                      { required: true, message: "请输入socket合法域名" },
                      {
                        validator: (_, value) => {
                          const domains = value
                            .split("\n")
                            .filter(item => item.trim());
                          const isValid = domains.every(
                            domain =>
                              domain.startsWith("ws://") ||
                              domain.startsWith("wss://")
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
                ),
              },
              {
                key: "upload",
                label: "上传域名",
                children: (
                  <Form.Item
                    name="uploadDomains"
                    rules={[
                      { required: true, message: "请输入uploadFile合法域名" },
                      {
                        validator: (_, value) => {
                          const domains = value
                            .split("\n")
                            .filter(item => item.trim());
                          const isValid = domains.every(
                            domain =>
                              domain.startsWith("http://") ||
                              domain.startsWith("https://")
                          );
                          return isValid
                            ? Promise.resolve()
                            : Promise.reject(
                                "域名必须以 http:// 或 https:// 开头"
                              );
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
                ),
              },
              {
                key: "download",
                label: "下载域名",
                children: (
                  <Form.Item
                    name="downloadDomains"
                    rules={[
                      { required: true, message: "请输入downloadFile合法域名" },
                      {
                        validator: (_, value) => {
                          const domains = value
                            .split("\n")
                            .filter(item => item.trim());
                          const isValid = domains.every(
                            domain =>
                              domain.startsWith("http://") ||
                              domain.startsWith("https://")
                          );
                          return isValid
                            ? Promise.resolve()
                            : Promise.reject(
                                "域名必须以 http:// 或 https:// 开头"
                              );
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
                ),
              },
              {
                key: "webview",
                label: "web-view域名",
                children: (
                  <Form.Item
                    name="webviewDomains"
                    rules={[
                      { required: true, message: "请输入web-view域名" },
                      {
                        validator: (_, value) => {
                          const domains = value
                            .split("\n")
                            .filter(item => item.trim());
                          const isValid = domains.every(
                            domain =>
                              domain.startsWith("http://") ||
                              domain.startsWith("https://")
                          );
                          return isValid
                            ? Promise.resolve()
                            : Promise.reject(
                                "域名必须以 http:// 或 https:// 开头"
                              );
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
                ),
              },
            ]}
          />

          <Alert
            type="warning"
            message="注意事项"
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>
                  所有域名必须以 http:// 或 https:// 开头（socket域名以 ws:// 或
                  wss:// 开头）
                </li>
                <li>域名不能使用 IP 地址或 localhost</li>
                <li>域名必须经过 ICP 备案</li>
                <li>同一域名只能配置一次</li>
                <li>批量设置将覆盖所选小程序的现有配置</li>
              </ul>
            }
          />
        </Form>
      </Modal>

      {/* 绑定测试模板弹窗 */}
      <Modal
        title="绑定测试模板"
        open={bindTestTemplateVisible}
        onOk={handleBindTestTemplate}
        onCancel={() => {
          setBindTestTemplateVisible(false);
          setCurrentMiniapp(null);
          setSelectedTemplate(null);
        }}
        width={600}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Alert
            message="绑定说明"
            description="选择要绑定的模板版本，绑定后将自动生成测试版本。"
            type="info"
            showIcon
          />

          <div>
            <div style={{ marginBottom: 16 }}>
              <Space align="center">
                <Avatar
                  size="small"
                  src={currentMiniapp?.icon}
                  shape="square"
                />
                <Text strong>{currentMiniapp?.name}</Text>
                <Tag>{currentMiniapp?.appid}</Tag>
              </Space>
            </div>

            <Form.Item
              label="选择模板版本"
              required
              style={{ marginBottom: 24 }}
            >
              <Select
                placeholder="请选择要绑定的模板版本"
                value={selectedTemplate}
                onChange={setSelectedTemplate}
                style={{ width: "100%" }}
                options={templateOptions.map(tpl => ({
                  value: tpl.value,
                  label: (
                    <Space>
                      <span>{tpl.label}</span>
                      <Tag color="purple">v{tpl.version}</Tag>
                    </Space>
                  ),
                }))}
              />
            </Form.Item>
          </div>

          <Alert
            type="warning"
            message="注意事项"
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>绑定后将自动生成测试版本</li>
                <li>可以基于测试版本提交审核或发布上线</li>
                <li>请确保选择的模板版本适用于该小程序</li>
              </ul>
            }
          />
        </Space>
      </Modal>

      <DevConfigModal />
      <RenderConfigModal
        visible={renderConfigVisible}
        currentData={{
          currentConfig: currentMiniapp?.renderConfig,
          draftConfig: currentMiniapp?.draftRenderConfig,
          version: currentMiniapp?.currentVersion || '1.0.0'
        }}
        schema={configSchema}
        title={`${currentMiniapp?.name || '小程序'} - 渲染配置`}
        onClose={() => {
          setRenderConfigVisible(false);
          setCurrentMiniapp(null);
        }}
        onSave={handleSaveConfig}
        onPublish={handlePublishMiniapp}
      />
    </div>
  );
}

export default MiniappList;
