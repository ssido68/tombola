var outputListElement = null;
var outputListID = 'outputList';

var dbName = 'Tombola';
var dbVersion = '1.0';
var dbDesc = 'Information de la tombola';
var dbSize = 10 * 1024 * 1024;

var tableNameUserData = 'UserData';


function initApp(){
    outputListElement = document.getElementById(outputListID);
    database = openDatabase(dbName, dbVersion, dbDesc, dbSize);

    SqlBase_CreateDB();
}

function OpenDb(){
    database = openDatabase(dbName, dbVersion, dbDesc, dbSize);


}


function SqlBase_CreateDB(){

    database.transaction(function(tx){

        // create the UserData table if not exist.
        var createParticipantsSql = 'create table if not exists Participant(name TEXT, desc TEXT, tickets INTEGER)';
        tx.executeSql(createParticipantsSql);
        var createLotssSql = 'create table if not exists Lots(id unique, Type TEXT, description TEXT, quantite INTEGER)';
        tx.executeSql(createLotssSql);

    });
}



function OLD_initApp(){
    outputListElement = document.getElementById(outputListID);

    database = openDatabase(dbName, dbVersion, dbDesc, dbSize);

    createUserDataTable();

    searchAll(tableNameUserData);
}

function saveUserData(userNameId, userEmailId, userNoteId){

    var userNameValue = '';
    var userEmailValue = '';
    var userNoteValue = '';

    var userNameObject = document.getElementById(userNameId);
    if(userNameObject==null){
        alert('The user name input text box does not exist.');
        return;
    }else{
        userNameValue = userNameObject.value;
        if(userNameValue.trim().length == 0){
            alert('The user name can not be empty.');
            return;
        }
    }

    var userEmailObject = document.getElementById(userEmailId);
    if(userEmailObject==null){
        alert('The user email input text box does not exist.');
        return;
    }else{
        userEmailValue = userEmailObject.value;
        if(userEmailValue.trim().length == 0){
            alert('The user email can not be empty.');
            return;
        }
    }

    var userNoteObject = document.getElementById(userNoteId);
    if(userNoteObject==null){
        alert('The user note input text area does not exist.');
        return;
    }else{
        userNoteValue = userNoteObject.value;
        if(userNoteValue.trim().length == 0){
            alert('The user note input text area can not be empty.');
            return;
        }
    }

    isUserExist(userNameValue, userEmailValue, userNoteValue, insertUserData);
}

function insertUserData(userNameValue, userEmailValue, userNoteValue){

        // execute insert sql to insert the user data to the UserData table.
        database.transaction(function(tx){

            var insertSql = 'insert into UserData(id, name, email, note, time) values(?, ?, ?, ?, ?)';
    
            id = Math.floor(Math.random() * 10000);
    
            pubTime = Date.now();
    
            valueArray = [id, userNameValue, userEmailValue, userNoteValue, pubTime];
    
            console.log('insertSql = ' + insertSql);
    
            tx.executeSql(insertSql, valueArray, function(tx, result){
    
                var message = 'Save user data to local SQLite database table successfully.';
                alert(message);
    
                console.log('message = ' + message);
    
                searchAll(tableNameUserData)
    
            }, function(tx, error){
    
                var message = 'Save user data to local SQLite database table fail, the error message is ' + error
                alert(message);
    
                console.log('message = ' + message);
            });
    
        });

}

// need to implement the below function later.
function isUserExist(userName, userEmail, userNote, insertFuncName){

    database.transaction(function(tx){

        // select the record by username case insensetive.
        var selectSql = 'select * from ' + tableNameUserData + ' where name = \'' + userName +'\' COLLATE NOCASE';

        console.log('selectSql = ' + selectSql);

        tx.executeSql(selectSql, [], function(tx, result){

            console.log('result.rows.length = ' + result.rows.length);

            if(result.rows.length > 0){

                var message = 'The user name exist, please input another one.'
                alert(message);
                console.log(message);
                
            }else{
                // if not exist then insert the user data.
                insertFuncName(userName, userEmail, userNote);
            }

        }, function(tx, error){
            alert(error);
        });
    });
}

function searchByName(searchByNameKeywordId){

    var searchByNameKeywordObject = document.getElementById(searchByNameKeywordId);
    if(searchByNameKeywordObject==null){
        alert('The search user by name keyword input text box does not exist.');
        return;
    }

    var searchName = searchByNameKeywordObject.value;

    if(searchName.trim().length == 0){
        searchAll(tableNameUserData);
    }else{

        database.transaction(function(tx){

            // select all the data from the database table by the name condition.
            var selectByNameSql = 'select * from ' + tableNameUserData + ' where name like "%' + searchName + '%"';
            tx.executeSql(selectByNameSql, [], function(tx, results){
    
                var rowsNumber = results.rows.length;

                console.log('selectByNameSql = ' + selectByNameSql);
                console.log('rowsNumber = ' + rowsNumber);
    
                if(rowsNumber > 0){
    
                    // remove all the child notes in the web page message list. 
                    outputListElement.innerHTML = '';
    
                    for(var i=0; i<rowsNumber; i++){
    
                        rowData = results.rows[i];
    
                        addUserDataOnWebPage(rowData);
    
                    }
                    
                }
    
            }, function(tx, error){
    
    
            });
    
        });
    }
}


function createUserDataTable(){

    database.transaction(function(tx){

        // create the UserData table if not exist.
        var createTableSql = 'create table if not exists UserData(id unique, name TEXT, email TEXT, note TEXT, time INTEGER)';
        tx.executeSql(createTableSql);

    });
}

function searchAll(tableName){

    database.transaction(function(tx){

        // select all the data from the database table.
        var selectAllSql = 'select * from ' + tableName;
        tx.executeSql(selectAllSql, [], function(tx, results){

            var rowsNumber = results.rows.length;

            console.log('selectAllSql = ' + selectAllSql);

            console.log('rowsNumber = ' + rowsNumber);

            // first empty all the user data list on the web page. 
            outputListElement.innerHTML = '';

            if(rowsNumber > 0){

                for(var i=0; i<rowsNumber; i++){

                    rowData = results.rows[i];

                    addUserDataOnWebPage(rowData);

                }
                
            }

        }, function(tx, error){


        });

    });
}


function addUserDataOnWebPage(rowData){

    var labelUserId = document.createElement('label');
    labelUserId.style.display = 'block';
    var labelUserIdText = document.createTextNode('Id:' + rowData.id);
    labelUserId.append(labelUserIdText);
    outputListElement.append(labelUserId);

    var labelUserName = document.createElement('label');
    labelUserName.style.display = 'block';
    var labelUserNameText = document.createTextNode('Name:' + rowData.name);
    labelUserName.append(labelUserNameText);
    outputListElement.append(labelUserName);

    var labelUserEmail = document.createElement('label');
    labelUserEmail.style.display = 'block';
    var labelUserEmailText = document.createTextNode('Email:' + rowData.email);
    labelUserEmail.append(labelUserEmailText);
    outputListElement.append(labelUserEmail);

    var labelUserNote = document.createElement('label');
    labelUserNote.style.display = 'block';
    var labelUserNoteText = document.createTextNode('Note:' + rowData.note);
    labelUserNote.append(labelUserNoteText);
    outputListElement.append(labelUserNote);

    var labelPubTime = document.createElement('label');
    labelPubTime.style.display = 'block';

    var date = new Date();
    date.setTime(rowData.time);

    var labelPubTimeText = document.createTextNode('Publish Time:' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
    labelPubTime.append(labelPubTimeText);
    outputListElement.append(labelPubTime);

    var hr = document.createElement('hr');
    outputListElement.append(hr);
}


function clearUserDataTable(){

    database.transaction(function(tx){

        var delSql = 'delete from ' + tableNameUserData;

        tx.executeSql(delSql, [], function(tx, result){

            var message = 'Delete all data from UserData table successfully.';

            alert(message);

            console.log(message);

            console.log(delSql);

            searchAll(tableNameUserData);
        }, function(tx, error){


        });
    });

}

