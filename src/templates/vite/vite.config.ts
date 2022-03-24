import type { UserConfig, ConfigEnv, Plugin, PluginOption } from 'vite';
import pkg from './package.json';
import legacy from '@vitejs/plugin-legacy';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import vitePluginImp from 'vite-plugin-imp';
import { viteMockServe } from 'vite-plugin-mock';
import compressPlugin from 'vite-plugin-compression';
import { readFileSync } from 'fs';
import lessToJS from 'less-vars-to-js';

const themeVariables = lessToJS(readFileSync(resolve(__dirname, './build/config/variables.less'), 'utf8'));

// env https://cn.vitejs.dev/guide/env-and-mode.html#env-variables
const env = process.argv[process.argv.length - 1];

const wrapperEnv = (envConf) => {
    const ret: any = {};

    for (const envName of Object.keys(envConf)) {
        let realName = envConf[envName].replace(/\\n/g, '\n');
        realName = realName === 'true' ? true : realName === 'false' ? false : realName;

        if (envName === 'VITE_PORT') {
            realName = Number(realName);
        }
        if (envName === 'VITE_PROXY' && realName) {
            try {
                realName = JSON.parse(realName.replace(/'/g, '"'));
            } catch (error) {
                realName = '';
            }
        }
        ret[envName] = realName;
        if (typeof realName === 'string') {
            process.env[envName] = realName;
        } else if (typeof realName === 'object') {
            process.env[envName] = JSON.stringify(realName);
        }
    }

    return ret;
};

const createVitePlugins = (viteEnv, isBuild) => {
    const {
        VITE_USE_IMAGEMIN,
        VITE_USE_MOCK,
        VITE_LEGACY,
        VITE_BUILD_COMPRESS,
        VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
    } = viteEnv;

    const vitePlugins: (Plugin | Plugin[] | PluginOption[])[] = [
        react({
            // Exclude storybook stories
            exclude: /\.stories\.(t|j)sx?$/,
            // Only .tsx files
            include: '**/*.tsx'
        }),
        vitePluginImp({
            libList: [
                {
                    libName: 'antd',
                    style: (name) => `antd/lib/${name}/style/index.less`
                }
            ]
        })
    ];

    VITE_LEGACY && isBuild && vitePlugins.push(legacy());

    // vite-plugin-mock
    VITE_USE_MOCK &&
        vitePlugins.push(
            viteMockServe({
                ignore: /^\_/,
                mockPath: 'mock',
                localEnabled: !isBuild,
                prodEnabled: isBuild,
                injectCode: `
            import { setupProdMockServer } from '../mock/_createProductionServer';
            setupProdMockServer();
            `
            })
        );

    if (isBuild) {
        const compressList = VITE_BUILD_COMPRESS.split(',');

        // gzip
        if (compressList.includes('gzip')) {
            vitePlugins.push(
                compressPlugin({
                    ext: '.gz',
                    deleteOriginFile: VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
                })
            );
        }

        // brotli
        if (compressList.includes('brotli')) {
            vitePlugins.push(
                compressPlugin({
                    ext: '.br',
                    algorithm: 'brotliCompress',
                    deleteOriginFile: VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
                })
            );
        }
    }

    return vitePlugins;
};

const createProxy = (list = []) => {
    const ret = {};
    const httpsRe = /^https:\/\//;
    for (const [prefix, target] of list) {
        const isHttps = httpsRe.test(target);

        // https://github.com/http-party/node-http-proxy#options
        ret[prefix] = {
            target: target,
            changeOrigin: true,
            ws: true,
            rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ''),
            // https is require secure=false
            ...(isHttps ? { secure: false } : {})
        };
    }
    return ret;
};

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfig => {
    const { name, version } = pkg;
    const __APP_INFO__ = {
        pkg: { name, version }
    };
    const root = process.cwd();

    const env = loadEnv(mode, root);

    const viteEnv = wrapperEnv(env);
    const { VITE_PORT, VITE_PUBLIC_PATH, VITE_PROXY, VITE_DROP_CONSOLE } = viteEnv;

    const isBuild = command === 'build';
    return {
        base: VITE_PUBLIC_PATH,
        plugins: createVitePlugins(viteEnv, isBuild),
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
                '~': resolve(__dirname, './'),
                // use alias to support HMR
                '@sc/ui-components': '@sc/ui-components/src',
                '@sc/hooks': '@sc/hooks/src'
            }
        },
        server: {
            host: true,
            port: VITE_PORT,
            proxy: createProxy(VITE_PROXY)
        },
        build: {
            target: 'es2015',
            outDir: 'dist',
            terserOptions: {
                compress: {
                    keep_infinity: true,
                    // Used to delete console in production environment
                    drop_console: VITE_DROP_CONSOLE
                }
            },
            // Turning off brotliSize display can slightly reduce packaging time
            brotliSize: false,
            chunkSizeWarningLimit: 2000
        },
        define: {
            __APP_INFO__: JSON.stringify(__APP_INFO__)
        },
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true,
                    modifyVars: themeVariables
                }
            },
            modules: {
                localsConvention: 'camelCase'
            }
        }
    };
};
