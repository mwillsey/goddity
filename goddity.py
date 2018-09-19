import copy
import json

import networkx as nx
import http.server

class State:

    def step(self, action):
        pass

    def heuristic(self):
        pass

def run(state):

    init = copy.deepcopy(state)
    graph = nx.DiGraph()
    graph.add_node(init)
    old_states = [init]

    while True:
        print(state)

        # query the user
        possible = state.heuristic()
        for i, p in enumerate(possible):
            print('{}. {}'.format(i, p))

        while True:
            try:
                choice = input('Pick one: ')
                if choice == 'b':
                    choice = old_states.pop()
                    break
                choice = possible[int(choice)]
                break
            except Exception as e:
                print(e)
                pass

        # take the action
        if choice in graph:
            state = copy.deepcopy(choice)
        else:
            state.step(choice)
            new_state = copy.deepcopy(state)
            graph.add_edge(old_states[-1], new_state)
            old_states.append(new_state)

STATIC_FILES = ['/', '/index.html', '/main.js']

class RequestHandler(http.server.SimpleHTTPRequestHandler):

    def do_POST(self):
        print('post')
        if self.path == '/make_choice':
            content_len = int(self.headers.get('Content-Length', 0))
            data_string = self.rfile.read(content_len)
            data = json.loads(data_string)

            self.server.step(int(data['choice']))

            self.send_response(200)
            self.send_header('Content-type','application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "ok"}')
        else:
            self.send_response(400)
            self.end_headers()

    def do_GET(self):

        if self.path in STATIC_FILES:
            super().do_GET()

        elif self.path == '/possibilities':
            self.send_response(200)
            self.send_header('Content-type','application/json')
            self.end_headers()
            s = json.dumps(self.server.render_choices())
            self.wfile.write(str.encode(s))

        elif self.path == '/state':
            self.send_response(200)
            self.send_header('Content-type','application/json')
            self.end_headers()
            s = json.dumps(self.server.state.render_state())
            self.wfile.write(str.encode(s))

        else:
            self.send_response(400)
            self.end_headers()

class Server(http.server.HTTPServer):
    def __init__(self, address, state, req_handler = RequestHandler):
        self.state = state

        init = copy.deepcopy(state)
        self.graph = nx.DiGraph()
        self.graph.add_node(init)
        self.old_states = [init]

        self.possible = state.heuristic()

        super().__init__(address, req_handler)

    def render_choices(self):
        return [
            self.state.render_action(act)
            for act in self.possible
        ]

    def step(self, choice_index):
        choice = self.possible[choice_index]
        self.state.step(choice)
        self.possible = self.state.heuristic()


def run_app(state):

    PORT = 5000
    print("hellow")
    with Server(("", PORT), state) as httpd:
        print("serving at port", PORT)
        httpd.serve_forever()
