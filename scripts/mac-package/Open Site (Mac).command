#!/bin/bash
# Холмогорское подворье — локальный запуск сайта для показа заказчику
HERE="$(cd "$(dirname "$0")" && pwd)"

# Снимаем «карантин» macOS с папки, чтобы файл не считался «повреждённым» при след. запусках
xattr -dr com.apple.quarantine "$HERE" 2>/dev/null
chmod +x "$0" 2>/dev/null

# Ищем сайт в трёх местах: рядом в папке site, прямо рядом с файлом, или ~/Desktop/site
if   [ -f "$HERE/site/index.html" ]; then ROOT="$HERE/site"
elif [ -f "$HERE/index.html" ];      then ROOT="$HERE"
elif [ -f "$HOME/Desktop/site/index.html" ]; then ROOT="$HOME/Desktop/site"
else
  echo "Не найден index.html. Положите этот файл рядом с папкой site (или внутрь неё)."
  read -n1; exit 1
fi

cd "$ROOT" || exit 1
PORT=8080
URL="http://localhost:$PORT/"
echo "======================================================"
echo "  Холмогорское подворье — запуск сайта"
echo "  Папка: $ROOT"
echo "  Адрес: $URL"
echo "  Не закрывайте это окно, пока показываете сайт."
echo "  Чтобы остановить — закройте окно или нажмите Ctrl+C."
echo "======================================================"

# Если порт уже занят прошлым запуском — освобождаем
lsof -ti:$PORT 2>/dev/null | xargs kill -9 2>/dev/null

( sleep 1.5; open "$URL" ) &
if command -v python3 >/dev/null 2>&1; then exec python3 -m http.server $PORT
elif command -v ruby >/dev/null 2>&1; then exec ruby -run -e httpd . -p $PORT
elif command -v php >/dev/null 2>&1; then exec php -S localhost:$PORT
elif command -v python >/dev/null 2>&1; then exec python -m SimpleHTTPServer $PORT
else echo "Не найден Python/Ruby/PHP. Откройте Terminal в папке site и запустите сервер вручную (см. инструкцию)."; read -n1; fi
