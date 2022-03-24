import Request, { useRequest } from 'core/tr';

const getUser = () => {
    return Request.get('/api/user');
};

const getName = () => {
    return Request.get('/api/name');
};

export const useUser = (options = {}) => {
    return useRequest(getUser, options);
};

export const useUserName = (options = {}) => {
    return useRequest(getName, options);
};
