#!/bin/sh

export RUSTUP_IO_THREADS=1                   # ensure it doesn't die on my tiny instance
curl https://sh.rustup.rs -sSf | sh -s -- -y # silently says yes to defaults
source $HOME/.cargo/env
yum install make glibc-devel gcc patch openssl-devel
cargo build --release

sudo ./run.sh
