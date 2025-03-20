# 懒执行的 effect
上一节中我们为 effect 函数新增一个参数 options，实现了副作用函数的调度执行。这一节我们来实现懒执行的副作用函数，同样利用 options 参数。

## 思路
### 什么是懒执行的 effect
懒执行的 effect，即 lazy 的 effect，指的是有些场景下，我们不希望调用 effect 函数后立刻执行传入的副作用函数，而是等到真正需要的时候再执行。

为此，我们可以为 effect 的options 参数添加一个 lazy 选项。有了它，我们就可以修改 effect 函数的实现逻辑，当 options.lazy 为 true 时，则不立即执行副作用函数
```js{14-18}
function effect(fn, options = {}) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn
        effectStack.push(effectFn)
        fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
    }

    effectFn.options = options
    effectFn.deops = []

    if (!options.lazy) {
        effectFn()
    }

    return effectFn
}
```
通过判断 options.lazy，实现了让副作用函数不立即执行的功能。但是到底什么时候执行呢？

从上述代码可以看出，我们将 包装了真实副作用函数 fn 的 effectFn 函数返回，这样外部就能拿到effectFn，在需要的时候手动调用。
```js
const effectFn = effect(() => cosole.log('lazy effect'), { lazy: true })

// 在需要的时候手动执行
effectFn()
```
### 把副作用函数看作 getter
仅仅能手动执行副作用函数看起来意义不大。

我们如果把副作用函数看成一个 getter，并且希望手动执行的时候获取到它的返回值：
```js
const effectFn = effect(
    // getter 返回 obj.foo 与 obj.bar 的和
    () => obj.foo + obj.bar,
    { lazy: true }
)

// value 是 getter 的返回值
const value = effectFn()
```

为了实现这一目标，我们需要再对 effect 函数做一些修改
```js{6-7,10-11}
function effect(fn, options = {}) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn
        effectStack.push(effectFn)
        // 执行原始副作用函数并把结果存储在 res 中
        const res = fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
        // 将 res 作为 effectFn 的返回值
        return res
    }

    effectFn.options = options
    effectFn.deops = []

    if (!options.lazy) {
        effectFn()
    }

    return effectFn
}
```
传递给 effect 函数的参数 fn 才是真正的副作用函数。现在我们实现了在外部手动调用 effect 函数的返回值 effectFn 时能获取到真实副作用函数 fn 的返回值（调用 effect 获取到 effectFn ，调用effectFn 获取到 fn 的返回值）。

## 已实现
现在我们已经能够实现懒执行的副作用函数，并且能够拿到副作用函数的执行结果了。

## 缺陷/待实现
做这么多，其实目的就是一个☝️：实现计算属性。