#!/bin/sh

curl https://sh.rustup.rs -sSf | sh -s -- -y
source $HOME/.cargo/env
yum install make glibc-devel gcc patch
cargo build --release

sudo ./run.sh
