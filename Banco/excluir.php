<?php
require_once 'config.php';
exigirLogin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    if (ctype_digit((string) $id)) {
        $comando = $pdo->prepare('DELETE FROM funcionarios WHERE id = ?');
        $comando->execute([$id]);
    }
    header('Location: index.php');
    exit;
}

$id = $_GET['id'] ?? '';
if (!ctype_digit((string) $id)) {
    header('Location: index.php');
    exit;
}

$comando = $pdo->prepare('SELECT id, nome FROM funcionarios WHERE id = ?');
$comando->execute([$id]);
$funcionario = $comando->fetch(PDO::FETCH_ASSOC);

if (!$funcionario) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Excluir funcionário</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <main class="caixa">
    <h1>Excluir funcionário</h1>
    <p class="aviso">Confirma a exclusão de <?php echo h($funcionario['nome']); ?>? Esta ação não pode ser desfeita.</p>
    <form action="excluir.php" method="post">
      <input type="hidden" name="id" value="<?php echo h($funcionario['id']); ?>">
      <div class="botoes">
        <button class="botao-vermelho" type="submit">Excluir</button>
        <a class="botao-azul" href="index.php">Cancelar</a>
        <a href="sair.php">Sair</a>
      </div>
    </form>
  </main>
</body>
</html>