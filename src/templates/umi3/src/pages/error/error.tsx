import React, { useState } from 'react';
import { Button, Input } from 'antd';
import './error.less';

interface ErrorProps {}

const Error: React.FC<ErrorProps> = () => {
    const [list, setList] = useState([1, 2, 3]);

    return (
        <div>
            <button onClick={() => setList(null)}>点击模拟触发错误</button>
            <ul>
                {list.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
};

export default Error;
