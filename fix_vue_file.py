import os

def fix_vue_file():
    file_path = "/Users/alan/Desktop/Blog/docs/Vue.js 渐进式实现/响应式系统/非原始值的响应式方案/2 代理对 Object 的“读”操作.md"

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 查找并修复图片链接
        original_content = content

        # 修复 in 操作符的运行时逻辑.png
        content = content.replace('![](in 操作符的运行时逻辑.png)', '![](in操作符的运行时逻辑.png)')

        # 修复 HasProperty 抽象方法.png
        content = content.replace('![](HasProperty 抽象方法.png)', '![](HasProperty抽象方法.png)')

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ 修复成功: {file_path}")
            return True
        else:
            print(f"未找到需要修复的内容: {file_path}")
            return False

    except Exception as e:
        print(f"❌ 修复失败: {file_path}")
        print(f"错误: {e}")
        return False

if __name__ == "__main__":
    fix_vue_file()