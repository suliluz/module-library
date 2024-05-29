#!/bin/sh

# Update package index
sudo apk update

# Install dependencies
sudo apk add --no-cache \
    autoconf \
    automake \
    build-base \
    cmake \
    freetype-dev \
    git \
    gnutls-dev \
    lame-dev \
    libass-dev \
    libtool \
    libva-dev \
    libvorbis-dev \
    libwebp-dev \
    meson \
    ninja \
    pkgconfig \
    python3 \
    py3-pip \
    sdl2-dev \
    texinfo \
    wget \
    xcb-dev \
    xcb-shm-dev \
    xcb-util-fixes-dev \
    yasm \
    zlib-dev \
    aom-dev \
    dav1d-dev \
    jpeg-dev \
    libpng-dev \
    libunistring-dev \
    musl-dev \
    opus-dev \
    lcms2-dev

# Install libsvtav1 (for FFmpeg)
git clone --recurse-submodules https://gitlab.com/AOMediaCodec/SVT-AV1.git
cd SVT-AV1/Build
cmake .. -G"Unix Makefiles" -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
sudo make install
cd ../..

# Install FFmpeg
git clone --recurse-submodules https://git.ffmpeg.org/ffmpeg.git
cd ffmpeg
./configure --prefix=/usr/local --enable-libdav1d --enable-libsvtav1 --enable-libaom --enable-libopus --enable-gpl
make -j$(nproc)
sudo make install
cd ..

sudo apk add imagemagick

# Clean up
rm -rf SVT-AV1 ffmpeg

