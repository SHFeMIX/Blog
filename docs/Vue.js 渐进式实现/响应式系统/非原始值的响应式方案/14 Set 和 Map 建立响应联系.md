# Set 和 Map 建立响应联系
了解了为 Set 和 Map 类型数据创建代理时的注意事项之后，我们就可以着手实现 Set 类型数据的响应式方案了。

## 思路
以下面代码为例：
```js
const p = reactive(new Set([1, 2, 3]))

effect(() => {
    console.log(p.size)
})

p.add(4) // 应触发响应
```
这段代码展示了响应式 Set 类型数据的工作方式。首先，在副作用函数内访问了 p.size 属性；接着调用 p.add 函数向集合中添加元素。由于这个行为会间接改变集合的 size 属性值，因此我们期望副作用函数重新执行。

为了实现这个目标，我们需要在访问 size 属性时调用 track 函数进行依赖追踪，在 add 方法执行时调用 trigger 函数触发响应。

### size 属性
下面代码展示了如何进行依赖追踪：
```js
const s = new Set([1, 2, 3])
const p = new Proxy(s, {
    get(target, key, receiver) {
        if (key === 'size') {
            // 调用 track 函数建立响应联系
            track(target, ITERATE_KEY)
            return Reflect.get(target, key, target)
        }

        return target[key].bind(target)
    }
})
```
这里需要注意的是，响应联系需建立在 ITERATE_KEY 与副作用函数之间，因为任何新增、删除操作都会影响 size 属性值。

### add 和 delete 方法
接下来我们来看如何触发响应。

当调用 add 方法向集合中添加新元素时，应该如何触发响应呢？很显然，需要我们自定义一个新 add 方法才行：
```js
// 定义一个新对象，将自定义的 add 方法定义到该对象下
const mutableInstrumentations = {
    add(key) { /* ... */ }
}

const p = new Proxy(s, {
    get(target, key, receiver) {
        // 如果读取的是 raw 属性，则返回原始数据对象 target
        if (key === 'raw') return target

        if (key === 'size') {
            // 调用 track 函数建立响应联系
            track(target, ITERATE_KEY)
            return Reflect.get(target, key, target)
        }

        // 返回定义在 mutableInstrumentations 对象下的方法
        return mutableInstrumentations[key]
    }
})
```
首先定义一个对象 mutableInstrumentations，我们会将所有自定义实现的方法都定义到该对象下。然后，在 get 拦截函数内返回定义在 mutableInstrumentations 对象下的方法。这样，当调用 p.add 时，调用的就会是我们自定义实现的新 add 方法。

有了自定义实现的方法后，就可以在其中调用 trigger 函数触发响应了：
```js
const mutableInstrumentations = {
    add(key) {
        // this 仍指向代理对象，通过 raw 属性获取原始数据对象
        const target = this.raw
        // 先判断值是否存在
        const hadKey = target.has(key)
        // 通过原始数据对象执行 add 方法
        const res = target.add(key)
        // 只有值不存在时，才需要触发响应
        if (!hadKey) {
            // 调用 trigger 函数触发响应，并指定操作类型为 ADD
            trigger(target, key， "ADD")
        }
        // 返回操作结果
        return res
    }
}
```
如上代码所示，自定义 add 函数内 this 仍然指向代理对象，所以通过 this.raw 获取原始数据对象，并通过它调用 add 方法。待添加完成后，调用 trigger 函数触发响应。并指定操作类型为 ADD。

在 trigger 函数中，当操作类型是 ADD 或 DELETE 时，会取出与 ITERATE_KEY 相关联的副作用函数并执行，这样就可以触发访问了 size 属性的副作用函数重新执行。

在此基础上，我们可以按照类似思路轻松实现自定义的 delete 方法：
```js
const mutableInstrumentations = {
    delete(key) {
        const target = this.raw
        const hadKey = target.has(key)
        const res = target.delete(key)
        if (hadKey) {
            trigger(target, key, "DELETE")
        }
        return res
    }
}
```

## 已实现
本节中，我们介绍了如何为 Set 和 Map 类型数据建立响应联系。

当访问 size 属性时，需要调用 track 函数，以 ITERATE_KEY 为 key 建立响应联系。

当调用 add 和 delete 方法时，调用我们自定义实现的新方法，在新方法中加入了调用 trigger 函数触发响应的逻辑，且操作类型分别是 ADD 和 DELETE。

## 缺陷/待实现
下一节中，我们将讲解 “避免污染原始数据” 问题及其原因。