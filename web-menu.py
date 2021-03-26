#!/usr/bin/python3

import json
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
    return render_template('index.html',host=hostname, code=code, butterfly=butterfly, bricks=bricks)

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
        return jsonify(status=0,list=nodes)
    except:
        return jsonify(status=-1,list=[])

@app.route('/service')
def get_services():
    try:
        services = get_service_list()
        m = []
        n = []
        for i in services:
            m.append(get_service_type(i))
            n.append(get_service_node(i))
        return jsonify(status=0,list=services,type=m,node=n)
    except:
        return jsonify(status=-1,list=[],type=[],node=[])

@app.route('/topic')
def get_topic():
    try:
        topics = get_topic_list()
        t = []
        m = []
        n = []
        for i in topics[0]:
            t.append(i[0])
            m.append(i[1])
            k = ""
            for j in i[2]:
                k += j + ","
            k = k[0:len(k)-1]
            n.append(k)
        return jsonify(status=0,list=t,type=m,node=n)
    except:
        return jsonify(status=-1,list=[],type=[],node=[])

try:
    argv = sys.argv
    sleep(10)
    with open("./static/config/ports.json","r") as f:
        config = json.load(f)
        if config['hostname'] == "":
            hostname = os.popen('ip addr show {}'.format(argv[argv.index('--interface')+1])).read().split("inet ")[1].split("/")[0]
        else:
            hostname = config['hostname']

    butterfly = config['butterfly']
    code = config['code']
    bricks = config['bricks']
    app.run(host=hostname,port=9090)
except:
    pass
