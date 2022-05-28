

function Fonctions_Paricipants() {
    $("#ParticipantAjouter").click(function(){
        console.log("ParticipantAjouter cliquer!");

        var nom =  $("#ParticipantNom").val() ;
        var ticket =   $("#ParticipantTicket").val();

        database.transaction(function(tx){ 
            var insertSql = 'insert into Participant( name, desc ,tickets) values("'+nom +'","" ,"'+ticket +'")';
            console.log( "sql:"+insertSql )
            tx.executeSql(insertSql);
        });

        $("#ParticipantNom").val("");
        $("#ParticipantTicket").val("");

        ChargerParticipants();

    }); 
}




    
function ChargerParticipants () {
    OpenDb();
    database.transaction(function(tx){ 
        var selectSql = 'select * from Participant';
        tx.executeSql(selectSql, [], function(tx, result){

            console.log('result.rows.length = ' + result.rows.length);
            var tableParticipants = $('#Participants').DataTable();
            tableParticipants.clear()
                .draw();
            for(i = 0; i < result.rows.length; i++) {
                console.log("nom:" + result.rows.item(i).name );
                tableParticipants.row.add( [ result.rows.item(i).name, result.rows.item(i).tickets ] )
                .draw()
                .node();

            }
           
           
    
        }, function(tx, error){
            alert(error);
        });
    });
}

$(document).ready(function(){
    Fonctions_Paricipants();
    ChargerParticipants();
});