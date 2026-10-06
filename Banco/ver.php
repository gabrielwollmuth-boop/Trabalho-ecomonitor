<?php
require_once 'config.php';
exigirLogin();

$id = $_GET['id'] ?? '';
if (!ctype_digit((string) $id)) {
    header('Location: index.php');
    exit;
}

$comando = $pdo->prepare(
    'SELECT id, nome, endereco, salario FROM funcionarios WHERE id = ?'
);
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
  <title>Ver funcionário</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <main class="caixa">
    <h1>Funcionário</h1>
    <div class="ficha">
      <p><strong>Código:</strong> <?php echo h($funcionario['id']); ?></p>
      <p><strong>Nome:</strong> <?php echo h($funcionario['nome']); ?></p>
      <p><strong>Endereço:</strong> <?php echo h($funcionario['endereco']); ?></p>
      <p><strong>Salário:</strong> R$ <?php echo h(number_format((int) $funcionario['salario'], 0, ',', '.')); ?></p>
    </div>
    <div class="botoes">
      <a class="botao-azul" href="index.php">Voltar</a>
      <a href="sair.php">Sair</a>
    </div>
  </main>
</body>
</html>