# 立即执行的 watch 与回调执行时机

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

### 回调函数执行时机

在 Vue.js 中还可以使用 flush 选项来执行回调函数执行时机：

```js{23-32}
watch(obj, () => {
    console.log('变化了')
}, {
    // 回调函数会在 watch 创建时立即执行一次
    flush: 'pre' // 还可以指定为 'post' | 'sync'
})
```

当 flush 值为 'post' 时，代表等待 DOM 更新结束后执行。因此，在监听的响应式数据有变化时候，我们需要将副作用函数放到一个微任务队列中执行：

```js
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
            scheduler: () => {
                // 在调度函数中判断 flush 是否为 'post'
                if (options.flush === 'post') {
                    // 如果是，job 放到微任务队列中执行
                    const p = Promise.resolve()
                    p.then(job)
                } else {
                    job()
                }
            }
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

如上代码所示，我们在调度器函数内检测 options.flush 是否为 'post', 如果是，将 job 函数放到微任务队列中，从而实现异步延迟执行；否则直接同步执行 jbo 函数，这本质上相当于 ‘sync’ 的实现机制。

对于 options.flush 值为 'pre' 的情况，我们暂时无法模拟，因为这涉及组件的更新时机。‘pre’ 和 ‘post’ 原本的语义就是组件更新前和更新后。

## 已实现

这一节中我们实现了 watch 的两个特性，立即执行的 watch 与回调函数执行时机。

## 缺陷/待实现

下一节中我们将解决 watch 的竞态问题，如何清理过期的副作用。
