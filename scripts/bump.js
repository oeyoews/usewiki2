// bump package version and add git tag
const { execSync } = require('child_process');

// 1. 首先，确保您已经对软件包进行了修改或更新。

// 2. 接下来，使用 npm 或 yarn 命令来升级软件包的版本。
const versionBumpCommand = 'pnpm version patch'; // 或 'yarn version patch';

try {
  // 执行命令以升级软件包版本
  execSync(versionBumpCommand);

  // 添加一个 Git 标签
  const tagName = execSync('git describe --tags --abbrev=0').toString().trim();
  execSync(`git tag -a ${tagName} -m "Version ${tagName}"`);

  // 将更改推送到远程仓库
  execSync('git push origin master --tags');

  console.log('成功升级软件包版本并添加了 Git 标签。');
} catch (error) {
  console.error('出现错误：', error);
}
