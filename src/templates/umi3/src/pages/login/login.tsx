import { Form, Input, Button, Layout } from 'antd';
import styles from './login.less';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
// import { useRequest } from '@sc/hooks';
import { Response, Tenant, User } from '@/types';
import useLocalStorage from 'core/hooks/useLocalstorage';
import BaseConst from '@/const';
import { useModel, history, useRequest } from 'core/tr';

interface LoginProps {}

interface AuthForm {
    name: string;
    password: string;
}

const { Content } = Layout;

const Login: React.FC<LoginProps> = (props) => {
    const [user, setUser] = useLocalStorage<User | null>(BaseConst.USER, null);
    const { initialState, setInitialState } = useModel('@@initialState');
    // const {
    //     run,
    //     response,
    //     loading: loginLoading
    // } = useRequest<Response<User>, AuthForm>({
    //     manual: true,
    //     cancelPrevious: true,
    //     config: {
    //         url: '/api/user/login',
    //         method: 'POST'
    //     },
    //     initState: { loading: false },
    //     onSuccess: (res) => {
    //         if (res.data.code === 200) {
    //             // 1 set to local storage
    //             // setUser(res.data.data);

    //             // 2 set to initialValue
    //             setInitialState({
    //                 ...initialState,
    //                 user: res.data.data
    //             });
    //             history.push('/dashboard');
    //         }
    //     }
    // });

    // const handleSubmit = (value: { uname: string; password: string }) => {
    //     run({
    //         data: {
    //             name: value.uname,
    //             password: value.password
    //         }
    //     });
    // };

    const handleSubmit = () => {
        history.push('/dashboard');
    };

    if (user?.token) {
        history.push('/dashboard');
        return null;
    }

    return (
        <Layout className={styles.loginContainer}>
            <Content className={styles.formContainer}>
                <div className={styles.title}>欢迎登录</div>
                <Form onFinish={handleSubmit}>
                    <Form.Item
                        name="uname"
                        validateTrigger={['onBlur']}
                        rules={[
                            { type: 'email', message: '请输入正确的邮箱' },
                            { required: true, message: '请输入用户名' }
                        ]}>
                        <Input prefix={<UserOutlined />} placeholder="请输入用户名" type="text" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                        <Input prefix={<LockOutlined />} placeholder="请输入密码" type="password" />
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType="submit" type="primary">
                            登录
                        </Button>
                    </Form.Item>
                </Form>
                <div className="company-info">
                    <p className="company-info-tite">© 2022</p>
                </div>
            </Content>
        </Layout>
    );
};

export default Login;
