

function Fonctions_Participants() {
    $("#ParticipantAjouter").click(function () {
        console.log("ParticipantAjouter cliquer!");

        if ($("#mode").val() == "update") {
            var nom = $("#ParticipantNom").val();
            var ticket = $("#ParticipantTicket").val();
            success = false;

            if (Math.floor(ticket) == ticket && $.isNumeric(ticket))
                success = true;

            if (success == false) {
                var notify = $.notify('<strong>Error</strong> Nombre de tickets, valeur incorrecte!', {
                    type: 'danger',
                    allow_dismiss: true,
                });

            } else {
                console.log("all right!!!")
                database.transaction(function (tx) {
                    var updateSql = 'update Participant set name="' + nom + '" , desc = ""  ,tickets = "' + ticket + '" where rowid = ' + $("#rowid").val();
                    console.log("sql:" + updateSql)
                    tx.executeSql(updateSql);
                });

                var notify = $.notify('<strong>Confirmation</strong> Participation mise a jour', {
                    type: 'success',
                    allow_dismiss: true,
                });


                $("#ParticipantNom").val("");
                $("#ParticipantTicket").val("");
                $("#rowid").val("");

                $("#mode").val("");
                $("#ParticipantAjouter").text("Ajouter");


                ChargerParticipants();

            }


        } else {
            var nom = $("#ParticipantNom").val();
            var ticket = $("#ParticipantTicket").val();
            success = false;

            if (Math.floor(ticket) == ticket && $.isNumeric(ticket))
                success = true;

            if (success == false) {
                var notify = $.notify('<strong>Error</strong> Nombre de tickets, valeur incorrecte!', {
                    type: 'danger',
                    allow_dismiss: true,
                });

            } else {
                console.log("all right!!!")
                database.transaction(function (tx) {
                    var insertSql = 'insert into Participant( name, desc ,tickets) values("' + nom + '","" ,"' + ticket + '")';
                    console.log("sql:" + insertSql)
                    tx.executeSql(insertSql);
                });

                var notify = $.notify('<strong>Confirmation</strong> Nouvelle participation enregistrée', {
                    type: 'success',
                    allow_dismiss: true,
                });


                $("#ParticipantNom").val("");
                $("#ParticipantTicket").val("");

                ChargerParticipants();

            }

        }




    });

    console.log("loading events")

    $("#Participants tbody").on("click", 'button.SupprimerParticipation', function () {
        var button = $(this);
        console.log("#SupprimerParticipation Clique");
        console.log(" > " + button.attr("participant-rowid"));

        bootbox.confirm({
            title: "Supprimer participation?",
            message: "Vous êtes sur de vouloir supprimer cette participation?",
            buttons: {
                cancel: {
                    label: '<i class="fa fa-times"></i> Annuler'
                },
                confirm: {
                    label: '<i class="fa fa-check"></i> Confirmer'
                }
            },
            callback: function (result) {
                console.log('Confirmation: ' + result);
                if (result == true) {
                    database.transaction(function (tx) {
                        var deleteSql = 'delete from Participant where rowid = ' + button.attr("participant-rowid");
                        console.log("sql:" + deleteSql)
                        tx.executeSql(deleteSql);
                    });


                    var notify = $.notify('<strong>Confirmation</strong> Participation supprimée....', {
                        type: 'danger',
                        allow_dismiss: true,
                    });



                    ChargerParticipants();

                }
            }
        });






    });

    $(document).on("dblclick", "#Participants tr", function () {
        //code here
        var selectedId = $(this).children("td:first")[0].id




        $("#mode").val("update");
        $("#ParticipantAjouter").text("Mettre a jour");


        $("#ParticipantNom").val($(this).find("td:eq(0)").text());
        $("#ParticipantTicket").val($(this).find("td:eq(1)").text());
        $("#rowid").val(selectedId);


    });






}


function Notification_functions() {

    $(function () {
        $(".btn").on("click", function () {

            var notify = $.notify('<strong>Saving</strong> Do not close this page...', {
                type: 'danger',
                allow_dismiss: true,
            });


            notify('message', '<strong>Saving</strong> Page Data.');


            setTimeout(function () {
                notify('message', '<strong>Saving</strong> User Data.');
            }, 500);




        });
    });



}





$(document).ready(function () {
    Fonctions_Participants();

    item = {}
    item["action"] = "select";

    var dataString = JSON.stringify(item)
    console.log("data:" + dataString);

    $("#Participants").DataTable({
        bInfo: false,
        paging: false,
        dom: 'lrtip',
        ajax: {
            url: "/api/participants.php",
            data: dataString,
            type: "POST",
            contentType: 'application/json',
            dataSrc: ""
        },
        columns: [
            {
                data: "id",
                render: function (data, type, model) {
                    return model.id;
                }
            },
            {
                "data": "name",
                render: function (data, type, model) {
                    return model.name;
                }
            },
            {
                "data": "tickets",
                render: function (data, type, model) {
                    return model.tickets;
                }
            },
            {
                "data": "action",
                render: function (data, type, model) {
                    return "<button class='btn-danger SupprimerParticipation'  participant-rowid='" + model.id + "' title='Supprimer paricipation' >-</button>";;
                }
            }
        ],
        columnDefs: [{
            orderable: false,
            targets: [0, 3]
        }, {
            visible: false,
            targets: [0]
        }],
    });

});