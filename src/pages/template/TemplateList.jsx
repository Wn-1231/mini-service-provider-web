import { useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, message, Tabs, App } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const mockData = Array.from({ length: 10 }).map((_, index) => ({
  id: `template_${index + 1}`,
  create_time: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
  template_id: `tpl_${Math.random().toString(36).slice(2, 10)}`,
  user_desc: `版本描述${index + 1}`,
  user_version: `${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
}));

function TemplateList() {
  const [activeTab, setActiveTab] = useState('test');
  const { modal } = App.useApp();

  const handleDelete = (record) => {
    modal.confirm({
      title: '确认删除',
      content: `是否删除模板「${record.template_id}」？`,
      onOk: () => {
        message.success('删除成功');
      },
    });
  };

  const columns = [
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
      title: '模板ID',
      dataIndex: 'template_id',
      copyable: true,
      search: true,
    },
    {
      title: '版本描述',
      dataIndex: 'user_desc',
      search: true,
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
          key="delete"
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
        >
          删除模板
        </Button>,
      ],
    },
  ];

  return (
    <div className="page-container">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            label: '测试模板',
            key: 'test',
          },
          {
            label: '正式模板',
            key: 'prod',
          },
        ]}
      />
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
        headerTitle={activeTab === 'test' ? '测试模板列表' : '正式模板列表'}
      />
    </div>
  );
}

export default TemplateList; 