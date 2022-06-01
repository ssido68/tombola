<?php
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

// (H) DATABASE SETTINGS - CHANGE TO YOUR OWN!
define("DB_HOST", "localhost");
define("DB_NAME", "tombola");
define("DB_CHARSET", "utf8");
define("DB_USER", "root");
define("DB_PASSWORD", "password");

// (I) START!
session_start();
$USR = new Users();


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
if (isset($_POST["req"])) { switch ($_POST["req"]) {
  // (D1) BAD REQUEST
  default:
    respond(false, "Invalid request", null, null, 400);
    break;
  
  // (D2) SAVE USER
  case "save": lcheck();
    $pass = $USR->save(
      $_POST["name"], $_POST["description"],
      isset($_POST["id"]) ? $_POST["id"] : null
    );
    respond($pass, $pass?"OK":$USR->error);
    break;

  // (D3) DELETE USER
  case "del": lcheck();
    $pass = $USR->del($_POST["id"]);
    respond($pass, $pass?"OK":$USR->error);
    break;
 
  // (D4) GET USER
  case "get": lcheck();
    respond(true, "OK", $USR->get($_POST["id"]));
    break;

  // (D5) LOGIN
  case "in":
    // ALREADY SIGNED IN
    if (isset($_SESSION["user"])) { respond(true, "OK"); }
    
    // CREDENTIALS CHECK
    $pass = $USR->verify($_POST["email"], $_POST["password"]);
    respond($pass, $pass?"OK":"Invalid email/password");
    break;

  // (D6) LOGOUT
  case "out":
    unset($_SESSION["user"]);
    respond(true, "OK");
    break;
}