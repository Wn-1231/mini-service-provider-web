import { ProTable } from "@ant-design/pro-components";
import { Space, Tag, Typography, Avatar } from "antd";
import { FilterFilled, ClockCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

// 状态配置
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

// 版本过滤下拉框组件
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

const SelectionTable = ({ 
  dataSource, 
  selectedRowKeys, 
  onSelectChange,
  showVersions = true  // 控制是否显示版本列
}) => {
  // 版本比较函数
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

  const columns = [
    {
      title: "图标",
      dataIndex: "icon",
      search: false,
      width: 80,
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
      search: true,
    },
    showVersions && {
      title: "版本信息",
      dataIndex: "versions",
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Space>
            <Text type="secondary" style={{ width: 70 }}>线上版本:</Text>
            {record.currentVersion ? (
              <Tag color="success">v{record.currentVersion}</Tag>
            ) : (
              <Text type="secondary">-</Text>
            )}
          </Space>
          <Space>
            <Text type="secondary" style={{ width: 70 }}>审核版本:</Text>
            {record.auditVersion ? (
              <Tag color="warning">v{record.auditVersion}</Tag>
            ) : (
              <Text type="secondary">-</Text>
            )}
          </Space>
          <Space>
            <Text type="secondary" style={{ width: 70 }}>测试版本:</Text>
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
        const versions = [
          record.currentVersion,
          record.auditVersion,
          record.templateVersion
        ].filter(Boolean);
        
        return versions.some(version => {
          const compareResult = compareVersion(version, value);
          switch (filterBy) {
            case "gt": return compareResult > 0;
            case "gte": return compareResult >= 0;
            case "lt": return compareResult < 0;
            case "lte": return compareResult <= 0;
            default: return compareResult === 0;
          }
        });
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const config = statusConfig[status];
        return (
          <Space>
            {config.icon}
            <Tag color={config.color}>{config.text}</Tag>
          </Space>
        );
      },
      filters: Object.values(statusConfig).map(item => ({
        text: item.text,
        value: item.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
  ].filter(Boolean);

  return (
    <ProTable
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      search={false}
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectChange,
      }}
      pagination={false}
      toolBarRender={false}
    />
  );
};

export default SelectionTable; 