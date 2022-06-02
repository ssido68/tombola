<?php
if (!function_exists('json_encode'))
{
  function json_encode($a=false)
  {
    if (is_null($a)) return 'null';
    if ($a === false) return 'false';
    if ($a === true) return 'true';
    if (is_scalar($a))
    {
      if (is_float($a))
      {
        // Always use "." for floats.
        return floatval(str_replace(",", ".", strval($a)));
      }

      if (is_string($a))
      {
        static $jsonReplaces = array(array("\\", "/", "\n", "\t", "\r", "\b", "\f", '"'), array('\\\\', '\\/', '\\n', '\\t', '\\r', '\\b', '\\f', '\"'));
        return '"' . str_replace($jsonReplaces[0], $jsonReplaces[1], $a) . '"';
      }
      else
        return $a;
    }
    $isList = true;
    for ($i = 0, reset($a); $i < count($a); $i++, next($a))
    {
      if (key($a) !== $i)
      {
        $isList = false;
        break;
      }
    }
    $result = array();
    if ($isList)
    {
      foreach ($a as $v) $result[] = json_encode($v);
      return '[' . join(',', $result) . ']';
    }
    else
    {
      foreach ($a as $k => $v) $result[] = json_encode($k).':'.json_encode($v);
      return '{' . join(',', $result) . '}';
    }
  }
}




// (H) DATABASE SETTINGS - CHANGE TO YOUR OWN!
define("DB_HOST", "localhost");
define("DB_NAME", "tombola");
define("DB_CHARSET", "utf8");
define("DB_USER", "root");
define("DB_PASSWORD", "password");


//connection to the mysql database,




// (I) START!
session_start();
// Create connection


$link = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);








// (B) STANDARD JSON RESPONSE
function respond ($status, $message, $more=null, $http=null) {
  if ($http !== null) { http_response_code($http); }
  exit(json_encode([
    "status" => $status,
    "message" => $message,
    "more" => $more
  ]));
}


// (D) HANDLE REQUEST
$json = file_get_contents('php://input');
$data = json_decode($json);



    
if (1) {

switch ($data->action ) {
    case "insert" :
      $thisName = $data->name;
      $thisDesc = $data->description;
      $thisTickets = $data->tickets;

      $insert_query =  sprintf("INSERT INTO participants (name, description, tickets) VALUES ('%s','%s',%s)",$thisName,$thisDesc,strval($thisTickets)) ;
      $result = mysqli_query($link,$insert_query);

    respond(false, "Action:(insert)", null, null, 200);
    break;

    case "update" :
      $thisId = $data->id;
      $thisName = $data->name;
      $thisDesc = $data->description;
      $thisTickets = $data->tickets;

      $update_query =  sprintf("UPDATE participants  SET (name = '%s', description = '%s' , tickets = %s) WHERE id = %s",$thisName,$thisDesc,strval($thisTickets),$thisId );
      $result = mysqli_query($link,$update_query);

    respond(false, "Action:(update)", null, null, 200);
    break;

    case "delete" :
      $thisId = $data->id;

      $delete_query =  sprintf("DELETE FROM  participants WHERE id = %s",$thisId );
      $result = mysqli_query($link,$delete_query);

    respond(false, "Action:(delete)", null, null, 200);
    break;


    default:
    $sql = "SELECT * FROM participants";
    $result = mysqli_query($link,$sql);
    header('Content-Type: application/json; charset=utf-8');
    
    $rows = array();
    while($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }
    print json_encode($rows);
    break;

}
}








class Users {
  // (A) CONSTRUCTOR - CONNECT TO DATABASE
  private $pdo = null;
  private $stmt = null;
  public $error = "";
  function __construct () {
    try {
      $this->pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET, 
        DB_USER, DB_PASSWORD, [
          PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
          PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
      );
    } catch (Exception $ex) { exit($ex->getMessage()); }
  }

  // (B) DESTRUCTOR - CLOSE DATABASE CONNECTION
  function __destruct () {
    if ($this->stmt!==null) { $this->stmt = null; }
    if ($this->pdo!==null) { $this->pdo = null; }
  }

  // (C) SUPPORT FUNCTION - SQL QUERY
  function query ($sql, $data) {
    try {
      $this->stmt = $this->pdo->prepare($sql);
      $this->stmt->execute($data);
      return true;
    } catch (Exception $ex) {
      $this->error = $ex->getMessage();
      return false;
    }
  }

  // (D) CREATE/UPDATE USER
  function save ($email, $pass, $id=null) {
    if ($id===null) {
      $sql = "INSERT INTO `participants` (`name`, `description`,`tickets`) VALUES (?,?,?)";
      $data = [$name, $description, $tickets];
    } else {
      $sql = "UPDATE `participants` SET `name`=?, `description`=?, `tickeets`=? WHERE `id`=?";
      $data = [$email, password_hash($pass, PASSWORD_BCRYPT), $id];
    }
    return $this->query($sql, $data);
  }

  // (E) DELETE USER
  function del ($id) {
    return $this->query("DELETE FROM `participants` WHERE `id`=?", [$id]);
  }
 
  // (F) GET USER
  function get ($id) {
    $this->query("SELECT * FROM `participants` WHERE `id`=?", [$id]);
    return $this->stmt->fetch();
  }
 
}


 mysqli_close($link);