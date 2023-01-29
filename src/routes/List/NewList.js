import React, { useState, useEffect } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { stripesConnect } from '@folio/stripes/core';
import {
  Button,
  Layout,
  message,
  Modal,
  Popover,
  Space,
  Table,
  Tag,
} from 'antd-stripes-jt';
import { cloneDeep, get } from 'lodash';
import PropTypes from 'prop-types';
import Filters from '../../components/AntdFilter/Filters';
import ModalForm from './ModalForm';

const { Content } = Layout;
const { confirm } = Modal;

function List({ mutator, resources, intl: { formatMessage } }) {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isPolicy, setIsPolicy] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addShow, setAddShow] = useState(false);

  useEffect(() => {
    message.config({
      top: 100,
    });
  }, []);

  const onPageChange = (page, pageSize) => {
    mutator.paginations.update({
      page,
      pageSize,
    });
  }

  const list = () => {
    const rulesReadList = get(resources.list, 'records[0]', [])['rules-reading'] || []
    const list = rulesReadList.map(i => ({
      ...i,
      key: i.id,
    }))

    const totalRecords = get(resources.list, 'records[0].totalRecords', []);
    const paginations = get(resources, 'paginations', {});
    const loanType = get(resources, 'loanType.records', []);
    const patronGroup = get(resources, 'patronGroup.records', []);
    const loanPolicy = get(resources, 'loanPolicy.records', []);
    const overduePolicy = get(resources, 'overduePolicy.records', []);
    const lostItemPolicy = get(resources, 'lostItemPolicy.records', []);
    const locations = cloneDeep(get(resources, 'locations.records', []));

    const columns = [
      {
        dataIndex: 'loanType',
        key: 'loanType',
        title: formatMessage({ id: 'ui-shl-reading-rules.loanTypes' }),
        render: (text, record) => (
          <div>
            {get(
              loanType.filter(i => i.id === text),
              '[0].name',
              ''
            )}
          </div>
        ),
      },
      {
        dataIndex: 'patronGroup',
        key: 'patronGroup',
        title: formatMessage({ id: 'ui-shl-reading-rules.patronGroups' }),
        render: (text, record) => (
          <div>
            {get(
              patronGroup.filter(i => i.id === text),
              '[0].group',
              ''
            )}
          </div>
        ),
      },
      {
        dataIndex: 'location',
        key: 'location',
        title: formatMessage({ id: 'ui-shl-reading-rules.locations' }),
        render: (text, record) => {
          const locationList = text
            ? text.split(' ').map(item =>
              get(
                locations.filter(i => i.id === item),
                '[0].name',
                ''
              )
            )
            : [];

          return (
            <div id="rulePopover">
              {locationList.slice(0, 2).map((i, index) => (
                <Tag key={i} color="blue">
                  {i}
                </Tag>
              ))}
              {locationList.slice(2).length ? (
                <Popover
                  placement="topRight"
                  title={formatMessage({ id: 'ui-shl-reading-rules.locations' })}
                  content={
                    <div style={{ maxWidth: '500px' }}>
                      {locationList.slice(2).map((i, index) => (
                        <Tag
                          style={{ marginBottom: '5px' }}
                          key={i}
                          color="blue"
                        >
                          {i}
                        </Tag>
                      ))}
                    </div>
                  }
                >
                  <Button
                    type="circle"
                    size="small"
                    shape="circle"
                    icon={<EllipsisOutlined />}
                  />
                </Popover>
              ) : null}
            </div>
          );
        },
      },
      {
        dataIndex: 'loanPolicy',
        key: 'loanPolicy',
        title: formatMessage({ id: 'ui-shl-reading-rules.loanPolicies' }),
        render: (text, record) => (
          <div>
            {get(
              loanPolicy.filter(i => i.id === text),
              '[0].name',
              ''
            )}
          </div>
        ),
      },
      {
        dataIndex: 'overduePolicy',
        key: 'overduePolicy',
        title: formatMessage({ id: 'ui-shl-reading-rules.overdueFinePolicies' }),
        render: (text, record) => (
          <div>
            {get(
              overduePolicy.filter(i => i.id === text),
              '[0].name',
              ''
            )}
          </div>
        ),
      },
      {
        dataIndex: 'lostItemPolicy',
        key: 'lostItemPolicy',
        title: formatMessage({ id: 'ui-shl-reading-rules.lostItemFeePolicy' }),
        render: (text, record) => (
          <div>
            {get(
              lostItemPolicy.filter(i => i.id === text),
              '[0].name',
              ''
            )}
          </div>
        ),
      },
      {
        dataIndex: 'action',
        key: 'action',
        title: formatMessage({ id: 'ui-shl-reading-rules.action' }),
        width: 155,
        render: (text, record) => {
          return (
            <div>
              <Button
                onClick={() => {
                  setEditShow(true)
                  detail(record.id);
                }}
                type="link"
                size="small"
              >
                <FormattedMessage id="ui-shl-reading-rules.edit" />
              </Button>

              {!record.default && !record.overRide && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    confirm({
                      title: formatMessage({ id: 'ui-shl-reading-rules.deleteConfirm' }),
                      content: formatMessage({ id: 'ui-shl-reading-rules.deleteMessage' }),
                      okText: formatMessage({ id: 'ui-shl-reading-rules.ok' }),
                      okType: 'danger',
                      cancelText: formatMessage({ id: 'ui-shl-reading-rules.cancel' }),
                      onOk: () => handleDelete(record.id),
                      onCancel() { },
                    });
                  }}
                >
                  <FormattedMessage id="ui-shl-reading-rules.delete" />
                </Button>
              )}

              {record.default && (
                <Tag color="orange">
                  <FormattedMessage id="ui-shl-reading-rules.default" />
                </Tag>
              )}
              {record.overRide && (
                <Tag color="orange">
                  <FormattedMessage id="ui-shl-reading-rules.overRide" />
                </Tag>
              )}
            </div>
          );
        },
      },
    ];

    return (
      <div>
        <div style={{ padding: '10px 0' }}></div>
        <Table
          scroll={{ x: 1220 }}
          loading={
            resources && resources.list ? resources.list.isPending : false
          }
          rowKey={'id'}
          columns={columns}
          dataSource={list}
          pagination={{
            current: paginations ? paginations.page : 1,
            pageSize: paginations ? paginations.pageSize : 10,
            showQuickJumper: true,
            total: totalRecords,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
        />
      </div>
    );
  };

  const getData = () => {
    const locations = cloneDeep(
      get(resources, 'locations.records', []).map(i => ({
        ...i,
        name: `${i.code}(${i.name})`,
      }))
    );
    const institutions = cloneDeep(
      get(resources, 'institutions.records', []).map(i => ({
        ...i,
        name: `${i.code}(${i.name})`,
      }))
    );
    const campuses = cloneDeep(
      get(resources, 'campuses.records', []).map(i => ({
        ...i,
        name: `${i.code}(${i.name})`,
      }))
    );
    const libraries = cloneDeep(
      get(resources, 'libraries.records', []).map(i => ({
        ...i,
        name: `${i.code}(${i.name})`,
      }))
    );

    const librariesFilter = libraries.filter(lib => {
      locations.map(loc => {
        loc.title = loc.name;
        loc.value = loc.id;
        loc.key = loc.id;
        if (lib.id === loc.libraryId) {
          loc.parentId = loc.libraryId;
          if (lib.children && lib.children.length > 0) {
            lib.children.push(loc);
          } else {
            lib.children = [loc];
          }
        }
        return false;
      });
      return lib.children;
    });

    const campusesFilter = campuses.filter(camp => {
      librariesFilter.map(lib => {
        lib.title = lib.name;
        lib.value = lib.id;
        lib.key = lib.id;
        if (lib.campusId === camp.id) {
          lib.parentId = lib.campusId;
          if (camp.children) {
            camp.children.push(lib);
          } else {
            camp.children = [lib];
          }
        }
        return false;
      });
      return camp.children;
    });

    const institutionsFilter = institutions.filter(ins => {
      ins.title = ins.name;
      ins.value = ins.id;
      ins.key = ins.id;
      campusesFilter.map(camp => {
        camp.title = camp.name;
        camp.value = camp.id;
        camp.key = camp.id;
        if (camp.institutionId === ins.id) {
          camp.parentId = camp.institutionId;
          if (ins.children) {
            ins.children.push(camp);
          } else {
            ins.children = [camp];
          }
        }
        return false;
      });
      return ins.children;
    });

    return institutionsFilter;
  };

  const add = async data => {
    setAddLoading(true)
    const loanType = get(resources, 'loanType.records', []);

    const loanTypeName = get(
      loanType.filter(i => i.id === data.loanType),
      '[0].name',
      ''
    );
    if (loanTypeName && loanTypeName === 'authority') {
      data.overRide = true;
    } else {
      delete data.overRide;
    }
    await mutator.list
      .POST(data)
      .then(res => {
        message.success(
          `${formatMessage({
            id: 'ui-shl-reading-rules.add',
          })} ${formatMessage({
            id: 'ui-shl-reading-rules.success',
          })}`
        );
        setAddShow(false);
        setIsPolicy(false);
      })
      .catch(resp => {
        resp.text().then(errors => {
          if (errors === 'The same circulation policy rules exist') {
            message.error(
              formatMessage({ id: 'ui-shl-reading-rules.tong' })
            );
          } else {
            message.error(
              `${formatMessage({
                id: 'ui-shl-reading-rules.add',
              })} ${formatMessage({
                id: 'ui-shl-reading-rules.fail',
              })}`
            );
          }
        });
      });
      setAddLoading(false)
  };

  const detail = async id => {
    mutator.activeId.replace(id);
    mutator.item.reset();
    await mutator.item
      .GET()
      .then(res => {
        if (
          res.loanPolicy ||
          res.requestPolicy ||
          res.noticePolicy ||
          res.overduePolicy ||
          res.lostItemPolicy
        ) {
          setIsPolicy(true)
        } else {
          setIsPolicy(false)
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const edit = async data => {
    setEditLoading(true)
    const loanType = get(resources, 'loanType.records', []);
    const loanTypeName = get(
      loanType.filter(i => i.id === data.loanType),
      '[0].name',
      ''
    );
    if (loanTypeName && loanTypeName === 'authority') {
      data.overRide = true;
    } else {
      delete data.overRide;
    }
    mutator.activeId.replace(data.id);
    await mutator.item
      .PUT(data)
      .then(res => {
        message.success(
          `${formatMessage({
            id: 'ui-shl-reading-rules.edit',
          })} ${formatMessage({
            id: 'ui-shl-reading-rules.success',
          })}`
        );
        setEditShow(false);
      })
      .catch(resp => {
        resp.text().then(errors => {
          console.log(errors);
          if (errors === 'The same circulation policy rules exist') {
            message.error(
              formatMessage({
                id: 'ui-shl-reading-rules.tong',
              })
            );
          } else {
            message.error(
              `${formatMessage({
                id: 'ui-shl-reading-rules.edit',
              })} ${formatMessage({
                id: 'ui-shl-reading-rules.fail',
              })}`
            );
          }
        });
      });
      setEditLoading(false)
  };

  const handleDelete = async id => {
    mutator.activeId.replace(id);
    return mutator.item
      .DELETE({})
      .then(res => {
        message.success(
          `${formatMessage({
            id: 'ui-shl-reading-rules.delete',
          })} ${formatMessage({
            id: 'ui-shl-reading-rules.success',
          })}`
        );
        setSelectedRowKeys(selectedRowKeys.filter(i => i !== id))
        onPageChange(1, 10);
      })
      .catch(error => {
        message.error(
          `${formatMessage({
            id: 'ui-shl-reading-rules.delete',
          })} ${formatMessage({
            id: 'ui-shl-reading-rules.fail',
          })}`
        );
      });
  };

  const onInitialValue = value => {
    const location = {};
    if (value.location) {
      location.location = value.location.split(' ');
    } else {
      delete value.location;
    }
    return {
      ...value,
      ...location,
    };
  }

  const loanType = get(resources, 'loanType.records', []);
  const patronGroup = get(resources, 'patronGroup.records', []);
  const loanPolicy = get(resources, 'loanPolicy.records', []);
  const overduePolicy = get(resources, 'overduePolicy.records', []);
  const lostItemPolicy = get(resources, 'lostItemPolicy.records', []);
  const item = get(resources, 'item.records[0]', {});
  const locations = cloneDeep(get(resources, 'locations.records', []));

  const options = [
    {
      id: 'loanType',
      name: formatMessage({ id: 'ui-shl-reading-rules.loanTypes' }),
      data: loanType,
      type: 'select',
      placeholder: formatMessage({ id: 'ui-shl-reading-rules.noData' }),
    },
    {
      id: 'patronGroup',
      name: formatMessage({ id: 'ui-shl-reading-rules.patronGroups' }),
      data: patronGroup.map(i => ({ ...i, name: i.group })),
      type: 'select',
      placeholder: formatMessage({ id: 'ui-shl-reading-rules.noData' }),
    },
    {
      id: 'location',
      name: formatMessage({ id: 'ui-shl-reading-rules.locations' }),
      data: getData(),
      type: 'treeSelect',
      showSearch: true,
      placeholder: formatMessage({ id: 'ui-shl-reading-rules.noData' }),
    },
    {
      id: 'loanPolicy',
      name: formatMessage({ id: 'ui-shl-reading-rules.loanPolicies' }),
      data: loanPolicy,
      type: 'select',
      required: isPolicy,
      message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
      placeholder: formatMessage({ id: 'ui-shl-reading-rules.noData' }),
    },
    {
      id: 'overduePolicy',
      name: formatMessage({ id: 'ui-shl-reading-rules.overdueFinePolicies' }),
      data: overduePolicy,
      type: 'select',
      required: isPolicy,
      message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
      placeholder: formatMessage({ id: 'ui-shl-reading-rules.noData' }),
    },
    {
      id: 'lostItemPolicy',
      name: formatMessage({ id: 'ui-shl-reading-rules.lostItemFeePolicy' }),
      data: lostItemPolicy,
      type: 'select',
      required: isPolicy,
      message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
      placeholder: formatMessage({ id: 'ui-shl-reading-rules.noData' }),
    },
  ];

  const filterOptions = [
    {
      id: 'loanType',
      name: formatMessage({ id: 'ui-shl-reading-rules.loanTypes' }),
      data: loanType,
      type: 'select',
      showSearch: false,
      width: 12,
    },
    {
      id: 'patronGroup',
      name: formatMessage({ id: 'ui-shl-reading-rules.patronGroups' }),
      data: patronGroup.map(i => ({ ...i, name: i.group })),
      type: 'select',
      showSearch: false,
      width: 12,
    },
    {
      id: 'location',
      name: formatMessage({ id: 'ui-shl-reading-rules.locations' }),
      data: locations.map(i => ({
        ...i,
        name: `${i.code}(${i.name})`,
      })),
      type: 'select',
      showSearch: true,
      width: 12,
    },
  ];
  
  return (
    <Layout>
      <Layout style={{ padding: '24px' }}>
        <Content
          style={{
            padding: 24,
            background: '#fff',
          }}
        >
          <Filters
            submitText={formatMessage({ id: 'ui-shl-reading-rules.filterSearch' })}
            all={formatMessage({ id: 'ui-shl-reading-rules.all' })}
            resetText={formatMessage({ id: 'ui-shl-reading-rules.reset' })}
            options={filterOptions}
          />

          <Space>
            <ModalForm
              id="Add"
              title={<FormattedMessage id="ui-shl-reading-rules.add" />}
              show={addShow}
              layout={{
                labelCol: { span: 6 },
                wrapperCol: { span: 12 },
              }}
              submitLoading={addLoading}
              onSubmit={v => {
                let value = v;
                if (v.location) {
                  value = { ...v, location: v.location.join(' ') };
                }
                add(value);
              }}
              onCancel={() =>{
                setAddShow(false)
                setIsPolicy(false)
              }}
              onOpen={() => {}}
              onFormChange={(changedValues, allValues, form) => {
                if (
                  allValues.loanPolicy ||
                  allValues.requestPolicy ||
                  allValues.noticePolicy ||
                  allValues.overduePolicy ||
                  allValues.lostItemPolicy
                ) {
                  setIsPolicy(true);
                } else {
                  setIsPolicy(false, () => {
                    form.validateFields();
                  });
                }
              }}
              cancelText={<FormattedMessage id="ui-shl-reading-rules.cancel" />}
              submitText={<FormattedMessage id="ui-shl-reading-rules.submit" />}
              options={options}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setAddShow(true)
                  setIsPolicy(false)
                }}
              >
                <FormattedMessage id="ui-shl-reading-rules.add" />
              </Button>
            </ModalForm>
          </Space>
          {list()}
        </Content>

        <ModalForm
          id="Edit"
          title={formatMessage({ id: 'ui-shl-reading-rules.edit' })}
          layout={{
            labelCol: { span: 6 },
            wrapperCol: { span: 12 },
          }}
          loading={
            resources && resources.item ? resources.item.isPending : false
          }
          submitText={formatMessage({ id: 'ui-shl-reading-rules.submit' })}
          cancelText={formatMessage({ id: 'ui-shl-reading-rules.cancel' })}
          submitLoading={editLoading}
          show={editShow}
          onSubmit={v => {
            let value = v;
            if (v.location) {
              value = { ...v, location: v.location.join(' ') };
            }
            if (item.default) {
              value.default = true;
            }

            edit({ id: item.id, ...value });
          }}
          onCancel={() => setEditShow(false)}
          initialValues={onInitialValue(item)}
          onOpen={() => {}}
          onFormChange={(changedValues, allValues, form) => {
            if (
              allValues.loanPolicy ||
              allValues.requestPolicy ||
              allValues.noticePolicy ||
              allValues.overduePolicy ||
              allValues.lostItemPolicy
            ) {
              setIsPolicy(true);
            } else {
              setIsPolicy(false, () => {
                form.validateFields();
              });
            }
          }}
          options={options}
        />
      </Layout>
    </Layout>
  );
}

List.manifest = Object.freeze({
  query: { initialValue: {} },
  activeRecord: {},
  activeId: {},
  ruleIds: {},
  paginations: {
    // 分页默认值
    initialValue: {
      pageSize: 10,
      page: 1,
    },
  },
  id: {},
  institutions: {
    type: 'okapi',
    records: 'locinsts',
    accumulate: 'true',
    path: 'location-units/institutions',
    params: {
      query: 'cql.allRecords=1 sortby name',
      limit: '8000',
    },
    throwErrors: false,
  },
  campuses: {
    type: 'okapi',
    records: 'loccamps',
    accumulate: 'true',
    path: 'location-units/campuses',
    params: {
      query: 'cql.allRecords=1 sortby name',
      limit: '8000',
    },
    throwErrors: false,
  },
  libraries: {
    type: 'okapi',
    records: 'loclibs',
    accumulate: 'true',
    path: 'location-units/libraries',
    params: {
      query: 'cql.allRecords=1 sortby name',
      limit: '8000',
    },
    throwErrors: false,
  },
  locations: {
    type: 'okapi',
    records: 'locations',
    accumulate: 'true',
    path: 'locations',
    params: {
      query: 'cql.allRecords=1 sortby name',
      limit: '8000',
    },
    throwErrors: false,
  },

  // 资料类型
  itemType: {
    type: 'okapi',
    records: 'mtypes',
    accumulate: 'true',
    path: 'material-types',
    params: {
      query: 'cql.allRecords=1 sortby name',
      limit: '8000',
    },
    throwErrors: false,
  },

  // 馆藏类型
  loanType: {
    type: 'okapi',
    records: 'loantypes',
    accumulate: 'true',
    path: 'loan-types',
    params: {
      query: 'cql.allRecords=1 sortby name',
      limit: '8000',
    },
    throwErrors: false,
  },

  // 用户组
  patronGroup: {
    type: 'okapi',
    records: 'usergroups',
    accumulate: 'true',
    path: 'groups',
    params: {
      limit: '8000',
    },
    throwErrors: false,
  },

  // 借阅规则
  loanPolicy: {
    type: 'okapi',
    records: 'loanPolicies',
    accumulate: 'true',
    path: 'loan-policy-storage/loan-policies',
    params: {
      limit: '8000',
    },
    throwErrors: false,
  },

  // 请求规则
  requestPolicy: {
    type: 'okapi',
    records: 'requestPolicies',
    accumulate: 'true',
    path: 'request-policy-storage/request-policies',
    params: {
      limit: '8000',
    },
    throwErrors: false,
  },
  // 通知规则
  noticePolicy: {
    type: 'okapi',
    records: 'patronNoticePolicies',
    accumulate: 'true',
    path: 'patron-notice-policy-storage/patron-notice-policies',
    params: {
      limit: '8000',
    },
    throwErrors: false,
  },
  // 逾期罚款规则
  overduePolicy: {
    type: 'okapi',
    records: 'overdueFinePolicies',
    accumulate: 'true',
    path: 'overdue-fines-policies',
    params: {
      limit: '8000',
    },
    throwErrors: false,
  },
  // 遗失书刊规则
  lostItemPolicy: {
    type: 'okapi',
    records: 'lostItemFeePolicies',
    accumulate: 'true',
    path: 'lost-item-fees-policies',
    params: {
      limit: '8000',
      query: 'cql.allRecords=1',
    },
    throwErrors: false,
  },
  list: {
    // list 作为接口返回值集合(resources)的key 这个字段名可以随意替换
    type: 'okapi', // 类型
    // records: 'setEntities',//返回对象其中的某个字段放到props里面
    accumulate: 'true', // 默认没有GET请求 必须设置为true
    path: 'circulation-rule-reading', // 接口地址
    throwErrors: false, // 是否弹出报错信息
    // fetch: false, // 是否刚进入页面就获取数据
    GET: {
      // get请求配置
      params: {
        // 请求参数
        query: (queryParams, pathComponents, resourceData) => {
          // query参数配置函数 接受三个参数 返回一个字符串 根据不同的SQL语句自行修改
          if (queryParams.filters) {
            const query = queryParams.filters
              .replace(/;/g, ' and ')
              .replace(/:/g, '=');
            // console.log(query);
            return `${query}`;
          }
          // return 'ruleType==Read 、sortby metadata.updatedDate/sort.descending';
          return undefined;
        },
        limit: (queryParams, pathComponents, resourceData) => {
          // 分页参数 无特殊情况不用修改
          if (resourceData.paginations) {
            return resourceData.paginations.pageSize;
          }
          return 20;
        },
        offset: (queryParams, pathComponents, resourceData) => {
          // 分页参数 无特殊情况不用修改
          if (resourceData.paginations) {
            return (
              (resourceData.paginations.page - 1) *
              resourceData.paginations.pageSize
            );
          }
          return 0;
        },
      },
      staticFallback: { params: {} },
    },
    POST: {
      path: 'circulation-rule-reading',
    },
  },
  item: {
    // list 作为接口返回值集合(resources)的key 这个字段名可以随意替换
    type: 'okapi', // 类型
    // records: 'setEntities',//返回对象其中的某个字段放到props里面
    accumulate: 'true', // 默认没有GET请求 必须设置为true
    path: 'circulation-rule-reading', // 接口地址
    throwErrors: false, // 是否弹出报错信息
    fetch: false, // 是否刚进入页面就获取数据
    GET: {
      path: 'circulation-rule-reading/%{activeId}',
    },
    DELETE: {
      path: 'circulation-rule-reading/%{activeId}',
    },
    PUT: {
      path: 'circulation-rule-reading/%{activeId}',
    },
  },
  deleteBatch: {
    // list 作为接口返回值集合(resources)的key 这个字段名可以随意替换
    type: 'okapi', // 类型
    // records: 'setEntities',//返回对象其中的某个字段放到props里面
    accumulate: 'true', // 默认没有GET请求 必须设置为true
    throwErrors: false, // 是否弹出报错信息
    fetch: false, // 是否刚进入页面就获取数据
    path: 'largeCircRule/deleteBatch/rules',
    headers: {
      accept: 'text/plain',
    },
    POST: {
      path: 'largeCircRule/deleteBatch/rules',
    },
  },
  defaultReadRule:{
    type: 'okapi', // 类型
    accumulate: 'true', // 默认没有GET请求 必须设置为true
    path: 'circulation-rule-reading', // 接口地址
    fetch: false, // 是否刚进入页面就获取数据
    params: {
      query: 'default==true and ruleType==Read',
    },
    throwErrors: false, // 是否弹出报错信息
  }
});

List.propTypes = {
  resources: PropTypes.shape({
    list: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
      isPending: PropTypes.bool,
    }),
    item: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
      isPending: PropTypes.bool,
    }),
  }), // 接口返回值的集合
  mutator: PropTypes.shape({
    list: PropTypes.shape({
      GET: PropTypes.func.isRequired,
      POST: PropTypes.func.isRequired,
      reset: PropTypes.func.isRequired,
    }),
    item: PropTypes.shape({
      GET: PropTypes.func.isRequired,
      PUT: PropTypes.func.isRequired,
      DELETE: PropTypes.func.isRequired,
      reset: PropTypes.func.isRequired,
    }),
    deleteBatch: PropTypes.shape({
      POST: PropTypes.func.isRequired,
      reset: PropTypes.func.isRequired,
    }),
    defaultReadRule: PropTypes.shape({
      GET: PropTypes.func.isRequired,
      reset: PropTypes.func.isRequired,
    }),
    paginations: PropTypes.shape({
      update: PropTypes.func,
    }),
    activeId: PropTypes.shape({
      update: PropTypes.func,
      replace: PropTypes.func,
    }),
    ruleIds: PropTypes.shape({
      update: PropTypes.func,
      replace: PropTypes.func,
    }),
  }), // 可调用接口的集合
  intl: PropTypes.object,
};

export default injectIntl(stripesConnect(List));
