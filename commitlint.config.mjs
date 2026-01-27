/**
 * Commitlint 配置
 * @see https://commitlint.js.org/
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档更新
        'style', // 代码格式（不影响代码运行）
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 测试相关
        'build', // 构建系统或外部依赖
        'ci', // CI 配置
        'chore', // 其他不修改 src 或测试文件的更改
        'revert', // 回滚提交
      ],
    ],
    // 主题不能为空
    'subject-empty': [2, 'never'],
    // 类型不能为空
    'type-empty': [2, 'never'],
    // 主题大小写不做限制
    'subject-case': [0],
  },
};
