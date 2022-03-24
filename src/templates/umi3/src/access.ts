export default function access(initialState: any) {
    const { user } = initialState || {};

    return {
        canLogin: user?.userName
    };
}
