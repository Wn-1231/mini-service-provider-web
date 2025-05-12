import { Menu, Select } from "antd";
import {
  KeyOutlined,
  AppstoreOutlined,
  MobileOutlined,
  WechatOutlined,
  VideoCameraOutlined,
  FileOutlined,
  TeamOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const { Option } = Select;

const platforms = {
  douyin: {
    key: "douyin",
    label: "抖音平台",
    icon: <VideoCameraOutlined />,
    color: "#000000",
  },
  wechat: {
    key: "wechat",
    label: "微信平台",
    icon: <WechatOutlined />,
    color: "#07C160",
  },
};

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [platform, setPlatform] = useState("wechat");

  useEffect(() => {
    const currentPlatform = location.pathname.split('/')[1];
    if (currentPlatform && platforms[currentPlatform]) {
      setPlatform(currentPlatform);
    }
  }, [location.pathname]);

  const handlePlatformChange = value => {
    setPlatform(value);
    // 切换平台时，跳转到对应平台的相同模块
    const currentPath = location.pathname.split("/").slice(2).join("/");
    navigate(`/${value}/${currentPath || "auth/list"}`);
  };

  const getMenuItems = platform => [
    
    // {
    //   key: `${platform}/template`,
    //   icon: <AppstoreOutlined />,
    //   label: "模板管理",
    //   children: [
    //     {
    //       key: `/${platform}/template/draft`,
    //       label: "草稿箱列表",
    //     },
    //     {
    //       key: `/${platform}/template/list`,
    //       label: "模板列表",
    //     },
    //   ],
    // },
    {
      key: `${platform}/miniapp`,
      icon: <MobileOutlined />,
      label: "小程序管理",
      children: [
        {
          key: `/${platform}/miniapp/list`,
          label: "小程序列表",
        },
      ],
    },
    {
      key: `${platform}/auth`,
      icon: <KeyOutlined />,
      label: "授权管理",
      children: [
        {
          key: `/${platform}/auth/list`,
          label: "授权列表",
        },
      ],
    },
    {
      key: 'operation',
      icon: <HistoryOutlined />,
      label: "操作记录",
      children: [
        {
          key: '/miniapp/operation-log',
          label: "操作日志",
        },
      ],
    },
  ];

  return (
    <div className="side-menu">
      <div className="platform-header">
        <h2>小程序服务商平台</h2>
        <Select
          value={platform}
          onChange={handlePlatformChange}
          style={{ width: "100%" }}
        >
          {Object.values(platforms).map(item => (
            <Option key={item.key} value={item.key}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: item.color,
                }}
              >
                {item.icon}
                <span style={{ marginLeft: 8 }}>{item.label}</span>
              </div>
            </Option>
          ))}
        </Select>
      </div>
      <div className="menu-container">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[
            `${platform}/auth`,
            `${platform}/template`,
            `${platform}/miniapp`,
            'operation',
          ]}
          items={getMenuItems(platform)}
          onClick={e => navigate(e.key)}
        />
      </div>
    </div>
  );
}

export default Navigation;
