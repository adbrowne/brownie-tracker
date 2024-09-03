#!/bin/sh
cd /home/ec2-user/data-repo
git add .
git commit -am "Automatic commit"
git pull
git push
