import { useState, useEffect } from "react";
import { ProTable } from "@ant-design/pro-components";
import { Button, Modal, Space, Typography, App, Tag } from "antd";
import { PlusOutlined, CopyOutlined, LinkOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Paragraph } = Typography;

// 生成过期时间（24小时后）
const getExpireTime = createTime => {
  return dayjs(createTime).add(24, "hour").toDate();
};

// 计算剩余时间
const getRemainingTime = expireTime => {
  const now = dayjs();
  const expire = dayjs(expireTime);
  const hours = expire.diff(now, "hour");
  const minutes = expire.diff(now, "minute") % 60;

  if (hours < 0 || (hours === 0 && minutes <= 0)) {
    return "已过期";
  }
  return `${hours}小时${minutes}分钟`;
};

// 判断是否过期
const isExpired = expireTime => {
  return dayjs().isAfter(expireTime);
};

const mockData = Array.from({ length: 10 }).map((_, index) => {
  const createTime = new Date(
    Date.now() - Math.floor(Math.random() * 86400000)
  ); // 随机生成24小时内的时间
  const expireTime = getExpireTime(createTime);

  return {
    id: `auth_${index + 1}`,
    auth_id: `AUTH_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    auth_url: `https://example.com/auth/${Math.random()
      .toString(36)
      .slice(2, 10)}`,
    created_at: createTime.toISOString(),
    expire_at: expireTime.toISOString(),
    status: isExpired(expireTime)
      ? "已过期"
      : Math.random() > 0.5
      ? "已使用"
      : "未使用",
  };
});

function AuthList({ platform }) {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newAuthUrl, setNewAuthUrl] = useState("");
  const [newAuthExpireTime, setNewAuthExpireTime] = useState(null);
  const [authList, setAuthList] = useState(mockData);
  const { message: antMessage } = App.useApp();

  // 更新剩余时间
  useEffect(() => {
    const timer = setInterval(() => {
      setAuthList(prevList =>
        prevList.map(item => ({
          ...item,
          status: isExpired(item.expire_at) ? "已过期" : item.status,
        }))
      );
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  const handleCreateAuth = async () => {
    const createTime = new Date();
    const expireTime = getExpireTime(createTime);
    const newUrl = `https://example.com/auth/${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    setNewAuthUrl(newUrl);
    setNewAuthExpireTime(expireTime);
    setCreateModalVisible(true);
  };

  const handleCopy = async text => {
    try {
      await navigator.clipboard.writeText(text);
      antMessage.success("复制成功");
    } catch {
      antMessage.error("复制失败");
    }
  };

  const handleOpenUrl = url => {
    window.open(url, "_blank");
  };

  const columns = [
    {
      title: "授权ID",
      dataIndex: "auth_id",
      copyable: true,
      search: true,
    },
    {
      title: "授权链接",
      dataIndex: "auth_url",
      copyable: true,
      ellipsis: true,
      search: true,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      valueType: "dateTime",
      search: {
        transform: (value) => {
          return {
            start_time: value[0],
            end_time: value[1],
          };
        },
      },
    },
    {
      title: "剩余有效期",
      dataIndex: "expire_at",
      render: (_, record) => {
        const remaining = getRemainingTime(record.expire_at);
        const isAuthExpired = remaining === "已过期";

        return (
          <Tag
            color={
              isAuthExpired
                ? "error"
                : remaining.includes("0小时")
                ? "warning"
                : "success"
            }
          >
            {remaining}
          </Tag>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      valueEnum: {
        未使用: { text: "未使用", status: "Default" },
        已使用: { text: "已使用", status: "Success" },
        已过期: { text: "已过期", status: "Error" },
      },
      search: true,
    },
  ];

  // 根据平台返回不同的标题
  const getPlatformTitle = () => {
    return platform === 'wechat' ? '微信授权列表' : '抖音授权列表';
  };

  return (
    <div className="page-container">
      <ProTable
        columns={columns}
        dataSource={authList}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
          span: {
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
          },
        }}
        dateFormatter="string"
        headerTitle={getPlatformTitle()}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateAuth}
          >
            创建授权链接
          </Button>,
        ]}
      />

      <Modal
        title="授权链接已创建"
        open={createModalVisible}
        onOk={() => setCreateModalVisible(false)}
        onCancel={() => setCreateModalVisible(false)}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <span>授权链接已生成：</span>
            <div
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: 16,
              }}
            >
              <Paragraph style={{ marginBottom: 0 }}>
                <span style={{ wordBreak: "break-all" }}>{newAuthUrl}</span>
              </Paragraph>
            </div>
            <div>
              <Tag color="warning">
                有效期至：
                {dayjs(newAuthExpireTime).format("YYYY-MM-DD HH:mm:ss")}
              </Tag>
            </div>
          </Space>
        </div>
        <Space>
          <Button
            icon={<CopyOutlined />}
            onClick={() => handleCopy(newAuthUrl)}
          >
            复制链接
          </Button>
          <Button
            type="primary"
            icon={<LinkOutlined />}
            onClick={() => handleOpenUrl(newAuthUrl)}
          >
            在浏览器中打开
          </Button>
        </Space>
      </Modal>
    </div>
  );
}

export default AuthList;
