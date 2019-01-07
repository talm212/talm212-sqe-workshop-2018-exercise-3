import $ from 'jquery';
import Viz from 'viz.js';
import {Module, render} from 'viz.js/full.render.js';
import {printGraph,parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {

        let code = $('#codeInput').val();
        let args = $('#argsInput').val();
        let dotGraph = printGraph(parseCode(code), args);
        let viz = new Viz({ Module, render });
        viz.renderSVGElement(dotGraph).then(function(element) {
            $('#result').html(element);
        });
    });
});
