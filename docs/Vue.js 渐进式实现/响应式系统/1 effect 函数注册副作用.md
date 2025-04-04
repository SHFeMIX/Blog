# effect 函数注册副作用
上一节的实现中，我们硬编码了副作用函数名字。而我们希望的是，哪怕副作用函数是一个匿名函数，也能够被正确地收集。

## 思路
为了实现这一点，我们需要提供一个用来注册副作用函数的机制。

## 代码
```javascript{1-8,19-22}
// 用一个全局变量存储被注册的副作用函数
let activeEffect
// effect 函数用于注册副作用函数
function effect(fn) {
    // 当调用 effect 注册副作用函数时，将副作用函数 fn 赋值给 activeEffect
    activeEffect = fn
    fn()
}

// 存储副作用函数的桶
const bucket = new Set()

// 原始数据
const data = { text: 'hellow world' }
// 对原始数据的代理
const obj = new Proxy(data, {
    // 拦截读取操作
    get(target, key) {
        // 将 activeEffect 中存储的副作用函数收集到“桶”中
        if (activeEffect) {
            bucket.add(activeEffect)
        }
        // 返回属性值
        retrun target[key]
    },
    // 拦截设置操作
    set(target, key newVal) {
        // 设置属性值
        target[key] = newVal
        // 把副作用函数从桶里取出并执行
        bucket.forEach(fn => fn())
        // 返回 true 代表设置操作成功
        return true
    }
})
```

## 已实现
* 正确地收集任何名字甚至是匿名的副作用函数。

## 缺陷/待实现
* 没有在副作用函数与被操作的目标字段之间建立明确联系。
   * 当读取属性时，无论读取的是哪个属性，都一样，都会把副作用函数收集到“桶”里；
   * 当设置属性时，无论设置的是哪个属性，也都会把“桶”里的副作用函数取出并执行。