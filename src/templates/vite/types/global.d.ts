declare global {
    const __APP_INFO__: {
        pkg: {
            name: string;
            version: string;
        };
        lastBuildTime: string;
    };
}
