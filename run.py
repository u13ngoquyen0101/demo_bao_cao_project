import sys
import os
import webbrowser
from threading import Timer

if getattr(sys, 'frozen', False):
    os.chdir(sys._MEIPASS)

from app import app

def open_browser():
    webbrowser.open('http://127.0.0.1:5000')

Timer(1.5, open_browser).start()

if __name__ == '__main__':
    app.run(debug=False, port=5000)
