#!/bin/bash
set -e

VERSION=${1:-1.0.0}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
RPM_BUILD="$SCRIPT_DIR/rpmbuild"

rm -rf "$RPM_BUILD" && mkdir -p "$RPM_BUILD"/{BUILD,RPMS,SOURCES,SPECS,SRPMS} "$DIST_DIR"

mkdir -p "$RPM_BUILD/SOURCES/toneai-setup-$VERSION/usr/local/bin"
cp "$ROOT_DIR/toneai-setup-linux-x64" "$RPM_BUILD/SOURCES/toneai-setup-$VERSION/usr/local/bin/toneai-setup"
chmod +x "$RPM_BUILD/SOURCES/toneai-setup-$VERSION/usr/local/bin/toneai-setup"
cd "$RPM_BUILD/SOURCES" && tar czf "toneai-setup-$VERSION.tar.gz" "toneai-setup-$VERSION" && cd "$SCRIPT_DIR"

cat > "$RPM_BUILD/SPECS/toneai-setup.spec" << EOF
Name:           toneai-setup
Version:        $VERSION
Release:        1
Summary:        Setup wizard for ToneAI NUX MightyAmp tone assistant
License:        MIT
URL:            https://github.com/steve-krisjanovs/toneai-nux-qr-ironbound
Source0:        toneai-setup-%{version}.tar.gz

%description
ToneAI builds NUX MightyAmp presets from artist/song descriptions using AI.
This wizard downloads ToneAI and installs all required dependencies.

%prep
%setup -q -n toneai-setup-%{version}

%install
mkdir -p %{buildroot}/usr/local/bin
cp usr/local/bin/toneai-setup %{buildroot}/usr/local/bin/toneai-setup
chmod +x %{buildroot}/usr/local/bin/toneai-setup

%files
/usr/local/bin/toneai-setup

%changelog
* $(date '+%a %b %d %Y') Steve Krisjanovs <steve.krisjanovs@gmail.com> - $VERSION-1
- Release $VERSION
EOF

rpmbuild --define "_topdir $RPM_BUILD" -bb "$RPM_BUILD/SPECS/toneai-setup.spec"
cp "$RPM_BUILD/RPMS/x86_64/"*.rpm "$DIST_DIR/"
echo "Built: $DIST_DIR/toneai-setup-$VERSION-1.x86_64.rpm"
