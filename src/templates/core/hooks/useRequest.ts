import { request, useRequest, history, plugin, ApplyPluginsType, ErrorShowType, RequestConfig } from 'umi';
import { useEffect, useCallback } from 'react';
import Request, { Context } from 'umi-request';

/**
 * need the unique key for the cancel function
 */
interface AbortControllers {
    [key: string]: AbortController;
}

interface ErrorInfoStructure {
    success: boolean;
    data?: any;
    errorCode?: string;
    errorMessage?: string;
    showType?: ErrorShowType;
    traceId?: string;
    host?: string;
    [key: string]: any;
}

interface RequestError extends Error {
    data?: any;
    info?: ErrorInfoStructure;
    request?: Context['req'];
    response?: Context['res'];
}

const controllers: AbortControllers = {};

const requestConfig: RequestConfig = plugin.applyPlugins({
    key: 'request',
    type: ApplyPluginsType.modify,
    initialValue: {}
});

const errorAdaptor = requestConfig.errorConfig?.adaptor || ((resData: any) => resData);

Request.use(async (ctx, next) => {
    await next();
    const { req, res } = ctx;
    if (req.options?.skipErrorHandler) {
        return;
    }
    const { options } = req;
    const { getResponse } = options;
    const resData = getResponse ? res.data : res;
    const errorInfo = errorAdaptor(resData, ctx);
    if (errorInfo.success === false) {
        // throw to error handler
        const error: RequestError = new Error(errorInfo.errorMessage);
        error.name = 'BizError';
        error.data = resData;
        error.info = errorInfo;
        error.response = res;
        throw error;
    }
});

// Add user custom middlewares
const customMiddlewares = requestConfig.middlewares || [];
customMiddlewares.forEach((mw) => {
    Request.use(mw);
});

// Add user custom interceptors
const requestInterceptors = requestConfig.requestInterceptors || [];
const responseInterceptors = requestConfig.responseInterceptors || [];
requestInterceptors.map((ri) => {
    Request.interceptors.request.use(ri);
});
responseInterceptors.map((ri) => {
    Request.interceptors.response.use(ri);
});

const useRequestA = (service: any, options: any = {}) => {
    const { pathname } = history.location;
    const cancelKey = options.cancelKey ? options.cancelKey : `${pathname}-${service.name}`;
    delete options.cancelKey;

    const controller = new AbortController();

    if (!controllers[cancelKey]) {
        controllers[cancelKey] = controller;
    }

    Request.extendOptions({
        ...requestConfig,
        signal: controllers[cancelKey].signal
    });

    const { cancel: oldCancel, run: oldRun, refresh: oldRefresh, ...rest } = useRequest(service, options);

    const cancel = () => {
        // 1. abort function
        controllers[cancelKey]?.abort();
        // 2. remove the key
        delete controllers[cancelKey];
        // 3. call the old cancel function
        return oldCancel();
    };

    // unmount
    useEffect(() => () => cancel(), []);

    const run = useCallback(
        (...args) => {
            Request.extendOptions({ signal: controllers[cancelKey]?.signal });
            return oldRun(...args);
        },
        [cancelKey, oldRun]
    );

    const refresh = useCallback(() => {
        Request.extendOptions({ signal: controllers[cancelKey].signal });
        return oldRefresh();
    }, [cancelKey, oldRefresh]);

    return { ...rest, cancel, run, refresh };
};

export { useRequestA as useRequest };
