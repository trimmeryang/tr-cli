export interface Response<D> {
    code: number;
    data: D;
    msg: string;
}

export interface Tenant {
    expiredTime: number;
    id: string;
    isCurrent?: boolean;
    name: string;
}

export interface User {
    userName: string;
    token: string;
    tenants?: Tenant[];
}
