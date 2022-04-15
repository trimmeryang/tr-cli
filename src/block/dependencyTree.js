const dependencyTree = require('dependency-tree');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
/**
 *
 * @param {*} pkg
 */
const getVersion = (pkg) => {
  const pkgPath = path.join(process.cwd(), `node_modules/${pkg}/package.json`);
  if (!fs.existsSync(pkgPath)) {
    console.warn(`%s 不存在这个包: ${pkg}`, chalk.yellow.bold('ERROR'));
    return false;
  }

  return require(pkgPath).version;
};

/**
 *
 * @param {*} treeList
 * nodeModulesTree: 1级node_modules   externalTree: 外部文件
 * @return {nodeModulesTree: string[], externalTree: string[]}
 */
const formatTree = (treeList, sourceDir) => {
  let nodeModulesTree = [];
  let externalTree = [];
  let internalTree = [];
  const nodeModulesDir = path.join(process.cwd(), `node_modules`);

  treeList.forEach((i) => {
    if (i.includes('node_modules')) {
      i = i.replace(`${nodeModulesDir}/`, '');
      const pathArr = i.split('/');
      // path 解析不对
      if (pathArr.length < 2) {
        return;
      }

      // 如果存在type定义
      if (pathArr[0] === '@types') {
        //加入type包
        nodeModulesTree.push(`@types/${pathArr[1]}`);
        // 加入原始包
        nodeModulesTree.push(`${pathArr[1]}`);
        return;
      }

      // 如果存在scope包
      if (pathArr[0] && pathArr[0].startsWith('@')) {
        return nodeModulesTree.push(`${pathArr[0]}/${pathArr[1]}`);
      }

      return nodeModulesTree.push(pathArr[0]);
    }

    if (!i.includes(sourceDir)) {
      return externalTree.push(i);
    }

    internalTree.push(i);
  });

  externalTree = [...new Set(externalTree)];

  /**
   * format dependencies
   * {
   *    pkg: "0.1.1"
   * }
   */
  nodeModulesTree = [...new Set(nodeModulesTree)];
  const dependencies = {};
  nodeModulesTree.forEach((key) => {
    const version = getVersion(key);
    version && (dependencies[key] = getVersion(key));
  });

  /**
   * 获取其他区块的依赖
   * 当外部文件中，存在.tsx且有package.json, 就表明有依赖关系
   */
  externalTree.forEach((ex) => {
    if (ex.endsWith('.tsx')) {
      const arr = ex.split('/');
      arr.splice(arr.length - 1, 1, 'package.json');
      const path = arr.join('/');
      if (fs.existsSync(path)) {
        const pkg = require(path);
        dependencies[pkg.name] = pkg.version;
      }
    }
  });

  return {
    dependencies,
    externalTree,
    internalTree
  };
};

/**
 * 获取依赖树
 * @param {*} sourceDir
 */
const getTree = (sourceDir) => {
  const treeList = dependencyTree.toList({
    filename: `${sourceDir}/index.ts`,
    directory: sourceDir,
    // requireConfig: 'path/to/requirejs/config', // optional
    // webpackConfig: path.join(process.cwd(), './node_modules/@mlamp/hulu-vine/es/config.prod.js'), // optional
    tsConfig: path.join(process.cwd(), 'tsconfig.json'), // optional
    nodeModulesConfig: {
      entry: 'module'
    }, // optional
    filter: (path, prePath) => {
      // 只获取一级node_modules
      return !prePath.includes('node_modules');
    }, // optional
    nonExistent: [], // optional
    noTypeDefinitions: true // optional
  });

  return formatTree(treeList, sourceDir);
};

module.exports = {
  getTree
};
