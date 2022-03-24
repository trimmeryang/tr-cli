import React, { useState } from 'react';
import { Button, Input, message } from 'antd';
import { useUser, useUserName } from '@/services/user';
import './list.less';
interface ListProps {}

const List: React.FC<ListProps> = () => {
    const { data, loading, run, refresh, cancel } = useUser({
        manual: true
    });

    const {
        data: nameData,
        loading: nameLoading,
        run: nameRun,
        cancel: nameCancel
    } = useUserName({
        manual: true
    });

    return (
        <div>
            <div>
                <div>get user:</div>
                <button disabled={loading} type="button" onClick={() => run()}>
                    {loading ? 'Loading' : 'Edit'}
                </button>
                <button type="button" onClick={cancel} style={{ marginLeft: 16 }}>
                    Cancel
                </button>
                <button type="button" onClick={refresh} style={{ marginLeft: 16 }}>
                    refresh
                </button>
                <div>data:{JSON.stringify(data)}</div>
            </div>

            <div>
                <div>get name:</div>
                <button disabled={nameLoading} type="button" onClick={() => nameRun()}>
                    {nameLoading ? 'Loading' : 'Edit'}
                </button>
                <button type="button" onClick={nameCancel} style={{ marginLeft: 16 }}>
                    Cancel
                </button>
                <div>data: {JSON.stringify(nameData)}</div>
            </div>
        </div>
    );
};

export default List;
