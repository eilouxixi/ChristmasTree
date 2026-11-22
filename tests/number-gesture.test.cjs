const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const source = html.split('// BEGIN NUMBER GESTURES')[1].split('// END NUMBER GESTURES')[0];
const { classifyHand, Gate, resolve } = vm.runInNewContext(source + '\n({classifyHand, Gate: NumberGestureGate, resolve: resolvePhotoNumber})');
const config = vm.runInNewContext(`(${html.match(/gesture: (\{[^\n]+\})/)[1]})`);
function hand(number, thumb = number === 5) {
    const points = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.7, z: 0 }));
    points[0] = { x: 0.5, y: 0.9 };
    [5, 9, 13, 17].forEach((base, i) => {
        const x = 0.38 + i * 0.11;
        points[base] = { x, y: 0.65 };
        points[base+1] = { x, y: 0.48 };
        points[base+2] = { x, y: i < number ? 0.35 : 0.63 };
        points[base+3] = { x, y: i < number ? 0.22 : 0.75 };
    });
    points[2] = { x: 0.36, y: 0.76 };
    points[3] = thumb ? { x: 0.25, y: 0.65 } : { x: 0.43, y: 0.73 };
    points[4] = thumb ? { x: 0.14, y: 0.54 } : { x: 0.45, y: 0.78 };
    return points;
}
test('recognizes 1–5 and a fist without confusing 3 and 7', () => {
    for (let i = 1; i <= 5; i++) assert.equal(classifyHand(hand(i)), String(i));
    assert.equal(classifyHand(hand(2, true)), '7');
    assert.equal(classifyHand(hand(0)), 'fist');
});
function chineseDigit(number) {
    if (number === 8) return hand(1, true);
    if (number === 7) return hand(2, true);
    const points = hand(0, number === 6);
    if (number === 6) {
        const open = hand(4, true);
        for (let i = 17; i <= 20; i++) points[i] = open[i];
    } else {
        points[8] = { x: 0.48, y: 0.54 };
    }
    return points;
}
test('recognizes Chinese 6, 7, 8 and 9 after mirroring or scaling', () => {
    for (const number of [6, 7, 8, 9]) {
        const points = chineseDigit(number);
        assert.equal(classifyHand(points), String(number));
        assert.equal(classifyHand(points.map(p => ({ x: 0.9-p.x*0.7, y: p.y*0.7 }))), String(number));
    }
    const seven = hand(0);
    seven[4] = {x:0.48,y:0.35}; seven[8] = {x:0.5,y:0.34}; seven[12] = {x:0.52,y:0.35};
    assert.equal(classifyHand(seven), '7');
});
test('numbers work after mirroring, scaling and rotating the hand in the image', () => {
    for (let i = 1; i <= 5; i++) {
        const transformed = hand(i).map(p => ({ x: 0.8 - p.x * 0.7, y: 0.1 + p.y * 0.7 }));
        assert.equal(classifyHand(transformed), String(i));
        const turned = hand(i).map(p => ({ x: 1 - p.y, y: p.x }));
        assert.equal(classifyHand(turned), String(i));
    }
});
test('thumbs up and down map to separate paging gestures', () => {
    for (const [dy, key] of [[-1, 'next'], [1, 'previous']]) {
        const points = hand(0);
        points[2] = { x: 0.38, y: 0.75 };
        points[3] = { x: 0.38, y: 0.75 + dy*0.2 };
        points[4] = { x: 0.38, y: 0.75 + dy*0.4 };
        assert.equal(classifyHand(points), key);
    }
});
test('requires a stable number and ignores transitional numbers', () => {
    const gate = new Gate(config);
    for (let t = 0; t <= 450; t += 50) assert.equal(gate.update('2', t), null);
    assert.equal(gate.update('2', 500), '2');
    for (let t = 550; t <= 1000; t += 50) assert.equal(gate.update(t % 100 ? '3' : '4', t), null);
});
test('holding a page gesture advances once; lowering hand rearms it', () => {
    const gate = new Gate(config);
    const events = [];
    for (let t = 0; t <= 2000; t += 50) { const key = gate.update('next', t); if (key) events.push(key); }
    assert.deepEqual(events, ['next']);
    for (let t = 2050; t <= 2350; t += 50) gate.update(null, t);
    for (let t = 2400; t < 3050; t += 50) assert.equal(gate.update('next', t), null);
    assert.equal(gate.update('next', 3050), 'next');
});
test('gaps and lost hands cannot complete stale confirmation timers', () => {
    const gate = new Gate(config);
    gate.update('1', 0); gate.update('1', 50);
    assert.equal(gate.update('1', 1000), null);
    gate.update(null, 1050);
    assert.equal(gate.update('1', 1100), null);
});
test('page slots map correctly, including an incomplete last page', () => {
    assert.equal(resolve(0, 1, 12), 0);
    assert.equal(resolve(0, 5, 20), -1);
    assert.equal(resolve(0, 6, 20), 4);
    assert.equal(resolve(0, 7, 20), 5);
    assert.equal(resolve(0, 8, 20), 6);
    assert.equal(resolve(0, 9, 20), 7);
    assert.equal(resolve(1, 9, 20), 15);
    assert.equal(resolve(2, 4, 20), 19);
    assert.equal(resolve(2, 6, 20), -1);
    assert.equal(resolve(0, 1, 0), -1);
});
test('actual handler keeps a photo open without a hand and supports paging and fist return', () => {
    const context = vm.createContext({
        CONFIG: { gesture: config }, classifyHand, resolvePhotoNumber: resolve, numberGesture: new Gate(config),
        STATE: { TREE: 'tree', SCATTER: 'scatter', ZOOM: 'zoom' }, currentState: 'tree',
        photoPage: 0, zoomTargetIndex: -1, lastPalmTime: null, handPos: {x:0,y:0}, lastHandPos: {},
        rotationVelocity: {x:0,y:0}, photoMeshes: Array(17).fill({}), updateStatus: () => {}, updatePhotoPage: () => {},
        now: 0, performance: { now: () => context.now }
    });
    vm.runInContext(html.slice(html.indexOf('        function handleGesture('), html.indexOf('        function onWindowResize(')), context);
    function run(points, start, end) {
        context.points = points;
        for (let t = start; t <= end; t += 50) { context.now = t; vm.runInContext('handleGesture(points)', context); }
    }
    run(hand(2), 0, 500);
    assert.equal(context.currentState, 'zoom');
    assert.equal(context.zoomTargetIndex, 1);
    context.numberGesture.update(null, 550);
    assert.equal(context.currentState, 'zoom');
    const up = hand(0);
    up[2] = {x:0.38,y:0.75}; up[3] = {x:0.38,y:0.55}; up[4] = {x:0.38,y:0.35};
    run(up, 600, 1250);
    assert.equal(context.photoPage, 1);
    run(hand(1), 1300, 1800);
    assert.equal(context.zoomTargetIndex, 8);
    run(hand(5), 1850, 2850);
    assert.equal(context.currentState, 'scatter');
    assert.equal(context.zoomTargetIndex, -1);
    run(chineseDigit(6), 2900, 3400);
    assert.equal(context.currentState, 'zoom');
    assert.equal(context.zoomTargetIndex, 12);
    run(hand(0), 3450, 3950);
    assert.equal(context.currentState, 'tree');
    assert.equal(context.zoomTargetIndex, -1);
});
