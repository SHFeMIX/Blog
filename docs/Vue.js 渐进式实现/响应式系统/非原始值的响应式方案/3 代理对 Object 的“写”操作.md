# 代理对 Object 的“写”操作
上一节中，我们实现了对一个 Object 所有可能的读取操作的拦截。

这一节，我们来实现对 Object 的所有“写”操作的拦截。

对一个普通对象所有可能的修改操作有：
* 修改属性值或新增属性：obj.key = newValue。
* 删除属性：delete obj.key。

## 拦截修改和新增属性
对属性的修改和新增对应的陷阱函数都是 set，我们使用它来拦截这两种操作:
```js
function reactive(obj) {
    return new Proxy(obj, {
        set(target, key, value, receiver) {
            // 设置属性值
            const res = Reflect.set(target, key, value, receiver)
            // 触发更新
            trigger(target, key)
            
            return res
        }
    })
}
```

### 对 for...in 的影响
当为对象添加属性时，会对 for...in 循环产生影响。

根据上一节的内容，for...in 循环是在副作用函数与 ITERATE_KEY 之间建立联系。因此当新增属性时，需要额外触发与 ITERATE_KEY 相关联的副作用函数重新执行。

修改和新增对象的属性都是使用 set 陷阱函数拦截，但是只有新增属性会影响 for..in 的结果。

因此我们需要在 set 函数中区分具体是修改还是新增，只有新增才需要触发与 ITERATE_KEY 相关联的副作用函数重新执行：
```js{4-5,9-10,30-38}
function reactive(obj) {
    return new Proxy(obj, {
        set(target, key, value, receiver) {
            // 如果属性不存在，说明是添加新属性，否则是修改已有属性
            const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'

            const res = Reflect.set(target, key, value, receiver)

            // 将 type 作为第三个参数传给 trigger 函数
            trigger(target, key, type)

            return res
        }
    })
}

function trigger(target, key, type) {
    const depsMap = bucket.get(target)
    if (!depsMap) return

    const effects = depsMap.get(key)
    const effectsToRun = new Set()

    effects?.forEach(effectFn => {
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
        }
    })

    // 当 type 为 ADD 时，把与 ITERATE_KEY 相关联的副作用函数也加入到 effectsToRun 中
    if (type === 'ADD') {
        const iterateEffects = depsMap.get(ITERATE_KEY)
        iterateEffects?.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }
    
    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}
```
如上述代码所示，我们使用 Object.prototype.hasOwnProperty 检查当前操作的属性是否已存在于随想上。如果存在，当前操作类型为 ‘SET’，即修改属性值；否则操作类型为 ‘ADD’，即新增属性。最后，把type 也传递给 trigger 函数。

在trigger 函数中，当操作类型 type 为  ADD 时，把与 ITERATE_KEY 相关联的副作用函数也加入到 effectsToRun 中。这样，只有当新增属性时，才会触发与 ITERATE_KEY 相关联的副作用函数重新执行。

## 拦截删除属性
如何代理 delete 操作符呢？还是看规范，规范的 13.5.1.2 节中明确定义了 delete 操作符的行为（太长了不放了）。

由此可知，delete 操作符的行为依赖 [[Delete]] 内部方法，该内部方法使用 deteleProperty 陷阱函数拦截：
```js{15-28,45-46}
function reactive(obj) {
    return new Proxy(obj, {
        set(target, key, value, receiver) {
            // 如果属性不存在，说明是添加新属性，否则是修改已有属性
            const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'

            const res = Reflect.set(target, key, value, receiver)

            // 将 type 作为第三个参数传给 trigger 函数
            trigger(target, key, type)

            return res
        },

        deleteProperty(target, key) {
            // 检查被操作属性是否是对象自己的属性
            const hasKey = Object.prototype.hasOwnProperty.call(target, key)

            // 使用 Reflect.deleteProperty 删除属性
            const res = Reflect.deleteProperty(target, key)

            // 只有当被删除的属性是对象自己的属性并且成功删除时，才触发更新
            if (hasKey && res) {
                trigger(target, key, 'DELETE')
            }

            return res
        }
    })
}

function trigger(target, key, type) {
    const depsMap = bucket.get(target)
    if (!depsMap) return

    const effects = depsMap.get(key)
    const effectsToRun = new Set()

    effects?.forEach(effectFn => {
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
        }
    })

    // 当 type 为 ADD 或 DELETE 时，把与 ITERATE_KEY 相关联的副作用函数也加入到 effectsToRun 中
    if (type === 'ADD' || type === 'DELETE') {
        const iterateEffects = depsMap.get(ITERATE_KEY)
        iterateEffects?.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }
    
    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}
```
如上述代码所示，首先检查被删除的属性是否属于对象自身，然后调用 Reflect.deleteProperty 删除属性，只有当两步的结果都满足条件时，才调用 trigger 函数触发更新。

需要注意的是，删除属性操作一样会改变 for...in 循环的结果。因此在调用 trigger 函数时，我们传递了新的操作类型 ‘DELETE’。

在 trigger 函数中，我们添加了 type === 'DELETE' 的判断。这样一来，当操作类型为 ‘DELETE’ 时，也会触发那些与  ITERATE_KEY 相关联的副作用函数重新执行。

## 已实现
只一节中我们实现了拦截对一个 Object 所有可能的“写”操作。

至此，我们已经实现了对一个 Object 完整的代理，可以拦截所有“读”和“写”操作。

## 缺陷/待实现
下一节中我们将讨论如何更合理的触发响应，比如当值没有变化时不触发更新，又或者是访问原型上的属性的情况。