import React, { useRef } from 'react'

import { Button, Col, Row, Space } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

import DataGrid from 'components/DataGrid'
import Page from 'components/Page'

// import usePermissions from 'utils/hooks/usePermissions'
// import Device from 'utils/Device'
import locale from 'locale'

// {{note}}
const {{functionName}} = () => {
  //   const menuId = Device.getUrlParameter('menuId') || ''
  //   const permissions = usePermissions({ menuId })
  const tableRef = useRef(null)

  const columns = [
    {
      title: locale('经销商名称'),
      dataIndex: 'area',
      width: 120,
    },
    {
      title: locale('经销商编码'),
      dataIndex: 'area',
      width: 120,
    }
  ]
  
  const handleReload = () => {
    tableRef && tableRef.current && tableRef.current.updateFetch(true)
  }

  return (
    <Page>
      <Page.Header>
        <Row wrap={false}>
          <Col flex="auto">
            <Space>
              <Button onClick={handleReload} icon={<ReloadOutlined />} />
            </Space>
          </Col>
        </Row>
      </Page.Header>
      <Page>
        <Page.Content>
          <DataGrid
            bordered
            columns={columns}
            rowKey="id"
            cRef={tableRef}
            url="/app/szsx/static/taskNum/getStaticPage.do"
            pagination
            contentType="json"
          />
        </Page.Content>
      </Page>
    </Page>
  )
}

export default  {{functionName}}