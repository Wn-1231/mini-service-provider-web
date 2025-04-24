import { ProTable } from "@ant-design/pro-components";
import { Tag, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

// 操作类型配置
const operationTypeConfig = {
  submit_audit: { text: "提交审核", color: "processing" },
  withdraw_audit: { text: "撤回提审", color: "warning" },
  publish: { text: "发布上线", color: "success" },
  rollback: { text: "版本回退", color: "error" },
  bind_template: { text: "绑定模板", color: "default" },
  update_gray: { text: "更新灰度", color: "blue" },
  offline: { text: "下线", color: "red" },
};

function OperationLog() {
  // 模拟操作日志数据
  const mockData = Array.from({ length: 50 }).map((_, index) => {
    const operationTypes = Object.keys(operationTypeConfig);
    return {
      id: `log_${index}`,
      operator: `管理员${Math.floor(Math.random() * 5) + 1}`,
      operation_type:
        operationTypes[Math.floor(Math.random() * operationTypes.length)],
      operation_time: dayjs()
        .subtract(Math.random() * 30, "days")
        .valueOf(),
      miniapp_name: `测试小程序${Math.floor(Math.random() * 10) + 1}`,
      miniapp_id: `wx${Math.random().toString().slice(2, 12)}`,
      user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    };
  });

  const columns = [
    {
      title: "操作时间",
      dataIndex: "operation_time",
      valueType: "dateTime",
      sorter: true,
      search: {
        transform: value => {
          return {
            operation_time_start: value[0],
            operation_time_end: value[1],
          };
        },
      },
    },
    {
      title: "操作人",
      dataIndex: "operator",
      search: true,
    },
    {
      title: "操作类型",
      dataIndex: "operation_type",
      valueEnum: Object.fromEntries(
        Object.entries(operationTypeConfig).map(([key, value]) => [
          key,
          { text: value.text, status: value.color },
        ])
      ),
      render: type => (
        <Tag color={operationTypeConfig[type]?.color}>
          {operationTypeConfig[type]?.text || type}
        </Tag>
      ),
      search: true,
      filters: Object.entries(operationTypeConfig).map(([key, value]) => ({
        text: value.text,
        value: key,
      })),
    },
    {
      title: "小程序名称",
      dataIndex: "miniapp_name",
      search: true,
    },
    {
      title: "小程序ID",
      dataIndex: "miniapp_id",
      search: true,
      render: text => <Text copyable>{text}</Text>,
    },
    {
      title: "User Agent",
      dataIndex: "user_agent",
      ellipsis: true,
      search: false,
    },
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
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        dateFormatter="string"
        headerTitle="操作日志"
      />
    </div>
  );
}

export default OperationLog;
