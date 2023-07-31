from proto import Messenger, SerialStream
from threading import Thread
from time import sleep

class AutopilotManger:
    def __init__(self, port='/dev/ttyS0', baud=57600):
        self.__port = port
        self.__baud = baud
        self._serial = SerialStream(self.__port, self.__baud)
        self._messenger = Messenger(self._serial)
        self._connection = False
        self._params = []

        self.__update_threading = False

    def connect(self):
        self._messenger.connect()
        self._params = self.get_params()

    def get_uav_file(self):
        if not self._connection:
            component = None
            for com in self._messenger.hub.components.values():
                if com.name == 'UavMonitor':
                    component = com
                    break
            return component.files[6]
        return None

    def __progress_update(self, uav, progress_callback):
        while self.__update_threading:
            progress_callback(uav.getProgress()[0] * 100.0)

    def __finish_update_callback(self, s, data):
        self.__update_threading = False
        self.restart()

    def upload_ap(self, iboot_file, progress_callback=None):
        uav_file = self.get_uav_file()
        if uav_file is not None:
            uav_file.write(data=iboot_file, callback=self.__finish_update_callback)

            self.__update_threading = True
            self.__progress_update(uav_file, progress_callback)
            return True
        return False
    
    def restart(self):
        self._messenger.hub.sendCommand(18)
        # self.disconnect()

    def disconnect(self):
        self._messenger.stop()
        self._messenger.handler.stream.socket.close()

    def get_params(self):
        params = []
        for i in range(self._messenger.hub.getParamCount()):
            name, value = self._messenger.hub.getParam(i)
            params.append([name, value])
        return params
    
    def set_params(self, params):
        for param in params:
            for ap_param in self._params:
                if ap_param[0] == param[0] and ap_param[1] != param[1]:
                    self._messenger.hub.setParam(name = param[0], value = float(param[1]))