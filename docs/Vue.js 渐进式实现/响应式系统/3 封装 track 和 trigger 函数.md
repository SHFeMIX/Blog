# 封装 track 和 trigger 函数
目前的实现中，我们直接在 get 拦截函数里编写把副作用函数收集到“桶”里的逻辑，但更好的做法是将这部分逻辑单独封装到一个 track 函数中，取名 track 是为了表达**追踪**的含义。

同样的，set 中**触发**副作用函数重新执行的逻辑也可以封装到 trigger 函数中。

## 代码
```javascript{20,29,35-59,61-71}
// 用一个全局变量存储被注册的副作用函数
let activeEffect
// effect 函数用于注册副作用函数
function effect(fn) {
    // 当调用 effect 注册副作用函数时，将副作用函数 fn 赋值给 activeEffect
    activeEffect = fn
    fn()
}

// 存储副作用函数的桶
const bucket = new WeakMap()

// 原始数据
const data = { text: 'hellow world' }
// 对原始数据的代理
const obj = new Proxy(data, {
    // 拦截读取操作
    get(target, key) {
        // 把副作用函数收集到桶中
        track(traget, key)
        // 返回属性值
        retrun target[key]
    },
    // 拦截设置操作
    set(target, key newVal) {
        // 设置属性值
        target[key] = newVal
        // 把副作用函数从桶里取出并执行
        trigger(target, key)
        // 返回 true 代表设置操作成功
        return true
    }
})

// track 函数 在 get 拦截函数中被调用，用来追踪副作用函数
function track(target, key) {
    // 没有 activeEffect 直接 return
    if (!activeEffect) return terget[key]

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
}

// trigger 函数 在 set 拦截函数中被调用，用来触发更新
function trigger(target, key) {
    const depsMap = bucket.get(target)
    // 如果这个对象没有被追踪的依赖，没有需要重新运行的副作用函数，直接 return
    if (!depsMap) return

    const effects = depsMap.get(key)
    // 如果这个对象的这个key没有被追踪的依赖，没有需要重新运行的副作用函数，啥也不干
    // 否则就把 effects 中的函数依次执行
    effects && effects.forEach(effect => effect())
}
```

## 已实现
把**依赖收集**和**触发更新**的逻辑分别封装到 **track** 和 **trigger** 函数中，代码逻辑更清晰并且更加灵活。