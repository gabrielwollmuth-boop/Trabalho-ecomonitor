<?php
require_once 'config.php';
exigirLogin();

$nome = $endereco = $salario = '';
$erroNome = $erroEndereco = $erroSalario = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome'] ?? '');
    $endereco = trim($_POST['endereco'] ?? '');
    $salario = trim($_POST['salario'] ?? '');

    if ($nome === '') {
        $erroNome = 'Informe o nome.';
    } elseif (!preg_match('/^[\p{L}\s]+$/u', $nome)) {
        $erroNome = 'Use apenas letras no nome.';
    } elseif (mb_strlen($nome) > 100) {
        $erroNome = 'O nome pode ter no máximo 100 caracteres.';
    }

    if ($endereco === '') {
        $erroEndereco = 'Informe o endereço.';
    } elseif (mb_strlen($endereco) > 255) {
        $erroEndereco = 'O endereço pode ter no máximo 255 caracteres.';
    }

    if ($salario === '') {
        $erroSalario = 'Informe o salário.';
    } elseif (!ctype_digit($salario) || (int) $salario <= 0) {
        $erroSalario = 'O salário deve ser um número inteiro maior que zero.';
    }

    if ($erroNome === '' && $erroEndereco === '' && $erroSalario === '') {
        $comando = $pdo->prepare(
            'INSERT INTO funcionarios (nome, endereco, salario) VALUES (?, ?, ?)'
        );
        $comando->execute([$nome, $endereco, $salario]);
        header('Location: index.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Novo funcionário</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <main class="caixa">
    <h1>Novo funcionário</h1>
    <p>Preencha o formulário para incluir um registro na tabela.</p>
    <form action="criar.php" method="post">
      <label for="nome">Nome</label>
      <input id="nome" name="nome" type="text" value="<?php echo h($nome); ?>">
      <?php if ($erroNome !== ''): ?><div class="erro"><?php echo h($erroNome); ?></div><?php endif; ?>

      <label for="endereco">Endereço</label>
      <textarea id="endereco" name="endereco" rows="3"><?php echo h($endereco); ?></textarea>
      <?php if ($erroEndereco !== ''): ?><div class="erro"><?php echo h($erroEndereco); ?></div><?php endif; ?>

      <label for="salario">Salário</label>
      <input id="salario" name="salario" type="text" value="<?php echo h($salario); ?>">
      <?php if ($erroSalario !== ''): ?><div class="erro"><?php echo h($erroSalario); ?></div><?php endif; ?>

      <div class="botoes">
        <button class="botao" type="submit">Salvar</button>
        <a class="botao-azul" href="index.php">Cancelar</a>
        <a href="sair.php">Sair</a>
      </div>
    </form>
  </main>
</body>
</html>