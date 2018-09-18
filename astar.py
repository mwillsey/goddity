import networkx as nx

import goddity

class State(goddity.State):
    def __init__(self, graph, src, dst):
        self.graph = nx.DiGraph(graph)
        assert src in graph
        assert dst in graph

        self.src = src
        self.dst = dst

        self.visited = {n: float('inf') for n in graph}
        self.visited[src] = 0

    def heuristic(self):
        return list(self.graph.out_edges(n for n, cost
                                    in self.visited.items()
                                    if cost != float('inf')))

    def render_action(self, edge):
        (u,v) = edge
        return '{} -> {}'.format(u,v)

    def step(self, edge):
        (u,v) = edge
        assert u in self.graph
        self.visited[v] = min(self.visited[v], self.visited[u] + 1)


graph = nx.grid_graph([4,4])
graph.remove_node((2,2))
graph.remove_node((1,2))

state = State(graph, (0,0), (3,3))
print('hello')

if __name__ == '__main__':
    print("HELLOE")
    goddity.run_app(state)
