# 12 立即执行的 watch 与回调执行时机
上一节中我们实现了 watch 的基本功能，本节我们继续讨论关于 watch 的两个特性：
* 立即执行的回调函数
* 回调函数执行时机

## 思路
### 立即执行的回调函数
默认情况下，一个 watch 的回调函数只会在响应式数据发生变化时执行。

在 Vue.js 中可以通过选项参数 immediate 来指定回调是否需要立即执行：
```js
watch(obj, () => {
    console.log('变化了')
}, { 
    // 回调函数会在 watch 创建时立即执行一次
    immediate: true 
})
```

仔细思考会发现，回调函数的立即执行与后续执行本质上并没有什么区别，因此我们可以把 scheduler 调度函数封装为一个通用函数，分别在初始化和变更时执行：
```js{11-16,22-23,27-32}
function watch(source, cb, options = {}) {
    let getter
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    let oldValue, newValue

    // 提取 scheduler 为一个独立的 job 函数
    const job = () => {
        newValue = effectFn()
        cb(newValue, oldValue)
        oldValue = newValue
    }

    const effectFn = effect(
        () => getter(),
        {
            lazy: true,
            // 使用 job 作为调度器函数
            scheduler: job
        }
    )

    if (options.immediate) { 
        // 当 immediate 为 true 时，立即执行一次 job，从而触发回调执行
        job()
    } else {
        oldValue = effectFn()
    }
}
```
这样就实现了立即执行回调函数的功能。第一次执行时，新值是 watch 创建时监听的响应式数据的值，旧值是 undefined，这也是符合预期的。