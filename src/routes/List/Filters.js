import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Layout,
  Row,
  Select,
  TreeSelect,
} from 'antd-stripes-jt';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import query2search, { search2query } from '../../utils/query2search';

const { RangePicker } = DatePicker;
const { Content } = Layout;
const { Option } = Select;
const layout = {
  labelCol: { flex: '120px', style: { marginRight: 10 } },
  wrapperCol: { flex: '1' },
  // wrapperCol: { flex: 'auto' },
};
const tailLayout = {
  wrapperCol: { offset: 0, span: 20 },
};

class Filters extends Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    onSubmit: PropTypes.func,
    submitText: PropTypes.string,
    resetText: PropTypes.string,
    all: PropTypes.string,
    onReset: PropTypes.func,
    initialValues: PropTypes.object,
  };

  formRef = React.createRef();
  state = {
    moreFilter: true,
  };

  // 重置url及form
  onReset = () => {
    const {
      history,
      location: { pathname, search },
      onReset,
    } = this.props;
    const query = search2query(search);
    delete query.filters;

    if (onReset) onReset();
    history.replace(
      query2search({
        pathname,
        search: {
          ...query,
        },
      })
    );
    setTimeout(() => this.formRef.current.resetFields(), 0);
  };

  // 提交成功函数 将object对象转化为string并写入url里
  onFinish = values => {
    const {
      history,
      location: { pathname, search },
      onSubmit,
    } = this.props;

    const newValues = {};
    Object.keys(values).forEach(k => {
      // console.log(values[k]);

      if (
        values[k] !== undefined &&
        values[k] !== null &&
        values[k].length !== 0
      ) {
        if (
          Array.isArray(values[k]) &&
          values[k].length === 2 &&
          moment.isMoment(values[k][0]) &&
          moment.isMoment(values[k][1])
        ) {
          newValues[k] =
            values[k][0].format('YYYY-MM-DD HH:mm:ss') +
            ' ~ ' +
            values[k][1].format('YYYY-MM-DD HH:mm:ss');
        } else {
          newValues[k] = values[k];
        }
      }
    });
    let valuesStr = '';
    Object.keys(newValues).forEach(k => {
      if (valuesStr) {
        valuesStr += ';';
      }
      valuesStr += k + '=' + newValues[k];
    });

    console.log('Success:', valuesStr, newValues);

    if (onSubmit) onSubmit(valuesStr, newValues);

    history.push(
      query2search({
        pathname,
        search: {
          ...search2query(search),
          filters: valuesStr,
        },
      })
    );
  };

  // 提交验证失败的函数
  onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  // 根据url参数初始化数据
  search2InitialValues = (initialValues = {}) => {
    const {
      location: { search },
    } = this.props;
    const searchValue = {};

    const { filters } = search2query(search);

    if (filters) {
      filters.split(';').forEach(item => {
        const [k, v] = item.split('=');

        if (v.includes(',')) {
          searchValue[k] = v.split(',');
        } else if (v.includes(' ~ ')) {
          console.log(
            v.split(' ~ ').map(i => moment(i, 'YYYY-MM-DD HH:mm:ss'))
          );

          searchValue[k] = v
            .split(' ~ ')
            .map(i => moment(i, 'YYYY-MM-DD HH:mm:ss'));
        } else {
          searchValue[k] = [v];
        }
      });
    }

    // console.log(filters, searchValue, initialValues);
    return { ...initialValues, ...searchValue };
  };

  formItem = item => (
    <Col span={item.width || 24} key={item.id}>
      <Form.Item
        key={item.id}
        label={item.name}
        name={item.id}
        rules={[{ required: !!item.required, message: item.message || '' }]}
      >
        {item.type === 'select' ? (
          <Select
            {...(item.multiple ? { mode: 'multiple' } : {})}
            showSearch={!!item.showSearch}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            placeholder={this.props.all || '全部'}
            style={{ width: 400 }}
            allowClear
          >
            {item.data.map(i => (
              <Option key={i.id} title={i.name} value={i.id}>
                {i.name}
              </Option>
            ))}
          </Select>
        ) : item.type === 'treeSelect' ? (
          <TreeSelect
            style={{ width: 400 }}
            showSearch={!!item.showSearch}
            placeholder={this.props.all || '全部馆藏地'}
            treeCheckable
            treeData={item.data}
          />
        ) : item.type === 'checkbox' ? (
          <Checkbox.Group
            options={item.data.map(i => ({
              label: i.name,
              value: i.id,
            }))}
          />
        ) : item.type === 'dateRange' ? (
          <RangePicker
            // disabledDate={disabledDate}
            // disabledTime={disabledRangeTime}
            showTime={{
              hideDisabledOptions: false,
              defaultValue: [
                moment('00:00:00', 'HH:mm:ss'),
                moment('11:59:59', 'HH:mm:ss'),
              ],
            }}
            format="YYYY-MM-DD HH:mm:ss"
          />
        ) : item.type === 'input' ? (
          <Input placeholder="搜索" />
        ) : (
          <Input />
        )}
      </Form.Item>
    </Col>
  );

  render() {
    const { options, initialValues, resetText, submitText } = this.props;
    const { moreFilter } = this.state;

    return (
      <Content
        style={{ padding: '24px', background: '#fff', marginBottom: '24px' }}
      >
        <Form
          {...layout}
          ref={this.formRef}
          name="filters"
          initialValues={this.search2InitialValues(initialValues)}
          onFinish={this.onFinish}
          onFinishFailed={this.onFinishFailed}
        >
          <Row>
            {options.slice(0, 2).map(item => this.formItem(item))}
            {moreFilter && options.slice(2).map(item => this.formItem(item))}
          </Row>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              {submitText || '查询'}
            </Button>
            <Button
              style={{ marginLeft: '8px' }}
              htmlType="button"
              onClick={this.onReset}
            >
              {resetText || '重置'}
            </Button>
            {/* <Button
              type="link"
              onClick={() => this.setState({ moreFilter: !moreFilter })}
              icon={<DoubleRightOutlined rotate={moreFilter ? 270 : 90} />}
            >
              {moreFilter ? "折叠筛选" : "更多筛选"}
            </Button> */}
          </Form.Item>
        </Form>
      </Content>
    );
  }
}
export default withRouter(Filters);
