# 如何代理 Set 和 Map
上一节中，我们已经完全实现了针对数组的响应式方案。本节开始，我们将介绍如何代理集合类型，包括 Map/Set 和 WeakMap/WeakSet。

Set 和 Map 类型的数据有特定的属性和方法用来操作自身，这一点与普通对象不同，如下面代码所示：
```js
// 普通对象的读取和设置操作
const obj = { foo: 1 }
obj.foo // 读取
obj.foo = 2 // 设置

// 操作 Map 数据
const map = new Map()
map.set('key', 1) // 设置数据
map.get('key') // 读取数据
```

正是因为这些差异，不能像代理普通对象一样代理 Map 和 Set。

但是整体思路不变，依然是在读取操作发生时调用 track 函数建立联系；在设置操作发生时，调用 trigger 函数触发更新。例如：
```js
const proxy = reactive(new Map([['key', 1]]))

effect(() => {
  console.log(proxy.get('key')) // 读取键为 key 的值
})

proxy.set('key', 2) // 修改键为 key 的值，应该触发响应，再次打印
```
这就是我们想实现的目标。

## 代理集合类型数据注意事项
### size 访问器属性
先来看下面一段代码：
```js
const s = new Set([1, 2, 3])
const p = new Proxy(s, {})

console.log(p.size) // 报错 TypeError: Method get Set.prototype.size called on incompatible receiver
```
这段代码中，首先定义了一个 Set 类型数据 s，接着为它创建代理，最后通过代理对象读取 size 属性获取元素的数量。不幸的是我们得到一个错误。

通过查阅规范，我们发现，Set.prototype.size 是一个访问器属性，而它在执行过程中会检测当前的 this 值内部是都存在内部槽 [[SetData]]，如果不存在就会抛出错误。由于我们是通过代理对象 p 来访问 size 属性，所以 this 自然就是代理对象，而代理对象不存在 [[SetData]] 这个内部槽，因此报错。

为了修复这个问题，我们需要修正防蚊器属性的 getter 函数执行时的 this 指向：
```js
const s = new Set([1, 2, 3])
const p = new Proxy(s, {
    get(target, key, receiver) {
        if (key === 'size') {
            // 如果访问的是 size 属性，
            // Refelct 第三个参数传入 target，用来指定 getter 执行时 this 为 原对象
            return Reflect.get(target, key, target)
            // 直接 return target.size 行不行
        }
        return Reflect.get(target, key, receiver)
    }
})
```
上面这段代码中，我们在 get 拦截函数中判断访问的是不是 size 属性。如果是，则在调用 Reflect.get 函数时执行第三个参数为原始 Set 对象，使得 getter 函数执行时 this 指向原始 Set 对象。由于 原始 Set 对象上存在内部槽 [[SetData]]，因此程序得以正确运行。

### delete 函数
接着，我们再尝试从 Set 中删除元素：
```js
const s = new Set([1, 2, 3])
const p = new Proxy(s, {
    get(target, key, receiver) {
        if (key === 'size') {
            return Reflect.get(target, key, target)
        }
        return Reflect.get(target, key, receiver)
    }
})

p.delete(1) // 报错：TypeError: Method Set.prototype.delete called on incompatible receiver [object Object]
```
可以看到，在代理对象 p 上调用 delete 方法会得到一个错误，与前文讲解的 访问 p.size 时发生的错误非常相似。

实际上，访问 p.size 与 访问 p.delete 是不同的。p.size 是一个属性，一个访问器属性，而 p.delete 是一个方法。

当访问 p.size 时，访问器属性的 getter 函数会立即调用，因此可以通过修改 receiver 来改变 getter 函数的 this 指向。

而当访问 p.delete 时，delete 方法并没有执行，真正使其执行的语句是 p.delete(1)。因此无论怎么修改，delete 方法执行时的 this 指向都是代理对象 p。

想修复这个问题也不难。通过代理对象访问 delete 函数时，只需要把 delete 方法与原始 Set 对象绑定再返回即可。这样无论之后怎么调用，delete 方法的 this 值永远指向原始数据对象。
```js
const s = new Set([1, 2, 3])
const p = new Proxy(s, {
    get(target, key, receiver) {
        if (key === 'size') {
            return Reflect.get(target, key, target)
        }

        if (key === 'delete') {
            return target[key].bind(target)
        }
        
        return Reflect.get(target, key, receiver)
    }
})
```

## 已实现
本节中，我们了解了代理 Set 和 Map 与代理普通对象有一定的差异，因为集合数据类型有特定的属性和方法来操作自身。

比如 size 属性，不能直接通过代理对象访问，因为它是一个访问器属性，需要通过 receiver 来指定 getter 函数执行时的 this 指向为原对象。

还有 delete 方法，也不能通过代理对象直接访问并执行，因为它执行时 this 值也必须是 Set 对象。因此我们在代理时将它与原对象绑定再返回，保证 this 值永远是原始 Set 对象。

## 缺陷/待实现
了解了为 Set 和 Map 类型数据创建代理时的注意事项之后，下一节我们就可以开始着手实现 Set 类型数据的响应式方案了。