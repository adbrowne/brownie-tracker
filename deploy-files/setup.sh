#!/bin/bash

yum install -y git certbot nginx python3-certbot-nginx cronie


EC2_HOME=/home/ec2-user
APP_DIR=$EC2_HOME/app/
# TODO lookup allocation-id rather than hardcoding
aws ec2 associate-address --instance-id "$(ec2-metadata -i --quiet)" --allocation-id eipalloc-0d09f30c55b0cfb5d --allow-reassociation

SSH_DIR=$EC2_HOME/.ssh
# setup github auth
mkdir -p $SSH_DIR
touch $SSH_DIR/known_hosts
echo "github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl" >> $SSH_DIR/known_hosts
echo "github.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj7ndNxQowgcQnjshcLrqPEiiphnt+VTTvDP6mHBL9j1aNUkY4Ue1gvwnGLVlOhGeYrnZaMgRK6+PKCUXaDbC7qtbW8gIkhL7aGCsOr/C56SJMy/BCZfxd1nWzAOxSDPgVsmerOBYfNqltV9/hWCqBywINIR+5dIg6JTJ72pcEpEjcYgXkE2YEFXV1JHnsKgbLWNlhScqb2UmyRkQyytRLtL+38TGxkxCflmO+5Z8CSSNY7GidjMIZ7Q4zMjA2n1nGrlTDkzwDCsw+wqFPGQA179cnfGWOWRVruj16z6XyvxvjJwbz0wQZ75XK5tKSb7FNyeIEs4TT4jk+S4dhPeAUC5y+bDYirYgM4GC7uEnztnZyaVWQ7B381AK4Qdrwt51ZqExKbQpTUNn+EjqoTwvqNj4kqx5QUCI0ThS/YkOxJCXmPUWZbhjpCg56i+2aB6CmK2JGhn57K5mj0MNdBXA4/WnwH6XoPWJzK5Nyu2zB3nAZp+S5hpQs+p1vN1/wsjk=" >>$SSH_DIR/known_hosts
echo "github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=" >>$SSH_DIR/known_hosts
aws secretsmanager get-secret-value --secret-id "arn:aws:secretsmanager:ap-southeast-2:662430452979:secret:brownie-tracker-git-key-H6Nh6k" --output text --query SecretString | sed 's/\r//' > $SSH_DIR/id_rsa
chown -R ec2-user:ec2-user $SSH_DIR
chmod 0600 $SSH_DIR/id_rsa

# setup certifications
mkdir -p /etc/letsencrypt/live/tracker.brownie.com.au/ 
cp $APP_DIR/letsencrypt/* /etc/letsencrypt/live/tracker.brownie.com.au/ 
cp $APP_DIR/nginx.conf /etc/nginx/nginx.conf

systemctl start nginx
systemctl enable nginx

chmod +x $APP_DIR/brownie-tracker

systemctl enable brownie-tracker
systemctl start brownie-tracker

chmod +x $APP_DIR/cron.sh

crontab -u ec2-user -l | grep -q 'cron.sh'  && echo 'crontab exists' || (crontab -u ec2-user -l 2>/dev/null; echo "*/5 * * * * /home/ec2-user/app/cron.sh >> /home/ec2-user/cron.log") | crontab -u ec2-user -
systemctl start crond
systemctl enable crond

