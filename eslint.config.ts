import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginOxlint from 'eslint-plugin-oxlint'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  skipFormatting,

  ...pluginOxlint.configs['flat/recommended'],

  // 将未使用变量的错误改为警告
  {
    rules: {
      // TypeScript ESLint 未使用变量规则
      '@typescript-eslint/no-unused-vars': 'warn',
      // 标准 ESLint 未使用变量规则
      'no-unused-vars': 'warn',
      // 确保 Vue script setup 中的变量使用被正确识别
      'vue/script-setup-uses-vars': 'error',
    },
  },
)
