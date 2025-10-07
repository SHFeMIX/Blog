import os
import re
from pathlib import Path

def find_image_links(content, file_path):
    """查找内容中的图片链接"""
    # 匹配图片语法: ![alt text](image path) 或 ![](image path)
    pattern = r'!\[([^\]]*)\]\(([^\)]+)\)'
    matches = re.finditer(pattern, content)

    results = []
    for match in matches:
        alt_text = match.group(1)
        image_path = match.group(2).strip()
        line_num = content[:match.start()].count('\n') + 1

        results.append({
            'line_num': line_num,
            'alt_text': alt_text,
            'image_path': image_path,
            'full_match': match.group(0)
        })

    return results

def check_image_exists(image_path, md_file_path):
    """检查图片文件是否存在"""
    # 处理相对路径
    if not image_path.startswith(('/', 'http://', 'https://', 'data:')):
        # 相对于md文件的路径
        base_dir = os.path.dirname(md_file_path)
        full_path = os.path.join(base_dir, image_path)
    else:
        full_path = image_path

    return os.path.exists(full_path), full_path

def check_space_issues(image_path):
    """检查路径中的空格问题"""
    has_spaces = ' ' in image_path
    suspicious_spaces = []

    if has_spaces:
        # 检查是否有可疑的空格模式
        parts = image_path.split('/')
        for part in parts:
            if ' ' in part:
                # 检查是否包含中英文混合空格
                if any('\u4e00' <= c <= '\u9fff' for c in part) and any(c.isalpha() for c in part):
                    suspicious_spaces.append(part)

    return has_spaces, suspicious_spaces

def suggest_fix(image_path):
    """建议修复方案"""
    # 尝试去掉多余的空格
    fixed_path = image_path.replace(' ', '')
    return fixed_path

def main():
    docs_path = '/Users/alan/Desktop/Blog/docs'
    issues_found = []

    # 遍历所有md文件
    for root, dirs, files in os.walk(docs_path):
        for file in files:
            if file.endswith('.md'):
                md_file_path = os.path.join(root, file)

                try:
                    with open(md_file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    image_links = find_image_links(content, md_file_path)

                    for img in image_links:
                        image_path = img['image_path']

                        # 检查空格问题
                        has_spaces, suspicious_spaces = check_space_issues(image_path)

                        # 检查文件是否存在
                        exists, full_path = check_image_exists(image_path, md_file_path)

                        # 如果文件不存在且有空格，尝试建议修复
                        suggested_fix_path = None
                        if not exists and has_spaces:
                            suggested_fix = suggest_fix(image_path)
                            exists_fixed, full_path_fixed = check_image_exists(suggested_fix, md_file_path)
                            if exists_fixed:
                                suggested_fix_path = suggested_fix

                        # 记录问题
                        if (has_spaces and suspicious_spaces) or (not exists and has_spaces):
                            issues_found.append({
                                'file_path': md_file_path,
                                'line_num': img['line_num'],
                                'original_link': img['full_match'],
                                'image_path': image_path,
                                'has_spaces': has_spaces,
                                'suspicious_spaces': suspicious_spaces,
                                'file_exists': exists,
                                'suggested_fix': suggested_fix_path,
                                'full_path': full_path
                            })

                except Exception as e:
                    print(f"Error reading {md_file_path}: {e}")
                    continue

    # 输出结果
    print("=== 图片链接空格问题扫描结果 ===\n")

    if not issues_found:
        print("未发现图片链接空格问题！")
        return

    # 按严重程度分组
    critical_issues = []  # 文件不存在且有修复建议
    warning_issues = []   # 有可疑空格但文件存在
    info_issues = []      # 只有空格，文件也存在

    for issue in issues_found:
        if not issue['file_exists'] and issue['suggested_fix']:
            critical_issues.append(issue)
        elif issue['suspicious_spaces']:
            warning_issues.append(issue)
        else:
            info_issues.append(issue)

    # 输出严重问题
    if critical_issues:
        print("🔴 严重问题（文件不存在，但有修复建议）：")
        for issue in critical_issues:
            print(f"\n文件: {issue['file_path']}")
            print(f"行号: {issue['line_num']}")
            print(f"原始链接: {issue['original_link']}")
            print(f"完整路径: {issue['full_path']}")
            print(f"建议修复: ![{issue['original_link'].split('](')[0].replace('![', '')}]({issue['suggested_fix']})")
            print("-" * 60)

    # 输出警告问题
    if warning_issues:
        print(f"\n🟡 警告问题（发现可疑空格模式，共{len(warning_issues)}个）：")
        for issue in warning_issues[:10]:  # 只显示前10个
            print(f"\n文件: {issue['file_path']}")
            print(f"行号: {issue['line_num']}")
            print(f"原始链接: {issue['original_link']}")
            print(f"可疑部分: {issue['suspicious_spaces']}")
            print(f"文件存在: {issue['file_exists']}")
            print("-" * 60)

        if len(warning_issues) > 10:
            print(f"\n... 还有 {len(warning_issues) - 10} 个类似问题")

    # 输出信息问题
    if info_issues:
        print(f"\n🔵 信息问题（路径包含空格但文件存在，共{len(info_issues)}个）：")
        for issue in info_issues[:5]:  # 只显示前5个
            print(f"\n文件: {issue['file_path']}")
            print(f"行号: {issue['line_num']}")
            print(f"图片路径: {issue['image_path']}")
            print("-" * 40)

        if len(info_issues) > 5:
            print(f"\n... 还有 {len(info_issues) - 5} 个类似问题")

    print(f"\n=== 总结 ===")
    print(f"严重问题: {len(critical_issues)} 个")
    print(f"警告问题: {len(warning_issues)} 个")
    print(f"信息问题: {len(info_issues)} 个")
    print(f"总计: {len(issues_found)} 个问题")

if __name__ == "__main__":
    main()