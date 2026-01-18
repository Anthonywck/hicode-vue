/*
 * @Author       : lingang
 * @Date         : 2024-07-17 11:31:55
 * @Description  :
 */
import { resolve } from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import prompts from 'prompts';

let targetDir = resolve(process.cwd(), '../hicode');

console.log(targetDir);
console.log(chalk.green('开始拷贝...'));
console.log();

if (!fs.pathExistsSync(targetDir)) {
  console.log(chalk.red('目标目录地址不存在，请手动输入.\n'));

  prompts({
    type: 'text',
    name: 'targetDir',
    message: '请输入目标目录绝对地址',
  }).then((answer) => {
    if (!fs.pathExistsSync(answer.targetDir)) {
      console.log(chalk.red('目标目录地址错误.\n'));
      process.exit(1);
    }
    console.log(chalk.blue('目标目录:'), chalk.blue(answer.targetDir));
    console.log();

    copyFiles(answer.targetDir);
  });
} else {
  console.log(chalk.blue('目标目录::'), chalk.blue(targetDir));
  console.log();

  copyFiles(targetDir);
}

function copyFiles(targetDir) {
  // 清空目标目录
  fs.emptyDirSync(targetDir + '/media');
  // 创建lib目录
  fs.ensureDirSync(targetDir + '/media');
  // 拷贝文件至目标目录
  fs.copySync(resolve(process.cwd(), 'media'), targetDir + '/media');
  console.log(chalk.green('已把media目录，拷贝到', chalk.blue(targetDir), '下，拷贝成功!'));
  console.log();

  // 退出
  process.exit(0);
}

