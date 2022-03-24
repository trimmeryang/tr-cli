import Mock, { Random } from 'mockjs';
import { Request, Response } from 'express';

const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};

export default {
    'POST /api/user/login': async (req: Request, res: Response) => {
        await waitTime(100);
        res.json(
            Mock.mock({
                code: 200,
                msg: '请求成功',
                data: {
                    userName: 'test user',
                    token: 'xxx',
                    tenants: []
                }
            })
        );
    },
    'GET /api/user': async (req: Request, res: Response) => {
        await waitTime(5000);
        res.json(
            Mock.mock({
                code: 200,
                msg: '请求成功',
                data: {
                    userName: 'trimmer',
                    token: 'xxx',
                    tenants: []
                }
            })
        );
    },
    'GET /api/name': async (req: Request, res: Response) => {
        await waitTime(5000);
        res.json(
            Mock.mock({
                code: 200,
                msg: '请求成功',
                data: {
                    name: 'trimmer'
                }
            })
        );
    }
};
