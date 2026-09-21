# -*- coding: utf-8 -*-
"""Сшивает самодостаточный HTML: модель, библиотеки и декодер Draco внутрь файла.

Без этого страница из file:// ничего не загрузит — браузер блокирует и
ES-модули, и fetch локальных файлов.
"""
import base64, io, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ext_glb, int_glb, out = sys.argv[1], sys.argv[2], sys.argv[3]
draco_dir = sys.argv[4]
zones_path = sys.argv[5] if len(sys.argv) > 5 else None

def b64(path):
    return base64.b64encode(open(path, 'rb').read()).decode('ascii')

shell = io.open(os.path.join(HERE, 'shell.html'), encoding='utf-8').read()
libs = io.open(os.path.join(HERE, 'libs.js'), encoding='utf-8').read()
app = io.open(os.path.join(HERE, 'viewer.js'), encoding='utf-8').read()

ext_b64 = b64(ext_glb)
int_b64 = b64(int_glb)
wasm_b64 = b64(os.path.join(draco_dir, 'draco_decoder.wasm'))
js_b64 = b64(os.path.join(draco_dir, 'draco_wasm_wrapper.js'))

zones = io.open(zones_path, encoding='utf-8').read() if zones_path else '{"zones":[]}'

data = (
    '<script>\n'
    'window.__ZONES=' + zones + ';\n'
    'window.__MODEL_EXT="' + ext_b64 + '";\n'
    'window.__MODEL_INT="' + int_b64 + '";\n'
    'window.__DRACO_WASM="' + wasm_b64 + '";\n'
    'window.__DRACO_JS="' + js_b64 + '";\n'
    '</' 'script>'
)

html = shell.replace('<!--DATA-->', data)
html = html.replace('<!--LIBS-->', '<script>' + libs + '</' 'script>')
html = html.replace('<!--APP-->', '<script>' + app + '</' 'script>')

io.open(out, 'w', encoding='utf-8').write(html)
size = os.path.getsize(out)
print('фасады      %7.2f МБ -> base64 %7.2f МБ' % (os.path.getsize(ext_glb) / 1048576, len(ext_b64) / 1048576))
print('интерьер    %7.2f МБ -> base64 %7.2f МБ' % (os.path.getsize(int_glb) / 1048576, len(int_b64) / 1048576))
print('библиотеки  %7.2f МБ' % (len(libs) / 1048576))
print('декодер     %7.2f МБ' % ((len(wasm_b64) + len(js_b64)) / 1048576))
print('зоны        %7.2f МБ' % (len(zones) / 1048576))
print('ИТОГО файл  %7.2f МБ  ->  %s' % (size / 1048576, out))
