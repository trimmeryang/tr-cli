import { useEffect, useState } from 'react';
import { Breadcrumb, Button } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { Button as SButton } from '@sc/ui-components';
import { useRequest } from '@sc/hooks';

interface WelcomeProps {}
interface Res {
    test: string;
}

const Welcome: React.FC<WelcomeProps> = (props) => {
    const { pkg } = __APP_INFO__;

    const { loading, error, response, run, cancel } = useRequest<Res>({
        manual: true,
        debounceInterval: 2000,
        onSuccess: (res) => {
            console.log('onSuccess:', res.data);
        },
        config: {
            // baseURL: import.meta.env.VITE_BASE_API_URL,
            url: '/api/pet/findByStatus',
            method: 'GET',
            params: {
                status: 'available'
            }
        }
    });

    const { run: run2 } = useRequest({
        manual: false,
        cancelPrevious: true,
        config: {
            // baseURL: import.meta.env.VITE_BASE_API_URL,
            url: '/api/pet/findByStatus2',
            method: 'GET',
            params: {
                status: 'available'
            }
        }
    });

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item href="">
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item href="login">
                    <UserOutlined />
                    <span>Login</span>
                </Breadcrumb.Item>
            </Breadcrumb>
            <div>
                <SButton type="primary" text="call" onClick={run}></SButton>
            </div>

            <div>
                <SButton type="primary" text="call function2" onClick={run2}></SButton>
            </div>

            <div>
                <Button type="primary" onClick={cancel}>
                    cancel
                </Button>
            </div>

            <div>
                <div>loading: {Number(loading)}</div>
                <div>{response?.data?.test}</div>
            </div>
            <div>
                version-- {pkg.name} {pkg.version}
            </div>
        </>
    );
};

export default Welcome;
