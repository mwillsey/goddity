
function make_choice(ev) {
    let data = {choice: ev.target.dataset.choice_index};
    $.ajax("/make_choice", {
        data: JSON.stringify(data),
        contentType : 'application/json',
        type : 'POST',
        success: function(data) {
            console.log("successfully made a choice, updating...");
            get_possibilities();
            get_state();
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
    $.getJSON("/state", function(result) {
        console.log("new state", result);
        $("#state").html(result);
    });
}

function get_possibilities() {
    $.getJSON("/possibilities", function(result) {
        console.log("new possibilities", result);

        let choices = $("<div/>", {id: "choices"});

        $.each(result, function(i, field) {
            console.log("here");
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
});
