# for...in 遍历数组
这一节开始我们将实现对遍历数组操作的代理。

既然数组也是对象，就意味着同样可以使用 for...in 循环遍历：
```js
const arr = reactive(['foo'])

effect(() => {
    for (const key in arr) {
        console.log(key) // 0
    }
})
```

虽然我们应该尽量避免使用 for...in 循环遍历数组，但既然在语法上是可行的，那么当然也要考虑如何正确代理。

## 思路
前面我们说道，数组和普通对象的不同仅体现在 [[DefineOwnProperty]] 这个内部方法上，因此使用 for...in 循环遍历数组与遍历常规对象并无差异，同样可以使用 ownKeys 拦截函数进行拦截：
```js
function createReactive(obj, isShallow = false. isReadonly = false) {
    return new Proxy(obj, {
        ownKeys(target) {
            track(target, ITERATE_KEY)
            return Reflect.ownKeys(target)
        }
    })
}
```
这段代码是我们目前的实现，为了追踪对普通对象的 for...in 操作，人为创造了 ITERATE_KEY 作为追踪的key。对于普通对象来说，只有当添加或删除属性时才会影响 for...in 循环的结果，所以当添加或删除操作发生时，我们需要取出与 ITERATE_KEY 相关联的副作用函数重新执行。

然而对于数组，情况有所不同，我们看看哪些操作会影响 for...in 循环对数组的遍历结果：
* 添加新元素：arr[100] = 'bar'。
* 修改数组长度：arr.length = 0。

其实，无论是添加新元素还是直接修改数组长度，本质上都是因为修改了数组的 length 属性。一旦数组的 length 属性被修改，那么 for...in 循环对数组的遍历结果就会改变，所以这时我们应该触发响应。

因此，我们可以在 ownKeys 拦截函数内判断当前操作目标是否是数组，如果是，则使用 length 作为 key 去建立响应联系：
```js{4}
function createReactive(obj, isShallow = false. isReadonly = false) {
    return new Proxy(obj, {
        ownKeys(target) {
            track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
            return Reflect.ownKeys(target)
        }
    })
}
```

## 已实现
通过这一节我们知道了，本质上有且只有数组的 length 属性变化了，for...in 循环遍历数组的结果就会改变。

因此在 ownKeys 拦截函数中，我们判断如果当前操作目标如果是数组，就把副作用函数添加到 ‘length’ 这个 key 的副作用集合中。这样就实现了 length 属性一改变，内部使用了 for...in 循环遍历数组的副作用函数会重新执行。

## 缺陷/待实现
下一节中我们将讨论如何正确代理 for...of 循环对数组的遍历。