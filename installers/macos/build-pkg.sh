#!/bin/bash
set -e

VERSION=${1:-1.0.0}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
PKG_ROOT="$SCRIPT_DIR/pkgroot"

rm -rf "$PKG_ROOT" "$DIST_DIR"
mkdir -p "$PKG_ROOT/usr/local/bin" "$DIST_DIR"

cp "$ROOT_DIR/toneai-setup-mac-arm64" "$PKG_ROOT/usr/local/bin/toneai-setup-arm64"
cp "$ROOT_DIR/toneai-setup-mac-x64"   "$PKG_ROOT/usr/local/bin/toneai-setup-x64"
chmod +x "$PKG_ROOT/usr/local/bin/toneai-setup-arm64"
chmod +x "$PKG_ROOT/usr/local/bin/toneai-setup-x64"

cat > "$PKG_ROOT/usr/local/bin/toneai-setup" << 'EOF'
#!/bin/bash
ARCH=$(uname -m)
DIR="$(dirname "$(readlink -f "$0")")"
if [ "$ARCH" = "arm64" ]; then
  exec "$DIR/toneai-setup-arm64" "$@"
else
  exec "$DIR/toneai-setup-x64" "$@"
fi
EOF
chmod +x "$PKG_ROOT/usr/local/bin/toneai-setup"

pkgbuild \
  --root "$PKG_ROOT" \
  --identifier "com.stevekrisjanovs.toneai-setup" \
  --version "$VERSION" \
  --install-location "/" \
  "$DIST_DIR/toneai-setup-$VERSION-macos.pkg"

echo "Built: $DIST_DIR/toneai-setup-$VERSION-macos.pkg"
