#!/bin/bash
source /opt/ros/noetic/setup.bash
source /home/ubuntu/geoscan_ws/devel/setup.bash
python3 /home/ubuntu/web-menu/web-menu.py --interface wlan0
