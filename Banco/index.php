<?php
require_once 'config.php';
exigirLogin();

$erro = '';
$funcionarios = [];

try {
    $funcionarios = $pdo->query(
        'SELECT id, nome, endereco, salario FROM funcionarios ORDER BY id'
    )->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $excecao) {
    $erro = 'Não foi possível listar os funcionários. Confira se a tabela foi criada.';
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Funcionários</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <main class="caixa">
    <div class="topo">
      <h1>Funcionários</h1>
      <div class="lado">
        <span><?php echo h($_SESSION['usuario_nome']); ?></span>
        <a class="botao" href="criar.php">Novo funcionário</a>
        <a class="botao-azul" href="sair.php">Sair</a>
      </div>
    </div>

    <?php if ($erro !== ''): ?>
      <p class="aviso"><?php echo h($erro); ?></p>
    <?php elseif (!$funcionarios): ?>
      <p class="aviso">Nenhum funcionário cadastrado.</p>
    <?php else: ?>
      <table>
        <tr>
          <th>#</th>
          <th>Nome</th>
          <th>Endereço</th>
          <th>Salário</th>
          <th>Ações</th>
        </tr>
        <?php foreach ($funcionarios as $funcionario): ?>
          <tr>
            <td><?php echo h($funcionario['id']); ?></td>
            <td><?php echo h($funcionario['nome']); ?></td>
            <td><?php echo h($funcionario['endereco']); ?></td>
            <td>R$ <?php echo h(number_format((int) $funcionario['salario'], 0, ',', '.')); ?></td>
            <td class="acoes">
              <a href="ver.php?id=<?php echo h($funcionario['id']); ?>">Ver</a>
              <a href="editar.php?id=<?php echo h($funcionario['id']); ?>">Alterar</a>
              <a href="excluir.php?id=<?php echo h($funcionario['id']); ?>">Excluir</a>
            </td>
          </tr>
        <?php endforeach; ?>
      </table>
    <?php endif; ?>
  </main>
</body>
</html>