import React, { useState } from 'react';
import styles from './base-layout.less';
import { ConfigProvider, Layout, Menu } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';
import zhCN from 'antd/lib/locale/zh_CN';
import { NavLink, history, ErrorBoundary } from 'core/tr';
import { split } from 'lodash';

const { Header, Footer, Sider, Content } = Layout;

interface BaseLayoutProps {}

const BaseLayout: React.FC<BaseLayoutProps> = (props) => {
    const { pathname } = history.location;
    const [collapsed, setCollapsed] = useState(false);
    const [currentKey, setCurrentKey] = useState([`/${split(pathname, '/', 2)?.[1]}`]);

    const toggle = () => {
        setCollapsed((collapsed) => !collapsed);
    };
    return (
        <Layout className={styles.baseLayout}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div className={styles.logo} />
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={currentKey}
                    defaultSelectedKeys={currentKey}
                    onSelect={({ selectedKeys }) => setCurrentKey(selectedKeys)}>
                    <Menu.Item key="/dashboard" icon={<MenuFoldOutlined />}>
                        <NavLink key="/dashboard" to="/dashboard">
                            dashboard
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key="/list" icon={<UserOutlined />}>
                        <NavLink key="/list" to="/list">
                            list
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key="/error" icon={<CloseOutlined />}>
                        <NavLink key="/error" to="/error">
                            error
                        </NavLink>
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout className={styles.siteLayout}>
                <Header className={styles.siteLayoutBackground} style={{ paddingLeft: 15 }}>
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: 'trigger',
                        onClick: toggle
                    })}
                </Header>
                <Content
                    className={styles.siteLayoutBackground}
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 700
                    }}>
                    <ConfigProvider locale={zhCN}>
                        <ErrorBoundary>{props.children}</ErrorBoundary>
                    </ConfigProvider>
                </Content>
            </Layout>
        </Layout>
    );
};

export default BaseLayout;
