import { MockMethod } from 'vite-plugin-mock';

export default [
    {
        url: '/api/pet/findByStatus',
        timeout: 1000,
        method: 'get',
        response: () => {
            return {
                test: 'test'
            };
        }
    },
    {
        url: '/api/pet/findByStatus2',
        timeout: 1000,
        method: 'get',
        response: () => {
            return {
                test2: 'test2'
            };
        }
    }
] as MockMethod[];
