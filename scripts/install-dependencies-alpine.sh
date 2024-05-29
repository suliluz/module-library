#!/bin/sh

# Update package index
sudo apk update

# Install dependencies
sudo apk add --no-cache \
    git \
    autoconf \
    automake \
    build-base \
    cmake \
    libass-dev \
    freetype-dev \
    gnutls-dev \
    lame-dev \
    sdl2-dev \
    libtool \
    libva-dev \
    vdpau-dev \
    libvorbis-dev \
    xcb-dev \
    xcb-shm-dev \
    xcb-util-fixes-dev \
    meson \
    ninja \
    pkgconfig \
    texinfo \
    wget \
    yasm \
    zlib-dev \
    libunistring-dev \
    aom-dev \
    dav1d-dev \
    opus-dev \
    libwebp-dev \
    python3 \
    py3-pip \
    gcc \
    g++ \
    python3-dev \
    musl-dev \
    libjpeg-turbo-dev \
    zlib-dev \
    libpng-dev \
    libressl-dev

# Install libsvtav1 dependency for ffmpeg
git clone --recurse-submodules https://gitlab.com/AOMediaCodec/SVT-AV1.git
cd SVT-AV1/Build
cmake .. -G"Unix Makefiles" -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
sudo make install
cd ../..

# Install ffmpeg
git clone --recurse-submodules https://git.ffmpeg.org/ffmpeg.git
cd ffmpeg
./configure --enable-libdav1d --enable-libsvtav1 --enable-libaom --enable-libopus
make -j$(nproc)
sudo make install
cd ..

# Install imagemagick
git clone --recurse-submodules https://github.com/ImageMagick/ImageMagick.git
cd ImageMagick
./configure
make -j$(nproc)
sudo make install

# Clean up
cd ..
rm -rf SVT-AV1
rm -rf ffmpeg
rm -rf ImageMagick
