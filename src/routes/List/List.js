import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { stripesConnect } from '@folio/stripes/core';
import {
  // Alert,
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
import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Filters from '../../components/AntdFilter/Filters';
import ModalForm from './ModalForm';

const { Sider, Content } = Layout;
const { confirm } = Modal;

class List extends Component {
  static manifest = Object.freeze({
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

  static propTypes = {
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

  state = {
    selectedRowKeys: [],
    page: 1,
    pageSize: 10,
    isPolicy: false,
    editShow: false,
    editLoading: false,
    addLoading: false,
    addShow: false,
    defaultCreateButton: false,
    createButton: false
  };

  componentDidMount() {
    message.config({
      top: 100,
    });
    // this.props.mutator.defaultReadRule.GET().then(res => {
    //   const defaultRule=get(res, 'largeCirculationRules', [])
    //   //没有默认规则时要优先创建默认规则，且只能创建一个
    //   if(defaultRule.length){
    //       this.setState({
    //         defaultCreateButton:false,
    //         createButton:true
    //       })
    //   }else{
    //     this.setState({
    //       defaultCreateButton: true,
    //       createButton: false
    //     })
    //   }
    // })
  }

  onSelectChange = selectedRowKeys => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  onPageChange = (page, pageSize) => {
    // console.log(page, pageSize);
    this.setState({
      page,
      pageSize,
    });
    this.props.mutator.paginations.update({
      page,
      pageSize,
    });
  };

  list = () => {
    const {
      resources,
      intl: { formatMessage },
    } = this.props;
    const { selectedRowKeys, page, pageSize } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.default || record.overRide, // Column configuration not to be checked
      }),
    };

    const rulesReadList = get(resources.list, 'records[0]', [])['rules-reading'] || []
    const list = rulesReadList.map(i => ({
      ...i,
      key: i.id,
    }))

    const totalRecords = get(resources.list, 'records[0].totalRecords', []);
    const paginations = get(resources, 'paginations', {});

    // const itemType = get(resources, 'itemType.records', []);
    const loanType = get(resources, 'loanType.records', []);
    const patronGroup = get(resources, 'patronGroup.records', []);

    const loanPolicy = get(resources, 'loanPolicy.records', []);
    // const requestPolicy = get(resources, 'requestPolicy.records', []);
    // const noticePolicy = get(resources, 'noticePolicy.records', []);
    const overduePolicy = get(resources, 'overduePolicy.records', []);
    const lostItemPolicy = get(resources, 'lostItemPolicy.records', []);
    const locations = cloneDeep(get(resources, 'locations.records', []));

    const columns = [
      // {
      //   dataIndex: 'itemType',
      //   key: 'itemType',
      //   title: formatMessage({ id: 'ui-shl-reading-rules.materialTypes' }),
      //   render: (text, record) => (
      //     <div>
      //       {get(
      //         itemType.filter(i => i.id === text),
      //         '[0].name',
      //         ''
      //       )}
      //     </div>
      //   ),
      // },
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
        // ellipsis: true,
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
                  // getPopupContainer={() =>
                  //   document.getElementById('rulePopover')
                  // }
                  placement="topRight"
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
                  title={formatMessage({
                    id: 'ui-shl-reading-rules.locations',
                  })}
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
      // {
      //   dataIndex: 'requestPolicy',
      //   key: 'requestPolicy',
      //   title: formatMessage({
      //     id: 'ui-shl-reading-rules.requestPolicies',
      //   }),
      //   render: (text, record) => (
      //     <div>
      //       {get(
      //         requestPolicy.filter(i => i.id === text),
      //         '[0].name',
      //         ''
      //       )}
      //     </div>
      //   ),
      // },
      // {
      //   dataIndex: 'noticePolicy',
      //   key: 'noticePolicy',
      //   title: formatMessage({ id: 'ui-shl-reading-rules.noticePolicies' }),
      //   render: (text, record) => (
      //     <div>
      //       {get(
      //         noticePolicy.filter(i => i.id === text),
      //         '[0].name',
      //         ''
      //       )}
      //     </div>
      //   ),
      // },
      {
        dataIndex: 'overduePolicy',
        key: 'overduePolicy',
        title: formatMessage({
          id: 'ui-shl-reading-rules.overdueFinePolicies',
        }),
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
        title: formatMessage({
          id: 'ui-shl-reading-rules.lostItemFeePolicy',
        }),
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
                  this.setState({
                    editShow: true,
                  });
                  this.detail(record.id);
                }}
                type="link"
                size="small"
              >
                <FormattedMessage id="ui-shl-reading-rules.edit" />
              </Button>

              {!record.default && !record.overRide && (
                <Button
                  onClick={() => {
                    confirm({
                      title: formatMessage({
                        id: 'ui-shl-reading-rules.deleteConfirm',
                      }),
                      // icon: <ExclamationCircleOutlined />,
                      content: formatMessage({
                        id: 'ui-shl-reading-rules.deleteMessage',
                      }),
                      okText: formatMessage({
                        id: 'ui-shl-reading-rules.ok',
                      }),
                      okType: 'danger',
                      cancelText: formatMessage({
                        id: 'ui-shl-reading-rules.cancel',
                      }),
                      onOk: () => this.delete(record.id),
                      onCancel() { },
                    });
                  }}
                  type="link"
                  size="small"
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
    // console.log(list);
    return (
      <div>
        <div style={{ padding: '10px 0' }}>
          {/* <Alert
            message={
              <div>
                <FormattedMessage
                  id="ui-shl-reading-rules.itemsSelected"
                  values={{
                    num: (
                      <span style={{ color: '#1890ff' }}>
                        {selectedRowKeys.length}
                      </span>
                    ),
                  }}
                />
                <Button
                  type="link"
                  size="small"
                  onClick={() => this.setState({ selectedRowKeys: [] })}
                >
                  <FormattedMessage id="ui-shl-reading-rules.clear" />
                </Button>
              </div>
            }
            type="info"
            showIcon
          /> */}
        </div>
        <Table
          scroll={{ x: 1220 }}
          loading={
            resources && resources.list ? resources.list.isPending : false
          }
          // rowSelection={rowSelection}
          columns={columns}
          dataSource={list}
          pagination={{
            current: paginations ? paginations.page : 1,
            pageSize: paginations ? paginations.pageSize : 10,
            showQuickJumper: true,
            total: totalRecords,
            onChange: this.onPageChange,
            onShowSizeChange: this.onPageChange,
          }}
        />
      </div>
    );
  };

  getData = () => {
    const { resources } = this.props;
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
    // console.log(institutionsFilter);

    return institutionsFilter;
  };

  add = async data => {
    const {
      intl: { formatMessage },
      resources,
      mutator,
    } = this.props;

    this.setState({
      addLoading: true,
    });
    // mutator.list.reset();
    const loanType = get(resources, 'loanType.records', []);

    const loanTypeName = get(
      loanType.filter(i => i.id === data.loanType),
      '[0].name',
      ''
    );
    // console.log(data, loanTypeName);
    if (loanTypeName && loanTypeName === 'authority') {
      data.overRide = true;
    } else {
      delete data.overRide;
    }
    // data.ruleType ='Read'
    await mutator.list
      .POST(data)
      .then(res => {
        console.log(res);
        message.success(
          `${formatMessage({
            id: 'ui-shl-reading-rules.add',
          })} ${formatMessage({
            id: 'ui-shl-reading-rules.success',
          })}`
        );
        this.setState({
          addShow: false,
          isPolicy: false,
          defaultCreateButton:false,
          createButton:true
        });
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
                id: 'ui-shl-reading-rules.add',
              })} ${formatMessage({
                id: 'ui-shl-reading-rules.fail',
              })}`
            );
          }
        });
      });
    this.setState({
      addLoading: false,
    });
  };

  detail = async id => {
    const {
      intl: { formatMessage },
      mutator,
    } = this.props;
    mutator.activeId.replace(id);
    mutator.item.reset();
    await mutator.item
      .GET()
      .then(res => {
        console.log(res);
        if (
          res.loanPolicy ||
          res.requestPolicy ||
          res.noticePolicy ||
          res.overduePolicy ||
          res.lostItemPolicy
        ) {
          this.setState({
            isPolicy: true,
          });
        } else {
          this.setState({
            isPolicy: false,
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  edit = async data => {
    const {
      intl: { formatMessage },
      resources,
      mutator,
    } = this.props;
    this.setState({
      editLoading: true,
    });
    const loanType = get(resources, 'loanType.records', []);

    const loanTypeName = get(
      loanType.filter(i => i.id === data.loanType),
      '[0].name',
      ''
    );
    // console.log(data, loanTypeName);
    if (loanTypeName && loanTypeName === 'authority') {
      data.overRide = true;
    } else {
      delete data.overRide;
    }
    // data.ruleType ='Read'
    mutator.activeId.replace(data.id);
    // mutator.list.reset();
    await mutator.item
      .PUT(data)
      .then(res => {
        // console.log(res);
        message.success(
          `${formatMessage({
            id: 'ui-shl-reading-rules.edit',
          })} ${formatMessage({
            id: 'ui-shl-reading-rules.success',
          })}`
        );
        this.setState({
          editShow: false,
        });
        // this.fetchModules();
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
    this.setState({
      editLoading: false,
    });
  };

  delete = async id => {
    const {
      intl: { formatMessage },
      mutator,
    } = this.props;
    const { selectedRowKeys } = this.state;
    mutator.activeId.replace(id);
    // mutator.item.reset();
    return mutator.item
      .DELETE({})
      .then(res => {
        console.log(res);
        message.success(
          `${formatMessage({
            id: 'ui-shl-reading-rules.delete',
          })} ${formatMessage({
            id: 'ui-shl-reading-rules.success',
          })}`
        );
        this.setState({
          selectedRowKeys: selectedRowKeys.filter(i => i !== id),
        });
        this.onPageChange(1, 10);
      })
      .catch(error => {
        message.error(
          `${formatMessage({
            id: 'ui-shl-reading-rules.delete',
          })} ${formatMessage({
            id: 'ui-shl-reading-rules.fail',
          })}`
        );
        console.log(error);
      });
  };

  // deleteBatch = async () => {
  //   const {
  //     intl: { formatMessage },
  //     mutator,
  //   } = this.props;
  //   const { selectedRowKeys } = this.state;
  //   console.log("deleteBatch", selectedRowKeys)
  //   // mutator.ruleIds.replace(selectedRowKeys.join(','));
  //   // mutator.item.reset();
  //   return mutator.deleteBatch
  //     .POST({
  //       "idList": selectedRowKeys
  //     })
  //     .then(res => {
  //       message.success(
  //         `${formatMessage({
  //           id: 'ui-shl-reading-rules.delete',
  //         })} ${formatMessage({
  //           id: 'ui-shl-reading-rules.success',
  //         })}`
  //       );
  //       this.setState({ selectedRowKeys: [] });
  //       this.onPageChange(1, 10);
  //       console.log(res);
  //     })
  //     .catch(error => {
  //       message.error(
  //         `${formatMessage({
  //           id: 'ui-shl-reading-rules.delete',
  //         })} ${formatMessage({
  //           id: 'ui-shl-reading-rules.fail',
  //         })}`
  //       );
  //       console.log(error);
  //     });
  // };

  onInitialValue = value => {
    const location = {};
    console.log(value);
    if (value.location) {
      location.location = value.location.split(' ');
      console.log(location.location);
    } else {
      delete value.location;
    }
    return {
      ...value,
      ...location,
    };
  };

  render() {
    const {
      resources,
      intl: { formatMessage },
    } = this.props;
    const { isPolicy, editShow, editLoading, addLoading, addShow, /* defaultCreateButton, createButton */ } = this.state;
    // const itemType = get(resources, 'itemType.records', []);
    const loanType = get(resources, 'loanType.records', []);
    const patronGroup = get(resources, 'patronGroup.records', []);

    const loanPolicy = get(resources, 'loanPolicy.records', []);
    const requestPolicy = get(resources, 'requestPolicy.records', []);
    const noticePolicy = get(resources, 'noticePolicy.records', []);
    const overduePolicy = get(resources, 'overduePolicy.records', []);
    const lostItemPolicy = get(resources, 'lostItemPolicy.records', []);
    const item = get(resources, 'item.records[0]', {});
    const locations = cloneDeep(get(resources, 'locations.records', []));

    const options = [
      // {
      //   id: 'itemType',
      //   name: formatMessage({ id: 'ui-shl-reading-rules.materialTypes' }),
      //   data: itemType,
      //   type: 'select',
      //   placeholder: formatMessage({
      //     id: 'ui-shl-reading-rules.noData',
      //   }),
      // },
      {
        id: 'loanType',
        name: formatMessage({ id: 'ui-shl-reading-rules.loanTypes' }),
        data: loanType,
        type: 'select',
        placeholder: formatMessage({
          id: 'ui-shl-reading-rules.noData',
        }),
      },
      {
        id: 'patronGroup',
        name: formatMessage({ id: 'ui-shl-reading-rules.patronGroups' }),
        data: patronGroup.map(i => ({ ...i, name: i.group })),
        type: 'select',
        placeholder: formatMessage({
          id: 'ui-shl-reading-rules.noData',
        }),
      },
      {
        id: 'location',
        name: formatMessage({ id: 'ui-shl-reading-rules.locations' }),
        data: this.getData(),
        type: 'treeSelect',
        showSearch: true,
        placeholder: formatMessage({
          id: 'ui-shl-reading-rules.noData',
        }),
      },
      {
        id: 'loanPolicy',
        name: formatMessage({ id: 'ui-shl-reading-rules.loanPolicies' }),
        data: loanPolicy,
        type: 'select',
        required: isPolicy,
        message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
        placeholder: formatMessage({
          id: 'ui-shl-reading-rules.noData',
        }),
      },
      // {
      //   id: 'requestPolicy',
      //   name: formatMessage({ id: 'ui-shl-reading-rules.requestPolicies' }),
      //   data: requestPolicy,
      //   type: 'select',
      //   required: isPolicy,
      //   message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
      //   placeholder: formatMessage({
      //     id: 'ui-shl-reading-rules.noData',
      //   }),
      // },
      // {
      //   id: 'noticePolicy',
      //   name: formatMessage({ id: 'ui-shl-reading-rules.noticePolicies' }),
      //   data: noticePolicy,
      //   type: 'select',
      //   required: isPolicy,
      //   message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
      //   placeholder: formatMessage({
      //     id: 'ui-shl-reading-rules.noData',
      //   }),
      // },
      {
        id: 'overduePolicy',
        name: formatMessage({
          id: 'ui-shl-reading-rules.overdueFinePolicies',
        }),
        data: overduePolicy,
        type: 'select',
        required: isPolicy,
        message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
        placeholder: formatMessage({
          id: 'ui-shl-reading-rules.noData',
        }),
      },
      {
        id: 'lostItemPolicy',
        name: formatMessage({
          id: 'ui-shl-reading-rules.lostItemFeePolicy',
        }),
        data: lostItemPolicy,
        type: 'select',
        required: isPolicy,
        message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
        placeholder: formatMessage({
          id: 'ui-shl-reading-rules.noData',
        }),
      },
    ];
    // const defaultOptions = [
    //   {
    //     id: 'loanPolicy',
    //     name: formatMessage({ id: 'ui-shl-reading-rules.loanPolicies' }),
    //     data: loanPolicy,
    //     type: 'select',
    //     required: isPolicy,
    //     message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
    //     placeholder: formatMessage({
    //       id: 'ui-shl-reading-rules.noData',
    //     }),
    //   },
    //   {
    //     id: 'requestPolicy',
    //     name: formatMessage({ id: 'ui-shl-reading-rules.requestPolicies' }),
    //     data: requestPolicy,
    //     type: 'select',
    //     required: isPolicy,
    //     message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
    //     placeholder: formatMessage({
    //       id: 'ui-shl-reading-rules.noData',
    //     }),
    //   },
    //   {
    //     id: 'noticePolicy',
    //     name: formatMessage({ id: 'ui-shl-reading-rules.noticePolicies' }),
    //     data: noticePolicy,
    //     type: 'select',
    //     required: isPolicy,
    //     message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
    //     placeholder: formatMessage({
    //       id: 'ui-shl-reading-rules.noData',
    //     }),
    //   },
    //   {
    //     id: 'overduePolicy',
    //     name: formatMessage({
    //       id: 'ui-shl-reading-rules.overdueFinePolicies',
    //     }),
    //     data: overduePolicy,
    //     type: 'select',
    //     required: isPolicy,
    //     message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
    //     placeholder: formatMessage({
    //       id: 'ui-shl-reading-rules.noData',
    //     }),
    //   },
    //   {
    //     id: 'lostItemPolicy',
    //     name: formatMessage({
    //       id: 'ui-shl-reading-rules.lostItemFeePolicy',
    //     }),
    //     data: lostItemPolicy,
    //     type: 'select',
    //     required: isPolicy,
    //     message: formatMessage({ id: 'ui-shl-reading-rules.required' }),
    //     placeholder: formatMessage({
    //       id: 'ui-shl-reading-rules.noData',
    //     }),
    //   },
    // ];
    // console.log(item);
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
              submitText={formatMessage({
                id: 'ui-shl-reading-rules.filterSearch',
              })}
              all={formatMessage({
                id: 'ui-shl-reading-rules.all',
              })}
              resetText={formatMessage({
                id: 'ui-shl-reading-rules.reset',
              })}
              options={[
                // {
                //   id: 'itemType',
                //   name: formatMessage({
                //     id: 'ui-shl-reading-rules.materialTypes',
                //   }),
                //   data: itemType,
                //   // required:true,
                //   type: 'select',
                //   showSearch: true,
                //   width: 12,
                // },
                {
                  id: 'loanType',
                  name: formatMessage({
                    id: 'ui-shl-reading-rules.loanTypes',
                  }),
                  data: loanType,
                  type: 'select',
                  showSearch: true,
                  width: 12,
                },
                {
                  id: 'patronGroup',
                  name: formatMessage({
                    id: 'ui-shl-reading-rules.patronGroups',
                  }),
                  data: patronGroup.map(i => ({ ...i, name: i.group })),
                  type: 'select',
                  showSearch: true,
                  width: 12,
                },
                {
                  id: 'location',
                  name: formatMessage({
                    id: 'ui-shl-reading-rules.locations',
                  }),
                  data: locations.map(i => ({
                    ...i,
                    name: `${i.code}(${i.name})`,
                  })),
                  type: 'select',
                  showSearch: true,
                  width: 12,
                },
                // {
                //   id: 'location',
                //   name: formatMessage({ id: 'ui-shl-reading-rules.locations' }),
                //   data: this.getData(),
                //   type: 'treeSelect',
                //   // showSearch: true,
                // },
              ]}
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
                  this.add(value);
                }}
                onCancel={() =>
                  this.setState({ addShow: false, isPolicy: false })
                }
                onOpen={() => {
                  console.log('open');
                }}
                onFormChange={(changedValues, allValues, form) => {
                  const key = Object.keys(changedValues)[0];
                  const values = Object.values(changedValues)[0];
                  if (
                    allValues.loanPolicy ||
                    allValues.requestPolicy ||
                    allValues.noticePolicy ||
                    allValues.overduePolicy ||
                    allValues.lostItemPolicy
                  ) {
                    this.setState({
                      isPolicy: true,
                    });
                  } else {
                    this.setState(
                      {
                        isPolicy: false,
                      },
                      () => {
                        form.validateFields();
                      }
                    );
                  }
                }}
                cancelText={
                  <FormattedMessage id="ui-shl-reading-rules.cancel" />
                }
                submitText={
                  <FormattedMessage id="ui-shl-reading-rules.submit" />
                }
                options={options}
              >
                <Button
                  type="primary"
                  onClick={() =>
                    this.setState({ addShow: true, isPolicy: false })
                  }
                  icon={<PlusOutlined />}
                >
                  <FormattedMessage id="ui-shl-reading-rules.add" />
                </Button>
              </ModalForm>
              {/* <Button
                type="ghost"
                onClick={() => {
                  const { selectedRowKeys } = this.state;
                  if (selectedRowKeys.length) {
                    confirm({
                      title: formatMessage({
                        id: 'ui-shl-reading-rules.deleteConfirm',
                      }),
                      // icon: <ExclamationCircleOutlined />,
                      content: formatMessage({
                        id: 'ui-shl-reading-rules.deleteMessages',
                      }),
                      okText: formatMessage({
                        id: 'ui-shl-reading-rules.ok',
                      }),
                      okType: 'danger',
                      cancelText: formatMessage({
                        id: 'ui-shl-reading-rules.cancel',
                      }),
                      onOk: () => this.deleteBatch(),
                      onCancel() { },
                    });
                  }
                }}
              >
                <FormattedMessage id="ui-shl-reading-rules.batch" />
                <FormattedMessage id="ui-shl-reading-rules.delete" />
              </Button> */}
            </Space>
            {/* {defaultCreateButton?<Space>
              <ModalForm
                id="defaultAdd"
                title={<FormattedMessage id="ui-shl-reading-rules.addDefault" />}
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
                  console.log(value);
                  value.default = true
                  console.log('value: ', value);
                  // this.add(value);
                }}
                onCancel={() =>
                  this.setState({ addShow: false, isPolicy: false })
                }
                onOpen={() => {
                  console.log('open');
                }}
                onFormChange={(changedValues, allValues, form) => {
                  const key = Object.keys(changedValues)[0];
                  const values = Object.values(changedValues)[0];
                  if (
                    allValues.loanPolicy ||
                    allValues.requestPolicy ||
                    allValues.noticePolicy ||
                    allValues.overduePolicy ||
                    allValues.lostItemPolicy
                  ) {
                    this.setState({
                      isPolicy: true,
                    });
                  } else {
                    this.setState(
                      {
                        isPolicy: false,
                      },
                      () => {
                        form.validateFields();
                      }
                    );
                  }
                }}
                cancelText={
                  <FormattedMessage id="ui-shl-reading-rules.cancel" />
                }
                submitText={
                  <FormattedMessage id="ui-shl-reading-rules.submit" />
                }
                options={defaultOptions}
              >
                <Button
                  type="primary"
                  onClick={() =>
                    this.setState({ addShow: true, isPolicy: false })
                  }
                  icon={<PlusOutlined />}
                >
                  <FormattedMessage id="ui-shl-reading-rules.add" />
                </Button>
              </ModalForm>
            </Space>:''} */}
            {this.list()}
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
            submitText={formatMessage({
              id: 'ui-shl-reading-rules.submit',
            })}
            cancelText={formatMessage({
              id: 'ui-shl-reading-rules.cancel',
            })}
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
              console.log(value, item);

              this.edit({ id: item.id, ...value });
            }}
            onCancel={() => this.setState({ editShow: false })}
            initialValues={this.onInitialValue(item)}
            onOpen={() => {
              console.log('detail');
            }}
            onFormChange={(changedValues, allValues, form) => {
              // const key = Object.keys(changedValues)[0];
              // const values = Object.values(changedValues)[0];
              console.log(allValues);
              if (
                allValues.loanPolicy ||
                allValues.requestPolicy ||
                allValues.noticePolicy ||
                allValues.overduePolicy ||
                allValues.lostItemPolicy
              ) {
                this.setState({
                  isPolicy: true,
                });
              } else {
                this.setState(
                  {
                    isPolicy: false,
                  },
                  () => {
                    form.validateFields();
                  }
                );
              }
            }}
            options={options}
          />
        </Layout>
      </Layout>
    );
  }
}

export default injectIntl(stripesConnect(List));
