import os
import re

def fix_image_links_in_file(file_path, fixes):
    """修复文件中的图片链接"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        for fix in fixes:
            old_link = fix['original']
            new_link = fix['fixed']
            content = content.replace(old_link, new_link)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # 定义需要修复的问题
    fixes = [
        {
            'file': '/Users/alan/Desktop/Blog/docs/CSS 权威指南/16 变形/16.2 变形主属性.md',
            'original': '![](视域 2.png)',
            'fixed': '![](视域2.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/CSS 权威指南/16 变形/16.3 其他变形属性.md',
            'original': '![](3D 变形.png)',
            'fixed': '![](3D变形.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/CSS 权威指南/16 变形/16.3 其他变形属性.md',
            'original': '![](保留 3D 效果的变形.png)',
            'fixed': '![](保留3D效果的变形.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/CSS 权威指南/8 内边边框、轮廓和外边距/8.1 基本元素框.md',
            'original': '![](CSS 盒模型.png)',
            'fixed': '![](CSS盒模型.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/CSS 权威指南/8 内边边框、轮廓和外边距/8.1 基本元素框.md',
            'original': '![](width 和 height.png)',
            'fixed': '![](width和height.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/CSS 权威指南/10 浮动及其形状/10.1 浮动.md',
            'original': '![](避免重叠 2.png)',
            'fixed': '![](避免重叠2.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/Vue.js 渐进式实现/响应式系统/非原始值的响应式方案/2 代理对 Object 的"读"操作.md',
            'original': '![](in 操作符的运行时逻辑.png)',
            'fixed': '![](in操作符的运行时逻辑.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/Vue.js 渐进式实现/响应式系统/非原始值的响应式方案/2 代理对 Object 的"读"操作.md',
            'original': '![](HasProperty 抽象方法.png)',
            'fixed': '![](HasProperty抽象方法.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/Vue.js 渐进式实现/响应式系统/响应式系统的作用与实现/2 建立副作用函数与被操作字段之间的联系.md',
            'original': '![](WeakMap 和 Set 之间的关系.png)',
            'fixed': '![](WeakMap和Set之间的关系.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/pro-git/3 Git 分支/3.1 分支简介.md',
            'original': '![](切换到 testing 分支.png)',
            'fixed': '![](切换到testing分支.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/pro-git/3 Git 分支/3.1 分支简介.md',
            'original': '![](HEAD 随着分支提交操作自动向前移动.png)',
            'fixed': '![](HEAD随着分支提交操作自动向前移动.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/pro-git/3 Git 分支/3.1 分支简介.md',
            'original': '![切换回 master 分支](切换回 master 分支.png)',
            'fixed': '![切换回 master 分支](切换回master分支.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/pro-git/3 Git 分支/3.2 分支的新建与合并.md',
            'original': '![](在 iss53 分支上提交.png)',
            'fixed': '![](在iss53分支上提交.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/pro-git/3 Git 分支/3.2 分支的新建与合并.md',
            'original': '![](创建 hotfix 分支并在此提交.png)',
            'fixed': '![](创建hotfix分支并在此提交.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/pro-git/3 Git 分支/3.2 分支的新建与合并.md',
            'original': '![](maste 被快进到 hotfix.png)',
            'fixed': '![](maste被快进到hotfix.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/pro-git/3 Git 分支/3.2 分支的新建与合并.md',
            'original': '![](切换回 iss53 分支继续工作.png)',
            'fixed': '![](切换回iss53分支继续工作.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/chrome-devtools/元素面板/查看DOM.md',
            'original': '![](Inspect 模式.png)',
            'fixed': '![](Inspect模式.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/chrome-devtools/元素面板/修改DOM.md',
            'original': '![](以 HTML 格式修改.png)',
            'fixed': '![](以HTML格式修改.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/chrome-devtools/元素面板/检查和调试FlexBox布局.md',
            'original': '![](flex 标记.png)',
            'fixed': '![](flex标记.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/chrome-devtools/元素面板/检查和调试FlexBox布局.md',
            'original': '![](flexbox 编辑器按钮.png)',
            'fixed': '![](flexbox编辑器按钮.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/chrome-devtools/元素面板/检查和调试FlexBox布局.md',
            'original': '![](flexbox 编辑器.png)',
            'fixed': '![](flexbox编辑器.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/chrome-devtools/元素面板/控制台中访问节点.md',
            'original': '![](使用$0 引用节点.png)',
            'fixed': '![](使用$0引用节点.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/chrome-devtools/源代码面板/调试JavaScript.md',
            'original': '![](DOM 更改断点.png)',
            'fixed': '![](DOM更改断点.png)'
        },
        {
            'file': '/Users/alan/Desktop/Blog/docs/chrome-devtools/源代码面板/调试JavaScript.md',
            'original': '![](DOM 更改断点列表.png)',
            'fixed': '![](DOM更改断点列表.png)'
        }
    ]

    # 按文件分组修复
    file_fixes = {}
    for fix in fixes:
        file_path = fix['file']
        if file_path not in file_fixes:
            file_fixes[file_path] = []
        file_fixes[file_path].append(fix)

    # 执行修复
    success_count = 0
    total_files = len(file_fixes)

    print("开始修复图片链接空格问题...\n")

    for file_path, file_fix_list in file_fixes.items():
        print(f"修复文件: {file_path}")
        if fix_image_links_in_file(file_path, file_fix_list):
            print(f"  ✅ 修复成功 ({len(file_fix_list)} 处)")
            success_count += 1
        else:
            print(f"  ❌ 修复失败")
        print()

    print(f"=== 修复完成 ===")
    print(f"成功修复: {success_count}/{total_files} 个文件")
    print(f"总计修复: {len(fixes)} 处图片链接")

if __name__ == "__main__":
    main()