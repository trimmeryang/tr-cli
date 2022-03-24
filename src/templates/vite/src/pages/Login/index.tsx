import { Rate, Breadcrumb, Button } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
interface LoginProps {}

const test = 'This is vite demo page.';
const Login: React.FC<LoginProps> = (props) => {
    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item href="/">
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                    <UserOutlined />
                    <span>Login</span>
                </Breadcrumb.Item>
            </Breadcrumb>
            <div>{test}</div>
            <Rate />
        </>
    );
};

export default Login;
