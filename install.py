import os
from utils.file import get_path, get_username
import argparse

if __name__ == '__main__':
    path = get_path()
    parser = argparse.ArgumentParser()
    parser.add_argument("-r", "--ros", type=str, default='noetic')
    args = parser.parse_args()
    with open('start.sh', 'w') as f:
        f.write("#!/bin/bash\n")
        f.write(f"source /opt/ros/{args.ros}/setup.bash\n")
        f.write(f"source /home/{get_username()}/geoscan_ws/devel/setup.bash\n")
        f.write(f"python3 {path}/web-menu.py\n")

    os.system(f"sudo chmod u+x {path}/start.sh")