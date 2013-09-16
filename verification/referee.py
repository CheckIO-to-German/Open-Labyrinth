from checkio.signals import ON_CONNECT
from checkio import api
from checkio.referees.io import CheckiOReferee

import tests

MOVE = {"S": (1, 0), "N": (-1, 0), "W": (0, -1), "E": (0, 1)}


def check_route(labyrinth, route):
    pos = (1, 1)
    goal = (10, 10)
    if not isinstance(route, str):
        return False, (route, "You return not a string.")
    for i, d in enumerate(route):
        move = MOVE.get(d, None)
        if not move:
            return False, (route, "Wrong symbol in route")
        pos = pos[0] + move[0], pos[1] + move[1]
        if pos == goal:
            return True, (route[0:i + 1], "Player reached the exit")
        if labyrinth[pos[0]][pos[1]] == 1:
            return False, (route[0:i + 1], "Player in the pit")
    return False, (route, "Player did not reach exit")


api.add_listener(
    ON_CONNECT,
    CheckiOReferee(
        tests=tests.TESTS,
        checker=check_route
    ).on_ready)
