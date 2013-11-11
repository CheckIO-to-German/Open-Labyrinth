//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });


        var sCell = 20;
        var zeroX = sCell;
        var zeroY = sCell;
        var userZeroX = sCell*2;
        var userZeroY = sCell*2;

        var colorBase = "#294270";
        var colorOrange = "#F0801A";
        var colorBlue = "#65A1CF";
        var nCell = 12;
        var delay = 130;
        var stepDelay = delay * 2;

        var DIRECTIONS = {"S":[1, 0], "N":[-1, 0], "E":[0, 1], "W":[0, -1]};

        var transformation = {
            "SS":"T0," + sCell, "SE":"R-90T" + sCell + ",0", "SW":"R90T-" + sCell + ",0", "SN":"R180T0,-" + sCell,
            "NS":"R180T0," + sCell, "NE":"R90T" + sCell + ",0", "NW":"R-90T-" + sCell + ",0", "NN":"T0,-" + sCell,
            "ES":"R90T0," + sCell, "EE":"T" + sCell + ",0", "EW":"R180T-" + sCell + ",0", "EN":"R-90T0,-" + sCell,
            "WS":"R-90T0," + sCell, "WE":"R180T" + sCell + ",0", "WW":"T-" + sCell + ",0", "WN":"R90T0,-" + sCell
        };

        function checkRoute(maze, route) {
            var resRoute = '';
            var message = 'Empty string';
            var current = [1, 1];
            var goal = [nCell - 2, nCell - 2];
            if (typeof(route) !== "string") {
                message = "Checkio return not string!";
                return [resRoute, message];
            }
            for (var i = 0; i < route.length; i++) {
                var ch = route[i];
                if ("SNWE".indexOf(ch) === -1) {
                    message = "Result string must contain only SNWE";
                    break;
                }
                resRoute += ch;
                var direct = DIRECTIONS[ch];
                current = [current[0] + direct[0], current[1] + direct[1]];
                if (String(current) === String(goal)) {
                    message = "Player reached the exit!";
                    break;
                }
                if (maze[current[0]][current[1]] === 1) {
                    message = "Player in the pit!";
                    break;
                }
            }
            return [resRoute, message]
        }


        function createLine(canvas, xs, ys, xe, ye) {
            return canvas.path("M" + xs + "," + ys + "L" + xe + "," + ye);
        }


        function createGrid(dom, grid) {
            var paper = Raphael(dom, sCell * (nCell + 2), sCell * (nCell + 2), 0, 0);
            for (var i = 0; i < nCell; i++) {
                grid[i] = [];
                for (var j = 0; j < nCell; j++) {
                    grid[i][j] = paper.rect(zeroX + (j * sCell), zeroY + (i * sCell), sCell, sCell).attr({
                        "stroke":colorBlue, "stroke-width":1
                    });
                }
            }
            paper.text(zeroX+nCell/2*sCell, sCell/2, "N").attr({"font-size": 18, "stroke": colorBase});
            paper.text(zeroX+nCell/2*sCell, sCell/2+(nCell+1)*sCell, "S").attr({"font-size": 18, "stroke": colorBase});
            paper.text(sCell/2, zeroY+nCell/2*sCell, "W").attr({"font-size": 18, "stroke": colorBase});
            paper.text(sCell/2+(nCell+1)*sCell, zeroY+nCell/2*sCell, "E").attr({"font-size": 18, "stroke": colorBase});
            return paper
        }

        function animateRoute(route, figure, timeoutIdArray) {
            for (var i = 1; i < route.length; i++) {
                var tid = setTimeout(function () {
                    var direction = route[i - 1] + route[i];
                    var tr = "..." + transformation[direction];
                    return function () {
                        figure.animate({"transform":tr}, delay);
                        return tr;
                    }
                }(),
                    i * (stepDelay));
                timeoutIdArray.push(tid);
            }
        }






        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }
            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(data.in) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var maze = data.in;
            var userResult = data.out;
            var result = data.ext["result"];
            var route = "S" + data.ext["result_addon"][0];
            var result_text = data.ext["result_addon"][1];

            var grid = [];
            var canvas = createGrid($content.find(".explanation")[0], grid);
            //
            for (var i = 0; i < nCell; i++) {
                for (var j = 0; j < nCell; j++) {
                    if (maze[i][j]) {
                        grid[i][j].attr({"stroke": colorBase, "fill": colorBase});
                    }
                }
            }
            grid[nCell - 2][nCell - 2].attr("fill", colorOrange);
            var triangle = canvas.path(Raphael.format("M{0},{1}L{2},{3}L{4},{5}L{6},{7}L{8},{9}z",
                    userZeroX + 3, userZeroY + 3, userZeroX + 10, userZeroY + 17, userZeroX + 17,
                    userZeroY + 3, userZeroX + 10, userZeroY + 6, userZeroX + 3, userZeroY + 3)).attr({
                    "color": colorBase, "stroke-width": 1, "fill": colorBase});

//            triangle.animate({"transform": "t200,200"}, 5000);
            animateRoute(route, triangle, []);
            var str_map_array = [];
            for (i = 0; i < maze.length; i++) {
                str_map_array[i] = maze[i].join(",")
            }
            var str_map = str_map_array.join("],<br>[");
            $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));

            if (!result) {
                $content.find('.call').html('Fail: checkio([<br>[' + str_map + '],<br>])');
                $content.find('.answer').html(result_text);

                $content.find('.output').addClass('error');
                $content.find('.answer').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio([<br>[' + str_map + '],<br>])');
                $content.find('.answer').html(result_text);
            }
            this_e.setAnimationHeight($content.height() + 60);

        });

        var tMaze = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1],
                [1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
                [1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];

        var player;
        var animationTimeouts = [];
        var tooltip = false;
        var $tryit;

        ext.set_console_process_ret(function(this_e, ret){
            $tryit.find(".checkio-result");
            if (!ret) {
                $tryit.find(".checkio-result .in-result").html("Empty result");
                return false;
            }
            ret = ret.replace("'", "");
            ret = ret.replace('"', '');
            var result = checkRoute(tMaze, ret);
            var route = result[0] !== '' ? "S" + result[0] : '';
            var message = result[1];
            animateRoute(route, player, animationTimeouts);
            player.transform("");
            $tryit.find(".checkio-result .in-result").html(message);
        });

        ext.set_generate_animation_panel(function(this_e){

            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit')));
            var tGrid = [];
            var tpaper = createGrid($tryit.find(".tryit-canvas")[0], tGrid);
            var fullCell = {"stroke":colorBase, "fill":colorBase, "fill-opacity":1};
            var emptyCell = {"stroke":colorBlue, "fill":colorBlue, "fill-opacity":0};
            $tryit.find(".tryit-canvas").mousedown(function (e) {
                e.originalEvent.preventDefault();
            });
            $tryit.find(".tryit-canvas").mouseenter(function(e) {
                if (tooltip) {
                    return false;
                }
                var $tooltip = $tryit.find(".tryit-canvas .tooltip");
                $tooltip.fadeIn(1000);
                setTimeout(function() {
                    $tooltip.fadeOut(1000);
                }, 2000);
                tooltip = true;
            });

            for (var i = 0; i < nCell; i++) {
                for (var j = 0; j < nCell; j++) {
                    if (tMaze[i][j]) {
                        tGrid[i][j].attr(fullCell);
                    }
                    else {
                        tGrid[i][j].attr(emptyCell);
                    }
                }
            }

            var mouseUpGrid = true;


            var toggleCellFunc = function (e) {
                var x = i;
                var y = j;
                var typeEvent = e;
                var self = this;
                return function () {
                    if (typeEvent === "mouseover" && mouseUpGrid) {
                        return false;
                    }
                    if (typeEvent === "mousedown") {
//                        e.preventDefault();
                        mouseUpGrid = false;
                    }
                    if (typeEvent === "mouseup") {
                        mouseUpGrid = true;
                        return false;
                    }
                    if (tMaze[x][y] == 1) {
                        tGrid[x][y].attr(emptyCell);
                        tMaze[x][y] = 0;
                    }
                    else {
                        tGrid[x][y].attr(fullCell);
                        tMaze[x][y] = 1;
                    }
                    for (var i = animationTimeouts.length; i >= 0; i--) {
                        clearTimeout(animationTimeouts[i]);
                    }

                    animationTimeouts = [];
                    setTimeout(function() {player.transform("");}, stepDelay * 2);

                }
            };

            for (i = 1; i < nCell - 1; i++) {
                for (j = 1; j < nCell - 1; j++) {
                    if ((i == 1 && j == 1) || (i == nCell - 2 && j == nCell - 2)) continue;
                    tGrid[i][j].mousedown(toggleCellFunc("mousedown"));
                    tGrid[i][j].mouseup(toggleCellFunc("mouseup"));
                    tGrid[i][j].mouseover(toggleCellFunc("mouseover"));
                }
            }

            player = tpaper.path(Raphael.format("M{0},{1}L{2},{3}L{4},{5}L{6},{7}L{8},{9}z",
                    userZeroX + 3, userZeroY + 3, userZeroX + 10, userZeroY + 17, userZeroX + 17,
                    userZeroY + 3, userZeroX + 10, userZeroY + 6, userZeroX + 3, userZeroY + 3)).attr({
                    "color":colorBase, "stroke-width":1, "fill":colorBase});

            tGrid[nCell-2][nCell-2].attr({"fill": colorOrange, "fill-opacity": 1});

            var $bn = $tryit.find(".bn-check");
            $bn.click(function (e) {
                //send tmaze
                this_e.sendToConsoleCheckiO(tMaze);
                e.stopPropagation();

                return false;
            });


        });


    }
);
