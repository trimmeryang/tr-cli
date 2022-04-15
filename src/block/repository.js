const axios = require('axios');
const { SCOPE_NAME, NPM_REGISTRY } = require('./const');

// http://verdaccio.npm.mlamp.cn/-/verdaccio/data/sidebar/@yuntai-block/brand
const getPackageInfo = async (name) => {
  try {
    const response = await axios.get(`${NPM_REGISTRY}/-/verdaccio/data/sidebar/${SCOPE_NAME}/${name}`);
    return response.data;
  } catch (e) {
    /**
     * 确保永远返回值
     */
    return {
      latest: {}
    };
  }
};

module.exports = {
  getPackageInfo
};
