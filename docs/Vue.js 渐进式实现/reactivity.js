// // 用一个全局变量存储被注册的副作用函数
// let activeEffect

// // 新增 effect 栈
// const effectStack = []

// // effect 函数用于注册副作用函数
// function effect(fn) {
//     // 包装真实副作用函数的函数，包含清除和再收集逻辑
//     const effectFn = () => {
//         // 调用 cleanup 完成清除工作
//         cleanup(effectFn)
        
//         // effectFn 每次执行都会重新进行一次依赖收集，并且被收集的副作用函数就是它自己
//         activeEffect = effectFn

//         // 调用真实副作用函数之前，先将当前 effect 压入栈中
//         effectStack.push(effectFn)

//         // 在 fn 这次执行中，effectFn 会作为副作用函数被收集到 fn 读取了的依赖的集合中
//         fn()

//         // 当前副作用函数执行完毕之后，弹出栈
//         effectStack.pop()
//         // 并把 activeEffect 还原为之前的值
//         activeEffect = effectStack[effectStack.length - 1]
//     }

//     // effctFn.deps 数组用来储存该副作用函数的所有依赖集合
//     effectFn.deps = []
//     // 执行副作用函数
//     effectFn()
// }

// function cleanup(effectFn) {
//     // 遍历 deps 数组
//     effectFn.deps.forEach( deps => {
//         // 把副作用函数从集合中删除
//         deps.delete(effectFn)
//     })

//     // 重置副作用函数的依赖集合，因为之后要再重新收集一次的
//     effectFn.deps.length = 0
// }

// // 存储副作用函数的桶
// const bucket = new WeakMap()

// // 原始数据
// const data = { text1: 'text1', text2: 'text2' }
// // 对原始数据的代理
// const obj = new Proxy(data, {
//     // 拦截读取操作
//     get(target, key) {
//         // 把副作用函数收集到桶中
//         track(target, key)
//         // 返回属性值
//         return target[key]
//     },
//     // 拦截设置操作
//     set(target, key, newVal) {
//         // 设置属性值
//         target[key] = newVal
//         // 把副作用函数从桶里取出并执行
//         trigger(target, key)
//         // 返回 true 代表设置操作成功
//         return true
//     }
// })

// // track 函数 在 get 拦截函数中被调用，用来追踪副作用函数
// function track(target, key) {
//     // 没有 activeEffect 直接 return
//     if (!activeEffect) return target[key]

//     // 根据 target 从“桶”中取得 depsMap，也是Map类型：key --> effects
//     let depsMap = bucket.get(target)
//     // 如果不存在 depsMap，就新建一个 Map 并与 target 关联
//     if (!depsMap) {
//         depsMap = new Map()
//         bucket.set(target, depsMap)
//     }

//     // 再根据 key 从 depsMap 中取得 deps。
//     // deps是一个 Set 类型，储存所有与当前 key 相关联的副作用函数
//     let deps = depsMap.get(key)
//     // 如果 deps 不存在，同样新建一个 Set 并与 key 关联
//     if (!deps) {
//         deps = new Set()
//         depsMap.set(key, deps)
//     }

//     // 最后将当前激活的副作用函数添加到“桶”里
//     deps.add(activeEffect)

//     // 也将这个集合添加到副作用函数的 deps 数组中
//     activeEffect.deps.push(deps)
// }

// // trigger 函数 在 set 拦截函数中被调用，用来触发更新
// function trigger(target, key) {
//     const depsMap = bucket.get(target)
//     // 如果这个对象没有被追踪的依赖，没有需要重新运行的副作用函数，直接 return
//     if (!depsMap) return

//     const effects = depsMap.get(key)

//     // 新建空集合存储本次触发更新要执行的副作用函数
//     const effectsToRun = new Set()

//     // 如果当前 activeEffect 在依赖集合里，本次触发更新不执行它
//     effects?.forEach(effectFn => {
//         if (effectStack.indexOf(effectFn) === -1) {
//             effectsToRun.add(effectFn)
//         }
//     })

//     effectsToRun.forEach(effectFn => effectFn())
// }

// effect(() => {
//     console.log(obj.text1)
//     obj.text2 = Date.now()
// })

// effect(() => {
//     console.log(obj.text2)
//     obj.text1 = Date.now()
// })

const obj = {
    foo: 1,
    get bar() {
        return this.foo
    }
}

const p1 = new Proxy(obj, {
    get(target, key, receiver) {
        console.log(key)
        return Reflect.get(target, key, receiver)
    }
})

const p2 = new Proxy(obj, {
    get(target, key, receiver) {
        console.log(key)
        return target[key]
    }
})

p1.bar // 先后打印 'bar'，'foo'
p2.bar // 只打印 'bar'