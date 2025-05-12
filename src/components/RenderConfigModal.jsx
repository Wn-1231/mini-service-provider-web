import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Tabs,
  Space,
  Tag,
  Alert,
  Descriptions,
  message,
  InputNumber,
  Divider,
  Typography,
  Collapse,
  Tooltip
} from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";

const { Text } = Typography;
const { Panel } = Collapse;

/**
 * 通用配置弹窗组件
 * @param {boolean} visible - 是否显示弹窗
 * @param {object} currentData - 当前数据对象，包含当前配置和草稿配置
 * @param {object} schema - 表单字段配置模式
 * @param {function} onClose - 关闭弹窗的回调
 * @param {function} onSave - 保存配置的回调
 * @param {function} onPublish - 发布配置的回调
 * @param {string} title - 弹窗标题
 */
const RenderConfigModal = ({ 
  visible, 
  currentData, 
  schema,
  onClose, 
  onSave, 
  onPublish,
  title = '配置'
}) => {
  const [configForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('current');

  // 从schema中提取默认值
  const getDefaultValues = () => {
    const defaults = {};
    if (schema && schema.properties) {
      Object.entries(schema.properties).forEach(([key, config]) => {
        if (config.default !== undefined) {
          defaults[key] = config.default;
        }
        
        // 处理嵌套对象
        if (config.type === 'object' && config.properties) {
          defaults[key] = {};
          Object.entries(config.properties).forEach(([nestedKey, nestedConfig]) => {
            if (nestedConfig.default !== undefined) {
              defaults[key][nestedKey] = nestedConfig.default;
            }
          });
        }
      });
    }
    return defaults;
  };

  const defaultValues = getDefaultValues();

  // 获取配置数据并设置表单值
  useEffect(() => {
    if (visible && currentData) {
      const onlineConfig = currentData.currentConfig || defaultValues;
      const draftConfig = currentData.draftConfig || { ...onlineConfig };
      
      if (activeTab === 'draft') {
        configForm.setFieldsValue(draftConfig);
      }
    }
  }, [visible, currentData, activeTab, configForm, defaultValues]);

  // 处理关闭弹窗
  const handleCancel = () => {
    if (hasChanges()) {
      Modal.confirm({
        title: '配置尚未保存',
        content: '您有未保存的配置更改，确定要离开吗？',
        onOk: () => {
          setActiveTab('current');
          onClose();
        }
      });
    } else {
      setActiveTab('current');
      onClose();
    }
  };

  // 检查是否有未保存的修改
  const hasChanges = () => {
    if (!currentData) return false;
    
    const formValues = configForm.getFieldsValue();
    const draftConfig = currentData.draftConfig || currentData.currentConfig || defaultValues;
    
    return JSON.stringify(formValues) !== JSON.stringify(draftConfig);
  };

  // 保存配置
  const handleSave = () => {
    configForm.validateFields().then(values => {
      onSave(values);
      setActiveTab('current');
      message.success('配置已保存，将在下次发布时生效');
    });
  };

  // 重置表单
  const handleReset = () => {
    configForm.resetFields();
    message.success('已重置为上次保存的配置');
  };

  // 计算配置差异
  const calculateDiff = (current, draft) => {
    if (!draft) return {};
    
    const diff = {};
    
    for (const key in draft) {
      if (typeof draft[key] === 'object' && draft[key] !== null) {
        const nestedDiff = calculateDiff(current?.[key] || {}, draft[key]);
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff;
        }
      } else if (draft[key] !== current?.[key]) {
        diff[key] = {
          from: current?.[key],
          to: draft[key]
        };
      }
    }
    
    return diff;
  };

  // 渲染配置差异提示
  const renderDiffAlert = () => {
    if (!currentData?.draftConfig) return null;
    
    const diff = calculateDiff(
      currentData.currentConfig || defaultValues,
      currentData.draftConfig
    );
    
    if (Object.keys(diff).length === 0) return null;
    
    // 转换差异对象为可读文本
    const diffList = [];
    
    for (const key in diff) {
      if (typeof diff[key] === 'object' && !diff[key].from && !diff[key].to) {
        // 处理嵌套对象
        for (const nestedKey in diff[key]) {
          diffList.push(`${key}.${nestedKey} 已修改`);
        }
      } else {
        // 处理直接字段
        diffList.push(`${key} 已修改`);
      }
    }
    
    return (
      <Alert
        type="warning"
        message="待发布的配置变更"
        description={
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {diffList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        }
        style={{ marginBottom: 16 }}
      />
    );
  };

  // 根据schema渲染表单项
  const renderFormItem = (key, config, path = '') => {
    const fullPath = path ? `${path}.${key}` : key;
    const label = config.title || key;
    const required = schema.required?.includes(key);
    
    // 根据类型渲染不同的表单控件
    let formItem;
    
    switch (config.type) {
      case 'string':
        if (config.enum) {
          // 枚举类型渲染为Select
          const options = Array.isArray(config.enumNames) 
            ? config.enum.map((value, index) => ({ 
                label: config.enumNames[index], 
                value 
              }))
            : config.enum.map(value => ({ label: value, value }));
            
          formItem = (
            <Select 
              placeholder={`请选择${label}`}
              options={options}
              allowClear={!required}
            />
          );
        } else if (config.format === 'color') {
          // 颜色类型
          formItem = (
            <Input 
              placeholder={config.default || '#000000'}
              addonAfter={
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: Form.useWatch(fullPath, configForm) || config.default || '#000000',
                    borderRadius: 2
                  }}
                />
              }
            />
          );
        } else {
          // 普通字符串
          formItem = <Input placeholder={config.default || `请输入${label}`} />;
        }
        break;
      
      case 'number':
        formItem = (
          <InputNumber 
            style={{ width: '100%' }}
            min={config.minimum}
            max={config.maximum}
            step={config.multipleOf || 1}
            placeholder={`请输入${label}`}
          />
        );
        break;
      
      case 'boolean':
        formItem = <Switch />;
        break;
      
      case 'object':
        // 对象类型渲染为嵌套表单项
        return (
          <div key={key} style={{ marginBottom: 16 }}>
            <Divider orientation="left">{label}</Divider>
            {config.properties && Object.entries(config.properties).map(([nestedKey, nestedConfig]) => 
              renderFormItem(nestedKey, nestedConfig, fullPath)
            )}
          </div>
        );
      
      default:
        formItem = <Input placeholder={`请输入${label}`} />;
    }
    
    return (
      <Form.Item
        key={fullPath}
        label={
          <Space>
            {label}
            {config.description && (
              <Tooltip title={config.description}>
                <QuestionCircleOutlined style={{ color: '#999' }} />
              </Tooltip>
            )}
          </Space>
        }
        name={path ? fullPath.split('.') : key}
        rules={[{ required: required, message: `请${config.type === 'string' ? '输入' : '选择'}${label}` }]}
        valuePropName={config.type === 'boolean' ? 'checked' : 'value'}
        extra={config.extra}
      >
        {formItem}
      </Form.Item>
    );
  };

  // 渲染当前配置详情
  const renderConfigDetails = () => {
    const currentConfig = currentData?.currentConfig || defaultValues;
    
    const renderConfigValue = (key, value, config) => {
      if (typeof value === 'object' && value !== null) {
        return Object.entries(value).map(([nestedKey, nestedValue]) => {
          const nestedConfig = config?.properties?.[nestedKey] || {};
          return renderConfigValue(`${key}.${nestedKey}`, nestedValue, nestedConfig);
        });
      }
      
      const fieldConfig = schema?.properties?.[key] || {};
      const label = fieldConfig.title || key;
      
      // 特殊类型的值展示
      let displayValue = value;
      
      if (fieldConfig.type === 'boolean') {
        displayValue = value ? '是' : '否';
      } else if (fieldConfig.enum && Array.isArray(fieldConfig.enumNames)) {
        const index = fieldConfig.enum.indexOf(value);
        if (index !== -1) {
          displayValue = fieldConfig.enumNames[index];
        }
      } else if (fieldConfig.format === 'color') {
        displayValue = (
          <Space>
            <div 
              style={{ 
                backgroundColor: value,
                width: 20, 
                height: 20, 
                borderRadius: 4,
                border: '1px solid #d9d9d9'
              }} 
            />
            {value}
          </Space>
        );
      }
      
      return (
        <Descriptions.Item key={key} label={label}>
          {displayValue}
        </Descriptions.Item>
      );
    };
    
    return (
      <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="当前版本">
          <Tag color="success">v{currentData?.version || '1.0.0'}</Tag>
        </Descriptions.Item>
        
        {schema?.properties && Object.entries(currentConfig).map(([key, value]) => {
          const config = schema.properties[key];
          if (config?.type === 'object' && typeof value === 'object' && value !== null) {
            // 对象类型单独处理
            return [
              <Descriptions.Item key={`${key}-title`} label={config.title || key} span={1}>
                <Collapse ghost>
                  <Panel header="展开详情" key="1">
                    <Descriptions bordered size="small" column={1}>
                      {Object.entries(value).map(([nestedKey, nestedValue]) => {
                        const nestedConfig = config.properties?.[nestedKey] || {};
                        return renderConfigValue(nestedKey, nestedValue, nestedConfig);
                      })}
                    </Descriptions>
                  </Panel>
                </Collapse>
              </Descriptions.Item>
            ];
          }
          return renderConfigValue(key, value, config);
        })}
      </Descriptions>
    );
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      footer={
        activeTab === 'draft' ? [
          <Button key="cancel" onClick={handleReset}>
            重置
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            保存草稿
          </Button>
        ] : [
          <Button key="edit" type="primary" onClick={() => setActiveTab('draft')}>
            编辑配置
          </Button>,
          <Button 
            key="publish" 
            type="primary" 
            disabled={!currentData?.draftConfig}
            onClick={onPublish}
          >
            发布应用
          </Button>
        ]
      }
      width={700}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'current',
            label: (
              <Space>
                <CheckCircleOutlined />
                当前配置
                <Tag color="success">已生效</Tag>
              </Space>
            ),
            children: (
              <>
                {currentData?.draftConfig && renderDiffAlert()}
                
                {renderConfigDetails()}
                
                <Alert
                  type="info"
                  message="查看当前生效的配置"
                  description="这里展示的是当前已发布版本的配置，如需修改请点击右下角的编辑配置按钮。"
                />
              </>
            )
          },
          {
            key: 'draft',
            label: (
              <Space>
                <EditOutlined />
                草稿配置
                <Tag color="warning">未生效</Tag>
              </Space>
            ),
            children: (
              <>
                <Alert
                  type="warning"
                  message="注意：此配置将在下次发布后生效"
                  description="您在此处修改的配置会保存为草稿，仅在下次发布版本时生效。"
                  style={{ marginBottom: 16 }}
                />
                
                <Form form={configForm} layout="vertical">
                  {schema?.properties && Object.entries(schema.properties).map(([key, config]) => 
                    renderFormItem(key, config)
                  )}
                </Form>
              </>
            )
          }
        ]}
      />
    </Modal>
  );
};

export default RenderConfigModal; 