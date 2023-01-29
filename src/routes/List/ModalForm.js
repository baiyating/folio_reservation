import {
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Spin,
  TreeSelect,
} from 'antd-stripes-jt';
import PropTypes from 'prop-types';
import React from 'react';

const { Option } = Select;
class ModalForm extends React.Component {
  state = {
    initialValues: {},
  };

  formRef = React.createRef();

  static getDerivedStateFromProps(nextProps, prevState) {
    // props有initialValues时
    // props的initialValues与state数据不同时
    // 并且表单不是关闭状态下更新state数据
    if (
      nextProps.initialValues &&
      JSON.stringify(nextProps.initialValues) !==
        JSON.stringify(prevState.initialValues) &&
      nextProps.show
    ) {
      console.log('getDerivedStateFromProps', nextProps, prevState);

      return {
        initialValues: nextProps.initialValues,
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    // 异步更新initialValues
    if (
      JSON.stringify(prevState.initialValues) !==
      JSON.stringify(this.state.initialValues)
    ) {
      console.log('update');
      this.formRef.current.setFieldsValue(this.state.initialValues);
    }
    // 关闭表单清空
    if (!this.props.show && prevProps.show) {
      console.log('close');
      this.resetForm();
    }
  }

  resetForm = () => {
    this.setState(
      {
        initialValues: {},
      },
      () => this.formRef.current.resetFields()
    );
  };

  render() {
    const {
      onSubmit,
      onCancel,
      title,
      children,
      options,
      onOpen,
      width,
      layout,
      onFormChange,
      show,
      id,
      loading,
      submitLoading,
      cancelText,
      submitText,
    } = this.props;
    const { initialValues } = this.state;

    let cloneChildren;
    if (children) {
      cloneChildren = React.cloneElement(children, {
        // onClick: () => {
        //   if (onOpen) onOpen();
        // },
      });
    }

    return (
      <div style={{ display: 'inline-block' }}>
        {cloneChildren}
        <Modal
          getContainer={false}
          visible={show}
          title={title}
          okText={submitText || '确定'}
          cancelText={cancelText || '取消'}
          width={width || 800}
          confirmLoading={submitLoading}
          onCancel={() => {
            if (onCancel) onCancel();
            this.resetForm();
          }}
          onOk={() => {
            this.formRef.current
              .validateFields()
              .then(values => {
                const newValues = {};
                Object.keys(values).forEach(k => {
                  if (values[k] !== undefined && values[k] !== null) {
                    newValues[k] = values[k];
                  }
                });
                if (Object.keys(newValues).length) {
                  console.log(initialValues, newValues);
                  onSubmit(newValues);
                  // 重置表单
                  // this.resetForm();
                }
              })
              .catch(info => {
                console.log('Validate Failed:', info);
              });
          }}
        >
          <Spin spinning={!!loading}>
            <Form
              ref={this.formRef}
              {...(layout || { layout: 'vertical' })}
              // layout="vertical"
              name={id}
              initialValues={initialValues}
              onValuesChange={(changedValues, allValues) =>
                onFormChange(changedValues, allValues, this.formRef.current)
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
                      placeholder={item.placeholder || 'Select a option'}
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
                      treeCheckable
                      showSearch={!!item.showSearch}
                      style={{ width: item.width }}
                      placeholder={item.placeholder || '未选择'}
                      treeData={item.data}
                      treeNodeFilterProp="name"
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
          </Spin>
        </Modal>
      </div>
    );
  }
}
ModalForm.propTypes = {
  id: PropTypes.string.isRequired, // 表单id
  children: PropTypes.element, // 按钮
  show: PropTypes.bool, // 是否显示
  loading: PropTypes.bool, // 异步获取数据loading
  submitLoading: PropTypes.bool, // 提交数据loading
  onSubmit: PropTypes.func.isRequired, // 提交表单
  onCancel: PropTypes.func, // 表单取消
  onOpen: PropTypes.func, // 表单打开事件
  onFormChange: PropTypes.func, // 事件
  title: PropTypes.string.isRequired, // 表单名称
  submitText: PropTypes.string, // 表单确定按钮名称
  cancelText: PropTypes.string, // 表单取消按钮名称
  options: PropTypes.array.isRequired, // 表单配置
  initialValues: PropTypes.object, // 表单配置
  layout: PropTypes.object, // 表单布局
  width: PropTypes.number, // 表单配置
};
export default ModalForm;
