# 数组的索引与 length
上一节说过，目前我们的响应式系统，在通过数组的索引访问元素值时，已经能够建立响应联系了：
```js
const arr = reactive([1, 2, 3])

effect(() => {
  console.log(arr[0])
})

arr[0] = 'bar' // 能够触发响应
```
但是通过索引设置数组的元素值与设置对象的属性值仍存在根本的差别，这是因为数组的内部方法 [[DefineOwnProperty]] 不同于常规对象。

## 思路
### 设置索引触发 length 修改
实际上，当我们通过索引设置数组元素的值时，会执行数组对象所部署的内部方法 [[Set]]，而其内部其实依赖于  [[DefineOwnProperty]] 方法。

[[DefineOwnProperty]] 方法的逻辑定义在规范的 10.4.2.1 节（太长了不放了）。规范中明确说明，如果设置的索引值大于当前数组的长度，那么会更新 length 属性。

因此在触发响应时，也应该触发与 length 属性相关联的副作用函数重新执行：
```js
const arr = reactive(['foo'])

effect(() => {
  console.log(arr.length)
})

// 设置索引 1 的值，会导致数组长度变为 2
arr[1] = 'bar'
```

这段代码中，因为数组长度只有 1，因此设置索引 1 的值会导致数组长度变为 2，应触发副作用函数重新执行。

目前的实现还做不到这一点，为此我们需要修改 set 拦截函数：
```js{11-17}
function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy(obj, {
        set(target, key, value, receiver) {
            if (isReadonly) {
                console.warn(`属性 ${key} 是只读的`)
                return true
            }

            const oldVal = target[key]

            // 如果代理目标是数组，则检测被设置的索引是否小于数组长度
            // 如果是，则视作 SET 操作，否则是 ADD 操作
            const type = Array.isArray(target)
                ? Number(key) < target.length ? 'SET' : 'ADD'
                : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'

            const res = Reflect.set(target, key, value, receiver)

            if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
            trigger(target, key, type)
            }   

            return res
        }
    })
}
```
我们在判断操作类型时，新增对数组类型的判断。当代理的目标对象是数组时，如果被设置的索引值大雨数组长度，会视为 ADD 操作，因为它会改变 length 属性值；否则视为 SET 操作。

有了这些信息，我们就可以在 trigger 函数中正确地触发与数组对象 length 属性相关联的副作用函数重新执行了：
```js{24-33}
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

    if (type === 'ADD' && Array.isArray(target)) {
        // 取出与 length 相关联的副作用函数
        const lengthEffect = depsMap.get('length')
        // 将这些副作用函数添加到 effectsToRun
        lengthEffect?.forEach(effectFn => {
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

### 修改 length 对元素值的影响
反过来思考，其实修数组的 length 属性也会影响数组元素：
```js
const arr = reactive(['foo'])

effect(() => {
  console.log(arr[0])
})

arr.length = 0 // 将数组长度改为 0，导致第 0 个元素被删除，理应触发响应
```

当修改 length 属性值时，会删除那些索引值大于等于新 length 值的元素，因此需要为它们触发响应。为了实现目标，我们需要修改 set 拦截函数，在调用 trigger 函数触发响应时，把新属性值传递过去：
```js{18-19}
function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy(obj, {
        set(target, key, value, receiver) {
            if (isReadonly) {
                console.warn(`属性 ${key} 是只读的`)
                return true
            }

            const oldVal = target[key]

            const type = Array.isArray(target)
                ? Number(key) < target.length ? 'SET' : 'ADD'
                : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD' 

            const res = Reflect.set(target, key, value, receiver)

            if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                // 增加第四个参数，即触发响应的新值
                trigger(target, key, type, newVal)
            }  

            return res
        }
    })
}
```

接着，我们还需要修改 trigger 函数：
```js{1-2,33-45}
// 为 trigger 函数新增第四个参数 newVal，即新值
function trigger(target, key, type, newVal) {
    const depsMap = bucket.get(target)
    if (!depsMap) return

    const effects = depsMap.get(key)
    const effectsToRun = new Set()

    effects?.forEach(effectFn => {
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
        }
    })

    if (type === 'ADD' || type === 'DELETE') {
        const iterateEffects = depsMap.get(ITERATE_KEY)
        iterateEffects?.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }

    if (type === 'ADD' && Array.isArray(target)) {
        const lengthEffect = depsMap.get('length')
        lengthEffect?.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn)
            }
        })
    }

    // 如果操作目标是数组，并且修改的是 length 属性
    if (Array.isArray(target) && key === 'length') {
        // 将所有索引大于等于新 length 的元素相关联的副作用函数添加到 effectsToRun
        depsMap.forEach((effects, key) => {
            if (key >= newVal) {
                effects.forEach(effectFn => {
                    if (effectFn !== activeEffect) {
                        effectsToRun.add(effectFn)
                    }
                })
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
如上代码所示，在 trigger 函数中判断如果操作目标是数组并且修改的 length 属性，就找到所有索引值大于等于新 length 的元素，然后把它们相关联的副作用函数取出并执行。

## 已实现
我们在已有响应式系统的基础上实现了专门针对数组索引与 length 的代理：
* 设置大于数组长度的索引值时，会造成 length 属性修改，触发 length 相关联的副作用函数重新执行。
* 设置 length 属性时，会删除索引值大于等于新 length 的元素，触发这些元素相关联的副作用函数重新执行。

## 缺陷/待实现
下一节中我们将实现对遍历数组操作的代理，包括 for...in 和 for...of。