#!/usr/bin/python3

import json
from time import sleep
from rosnode import get_node_names
from rosservice import get_service_list, get_service_type, get_service_node
from rostopic import get_topic_list
import subprocess
from flask import Flask, render_template, jsonify, request, Response
from flask_socketio import SocketIO, emit
from utils.autopilot import AutopilotManger

import eventlet
eventlet.monkey_patch()

class EndpointAction(object):

    def __init__(self, action):
        self.action = action

    def __call__(self, *args):
        return self.action()

class WebMenuServer:
    def __init__(self, config_path, debug_ros = False):
        self.__config_path = config_path
        self._debug_ros = debug_ros
        self._app = Flask(__name__)
        self._socketio = SocketIO(self._app, logger=True, engineio_logger=True)
        self._roscore = None
        self._launch = None

        config = self.load_config(f"{self.__config_path}/config.json")
        self._hostname = config['hostname']
        self._port = config['port']
        self.__ap_serial = config['autopilot']['serial']
        self.__ap_baud = config['autopilot']['baudrate']
        self.__progress = 0
        if self._debug_ros:
            self._manager = None
        else:
            self._manager = AutopilotManger(config['autopilot']['serial'], config['autopilot']['baudrate'])

    def __add_endpoint(self, endpoint="", handler=None, methods=['GET'], socketio=False):
        if socketio:
            self._socketio.on_event("get", handler, endpoint)
        else:
            self._app.add_url_rule(endpoint, endpoint, EndpointAction(handler), methods=methods)

    def load_config(self, path):
        with open(path,"r") as f:
            config = json.load(f)

        return config
    
    def run(self):
        self.__add_endpoint("/", self.index)
        self.__add_endpoint("/core", self.core, methods=['POST'])
        self.__add_endpoint("/launch", self.launch, methods=['POST'])
        self.__add_endpoint("/update", self.update_ap, methods=["POST"])
        self.__add_endpoint('/params', self.params, methods=["GET", "POST"])
        self.__add_endpoint("/restart", self.restart, methods=["POST"])
        self.__add_endpoint('/navigation', self.navigation_system, methods=["GET", "POST"])
        self.__add_endpoint("/status", self.status, socketio=True)
        self.__add_endpoint("/node", self.get_nodes, socketio=True)
        self.__add_endpoint("/service", self.get_services, socketio=True)
        self.__add_endpoint("/topic", self.get_topic, socketio=True)
        self.__add_endpoint("/progress", self.progress, socketio=True)
        if not self._debug_ros:
            self._manager.connect()
        self._socketio.run(self._app, host=self._hostname, port=self._port, debug=True)

    def index(self):
        return render_template('index.html', host=self._hostname, port=self._port)

    def core(self):
        print(request.get_json())
        if request.get_json()['command'] == 1:
            if self._debug_ros:
                self._roscore = True
            else:
                self._roscore = subprocess.Popen("roscore", stdout=subprocess.DEVNULL)
            return jsonify(status=1)
        else:
            if self._roscore is not None:
                if not self._debug_ros:
                    self._roscore.terminate()
                self._roscore = None
            return jsonify(status=0)
    
    def launch(self):
        command = request.get_json()["command"]
        if command == 1:
            if self._debug_ros:
                self._launch = True
            else:
                self._launch = subprocess.Popen(["roslaunch","gs_core","pioneer.launch"], stdout=subprocess.DEVNULL)
            return jsonify(status=1)
        elif command == 0:
            if self._debug_ros:
                self._launch = None
            else:
                if self._launch is None:
                    return jsonify(status=0)
                else:
                    self._launch.terminate()
                    self._launch = None
                    return jsonify(status=1)

    def status(self):
        core = False
        launch = self._launch is not None
        try:
            if self._debug_ros:
                core = self._roscore is not None or self._launch is not None
            else:
                get_node_names()
                core = True
        except:
            pass
        emit('response', {'core': int(core), 'launch': int(launch)})
    
    def get_nodes(self):
        if self._debug_ros:
            if self._roscore is not None or self._launch is not None:
                content = [['/rosout']]
                emit('response', {'status': 0, 'result': content})
            else:
                emit('response', {'status': -1, 'result': []})
        else:
            try:
                nodes = get_node_names()
                content = []
                for node in nodes:
                    content.append([node])
                emit('response', {'status': 0, 'result': content})
            except:
                emit('response', {'status': -1, 'result': []})

    def get_services(self):
        if self._debug_ros:
            if self._roscore is not None or self._launch is not None:
                content = [['/rosout/get_loggers', 'roscpp/GetLoggers', '/rosout'], ['/rosout/set_logger_level', 'roscpp/SetLoggerLevel', '/rosout']]
                emit('response', {'status': 0, 'result': content})
            else:
                emit('response', {'status': -1, 'result': []})
        else:
            try:
                services = get_service_list()
                content = []
                for i in services:
                    content.append([i, get_service_type(i), get_service_node(i)])

                emit('response', {'status': 0, 'result': content})
            except:
                emit('response', {'status': -1, 'result': []})

    def get_topic(self):
        if self._debug_ros:
            if self._roscore is not None or self._launch is not None:
                content = [['/rosout_agg', 'rosgraph_msgs/Log', '/rosout']]
                emit('response', {'status': 0, 'result': content})
            else:
                emit('response', {'status': -1, 'result': []})
        else:
            try:
                topics = get_topic_list()

                content = []
                for i in topics[0]:
                    k = ""
                    for j in i[2]:
                        k += j + ","
                    k = k[0:len(k)-1]
                    content.append([i[0], i[1], k])

                emit('response', {'status': 0, 'result': content})
            except:
                emit('response', {'status': -1, 'result': []})

    def __update_progress(self, percent):
        print(percent)
        self.__progress = percent

    def update_ap(self):
        for name in request.files.keys():
            file = b''.join(request.files[name].stream.readlines())
        if self._debug_ros:
            def callback(object, sio):
                for i in range(101):
                    object.__progress = i
                    sio.sleep(0.05)
            self._socketio.start_background_task(lambda: callback(self, self._socketio))
        else:
            self._socketio.start_background_task(lambda : self._manager.upload_ap(self._socketio, file, self.__update_progress))
        return Response(status=200)
    
    def progress(self):
        emit('response', {'progress' : self.__progress})

    def params(self):
        if self._debug_ros:
            if request.method == 'POST':
                print(request.get_json())
            else:
                return jsonify(params=[['Param1', 0]])
        else:
            if request.method == 'POST':
                self._manager.set_params(request.get_json())
                self._manager.restart()
            else:
                return jsonify(params=self._manager._params)
        return Response(status=200)

    def restart(self):
        if not self._debug_ros:
            self._manager.restart()
        return Response(status=200)
    
    def navigation_system(self):
        params_raw = self.load_config(f"{self.__config_path}/properties.json")
        
        if self._debug_ros:
            if request.method == 'POST':
                current = request.get_json()['current']
                system_param = params_raw[list(params_raw)[current]]
                param = [[key, system_param[key]] for key in params_raw[list(params_raw)[current]]]
                print(param)
                return Response(status=200)
            else:
                print(params_raw.keys())
                return jsonify(systems=list(params_raw), current=0)
        else:
            if request.method == 'POST':
                current = request.get_json()['current']
                system_param = params_raw[list(params_raw)[current]]
                param = [[key, system_param[key]] for key in params_raw[list(params_raw)[current]]]

                self._manager.set_params(param)
                self._manager.restart()
                return Response(status=200)
            else:
                current = 0
                for param in self._manager._params:
                    if param[0] == "Flight_com_navSystem":
                        current = param[1]
                        break
                return jsonify(systems=list(params_raw), current=current)

if __name__ == '__main__':
    from utils.file import get_path
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("-d", "--debug", action="store_true")
    parser.add_argument("-dr", "--debug_ros", action="store_true")
    args = parser.parse_args()
    try:
        if not args.debug:
            sleep(10)
        config_path = f"{get_path()}/static/config/"

        web_menu = WebMenuServer(config_path, args.debug_ros)
        web_menu.run()
    except Exception as e:
        print(str(e))