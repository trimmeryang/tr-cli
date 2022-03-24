import React from 'react';
import { Button, Input, Spin } from 'antd';
import './user.less';
import { useUser } from '@/services/user';

interface UserProps {}

const User: React.FC<UserProps> = () => {
    const { data, loading, cancel } = useUser();

    return (
        <div>
            <div>
                <Spin spinning={loading} />
            </div>
            <div>{/* <button onClick={run}>run</button> */}</div>
            <div>
                <button onClick={cancel}>cancel</button>
                <div>data:{JSON.stringify(data)}</div>
            </div>
        </div>
    );
};

export default User;
