/**
 * 测试数据 - 包含代码片段的会话数据
 * 用于调试 ChatMessage 组件的样式
 */

export interface ChatMessageData {
  chatId: string
  display_question?: string
  display_answer?: string
  model_name?: string
  status?: 'loading' | 'finished' | 'break'
}

/**
 * 测试会话数据列表
 */
export const testChatData: ChatMessageData[] = [
  {
    chatId: 'test-001',
    display_question: `请帮我优化这段 JavaScript 代码：

\`\`\`javascript
function calculateSum(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}
\`\`\`

有什么可以改进的地方吗？`,
    display_answer: `这段代码可以优化为使用数组的 reduce 方法，代码更简洁：

\`\`\`javascript
function calculateSum(arr) {
  return arr.reduce((sum, num) => sum + num, 0);
}
\`\`\`

**优化说明：**
1. 使用 \`reduce\` 方法，代码更函数式
2. 减少了变量声明
3. 性能基本相同，但代码更易读

如果数组很大，也可以考虑使用 for...of：

\`\`\`javascript
function calculateSum(arr) {
  let sum = 0;
  for (const num of arr) {
    sum += num;
  }
  return sum;
}
\`\`\``,
    model_name: '智谱AI-4.5V',
    status: 'finished',
  },
  {
    chatId: 'test-002',
    display_question: `如何用 Vue 3 实现一个响应式的计数器？请提供完整代码：

\`\`\`vue
<template>
  <div>
    <button @click="increment">+</button>
    <span>{{ count }}</span>
    <button @click="decrement">-</button>
  </div>
</template>
\`\`\`

这个实现有问题吗？`,
    display_answer: `你的代码缺少 script 部分。完整的 Vue 3 实现应该是：

\`\`\`vue
<template>
  <div class="counter">
    <button @click="increment">+</button>
    <span class="count">{{ count }}</span>
    <button @click="decrement">-</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>

<style scoped>
.counter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count {
  font-size: 20px;
  font-weight: bold;
}
</style>
\`\`\`

**关键点：**
1. 使用 \`ref\` 创建响应式数据
2. 修改值时需要使用 \`.value\`
3. 模板中会自动解包，不需要 \`.value\`

如果需要更复杂的功能，可以使用 \`computed\`：

\`\`\`typescript
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)
\`\`\``,
    model_name: '智谱AI-4.5V',
    status: 'finished',
  },
  {
    chatId: 'test-003',
    display_question: `这段 TypeScript 代码有类型错误，请修复：

\`\`\`typescript
interface User {
  name: string;
  age: number;
}

function greet(user: User) {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const user = { name: 'Alice', age: '25' };
greet(user);
\`\`\``,
    display_answer: `问题在于 \`user\` 对象的 \`age\` 属性是字符串类型，但接口要求是数字类型。修复方法：

**方法1：修正数据类型**
\`\`\`typescript
const user = { name: 'Alice', age: 25 }; // 改为数字
greet(user);
\`\`\`

**方法2：使用类型断言（不推荐，除非确定类型）**
\`\`\`typescript
const user = { name: 'Alice', age: '25' } as User;
greet(user);
\`\`\`

**方法3：修改接口定义（如果确实需要字符串）**
\`\`\`typescript
interface User {
  name: string;
  age: string | number; // 允许字符串或数字
}
\`\`\`

**推荐做法：**
使用类型转换确保类型正确：

\`\`\`typescript
const user: User = {
  name: 'Alice',
  age: parseInt('25', 10) // 或 Number('25')
};
greet(user);
\`\`\``,
    model_name: '智谱AI-4.5V',
    status: 'finished',
  },
  {
    chatId: 'test-004',
    display_question: `请解释一下这段 React Hook 代码：

\`\`\`jsx
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\``,
    display_answer: `这段代码展示了 React Hooks 的基本用法。让我详细解释：

**1. useState Hook**
\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`
- \`useState\` 返回一个数组，第一个元素是状态值，第二个是更新函数
- \`0\` 是初始值
- 每次调用 \`setCount\` 都会触发组件重新渲染

**2. useEffect Hook**
\`\`\`jsx
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`
- 第一个参数是副作用函数
- 第二个参数是依赖数组，当 \`count\` 变化时执行
- 相当于类组件的 \`componentDidUpdate\`

**3. 完整示例（带清理函数）**
\`\`\`jsx
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return () => clearInterval(timer); // 清理函数
}, []);
\`\`\`

**优化建议：**
使用函数式更新避免闭包问题：
\`\`\`jsx
<button onClick={() => setCount(prev => prev + 1)}>
  Click me
</button>
\`\`\``,
    model_name: '智谱AI-4.5V',
    status: 'finished',
  },
  {
    chatId: 'test-005',
    display_question: `如何用 CSS 实现一个居中的模态框？请提供代码：

\`\`\`css
.modal {
  /* 你的代码 */
}
\`\`\``,
    display_answer: `有多种方法可以实现居中模态框，以下是几种常用方式：

**方法1：Flexbox（推荐）**
\`\`\`css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}
\`\`\`

**方法2：绝对定位 + transform**
\`\`\`css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}
\`\`\`

**方法3：Grid（现代浏览器）**
\`\`\`css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.5);
}
\`\`\`

**HTML 结构：**
\`\`\`html
<div class="modal-overlay">
  <div class="modal">
    <h2>Modal Title</h2>
    <p>Modal content...</p>
  </div>
</div>
\`\`\``,
    model_name: '智谱AI-4.5V',
    status: 'finished',
  },
]

/**
 * 使用示例：
 * 
 * import { testChatData } from './test-chat-data'
 * 
 * // 在组件中使用
 * const chatList = ref<ChatMessageData[]>(testChatData)
 */

