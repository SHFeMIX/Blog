# 代理对 Object 的“写”操作
上一节中，我们实现了对一个 Object 所有可能的读取操作的拦截。

这一节，我们来实现对 Object 的所有“写”操作的拦截。

对一个普通对象所有可能的修改操作有：
* 修改属性值或新增属性：obj.key = newValue。
* 删除属性：delete obj.key。