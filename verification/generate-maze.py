import random

DIRECTIONS = ((1, 0), (-1, 0), (0, 1), (0, -1))
ALL_DIRECT = ((-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1))


def printMaze(maze):
    for line in maze:
        print(' '.join(['X' if el == 1 else "-" for el in line]))


def neighbours(coor, maze, direct=DIRECTIONS):
    x, y = coor
    N = len(maze)
    res = []
    for d in direct:
        nx = x + d[0]
        ny = y + d[1]
        if 0 < nx < N - 1 and 0 < ny < N - 1:
            res.append((nx, ny))
    return res


def carve(coor, maze):
    maze[coor[0]][coor[1]] = 0


def isOpen(coor, maze):
    return not maze[coor[0]][coor[1]]


def generateMaze(N):
    maze = [[1] * N for _ in range(N)]
    start = (1, 1)
    exit = (N - 2, N - 2)
    queue = [start]
    good_neighs = []
    while queue or good_neighs:
        if good_neighs:
            current = random.choice(good_neighs)
            queue.append(current)
        else:
            current = queue[-1]
        carve(current, maze)
        neighs = [n for n in neighbours(current, maze) if not isOpen(n, maze)]
        good_neighs = []
        for n in neighs:
            new_neighs = neighbours(n, maze, ALL_DIRECT)
            all_current_neighs = neighbours(current, maze)
            for cn in all_current_neighs:
                if cn in new_neighs:
                    new_neighs.remove(cn)
            if len([1 for x, y in new_neighs if maze[x][y] == 0]) <= 1:
                good_neighs.append(n)
        if not good_neighs:
            queue.remove(current)
    maze[10][10] = 0
    return maze


def generateGoodMaze(N):
    while True:
        mz = generateMaze(12)
        if mz[9][10] and mz[10][9]:
            continue
        return mz