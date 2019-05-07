import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import { Row, Col, Card, Form, Select, Button, Radio, Badge } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['default', 'processing', 'success', 'error'];
const status = ['关闭', '运行中', '已上线', '异常'];

/* eslint react/no-multi-comp:0 */
@connect(({ rule, loading }) => ({
  rule,
  loading: loading.models.rule,
}))
@Form.create()
class TableList extends PureComponent {
  state = {
    selectedRows: [],
    formValues: {},
  };

  columns = [
    {
      title: '平台名称',
      dataIndex: 'name',
      render: text => <a onClick={() => this.previewItem(text)}>{text}</a>,
    },
    {
      title: '标题',
      dataIndex: 'desc',
    },
    {
      title: '租金',
      dataIndex: 'desc',
    },
    {
      title: '户型',
      dataIndex: 'callNo',
      sorter: true,
      render: val => `${val} 万`,
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '面积',
      dataIndex: 'status',
      filters: [
        {
          text: status[0],
          value: 0,
        },
        {
          text: status[1],
          value: 1,
        },
        {
          text: status[2],
          value: 2,
        },
        {
          text: status[3],
          value: 3,
        },
      ],
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '朝向',
      dataIndex: 'updatedAt',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: () => (
        <Fragment>
          <a href="">详情</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'rule/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'rule/fetch',
      payload: params,
    });
  };

  previewItem = id => {
    router.push(`/profile/basic/${id}`);
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'rule/fetch',
      payload: {},
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (selectedRows.length === 0) return;
    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'rule/remove',
          payload: {
            key: selectedRows.map(row => row.key),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'rule/fetch',
        payload: values,
      });
    });
  };

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="平台">
              {getFieldDecorator('platform', { initialValue: 'no' })(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="no">不限</Radio.Button>
                  <Radio.Button value="ziru">自如</Radio.Button>
                  <Radio.Button value="danke">蛋壳</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="类型">
              {getFieldDecorator('name', { initialValue: 'no' })(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="no">不限</Radio.Button>
                  <Radio.Button value="full">整租</Radio.Button>
                  <Radio.Button value="shared">合租</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={24} sm={24}>
            <FormItem label="区域">
              {getFieldDecorator('area', { initialValue: 'no' })(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="no">不限</Radio.Button>
                  <Radio.Button value="shangcheng">上城</Radio.Button>
                  <Radio.Button value="xiacheng">下城</Radio.Button>
                  <Radio.Button value="yuhang">余杭</Radio.Button>
                  <Radio.Button value="gongshu">拱墅</Radio.Button>
                  <Radio.Button value="jianggan">江干</Radio.Button>
                  <Radio.Button value="bingjiang">滨江</Radio.Button>
                  <Radio.Button value="xiaoshan">萧山</Radio.Button>
                  <Radio.Button value="xihu">西湖</Radio.Button>
                  <Radio.Button value="qiantang">钱塘新区</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={24} sm={24}>
            <FormItem label="租金">
              {getFieldDecorator('price', { initialValue: 'no' })(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="no">不限</Radio.Button>
                  <Radio.Button value="1500">1500以下</Radio.Button>
                  <Radio.Button value="1500-2000">1500-2000</Radio.Button>
                  <Radio.Button value="2000-3000">2000-3000</Radio.Button>
                  <Radio.Button value="3000-5000">3000-5000</Radio.Button>
                  <Radio.Button value="5000">5000以上</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={24} sm={24}>
            <FormItem label="居室">
              {getFieldDecorator('model', { initialValue: 'no' })(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="no">不限</Radio.Button>
                  <Radio.Button value="1">1居室</Radio.Button>
                  <Radio.Button value="2">2居室</Radio.Button>
                  <Radio.Button value="3">3居室</Radio.Button>
                  <Radio.Button value="4">4居室</Radio.Button>
                  <Radio.Button value=">4">4居室以上</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={24} sm={24}>
            <FormItem label="面积">
              {getFieldDecorator('size', { initialValue: 'no' })(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="no">不限</Radio.Button>
                  <Radio.Button value="40">
                    40m<sup>2</sup>以下
                  </Radio.Button>
                  <Radio.Button value="40-60">
                    40m<sup>2</sup>-60m<sup>2</sup>
                  </Radio.Button>
                  <Radio.Button value="60-80">
                    60m<sup>2</sup>-80m<sup>2</sup>
                  </Radio.Button>
                  <Radio.Button value="80-100">
                    80m<sup>2</sup>-100m<sup>2</sup>
                  </Radio.Button>
                  <Radio.Button value=">100">
                    100m<sup>2</sup>以上
                  </Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={11} sm={24}>
            <FormItem label="特色">
              {getFieldDecorator('special', { initialValue: 'no' })(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="no">不限</Radio.Button>
                  <Radio.Button value="cesuo">独立卫生间</Radio.Button>
                  <Radio.Button value="yangtai">独立阳台</Radio.Button>
                  <Radio.Button value="suo">智能锁</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="朝向">
              {getFieldDecorator('orientations', { initialValue: 'no' })(
                <Select style={{ width: 120 }}>
                  <Option value="no">不限</Option>
                  <Option value="south">朝南</Option>
                  <Option value="north">朝北</Option>
                  <Option value="east">朝东</Option>
                  <Option value="wast">朝西</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
          </div>
        </div>
      </Form>
    );
  }

  render() {
    const {
      rule: { data },
      loading,
    } = this.props;
    const { selectedRows } = this.state;
    return (
      <PageHeaderWrapper title="房屋信息查询">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TableList;
