
function make_choice(ev) {
    let data = {choice: ev.target.dataset.choice_index};
    $.ajax("make_choice", {
        data: JSON.stringify(data),
        contentType : 'application/json',
        type : 'POST',
        success: function(data) {
            console.log("successfully made a choice, updating...");
            get_possibilities();
            get_state();
            do_graph();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("ERROR");
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

function get_state() {
    $.getJSON("state", function(result) {
        console.log("new state", result);
        $("#state").html(result);
    });
}

function get_possibilities() {
    $.getJSON("possibilities", function(result) {
        console.log("new possibilities", result);

        let choices = $("<div/>", {id: "choices"});

        $.each(result, function(i, field) {
            $("<button/>", {
                text: field,
                "data-choice_index": i,
                click: make_choice
            }).appendTo(choices);
        });

        choices.replaceAll("#choices");

    });
}


console.log("ready!");

$(function() {
    get_possibilities();
    get_state();
    do_graph();
});




var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    color = d3.scaleOrdinal(d3.schemeCategory10);

var nodes = [],
    links = [];

var simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-100))
    .force("link", d3.forceLink(links).distance(20))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .alphaTarget(1)
    .on("tick", ticked);

var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
    link = g.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link"),
    node = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");

restart();

function restart() {

    // Apply the general update pattern to the nodes.
    node = node.data(nodes, function(d) { return d.id;});
    // node.exit().remove();
    node = node.enter().append("circle").attr("fill", "black").attr("r", 8).merge(node);

    // Apply the general update pattern to the links.
    link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
    // link.exit().remove();
    link = link.enter().append("line").merge(link);

    // Update and restart the simulation.
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
}

function ticked() {
    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
}


function do_graph() {
    console.log("dograph");
    d3.json("graph").then(function(graph) {
        console.log("graph", graph);

        nodes = graph.nodes;
        links = graph.edges.map(function(e) {
            return {
                source: nodes.find(n => n.id == e.source),
                target: nodes.find(n => n.id == e.target),
            };
        });
        console.log("links", links);

        console.log("link", link);
        console.log("node", node);

        restart();

    });

}

// function dragstarted(d) {
//   if (!d3.event.active) simulation.alphaTarget(0.3).restart();
//   d.fx = d.x;
//   d.fy = d.y;
// }

// function dragged(d) {
//   d.fx = d3.event.x;
//   d.fy = d3.event.y;
// }

// function dragended(d) {
//   if (!d3.event.active) simulation.alphaTarget(0);
//   d.fx = null;
//   d.fy = null;
// }
