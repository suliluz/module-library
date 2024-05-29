#!/bin/bash

# Update package index
sudo apt-get update

# Attempt to install from packages first (recommended)
if sudo apt-get install -y ffmpeg libavcodec-extra libsvtav1 imagemagick; then
    echo "Successfully installed FFmpeg, libsvtav1, and ImageMagick from packages."
    exit 0
else
    echo "Some packages not found, proceeding to build from source."
fi

# Install dependencies for building from source
sudo apt-get -y install \
    git \
    autoconf \
    automake \
    build-essential \
    cmake \
    libass-dev \
    libfreetype6-dev \
    libgnutls28-dev \
    libmp3lame-dev \
    libsdl2-dev \
    libtool \
    libva-dev \
    libvdpau-dev \
    libvorbis-dev \
    libxcb1-dev \
    libxcb-shm0-dev \
    libxcb-xfixes0-dev \
    meson \
    ninja-build \
    pkg-config \
    texinfo \
    wget \
    yasm \
    zlib1g-dev \
    libunistring-dev \
    libaom-dev \
    libdav1d-dev \
    libopus-dev \
    libwebp-dev \
    python3 \
    python3-pip \
    gcc \
    g++ \
    python3-dev \
    libjpeg-turbo8-dev \
    libpng-dev \
    libssl-dev

# Install libsvtav1 dependency for ffmpeg
git clone --recurse-submodules https://gitlab.com/AOMediaCodec/SVT-AV1.git
cd SVT-AV1/Build
cmake .. -G"Unix Makefiles" -DCMAKE_BUILD_TYPE=Release
make -j $(nproc)
sudo make install
cd ../..

# Install ffmpeg
git clone --recurse-submodules https://git.ffmpeg.org/ffmpeg.git
cd ffmpeg
export LD_LIBRARY_PATH+=":/usr/local"
export PKG_CONFIG_PATH+=":/usr/local/pkgconfig"
./configure --enable-libdav1d --enable-libsvtav1 --enable-libaom --enable-libopus --enable-gpl --enable-nonfree
make -j $(nproc)
sudo make install
cd ..

# Install imagemagick
git clone --recurse-submodules https://github.com/ImageMagick/ImageMagick.git
cd ImageMagick
./configure --with-modules --with-perl
make -j $(nproc)
sudo make install

# Load symlinks
sudo ldconfig /usr/local

# Clean up
cd ..
rm -rf SVT-AV1
rm -rf ffmpeg
rm -rf ImageMagick
