// 用一个全局变量存储被注册的副作用函数
let activeEffect
// effect 函数用于注册副作用函数
function effect(fn) {
    // 包装真实副作用函数的函数，包含清除和再收集逻辑
    const effectFn = () => {
        // 调用 cleanup 完成清除工作
        cleanup(effectFn)
        /*
        在 effectFn 里，activeEffect 被赋值为它自己。
        而 activeEffect 只要不为空，就会执行依赖收集（见 track 函数第一句 if）。
        因此 effectFn 每次执行都会重新进行一次依赖收集，并且被收集的副作用函数就是它自己
        */
        activeEffect = effectFn
        // 在 fn 这次执行中，effectFn 会作为副作用函数被收集到 fn 读取了的依赖的集合中
        fn()
    }

    // effctFn.deps 数组用来储存该副作用函数的所有依赖集合
    effectFn.deps = []
    // 执行副作用函数
    effectFn()
}

function cleanup(effectFn) {
    // 遍历 deps 数组
    effectFn.deps.forEach( deps => {
        // 把副作用函数从集合中删除
        deps.delete(effectFn)
    })

    // 重置副作用函数的依赖集合，因为之后要再重新收集一次的
    effectFn.deps.length = 0
}

// 存储副作用函数的桶
const bucket = new WeakMap()

// track 函数 在 get 拦截函数中被调用，用来追踪副作用函数
function track(target, key) {
    // 没有 activeEffect 直接 return
    if (!activeEffect) return target[key]

    // 根据 target 从“桶”中取得 depsMap，也是Map类型：key --> effects
    let depsMap = bucket.get(target)
    // 如果不存在 depsMap，就新建一个 Map 并与 target 关联
    if (!depsMap) {
        depsMap = new Map()
        bucket.set(target, depsMap)
    }

    // 再根据 key 从 depsMap 中取得 deps。
    // deps是一个 Set 类型，储存所有与当前 key 相关联的副作用函数
    let deps = depsMap.get(key)
    // 如果 deps 不存在，同样新建一个 Set 并与 key 关联
    if (!deps) {
        deps = new Set()
        depsMap.set(key, deps)
    }

    // 最后将当前激活的副作用函数添加到“桶”里
    deps.add(activeEffect)

    // 也将这个集合添加到副作用函数的 deps 数组中
    activeEffect.deps.push(deps)
}

// trigger 函数 在 set 拦截函数中被调用，用来触发更新
function trigger(target, key) {
    const depsMap = bucket.get(target)
    // 如果这个对象没有被追踪的依赖，没有需要重新运行的副作用函数，直接 return
    if (!depsMap) return

    const effects = depsMap.get(key)
    // 如果这个对象的这个key没有被追踪的依赖，没有需要重新运行的副作用函数，啥也不干
    // 否则就把 effects 中的函数依次执行
    const effectsToRun = new Set(effects)
    // 为了避免无限循环
    effectsToRun.forEach(effectFn => effectFn())

    // 使用 ?. 可选链操作符，也可以写成这样
    // bucket.get(target)?.get(key)?.forEach(effect => effect())
}

const data = { foo: true, bar: true }

let temp1, temp2

// 对原始数据的代理
const obj = new Proxy(data, {
    // 拦截读取操作
    get(target, key) {
        // 把副作用函数收集到桶中
        track(target, key)
        // 返回属性值
        return target[key]
    },
    // 拦截设置操作
    set(target, key, newVal) {
        // 设置属性值
        target[key] = newVal
        // 把副作用函数从桶里取出并执行
        trigger(target, key)
        // 返回 true 代表设置操作成功
        return true
    }
})

effect(function effectFn1() {
    console.log('effectFn1 执行')

    effect(function effectFn2() {
        console.log('effectFn2 执行')
        temp2 = obj.bar
    })

    temp1 = obj.foo
})

obj.foo = false
