/**
 * Created by Travis on 2014/7/12.
 */
var current_progress = 0;

var init = function () {
    scene = sjs.Scene({w:screen_w, h:screen_h});

    // load the images in parallel. When all the images are
    // ready, the callback function is called.
    scene.loadImages(['images/mario_8_bit.png', 'images/stone.png', 'images/medicine.png'], function() {

        // define the walking movements of mario
        var positions = [];
        for (var i = 0; i < 20; i++) {
            positions.push([i * 21 + 1, 13, 5]);
        }
        cycle = scene.Cycle(positions);

        // create mario and set movements
        crazy_mario = scene.Sprite('images/mario_8_bit.png');
        crazy_mario.size(mario_size[0],mario_size[1]);
        cycle.addSprite(crazy_mario);
        cycle.update();

        // various transformations
        crazy_mario.position(screen_w, mario_init_y);
        crazy_mario.rotate(Math.PI / 2);
        crazy_mario.update();

        ticker = scene.Ticker(paint);
        init_map();
        create_listeners();
        ticker.run();
    });
};

var create_listeners = function () {
    body = $('body');
    body.touchstart(function () {
        jump_collision_classify(crazy_mario, blocks.list);
    });
};

var refresh_map = function () {
    draw_map();
    current_progress += get_current_global_speed();
};
var restart = function () {
    crazy_mario.setX(screen_w);
    crazy_mario.setY(mario_init_y);
    crazy_mario.xv = 0;
    crazy_mario.yv = 0;
};

var paint = function () {
    cycle.next(5).update();

    // draw other blocks
    refresh_map();

    // return to the top if Mario falls down or goes beyond the border
    if (crazy_mario.x + mario_size[1] < 0 || crazy_mario.y< 0) {
        restart();
    }

    // update Mario's movements based on collision types;
    mario_movement_classify(crazy_mario, valuable_blocks(crazy_mario, blocks));
};

var valuable_blocks = function (crazy_mario, blocks) {
    var vb = [];
    var mx = crazy_mario.x, my = crazy_mario.y;
    for (var i = 0; i < blocks.list.length; i ++) {
        var b = blocks.list[i];
        if (Math.abs(b.x - mx) > block_size[0] * 3 || Math.abs(b.y - my) > block_size[1] * 3) {
            continue;
        }
        vb.push(b);
    }
    return vb;
}

var get_current_global_speed = function () {
    return Math.max(0, Math.floor(ticker.currentTick / speed_mutation_period) * speed_mutation_range
        - medicine_collected * medicine_efficacy ) + global_speed;
};

// init map
var init_map = function () {
    extend_map();
    draw_map();
};
var extend_map = function () {
    map = bogus_generate_map({height: map_height, length: map_growth + map.length}, map);
    // add the extended part of the map to the blocks
    for (var i = map.length - map_growth; i < map.length; i ++) {
        for (var j = 0; j < map.height; j ++) {
            var type = getElementAt(map, j, i);
            if (!type) continue;
            var block;
            if (1 == type) {
                block = scene.Sprite('images/stone.png');
            } else if (2 == type) {
                block = scene.Sprite('images/medicine.png');
            }
            block.position(j * block_size[1], i * block_size[0] - current_progress);
            blocks.add(block);
        }
    }
};

var draw_map = function () {
    // if map end is nigh, extend the original map
//    console.log("map length: " + map.length + "; progress: " + current_progress + "; buffer " + map_buffer_size);
    if (map.length < current_progress / block_size[0] + map_buffer_size) {
        extend_map();
    }
//    console.log(blocks.length);
    // update blocks' position
    for (var i = 0; i < blocks.length; i ++) {
        var block = blocks.list[i];
        // if block goes beyond the map, eliminate it
        if (block.y < - block_size[1]) {
            block.remove();
            blocks.remove(block);
            i --;
        } else {
            block.yv = - get_current_global_speed();
            block.applyYVelocity();
            block.update();
        }
    }
};



























