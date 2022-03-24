const fs = require('fs');

// the array which is used to check the root directory
const fileList = ['package.json'];

const isRootDir = () => {
  // if the fileList exists in the directory, the current working directory is fine
  const files = fs.readdirSync(process.cwd());
  return fileList.every((r) => files.includes(r));
};

module.exports = {
  isRootDir
};
