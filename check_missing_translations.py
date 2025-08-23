#!/usr/bin/env python3
import json
import re
import glob
import os

def extract_data_lang_keys(file_path):
    """从HTML文件中提取所有data-lang键"""
    keys = set()
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # 匹配 data-lang="key" 模式
            matches = re.findall(r'data-lang="([^"]*)"', content)
            keys.update(matches)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return keys

def load_json_keys(file_path):
    """从JSON文件加载所有翻译键"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return set(data.keys())
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return set()

def main():
    os.chdir(r"F:\Git des\wplace--tool")
    
    # 提取所有HTML文件中的data-lang键
    all_keys = set()
    html_files = []
    
    # 查找所有HTML文件
    for pattern in ['*.html', 'blog/*.html']:
        html_files.extend(glob.glob(pattern))
    
    print("=== 分析HTML文件中的data-lang键 ===")
    for html_file in sorted(html_files):
        keys = extract_data_lang_keys(html_file)
        all_keys.update(keys)
        print(f"{html_file}: {len(keys)} 个键")
    
    print(f"\n总共找到 {len(all_keys)} 个不重复的data-lang键")
    
    # 加载JSON翻译文件
    en_keys = load_json_keys('lang/en.json')
    zh_keys = load_json_keys('lang/zh.json')
    
    print(f"\nen.json 包含 {len(en_keys)} 个翻译")
    print(f"zh.json 包含 {len(zh_keys)} 个翻译")
    
    # 查找缺失的翻译
    missing_en = all_keys - en_keys
    missing_zh = all_keys - zh_keys
    
    print(f"\n=== 缺失的英文翻译 ({len(missing_en)} 个) ===")
    for key in sorted(missing_en):
        print(f"  - {key}")
    
    print(f"\n=== 缺失的中文翻译 ({len(missing_zh)} 个) ===")
    for key in sorted(missing_zh):
        print(f"  - {key}")
    
    # 查找JSON中多余的键
    extra_en = en_keys - all_keys
    extra_zh = zh_keys - all_keys
    
    if extra_en:
        print(f"\n=== en.json中多余的键 ({len(extra_en)} 个) ===")
        for key in sorted(extra_en):
            print(f"  - {key}")
    
    if extra_zh:
        print(f"\n=== zh.json中多余的键 ({len(extra_zh)} 个) ===")
        for key in sorted(extra_zh):
            print(f"  - {key}")

if __name__ == '__main__':
    main()