#!/usr/bin/env python3
"""Static responsive regression audit for every routed page and shared JSX component."""
from pathlib import Path
import re, sys

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'frontend/src'
routes_file = SRC / 'routes/AppRoutes.jsx'
source = routes_file.read_text()

imports = {}
# Explicit parser for eager and lazy page imports.
for m in re.finditer(r"import\s+(\w+)\s+from\s+'(\.\./(?:pages|layouts)/[^']+)'", source):
    imports[m.group(1)] = m.group(2)
for m in re.finditer(r"const\s+(\w+)\s*=\s*lazy\(\(\)\s*=>\s*import\('(\.\./(?:pages|layouts)/[^']+)'\)\)", source):
    imports[m.group(1)] = m.group(2)

route_elements = re.findall(r'<Route(?:\s+path="([^"]+)")?[^>]*\selement=\{<(\w+)', source)
page_names = sorted({name for _, name in route_elements if name in imports})
page_files = []
for name in page_names:
    rel = imports[name].replace('../', '')
    p = SRC / rel
    if p.suffix != '.jsx': p = p.with_suffix('.jsx')
    page_files.append((name, p))

jsx_files = sorted(SRC.rglob('*.jsx'))
errors, warnings = [], []

def fail(path, msg): errors.append(f'{path.relative_to(ROOT)}: {msg}')

def warn(path, msg): warnings.append(f'{path.relative_to(ROOT)}: {msg}')

# Every routed component must resolve.
for name, p in page_files:
    if not p.exists(): fail(routes_file, f'route component {name} does not resolve')

# Shared viewport and shell safety.
html = (ROOT / 'frontend/index.html').read_text()
if 'width=device-width' not in html: fail(ROOT / 'frontend/index.html', 'missing mobile viewport meta')
main_layout = (SRC / 'layouts/MainLayout.jsx').read_text()
if 'mobile-nav-content-offset' not in main_layout: fail(SRC / 'layouts/MainLayout.jsx', 'fixed mobile nav can cover page content')
css = (SRC / 'index.css').read_text()
for token in ['.page-shell', 'overflow-x: clip', '@media (max-width: 359px)', '@media (hover: hover) and (pointer: fine)']:
    if token not in css: fail(SRC / 'index.css', f'missing shared responsive safeguard: {token}')

# Mobile audit regressions: fixed layers, safe areas, labels, and touch targets.
mobile_tokens = [
    '--mobile-nav-clearance', '.mobile-filter-trigger', '.mobile-footer-clearance',
    'max-height: 86dvh', '.mobile-filter-sheet-actions', 'bottom: 0',
    '.mobile-search-panel', 'env(safe-area-inset-top)', '.cart-drawer-footer',
    '.scroll-top-control', '.mobile-nav-label', '.toast-stack--with-nav',
]
for token in mobile_tokens:
    if token not in css: fail(SRC / 'index.css', f'missing mobile audit fix: {token}')

mobile_component_tokens = {
    SRC / 'components/product/FilterSidebar.jsx': ['mobile-filter-trigger', 'mobile-filter-sheet-actions'],
    SRC / 'components/layout/Footer.jsx': ['mobile-footer-clearance'],
    SRC / 'components/layout/Navbar.jsx': ['mobile-nav-label', 'mobile-search-panel', 'mobile-menu-footer'],
    SRC / 'components/cart/CartDrawer.jsx': ['cart-drawer-header', 'cart-drawer-footer', 'min-h-0 flex-1 overflow-y-auto'],
    SRC / 'components/ui/ScrollTop.jsx': ['scroll-top-control'],
    SRC / 'components/product/ProductCard.jsx': ['size-11 shrink-0'],
    SRC / 'components/ui/Rating.jsx': ['size-11 shrink-0'],
    SRC / 'components/ui/Input.jsx': ['left-0.5', 'size-10'],
    SRC / 'pages/admin/ProductForm.jsx': ['size-10', 'md:opacity-0', 'md:group-focus-within:opacity-100'],
    SRC / 'pages/admin/dashboard/Panels.jsx': ['tooltipPosition', 'onClick={() => setHover(i)}', 'aria-pressed={hover === i}', 'size-10 place-items-center rounded-lg border'],
    SRC / 'context/ToastContext.jsx': ['toast-stack--with-nav', 'useLocation'],
}
for path, tokens in mobile_component_tokens.items():
    source_text = path.read_text()
    for token in tokens:
        if token not in source_text: fail(path, f'missing mobile audit fix: {token}')

# Component-level regression rules.
for p in jsx_files:
    s = p.read_text()
    # Tables must be intentionally scrollable on small screens.
    if '<table' in s and 'overflow-x-auto' not in s:
        fail(p, 'table has no horizontal scroll container')
    # Raw viewport widths frequently create mobile overflow.
    if re.search(r'\bw-screen\b|width:\s*100vw', s):
        fail(p, 'viewport-width sizing can create horizontal overflow')
    # Unprefixed multi-column grids are forbidden except desktop-only category menu.
    for line_no, line in enumerate(s.splitlines(), 1):
        if re.search(r'(?<![:\w-])grid-cols-[2-9]\b', line):
            if p.name == 'Navbar.jsx' and ('grid-cols-2' in line or 'mobile-bottom-nav' in line):
                continue
            fail(p, f'unconditional multi-column grid at line {line_no}')
    # Fixed widths need a viewport cap or must be desktop-only.
    for line_no, line in enumerate(s.splitlines(), 1):
        if re.search(r'(?<!min-)\bw-\[[0-9.]+(?:rem|px)\]', line):
            safe = 'max-w-[' in line or 'hidden' in line or p.name == 'Panels.jsx'
            if not safe: fail(p, f'uncapped fixed width at line {line_no}')
    # Flex/grid children with dynamic text should permit shrinking.
    if 'truncate' in s and 'min-w-0' not in s:
        warn(p, 'truncated text without an explicit shrinkable ancestor')

# Required narrow-mobile adaptations.
required = {
    SRC / 'components/product/ProductGrid.jsx': ['min-[390px]:grid-cols-2'],
    SRC / 'components/product/ProductCarousel.jsx': ['min-[390px]:grid-cols-2'],
    SRC / 'components/ui/Pagination.jsx': ['overflow-x-auto', 'size-9'],
    SRC / 'components/ui/Modal.jsx': ['px-4', '65dvh'],
    SRC / 'pages/ProductDetails.jsx': ['overflow-x-auto', 'grid-cols-[6rem_minmax(0,1fr)]'],
    SRC / 'pages/admin/AdminOrders.jsx': ['grid-cols-[1fr_auto]', 'sm:flex'],
}
for p, tokens in required.items():
    s = p.read_text()
    for token in tokens:
        if token not in s: fail(p, f'missing narrow-mobile adaptation: {token}')

print(f'Routes checked: {len(route_elements)}')
print(f'Routed page/layout components checked: {len(page_files)}')
print(f'JSX components checked: {len(jsx_files)}')
print('Viewports modeled: 320, 360, 390, 768, 1024, 1440 px')
if warnings:
    print(f'Warnings: {len(warnings)}')
    for item in warnings: print('WARN', item)
if errors:
    print(f'FAILED: {len(errors)} issue(s)')
    for item in errors: print('ERROR', item)
    sys.exit(1)
print('PASSED: responsive static regression audit')
