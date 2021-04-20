#!/usr/bin/python3

import os, sys, json
from time import sleep
from rosnode import get_node_names
from rosservice import get_service_list, get_service_type, get_service_node
from rostopic import get_topic_list
import subprocess
from flask import Flask,render_template,jsonify,request

app = Flask(__name__)
roscore = None
launch = None
port = 9090

@app.route('/')
def index():
    global hostname
    global butterfly
    global code
    global bricks
    global global_net
    if global_net == "":
        return render_template('index.html',host=hostname, code=code, butterfly=butterfly, bricks=bricks, port=port)
    else:
        return render_template('index.html',host=global_net, code=code, butterfly=butterfly, bricks=bricks, port=port)

@app.route('/core',methods=['POST'])
def com():
    global roscore
    if request.get_json()['command'] == 1:
        roscore = subprocess.Popen("roscore", stdout=subprocess.DEVNULL)
        return jsonify(status=1)
    else:
        if roscore != None:
            roscore.terminate()
            roscore = None
        return jsonify(status=0)
    
@app.route("/launch", methods=['POST'])
def launcher():
    global launch
    if request.get_json()["command"] == 1:
        launch = subprocess.Popen(["roslaunch","gs_core","pioneer.launch"], stdout=subprocess.DEVNULL)
        return jsonify(status=1)
    elif request.get_json()["command"] == 0:
        if launch == None:
            return jsonify(status=0)
        else:
            launch.terminate()
            launch = None
            return jsonify(status=1)

@app.route('/status')
def status():
    global launch
    core = False
    try:
        get_node_names()
        core = True
    except:
        pass
    if launch == None:
        return jsonify(core=int(core), launch=0)
    else:
        return jsonify(core=int(core), launch=1)
    

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
    app.run(host=hostname,port=port)
except:
    pass
