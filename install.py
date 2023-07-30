import os
from utils.file import get_path, get_username

if __name__ == '__main__':
    path = get_path()
    with open('start.sh', 'w') as f:
        f.write("#!/bin/bash\n")
        f.write("source /opt/ros/noetic/setup.bash\n")
        f.write(f"source /home/{get_username()}/geoscan_ws/devel/setup.bash\n")
        f.write(f"python3 {path}/web-menu.py\n")

    os.system(f"sudo chmod u+x {path}/start.sh")