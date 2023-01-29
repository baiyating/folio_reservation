import { Form, Input, Modal, Radio, Select, TreeSelect } from 'antd-stripes-jt';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

const { Option } = Select;

const ModalForm = ({
  onSubmit,
  onCancel,
  title,
  children,
  options,
  initialValues,
  onOpen,
  width,
  layout,
  onFormChange,
  show,
}) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState({});

  let cloneChildren;
  if (children) {
    cloneChildren = React.cloneElement(children, {
      onClick: () => {
        if (onOpen) onOpen();
        setVisible(!visible);
      },
    });
  }

  useEffect(() => {
    console.log(value);
    if (JSON.stringify(initialValues) !== JSON.stringify(value)) {
      console.log(initialValues);

      // setValue(initialValues);
    }
  });

  return (
    <div>
      {cloneChildren}
      <Modal
        visible={children ? visible : show}
        title={title}
        okText="Submit"
        cancelText="Cancel"
        width={width || 800}
        onCancel={() => {
          setVisible(!visible);
          if (onCancel) onCancel();
          form.resetFields();
        }}
        onOk={() => {
          form
            .validateFields()
            .then(values => {
              const newValues = {};
              Object.keys(values).forEach(k => {
                if (values[k] !== undefined && values[k] !== null) {
                  newValues[k] = values[k];
                }
              });
              if (Object.keys(newValues).length) {
                onSubmit({ ...initialValues, ...newValues });
                // 重置表单
                form.resetFields();
              }
            })
            .catch(info => {
              console.log('Validate Failed:', info);
            });
        }}
      >
        <Form
          form={form}
          {...(layout || { layout: 'vertical' })}
          // layout="vertical"
          name="form_in_modal"
          // initialValues={initialValues}
          onValuesChange={(changedValues, allValues) =>
            onFormChange(changedValues, allValues, form)
          }
        >
          {options.map(item => (
            <Form.Item
              key={item.id}
              label={item.name}
              name={item.id}
              rules={[
                { required: !!item.required, message: item.message || '' },
              ]}
            >
              {item.type === 'select' ? (
                <Select
                  showSearch={!!item.showSearch}
                  style={{ width: item.width }}
                  placeholder="Select a option"
                  allowClear
                >
                  {item.data.map(i => (
                    <Option key={i.id} value={i.id}>
                      {i.name}
                    </Option>
                  ))}
                </Select>
              ) : item.type === 'treeSelect' ? (
                <TreeSelect
                  showSearch={!!item.showSearch}
                  style={{ width: item.width }}
                  treeCheckable
                  treeData={item.data}
                />
              ) : item.type === 'radio' ? (
                <Radio.Group>
                  {item.data.map(i => (
                    <Radio key={i.id} value={i.id}>
                      {i.name}
                    </Radio>
                  ))}
                </Radio.Group>
              ) : (
                <Input />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
};
ModalForm.propTypes = {
  id: PropTypes.string.isRequired, // 表单id
  children: PropTypes.element, // 按钮
  show: PropTypes.bool, // 是否显示
  onSubmit: PropTypes.func.isRequired, // 提交表单
  onCancel: PropTypes.func, // 表单取消
  onOpen: PropTypes.func, // 表单打开事件
  onFormChange: PropTypes.func, // 事件
  title: PropTypes.string.isRequired, // 表单名称
  options: PropTypes.array.isRequired, // 表单配置
  initialValues: PropTypes.object, // 表单配置
  layout: PropTypes.object, // 表单布局
  width: PropTypes.number, // 表单配置
};
export default ModalForm;
