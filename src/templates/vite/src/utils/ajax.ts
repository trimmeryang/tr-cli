import axios from 'axios';
import { message } from 'antd';
import { stringify } from 'qs';

const MODE = import.meta.env.MODE; // 环境变量

const getRequest = (method) => {
    return (url, data, options = {}) => {
        return axios({
            baseURL: import.meta.env.VITE_BASE_API_URL,
            method,
            url,
            ...(method === 'POST'
                ? {
                      data: options.string ? stringify(data) : data
                  }
                : {}),
            params: method === 'GET' ? data : options.params,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': options.string ? 'application/x-www-form-urlencoded' : 'application/json',
                ...options.headers
            },
            withCredentials: true
        })
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    };
};

export const get = getRequest('GET');
