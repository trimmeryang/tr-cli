import React, { Suspense } from 'react';
import { Button, Input } from 'antd';
import './dashboard.less';
import User from '@/components/user';

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
    return (
        <Suspense fallback={<h1>Loading profile...</h1>}>
            <User />
        </Suspense>
    );
};

export default Dashboard;
