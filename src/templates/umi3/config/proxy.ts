export default {
    dev: {
        '/api': {
            target: 'https://localhost:3001',
            changeOrigin: true,
            pathRewrite: { '^/api': '' },
            secure: false
        }
    }
};
