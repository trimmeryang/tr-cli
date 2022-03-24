# 代码规范

## Getting Started

Install dependencies,

```bash
$ yarn
```

Start the dev server,

```bash
$ yarn start
```

# 以下文件夹不允许修改
修改后，可能造成tr-cli更新后项目启动失败
- core

# 代码提交规范
- `feat` 新功能、新特性
- `fix` 修改 bug
- `perf` 更改代码，以提高性能
- `refactor` 代码重构（重构，在不影响代码内部行为、功能下的代码修改）
- `docs` 文档修改
- `style` 代码格式修改, 注意不是 css 修改（例如分号修改）
- `test` 测试用例新增、修改
- `build` 影响项目构建或依赖项修改
- `revert` 恢复上一次提交
- `ci` 持续集成相关文件修改
- `chore` 其他修改（不在上述类型中的修改）