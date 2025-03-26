# watch 的基本实现原理
上一节中我们实现了完整的计算属性功能，这一节开始我们来实现 watch。

## 思路
### watch
所谓 watch，本质就是观测一个响应式数据，数据发生变化时通知并指定响应的回调函数。watch 的实现本质上就是利用了 effect 以及 options.scheduler 选项，下面是最简单的实现：
```js
function watch(source, cb) {
    effect(
        // 读取 source，从而建立联系
        () => source.foo,
        {
            scheduler() {
                // source 有变化时，执行cb
                cb()
                /*
                其实这里应该执行一次传递给 scheduler 的副作用函数，不然无法解决分支切换遗留副作用函数的问题  
                被收集进依赖集合的并会传给 scheduler 的，effect 返回的，都是 effectFn
                调用 effectFn 才是再次依赖收集
                */
            }
        }
    )
}
```

### 递归读取完整对象
然而现在的实现有一个问题，我们硬编码了对 source.foo 的读取，也就是说现在只能监听 obj.foo 的改变。实际上我们希望的是监听的是整个 source 对象的改变，也就是说当 source 对象的任意属性发生变化时，都会触发 cb 的执行。

因此我们需要封装一个通用的读取操作：
```js{3,12-27}
function watch(source, cb) {
    effect(
        () => traverse(source),
        {
            scheduler() {
                cb()
            }
        }
    )
}

function traverse(value, seen = new Set()) {
    // 如果 value 是原始值，或者已经被读取过，则什么都不做
    if (typeof value !== 'object' || value === null || seen.has(value)) {
        return
    }

    // 将 value 添加到 seen 中代表读取过了，避免循环引用引起的死循环
    seen.add(value)

    // 暂时只考虑对象，遍历读取对象每一个属性，递归调用 traverse
    for (const key in value) {
        traverse(value[key], seen)
    }

    return value
}
```
如上述代码所示，在 watch 内部 的 effect 中调用 traverse 函数递归读取对象的每一个属性，使得任意属性发生变化时都能触发回调函数执行。

### 支持接收 getter
watch 函数除了可以观测响应式数据，还支持接收一个 getter 函数。在 getter 函数内部，用户可以指定该 watch 监听哪些响应式数据。：
```js
watch(
    () => source.foo,
    () => {
        console.log('source.foo changed')
    }
)
```

实现这一功能的代码如下：
```js{2-7,10-11}
function watch(source, cb) {
    let getter
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    effect(
        // 直接传 getter 行不行呢
        () => getter(),
        {
            scheduler() {
                cb()
            }
        }
    )
}
```

### 获取新值和旧值
在使用 Vue.js 的 watch 时，有一个非常重要的功能，那就是能够在回调函数中得到变化前后的值：
```js
watch(
    () => source.foo,
    (newVal, oldVal) => {
        console.log('source.foo changed', newVal, oldVal)
    }
)
```
实现这一功能，需要充分利用 effect 函数的 lazy 选项。每次监听的数据更新时手动调用 effect 函数的返回值 effectFn 获取更新后的响应式数据的值，而上一次调用 effectFn 的结果则作为旧值：
```js{9,11-12,16,18-23,28-29}
function watch(source, cb) {
    let getter
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }

    let oldValue, newValue

    // 使用 effect 注册副作用函数，开启 lazy 选项，把返回值储存在 effectFn 中以便之后手动调用
    const effectFn = effect(
        // 直接传 getter 行不行呢
        () => getter(),
        {
            lazy: true,
            scheduler() {
                // 在 scheduler 中重新执行副作用函数，获取新值
                newValue = effectFn()
                // 将新值和旧值作为回调函数的参数
                cb(newValue, oldValue)
                // 更新旧值
                oldValue = newValue
            }
        }
    )

    // 手动调用副作用函数，拿到的就是初始旧值
    oldValue = effectFn()
}
```
上述代码最下面的部分，我们手动调用 effectFn 得到的返回值就是旧值，即第一次执行得到的值。当变化发生并触发 scheduler 调度函数执行时，会重新调用 effectFn 并得到新值。这样我们就拿到了新值和旧值，进而传给回调函数。最后不要忘了用新值更新旧值：oldValue = newValue，毕竟本次更新后的新值也是下一次更新后的旧值。

## 已实现
目前我们实现了 watch 的基本功能，支持监听对象的任意属性变化，也支持接收 getter 函数，并且回调函数中也能获取到监听的数据的新值和旧值。

## 缺陷/待实现
