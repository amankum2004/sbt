#!/bin/bash
cd /home/ec2-user/sbt/Server
npm install
pm2 restart salonhub-backend
