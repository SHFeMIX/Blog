# 理解 Proxy 和 Reflect

Vue.js 3 结合使用了 Proxy 和 Reflect 实现响应式数据，那么我们就有必要了解 Proxy 以及与之相关联的 Reflect。

ES6 官方文档规定了 ECMAScript 语言在底层操作一个对象的 13 种基本方法。不管语法层面怎么写，最终内部调用的都是这 13 种基本方法来操作对象。

## Proxy

Proxy 是一个构造函数，能够生成原对象的一个代理对象，拦截了对原对象的操作。

```js
const p = new Proxy(obj, {
    // 拦截读取属性操作 [[Get]]
    get() { /*...*/ },
    // 拦截设置属性操作 [[Set]]
    set() { /*...*/ },
})
```

它的优点有：

* 直接监听整个对象而非属性，性能有优势。
* 可以拦截所有 13 种基本操作，因此可以监听新增和删除属性，也可以监听数组的索引和 length 属性。
* Proxy 返回的是一个新对象，直接操作新对象就可以达到目的，不用修改原对象。
* Proxy 作为新标准，受到浏览器厂商重点持续的性能优化，也就是新标准的性能红利。

## Reflect

Reflect 是一个内置全局对象，它可以直接调用 13 种基本方法。而除它之外没有任何方式能够实现这一点。

```js
Reflect.get() // 对应 [[Get]] 方法
Reflect.set() // 对应 [[Set]] 方法
Reflect.apply() // 对应 [[Call]] 方法
// ...
```

任何在 Proxy 的拦截器中能找到的方法，都能够在 Reflect 中找到同名函数。

那么问题来了，Vue.js 3 的响应式系统为什么一定要用 Reflect？比如读取属性，只能用 Reflect.get 方法，不能直接 obj[key] 吗？

### 不用 Reflect 的问题

举个例子：

```js
const obj = {
    foo: 1,
    get bar() {
        return this.foo
    }
}

const p = new Proxy(obj, {
    get(target, key) {
        track(target, key)
        return target[key]
    },

    set(target, key, newVal) {
        trigger(target, key)
        target[key] = newVal
    }
})

effect(() => {
    console.log(p.bar)
})
```

obj 的 bar 属性是一个访问器属性，它返回了 this.foo 的值。接着，我们在 effect 注册的副作用函数中通过代理对象 p 访问 bar 属性。

由于 p.bar 是一个访问器属性，实际上读取的是 foo 属性。因此我们希望副作用函数与 foo 属性之间建立响应联系，当 foo 属性被修改时，副作用函数重新执行。

然而事实并非如此。尝试修改 p.foo 的值，副作用函数并不会重新执行。

#### 分析原因

如果我们希望副作用函数与 foo 属性之间建立响应联系，那副作用函数必须访问到代理对象 p 的 foo 属性。

在 get 拦截函数内，通过 target[key] 返回属性值。其中 target 是原始对象 obj，key 是字符串 'bar'，所以 target[key] 等价于 obj.bar。

既然是 obj.bar，那么 bar 的访问器函数内的 this 值自然是 obj，也就是原始对象。最终访问到了 obj.foo 的值。

很显然，直接访问到原始对象的某个属性，是不会建立响应联系的。

### 使用 Reflcet 正确建立响应联系

如果能让 bar 的访问器函数内的 this 变成代理对象 p 而不是原对象 obj，那么访问的就是 p.foo，不就能触发 foo 的依赖收集，建立起响应联系了吗。

Reflect 就能做到这一点。

#### Reflect 的能力

比如 13 种基本方法中的 [[Get]] 和 [[Set]] 方法，ES6 官方文档规定了它们接收的最后一个参数 Receiver 是：如果检索或设置属性值时需要执行代码，代码执行时候的 this 值。这里说的 “如果检索或设置属性值时需要执行代码”，其实就是对象的 getter 和 setter。

当访问对象的 getter 和 setter 需要指定方法的 this 值时，就必须使用 Reflect 直接调用底层的 [[Get]] 和 [[Set]] 方法，手动传入 Receiver 参数。

#### 如何正确建立联系

而 Proxy 的拦截函数的最后一个参数 receiver，表示的是谁在操作属性，一般是代理对象本身。

两者一结合，在拦截函数里获取到代理对象本身，用 Reflect 把代理对象指定为访问器属性的函数执行时的 this 值。这样一来，访问代理对象的访问器属性，最终还是访问到代理对象的属性，能建立响应联系。

```js
const p = new Proxy(obj, {
    // 拦截读取操作，接收第三个参数 receiver
    get(target, key, receiver) {
        track(target, key)
        // 使用 Reflect.get 返回属性值，传入第三个参数 receiver
        return Reflect.get(target, key, receiver)
    },
    // ...
})
```

我们用 Reflect.get(target, key, receiver) 代替了之前的 target[key], 把 reveiver 也就是代理对象 p 作为 Reflect.get 的第三个参数传入。

因此访问器属性 bar 的 getter 函数内的 this 指向代理对象 p，进而访问到 p.foo。访问代理对象的属性，自然会在副作用函数与响应式数据之间建立联系。

### 直观对比

我们通过下列代码可以更直观对比出用与不用 Reflect 的区别：

```js
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
```

## 总结

Proxy 可以生成原对象的代理对象，拦截对原对象的操作。Reflect 是一个内置全局对象，能够直接调用 13 种基本方法。

当原对象有 getter 和 setter 属性时，只有使用 Reflect 的能力指定 getter 和 setter 函数内的 this 值，使得最终访问到代理对象属性，才可以正确建立响应联系。
