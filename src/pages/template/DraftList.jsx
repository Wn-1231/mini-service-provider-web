import { ProTable } from '@ant-design/pro-components';
import { Button, message, App } from 'antd';
import { ExportOutlined } from '@ant-design/icons';

const mockData = Array.from({ length: 5 }).map((_, index) => ({
  id: `draft_${index + 1}`,
  app_name: `测试小程序${index + 1}`,
  tpl_app_id: `wx${Math.random().toString().slice(2, 12)}`,
  create_time: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
  draft_id: Math.floor(Math.random() * 1000000),
  nick_name: `开发者${index + 1}`,
  user_desc: `版本描述${index + 1}`,
  user_version: `${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
}));

function DraftList() {
  const { modal } = App.useApp();

  const handleSetTemplate = (record) => {
    modal.confirm({
      title: '确认设置为模板',
      content: `是否将草稿「${record.app_name}」设置为模板？`,
      onOk: () => {
        message.success('设置成功');
      },
    });
  };

  const columns = [
    {
      title: '小程序名称',
      dataIndex: 'app_name',
      search: true,
    },
    {
      title: '小程序ID',
      dataIndex: 'tpl_app_id',
      copyable: true,
      search: true,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
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
      title: '草稿ID',
      dataIndex: 'draft_id',
      search: true,
    },
    {
      title: '上传开发者',
      dataIndex: 'nick_name',
      search: true,
    },
    {
      title: '版本描述',
      dataIndex: 'user_desc',
    },
    {
      title: '版本号',
      dataIndex: 'user_version',
      search: true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="setTemplate"
          type="link"
          icon={<ExportOutlined />}
          onClick={() => handleSetTemplate(record)}
        >
          设置为模板
        </Button>,
      ],
    },
  ];

  return (
    <div className="page-container">
      <ProTable
        columns={columns}
        dataSource={mockData}
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
        headerTitle="草稿箱列表"
      />
    </div>
  );
}

export default DraftList; 