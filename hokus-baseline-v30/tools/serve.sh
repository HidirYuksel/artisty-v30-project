#!/bin/sh
# Geliştirme sunucusu: src/ klasörünü http://localhost:8080/ adresinde açar (ayrı port = ayrı tarayıcı hafızası).
# Kullanım:  sh tools/serve.sh [port]     →  iki geliştirici farklı port kullansın (örn. 8080 / 8081)
cd "$(dirname "$0")/../src" && python3 -m http.server "${1:-8080}"
