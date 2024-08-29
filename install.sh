#!/bin/sh

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
yum install make glibc-devel gcc patch
cargo build --release

sudo ./run.sh
