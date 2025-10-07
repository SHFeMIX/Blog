# for...of 遍历数组

上一节讲解了如何代理使用 for...in 遍历数组，接下来我们再看看使用 for...of 遍历数组的情况。

与 for...in 不同，for...of 是用来遍历可迭代对象的，因此我们需要先搞清楚什么是可迭代对象。

## 思路

### 可迭代对象

ES2015 为 JavaScript 定义了迭代协议。

具体来说，一个对象能否被迭代，取决于该对象或者该对象的原型是否实现了 @@iterator 方法。这里的 @@[name] 标志在 ESMAScript 规范里用来代指 JavaScript 内建的 symbols 值，例如 @@iterator 就是 Symbol.iterator。

如果一个对象实现了 Symbol.iterator 方法，那么该对象就是一个可迭代对象:

```js
const obj = {
    val: 0,
    [Symbol.iterator]() {
        return {
            next() {
                return {
                    value: obj.val ++
                    done: obj.val > 10
                }
            }
        }
    }
}

for (const alue of obj) {
    console.log(value) // 0 1 2 3 4 5 6 7 8 9 10
}
```

而数组就内建了 Symbol.iterator 方法，可以做一个实验：

```js
const arr = [1, 2, 3]

// 获取并调用数组内建的迭代器方法
const iterator = arr[Symbol.iterator]()

console.log(iterator.next()) // { value: 1, done: false }
console.log(iterator.next()) // { value: 2, done: false }
console.log(iterator.next()) // { value: 3, done: false }
console.log(iterator.next()) // { value: undefined, done: true }
```

### 拦截 for...of

想要对数组进行 for..of 遍历操作的拦截，关键点在于找到 for...of 操作依赖的基本语义，相关内容在规范的 23.1.5.1 节中（太长了不放了）。可以看到，数组迭代器的执行会读取数组的 length 属性，如果迭代的是数组元素值，还会读取数组的索引。

因此，只需要在副作用函数与数组的 length 属性和索引之间建立响应联系，就能够实现拦截 for...of 遍历数组的操作。

我们目前的实现已经完全可以实现这一点，因为 for...of 迭代内部就会读取数组的 length 和索引，自然会被收集进相关的依赖集合中：

```js
const arr = reactive([1, 2, 3])

effect(() => {
    for (const val of arr) {
        console.log(val)
    }
})

arr[1] = 'bar' // 能够触发响应
arr.length = 0 // 能够触发响应
```

### values 方法

还有一点不得不提，数组的 values 方法的返回值就是数组内建的迭代器：

```js
console.log(Array.prototype.values === Array.prototype[Symbol.iterator]) // true
```

因此，在不增加任何代码的情况下，目前我们的实现也能够让数组的迭代器方法正确地工作：

```js
const arr = reactive([1, 2, 3])

effect(() => {
    for (const val of arr.values()) {
        console.log(val)
    }
})

arr[1] = 'bar' // 能够触发响应
arr.length = 0 // 能够触发响应
```

### 避免追踪对 symbol 的读取

最后要指出的是，无论使用 for...of 还是调用 values 等方法，它们都会读取数组的 Symbol.iterator 属性。

为了避免发生意外的错误，以及性能上的考虑，我们不应该在副作用函数与 symbol 值之间建立响应联系，因此需要修改 get 拦截函数：

```js{4-7}
function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy(obj, {
        get(target, key, receiver) {
            // 如果 key 的类型是 symbol，则不进行追踪
            if (!isReadonly && typeof key !== 'symbol') {
                track(target, key)
            }

            const res = Reflect.get(target, key, receiver)

            if (isShallow) {
                return res
            }

            if (typeof res === 'object' && res !== null) {
                return isReadonly ? readonly(res) : reactive(res)
            }

            return res
        }
    })
}
```

## 已实现

这一节中，我们首先研究了什么是可迭代对象，因为 for...of 是用来遍历可迭代对象的。

接下来，我们查看了规范中规定的 for...of 的基本语义，进而发现不用增加任何代码，现有的实现已经支持拦截 for...of 遍历数组的操作了。

会使得 for...of 遍历数组结果改变的，只有数组的 length 属性和索引。而根据 for...of 的基本语义，其内部已经读取了数组的 length 和索引，自然会正确地建立响应联系，无需我们额外处理。

最后，我们修改了 get 拦截函数，不追踪对 symbol 的读取，避免发生错误和性能问题。

## 缺陷/待实现

下一节中，我们将实现拦截数组的查找方法，包括 includes、indexOf 和 lastIndexOf。
