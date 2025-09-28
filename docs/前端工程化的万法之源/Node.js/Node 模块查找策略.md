# Node 模块查找策略

## 解析算法
下面我们将通过实现一个函数 **ESM_RESOLVE** 来模拟 Node.js 加载 ES modules 标识符的算法，它会返回解析模块标识符得到的相对于父级 URL 的 URL。

```js
const defaultConditions = ['node', 'import']

function ESM_RESOLVE(specifier, parentURL) {
    // 1. 让 resolved 变量等于 undefined
    let resolved = undefined

    // 2. 如果标识符是合法 URL
    if (isValidURL(specifier)) {
        // 2.1 把标识符当作 URL 进行解析和序列化，赋值给 resolved
        resolved = new URL(specifier, parentURL).href
    }
    // 3. 如果标识符是 '/'、'./' 或者 '../' 开头
    else if (specifier.startsWith('/') || specifier.startsWith('./') || specifier.startsWith('../')) {
        // 3.1 把 resolved 赋值为标识符相对于父级 URL 的解析结果
        resolved = resolveURL(specifier, parentURL)
    }
    // 4. 如果标识符是 ‘#’ 开头
    else if (specifier.startsWith('#')) {
        // 4.1 把 resolved 赋值为调用 PACKAGE_IMPORTS_RESOLVE 函数的结果
        resolved = PACKAGE_IMPORTS_RESOLVE(specifier, parentURL, defaultConditions)
    }
    else {
        // 5. 如果上述情况都不符合
        // 5.1 注意：此时的标识符是裸模块标识符
        // 5.2 把 resolved 赋值为调用 PACKAGE_RESOLVE 函数的结果
        resolved = PACKAGE_RESOLVE(specifier, parentURL)
    }

    // 6. 把 format 赋值为 undefined
    let format = undefined

    // 7. 如果 resolved 是一个 'file:' 开头的 URL
    if (resolved.startsWith('file:')) {
        // 7.1 如果 resolved 包含 "/" 或 "\" 的百分比编码（"%2F 或 "%5C"）
        if (resolved.includes('%2F') || resolved.includes('%5C')) {
            // 7.1.1 报错 Invalid Module Specifier
            throw new ERR_INVALID_MODULE_SPECIFIER()
        }

        // 7.2 如果 resolved 是一个文件夹
        if (isDirectory(resolved)) {
            // 7.2.1 报错 Unsupported Directory Import
            throw new ERR_UNSUPPORTED_DIR_IMPORT()
        }

        // 7.3 如果 resolved 指向的文件不存在
        if (!isFileExists(resolved)) {
            // 7.3.1 报错 Module Not Found
            throw new ERR_MODULE_NOT_FOUND()
        }

        // 7.4 把 resolved 赋值为 它的真实路径，保留 URL参数和分隔符号
        resolved = toRealPath(resolved)

        // 7.5 把 format 赋值为调用 ESM_FILE_FORMAT 函数的结果
        format = ESM_FILE_FORMAT(resolved)
    }
    else {
        // 8. 否则
        // 8.1 把 format 赋值 resolved URL 对应的 content type 的格式
        format = getFormat(resolved)
    }

    // 9. 返回 format 和 resolved 交给模块加载器
    return { format, resolved }
}

function PACKAGE_RESOLVE(specifier, parentURL) {
    // 1. 把 packageName 赋值为 undefined
    let packageName = undefined

    // 2. 如果 specifier 是空字符串
    if (specifier === '') {
        // 报错 Invalid Module Specifier
        throw new ERR_INVALID_MODULE_SPECIFIER()
    }

    // 3. 如果 spceifier 是一个 Node 内部模块名称
    if (isNodeBuiltinModule(specifier)) {
        // 将字符串 'node:' 和 specifier 拼接并返回
        return `node:${specifier}`
    }

    // 4. 如果 specifier 不是 '@' 开头
    if (!specifier.startsWith('@')) {
        // 4.1 把 packageName 赋值为 specifier 的第一个 '/' 之前的子字符串，没有就是它自己
        const packageName = specifier.split('/', 1)[0]
    }

    // 5. 否则
    else {
        // 5.1 如果 packageName 不包含 '/'
        if (!packageName.includes('/')) {
            // 5.1.1 报错 Invalid Module Specifier
            throw new ERR_INVALID_MODULE_SPECIFIER()
        }

        // 5.2 把 packageName 赋值 specifier 的为第二个 '/' 之前的子字符串，没有就是它自己
        packageName = specifier.split('/', 2).join('/')
    }

    // 6. 如果 packegaName 以 "." 开头，或者包含 "\" 或者 "%"
    if (packageName.startsWith('.') || packageName.includes('\\') || packageName.includes('%')) {
        // 6.1 报错 Invalid Module Specifier
        throw new ERR_INVALID_MODULE_SPECIFIER()
    }

    // 7. 把 字符串 "." 与 specifier 从 packageName 长度开始的子字符串拼接，赋值给 packegeSubpath  
    const packageSubpath = '.' + specifier.substring(packageName.length)

    // 8. 把 selfUrl 赋值为 PACKAGE_SELF_RESOLVE 函数的调用结果
    const selfUrl = PACKAGE_SELF_RESOLVE(packageName, packageSubpath， parentURL)

    // 9. 如果 selfUrl 不是 undefined， 返回 selfUrl
    if (selfUrl !== undefined) {
        return selfUrl
    }

    // 10
}
```