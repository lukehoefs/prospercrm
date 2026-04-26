import os
import re
import sys

def check_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []

    # Check for synchronous params/searchParams access in Page/Layout
    if 'page.tsx' in filepath or 'layout.tsx' in filepath:
        if 'params' in content or 'searchParams' in content:
            if 'await' not in content and 'Promise' not in content:
                # This is a bit naive but good as a hint
                errors.append("Potential sync access to params or searchParams. In Next.js 16, these are Promises.")

    # Check for middleware.ts
    if 'middleware.ts' in filepath or 'middleware.js' in filepath:
        errors.append("middleware.ts is deprecated. Rename to proxy.ts.")

    # Check for revalidateTag with single argument
    revalidate_matches = re.finditer(r'revalidateTag\((["\'].*?["\'])\s*\)', content)
    for match in revalidate_matches:
        errors.append(f"revalidateTag used with one argument at {match.start()}. Next.js 16 requires a cacheLife profile as the second argument.")

    # Check for unstable_ prefixes
    if 'unstable_cacheLife' in content or 'unstable_cacheTag' in content:
        errors.append("unstable_cacheLife/Tag is now stable. Remove the unstable_ prefix.")

    return errors

def main():
    root_dir = 'src'
    all_errors = {}

    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                filepath = os.path.join(root, file)
                errors = check_file(filepath)
                if errors:
                    all_errors[filepath] = errors

    # Also check root for middleware
    for file in os.listdir('.'):
        if file.startswith('middleware.'):
            errors = check_file(file)
            if errors:
                all_errors[file] = errors

    if all_errors:
        print("❌ Next.js 16 Convention Violations Found:")
        for filepath, errors in all_errors.items():
            print(f"\n  {filepath}:")
            for err in errors:
                print(f"    - {err}")
        sys.exit(1)
    else:
        print("✅ No Next.js 16 convention violations found in src/.")

if __name__ == "__main__":
    main()
