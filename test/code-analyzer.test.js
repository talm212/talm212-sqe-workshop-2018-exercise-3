import assert from 'assert';
import {parseCode, printGraph} from '../src/js/code-analyzer';

function check1(str){
    return printGraph(parseCode(str), '');
}

describe('The foo and boo without args', () => {
    it('function foo', () => {

        assert.equal(
            check1('function foo(x, y, z){let a = x + 1;let b = a + y;let c = 0;if (b < z) {c = c + 5;} else if (b < z * 2) {c = c + x + 5;} else {c = c + z + 5;}return c;}')
            ,'digraph cfg { forcelabels=true n0 [label=\"let a = x + 1;\nlet b = a + y;\nlet c = 0;\", xlabel = 1,  shape=rectangle,]\nn1 [label=\"b < z\", xlabel = 2,  shape=diamond,]\nn2 [label=\"c = c + 5\", xlabel = 3,  shape=rectangle,]\nn3 [label=\"return c;\", xlabel = 4,  shape=rectangle,]\nn4 [label=\"b < z * 2\", xlabel = 5,  shape=diamond,]\nn5 [label=\"c = c + x + 5\", xlabel = 6,  shape=rectangle,]\nn6 [label=\"c = c + z + 5\", xlabel = 7,  shape=rectangle,]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n4 [label=\"F\"]\nn2 -> n3 []\nn4 -> n5 [label=\"T\"]\nn4 -> n6 [label=\"F\"]\nn5 -> n3 []\nn6 -> n3 []\n }'
        );
    });

    it('function boo', () => {
    assert.equal(
            check1('function boo(x, y, z){let a = x + 1;let b = a + y;let c = 0;while (a < z) {c = a + b;z = c * 2;a++;}return z;}')
        ,'digraph cfg { forcelabels=true n0 [label=\"let a = x + 1;\nlet b = a + y;\nlet c = 0;\", xlabel = 1,  shape=rectangle,]\nn1 [label=\"a < z\", xlabel = 2,  shape=diamond,]\nn2 [label=\"c = a + b\nz = c * 2\na++\", xlabel = 3,  shape=rectangle,]\nn3 [label=\"return z;\", xlabel = 4,  shape=rectangle,]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n3 [label=\"F\"]\nn2 -> n1 []\n }'
        );
    });
});

describe('just funcs', () => {
    it('function 1', () => {

        assert.equal(
            check1('function foo(){let c = 20;return c;}')
            ,'digraph cfg { forcelabels=true n0 [label=\"let c = 20;\", xlabel = 1,  shape=rectangle,]\nn1 [label=\"return c;\", xlabel = 2,  shape=rectangle,]\nn0 -> n1 []\n }'
        );
    });

    it('function 2', () => {
        assert.equal(
            check1('function boo(){let a = 1;let b = [];b[0] = a;return b;}')
            ,'digraph cfg { forcelabels=true n0 [label=\"let a = 1;\nlet b = [];\nb[0] = a\", xlabel = 1,  shape=rectangle,]\nn1 [label=\"return b;\", xlabel = 2,  shape=rectangle,]\nn0 -> n1 []\n }'
        );
    });

    it('function 3', () => {
        assert.equal(
            check1('function boo(){let a = false;return a;}')
            ,'digraph cfg { forcelabels=true n0 [label=\"let a = false;\", xlabel = 1,  shape=rectangle,]\nn1 [label=\"return a;\", xlabel = 2,  shape=rectangle,]\nn0 -> n1 []\n }'
        );
    });

    it('function 4', () => {
        assert.equal(
            check1('function boo(){let a = false; while(a==true){a=true;}return a;}')
            ,'digraph cfg { forcelabels=true n0 [label=\"let a = false;\", xlabel = 1,  shape=rectangle,]\nn1 [label=\"a == true\", xlabel = 2,  shape=diamond,]\nn2 [label=\"a = true\", xlabel = 3,  shape=rectangle,]\nn3 [label=\"return a;\", xlabel = 4,  shape=rectangle,]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n3 [label=\"F\"]\nn2 -> n1 []\n }'
        );
    });

    it('function 5', () => {

        assert.equal(
            check1('function foo(){let c = 20; let d = 20; return c*d;}')
            ,'digraph cfg { forcelabels=true n0 [label=\"let c = 20;\nlet d = 20;\", xlabel = 1,  shape=rectangle,]\nn1 [label=\"return c * d;\", xlabel = 2,  shape=rectangle,]\nn0 -> n1 []\n }'
        );
    });
 
    it('function 6', () => {
        assert.equal(
            check1('function boo(){let a = 1;let b = [];b[0] = a;return b[0];}')
            ,'digraph cfg { forcelabels=true n0 [label=\"let a = 1;\nlet b = [];\nb[0] = a\", xlabel = 1,  shape=rectangle,]\nn1 [label=\"return b[0];\", xlabel = 2,  shape=rectangle,]\nn0 -> n1 []\n }'
        );
    });

    it('function 7', () => {
        assert.equal(
            check1('function boo(){let a = true;return a;}')
            ,'digraph cfg { forcelabels=true n0 [label=\"let a = true;\", xlabel = 1,  shape=rectangle,]\nn1 [label=\"return a;\", xlabel = 2,  shape=rectangle,]\nn0 -> n1 []\n }'
        );
    });

    it('function 8', () => {
        assert.equal(
            check1('function boo(){let a = false; let b = true; while(a==b){a=true;}return a;}')
            ,'digraph cfg { forcelabels=true n0 [label=\"let a = false;\nlet b = true;\", xlabel = 1,  shape=rectangle,]\nn1 [label=\"a == b\", xlabel = 2,  shape=diamond,]\nn2 [label=\"a = true\", xlabel = 3,  shape=rectangle,]\nn3 [label=\"return a;\", xlabel = 4,  shape=rectangle,]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n3 [label=\"F\"]\nn2 -> n1 []\n }'
        );
    });
});