#!/usr/bin/python3

import json
from typing import ContextManager
from rosnode import get_node_names
from rosservice import get_service_list, get_service_type, get_service_node
from rostopic import get_topic_list
import os, sys, subprocess
from time import sleep
from flask import Flask,render_template,jsonify,request

app = Flask(__name__)
roscore = None
launch = None

@app.route('/')
def index():
    global hostname
    global butterfly
    global code
    global bricks
    global global_net
    if global_net == "":
        return render_template('index.html',host=hostname, code=code, butterfly=butterfly, bricks=bricks)
    else:
        return render_template('index.html',host=global_net, code=code, butterfly=butterfly, bricks=bricks)

@app.route('/com',methods=['POST'])
def com():
    global roscore
    c = int(request.form['com'])
    if(c==1):
        roscore = subprocess.Popen("roscore", stdout=subprocess.DEVNULL)
        return jsonify(status=1)
    else:
        if roscore != None:
            roscore.terminate()
            roscore = None
        return jsonify(status=0)
    return jsonify(status=-1)
    
@app.route('/launch_start',methods=['POST'])
def launch_start():
    global launch
    launch = subprocess.Popen(["roslaunch","gs_core","pioneer.launch"], stdout=subprocess.DEVNULL)
    return jsonify(status=1)

@app.route('/launch_stop',methods=['POST'])
def launch_stop():
    global launch
    if launch == None:
        return jsonify(status=0)
    else:
        launch.terminate()
        launch = None
        return jsonify(status=1)

@app.route('/launch_status')
def launch_status():
    global launch
    if launch == None:
        return jsonify(status=0)
    else:
        return jsonify(status=1)

@app.route('/core')
def core():
    try:
        get_node_names()
        return jsonify(status=1)
    except:
        return jsonify(status=0)

@app.route('/node')
def get_nodes():
    try:
        nodes = get_node_names()
        return jsonify(status=0,result=[nodes])
    except:
        return jsonify(status=-1,result=[])

@app.route('/service')
def get_services():
    try:
        services = get_service_list()
        content = []
        for i in services:
            content.append([i, get_service_type(i), get_service_node(i)])

        return jsonify(status=0,result=content)
    except:
        return jsonify(status=-1,result=[])

@app.route('/topic')
def get_topic():
    try:
        topics = get_topic_list()

        content = []
        for i in topics[0]:
            k = ""
            for j in i[2]:
                k += j + ","
            k = k[0:len(k)-1]
            content.append([i[0], i[1], k])

        return jsonify(status=0,result=content)
    except:
        return jsonify(status=-1,result=[])

try:
    argv = sys.argv
    sleep(10)
    with open("./static/config/ports.json","r") as f:
        config = json.load(f)

    hostname = os.popen('ip addr show {}'.format(argv[argv.index('--interface')+1])).read().split("inet ")[1].split("/")[0]
    global_net = config['global']
    butterfly = config['butterfly']
    code = config['code']
    bricks = config['bricks']
    app.run(host=hostname,port=9090)
except:
    pass
