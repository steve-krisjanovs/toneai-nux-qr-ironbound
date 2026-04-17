#!/bin/bash
set -e

VERSION=${1:-1.0.0}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
PKG_DIR="$SCRIPT_DIR/deb/toneai-setup_${VERSION}_amd64"

rm -rf "$PKG_DIR" && mkdir -p "$PKG_DIR/usr/local/bin" "$PKG_DIR/DEBIAN" "$DIST_DIR"

cp "$ROOT_DIR/toneai-setup-linux-x64" "$PKG_DIR/usr/local/bin/toneai-setup"
chmod +x "$PKG_DIR/usr/local/bin/toneai-setup"

cat > "$PKG_DIR/DEBIAN/control" << EOF
Package: toneai-setup
Version: $VERSION
Section: utils
Priority: optional
Architecture: amd64
Maintainer: Steve Krisjanovs <steve.krisjanovs@gmail.com>
Description: Setup wizard for ToneAI NUX MightyAmp tone assistant
 ToneAI builds NUX MightyAmp presets from artist/song descriptions using AI.
 This wizard downloads ToneAI and installs all required dependencies.
 Homepage: https://github.com/steve-krisjanovs/toneai-nux-qr-ironbound
EOF

dpkg-deb --build "$PKG_DIR" "$DIST_DIR/toneai-setup_${VERSION}_amd64.deb"
echo "Built: $DIST_DIR/toneai-setup_${VERSION}_amd64.deb"
