import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'dva';
import { useMount, useSetState } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';
import { Form, Divider, Row, Col, Input, Button, Select, Modal, message, DatePicker, Popconfirm, Menu } from 'antd';
import { PlusOutlined, CloudUploadOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import BasicContentLayout from '@/layouts/BasicContentLayout';
import { list } from '@/services/school';
import TablePro, { ViewAction, DeleteAction, EditAction, MoreAction, Actions } from '@/components/TablePro';
import { schoolSizeTypes, schoolAwesomeTypes } from './data';

const { RangePicker } = DatePicker;

/**
 * 列表页面实例，最佳copy方案,hook版
 */
const School = props => {
  // antd4 form 实例,注意弹框也有的form需新建实例
  const [searchForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [pageParams, setPageParams] = useSetState({ pageNumber: 1, pageSize: 10, dataSource: [], loading: false });

  useMount(() => init());

  const columns = [
    {
      title: '名',
      dataIndex: 'Name',
      key: 'Name',
    },
    {
      title: '板块',
      dataIndex: 'Region',
      key: 'Region',
    },
    {
      title: '市区',
      dataIndex: 'District',
      key: 'District',
    },
    {
      title: '学校类型',
      dataIndex: 'Size',
      key: 'Size',
      render: text => {
        return schoolSizeTypes.find(v => v.value === text)?.label;
      },
    },
    {
      title: '梯队',
      dataIndex: 'Awesome',
      key: 'Awesome',
      render: text => schoolAwesomeTypes.find(v => v.value === text)?.label,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => {
        // 直接操作的选项要加一步确认哦，Popconfirm
        return (
          <Actions>
            <EditAction onClick={modify(record)} />
            <Popconfirm title="确定删除XXX？" onConfirm={() => console.log('删除方法')}>
              <DeleteAction />
            </Popconfirm>
            <ViewAction onClick={view(record)} />
            <MoreAction
              menu={
                <Menu>
                  <Menu.Item key="1">1st menu item</Menu.Item>
                  <Menu.Item key="2">2nd menu item</Menu.Item>
                  <Menu.Item key="3">3rd menu item</Menu.Item>
                </Menu>
              }
            />
          </Actions>
        );
      },
    },
  ];

  /**
   * 列表刷新方法
   * @param {*} [params={}] 需要更新的查询参数
   */
  const init = (params = {}) => {
    // 从state里拿页面数据
    const { pageNumber, pageSize } = pageParams;
    setPageParams({ loading: true });
    const searchValues = getSearchFormValues();
    // ---把页面值\搜索值\传入值整合---
    const payload = { pageNumber, pageSize, ...searchValues, ...params };
    // 发起请求，处理后端数据
    list(payload).then(res => {
      setPageParams({
        // ----lodash取值不会空指针----
        ...payload,
        dataSource: _.get(res, 'data.list'),
        count: _.get(res, 'data.count'),
        loading: false,
      });
    });
  };

  // 搜索事件
  const search = () => {
    init({ pageNumber: 1 });
  };

  // 高阶函数的写法引入record
  const modify = record => () => {
    setModalVisible(true);
    console.log(record);
  };

  // 高阶函数的写法引入record
  const view = record => () => {
    setModalVisible(true);
    console.log(record);
  };

  const add = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  /**
   * 获取查询的选项值
   */
  const getSearchFormValues = () => {
    const { getFieldsValue } = searchForm;
    const formValues = getFieldsValue(['name', 'date']);
    const transMoment = d => (moment.isMoment(d) ? d.format('YYYY-MM-DD') : d);
    const startDate = _.get(formValues, 'date[0]');
    const endDate = _.get(formValues, 'date[1]');
    // 清空date，传入开始时间和终止时间
    return { ...formValues, startDate: transMoment(startDate), endDate: transMoment(endDate), date: undefined };
  };

  // 跳转页面事件
  const changePage = pagination => {
    const { current, pageSize } = pagination;
    init({
      pageSize,
      pageNumber: current,
    });
  };

  // 一般都会弹窗干点啥，如果弹窗内容很长请换成@Drawer组件
  const renderModal = () => {
    return (
      <Modal title="填写名称" visible={modalVisible} onCancel={hideModal}>
        <div>填写你的内容</div>
      </Modal>
    );
  };

  const { dataSource, pageNumber, pageSize, count, loading } = pageParams;
  const pagination = {
    current: pageNumber,
    pageSize,
    total: count,
  };
  return (
    <BasicContentLayout>
      <TablePro.SearchToolbar onSubmit={search} form={searchForm}>
        <Form.Item label="名称" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="时间" name="date">
          <RangePicker />
        </Form.Item>
      </TablePro.SearchToolbar>
      <TablePro
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        onChange={changePage}
        actionToolbar={
          <Button.Group>
            <Button icon={<PlusOutlined />} onClick={add}>
              新增
            </Button>
            <Button icon={<CloudUploadOutlined />}>导入</Button>
            <Button icon={<CloudDownloadOutlined />}>导出</Button>
          </Button.Group>
        }
        refresh={init}
        rowKey="coloum1" //必须指定唯一id
      />
      {renderModal()}
    </BasicContentLayout>
  );
};

export default School;
