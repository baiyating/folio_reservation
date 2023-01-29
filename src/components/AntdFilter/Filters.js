import { DoubleRightOutlined } from '@ant-design/icons';
import { stripesConnect, withStripes } from '@folio/stripes/core';
import {
  Button,
  Checkbox,
  Col,
  ConfigProvider,
  DatePicker,
  Divider,
  Form,
  Input,
  Layout,
  Row,
  Select,
  TreeSelect,
} from 'antd-stripes-jt';
import enUS from 'antd-stripes-jt/es/locale/en_US';
import zhCN from 'antd-stripes-jt/es/locale/zh_CN';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { withRouter } from 'react-router';
import query2search, { search2query } from './query2search';

const { RangePicker } = DatePicker;
const { Content } = Layout;
const { Option } = Select;
const layout = {
  labelCol: { flex: '120px', style: { marginRight: 10 } },
  wrapperCol: { flex: 'none', style: { width: 'calc(100% - 130px)' } },
  // wrapperCol: { flex: 'auto' },
};
const tailLayout = {
  wrapperCol: { offset: 0, span: 24 },
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
    intl: PropTypes.object,
  };

  state = {
    moreFilter: true,
  };

  formRef = React.createRef();

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
        } else if (typeof values[k] === 'string') {
          newValues[k] = [values[k]];
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

    console.log(filters, searchValue, initialValues);
    return { ...initialValues, ...searchValue };
  };

  formItem = item => {
    const {
      intl: { formatMessage },
    } = this.props;
    // span={item.width || 12}
    return (
      <Col xs={24} xl={12} key={item.id}>
        <Form.Item
          key={item.id}
          label={item.name}
          name={item.id}
          style={{ width: '100%' }}
          rules={[{ required: !!item.required, message: item.message || '' }]}
        >
          {item.type === 'select' ? (
            <Select
              {...(item.multiple ? { mode: 'multiple' } : {})}
              showSearch={!!item.showSearch}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder={formatMessage({
                id: 'stripes-smart-components-jt.all',
              })}
              style={{ width: '100%' }}
              onChange={e =>
                item.onChange ? item.onChange(this.formRef.current, e) : null
              }
              allowClear
              getPopupContainer={() => document.getElementById('filtersForm')}
            >
              {item.data.map(i => (
                <Option key={i.id} title={i.name} value={i.id}>
                  {i.name}
                </Option>
              ))}
            </Select>
          ) : item.type === 'treeSelect' ? (
            <TreeSelect
              style={{ width: '100%' }}
              showSearch={!!item.showSearch}
              placeholder={formatMessage({
                id: 'stripes-smart-components-jt.all',
              })}
              treeNodeFilterProp="name"
              treeCheckable
              getPopupContainer={() => document.getElementById('filtersForm')}
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
              showTime={
                !item.hideTime
                  ? {
                      hideDisabledOptions: false,
                      defaultValue: [
                        moment('00:00:00', 'HH:mm:ss'),
                        moment('11:59:59', 'HH:mm:ss'),
                      ],
                    }
                  : false
              }
              style={{ width: '100%' }}
              format={!item.hideTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
              getPopupContainer={() => document.getElementById('filtersForm')}
            />
          ) : item.type === 'input' ? (
            <Input
              style={{ width: '100%' }}
              placeholder={
                item.placeholder ||
                formatMessage({
                  id: 'stripes-smart-components-jt.search',
                })
              }
            />
          ) : item.type === 'search' ? (
            <Input
              style={{ width: '100%' }}
              placeholder={
                item.placeholder ||
                formatMessage({
                  id: 'stripes-smart-components-jt.search',
                })
              }
            />
          ) : (
            <Input style={{ width: '100%' }} />
          )}
        </Form.Item>
      </Col>
    );
  };

  render() {
    const {
      options,
      initialValues,
      resetText,
      submitText,
      intl: { formatMessage, locale },
    } = this.props;
    const { moreFilter } = this.state;
    console.log(initialValues);

    let local = 'en';
    if (locale.includes('zh')) {
      local = zhCN;
    } else if (locale.includes('en')) {
      local = enUS;
    }

    return (
      <ConfigProvider locale={local}>
        <Content
          key={
            local
              ? local.locale
              : 'en' /* Have to refresh for production environment */
          }
          style={{
            // padding: '24px',
            background: '#fff',
          }}
        >
          <Form
            {...layout}
            ref={this.formRef}
            id="filtersForm"
            name="filters"
            initialValues={this.search2InitialValues(initialValues)}
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
          >
            <Row>
              {options.slice(0, 2).map(item => this.formItem(item))}
              {moreFilter && options.slice(2).map(item => this.formItem(item))}
            </Row>
          </Form>
          <Divider>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {options.length > 2 && (
                <Button
                  size="small"
                  type="link"
                  onClick={() => this.setState({ moreFilter: !moreFilter })}
                  icon={<DoubleRightOutlined rotate={moreFilter ? 270 : 90} />}
                >
                  {moreFilter
                    ? formatMessage({
                        id: 'stripes-smart-components-jt.hideFilter',
                      })
                    : formatMessage({
                        id: 'stripes-smart-components-jt.moreFilter',
                      })}
                </Button>
              )}
              {moreFilter && (
                <Form.Item
                  {...tailLayout}
                  style={{
                    textAlign: 'center',
                    display: 'inline-block',
                    margin: '0 0 0 17px',
                  }}
                >
                  <Button
                    type="primary"
                    onClick={() => this.formRef.current.submit()}
                    htmlType="submit"
                    size="middle"
                  >
                    {submitText ||
                      formatMessage({
                        id: 'stripes-smart-components-jt.filterSearch',
                      })}
                  </Button>
                  <Button
                    style={{ marginLeft: '24px' }}
                    htmlType="button"
                    onClick={this.onReset}
                    size="middle"
                  >
                    {resetText ||
                      formatMessage({
                        id: 'stripes-smart-components-jt.reset',
                      })}
                  </Button>
                </Form.Item>
              )}
            </div>
          </Divider>
        </Content>
      </ConfigProvider>
    );
  }
}

const routerCom = withRouter(Filters)
const connectCom = stripesConnect(routerCom)
const stripesCom = withStripes(connectCom)
const injectCom = injectIntl(stripesCom)

export default injectCom;
