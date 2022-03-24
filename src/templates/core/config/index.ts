import routes from '../../config/routes';
import proxy from '../../config/proxy';
import { resolve } from 'path';
import CompressionPlugin from 'compression-webpack-plugin';

const { UMI_ENV } = process.env;
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
const isDev = UMI_ENV === 'dev';

export default function TrConfig(config: any) {
    const defaultConfig = {
        hash: true,
        nodeModulesTransform: {
            type: 'none',
            exclude: []
        },
        locale: {
            default: 'zh-CN',
            antd: true,
            // default true, when it is true, will use `navigator.language` overwrite default
            baseNavigator: true,
            baseSeparator: '-'
        },
        alias: {
            core: resolve(__dirname, '../')
        },
        fastRefresh: {},
        routes: routes,
        theme: {
            'primary-color': '#3388ff',
            black: '#000',
            white: '#fff',
            lightBlack: '#747a88',
            red: '#ff7341'
        },
        targets: {
            ie: 11
        },
        manifest: {
            basePath: '/'
        },

        chainWebpack(config: any, args: any) {
            if (!isDev) {
                config.devtool = false;
                config.plugin('CompressionPlugin').use(
                    new CompressionPlugin({
                        algorithm: 'gzip',
                        test: productionGzipExtensions,
                        // 只处理大于xx字节 的文件，默认：0
                        threshold: 10240,
                        // 示例：一个1024b大小的文件，压缩后大小为768b，minRatio : 0.75
                        minRatio: 0.8, // 默认: 0.8
                        // 是否删除源文件，默认: false
                        deleteOriginalAssets: false
                    })
                );
            }

            config.merge({
                optimization: {
                    minimize: false,
                    splitChunks: {
                        chunks: 'all',
                        minSize: 30000,
                        minChunks: 3,
                        automaticNameDelimiter: '.',
                        cacheGroups: {
                            react: {
                                name: 'react',
                                priority: 20,
                                test: /[\\/]node_modules[\\/](react|react-dom|react-dom-router)[\\/]/
                            },
                            antd: {
                                name: 'antd',
                                priority: 20,
                                test: /[\\/]node_modules[\\/](antd|@ant-design\/icons)[\\/]/
                            }
                        }
                    }
                }
            });
        },
        ignoreMomentLocale: true,
        proxy: proxy[UMI_ENV || 'dev'],
        // mfsu: {},
        cssLoader: {
            localsConvention: 'camelCase'
        },
        title: 'umi'
    };

    return { ...defaultConfig, ...config };
}
