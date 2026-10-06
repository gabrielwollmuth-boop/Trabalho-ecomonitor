<?php
require_once 'config.php';

if (!empty($_SESSION['usuario_id'])) {
    header('Location: index.php');
    exit;
}

$erro = '';
$usuario = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = trim($_POST['usuario'] ?? '');
    $senha = $_POST['senha'] ?? '';

    $comando = $pdo->prepare(
        'SELECT id, usuario, senha_hash FROM usuarios WHERE usuario = ?'
    );
    $comando->execute([$usuario]);
    $linha = $comando->fetch(PDO::FETCH_ASSOC);

    if ($linha && password_verify($senha, $linha['senha_hash'])) {
        session_regenerate_id(true);
        $_SESSION['usuario_id'] = (int) $linha['id'];
        $_SESSION['usuario_nome'] = $linha['usuario'];
        header('Location: index.php');
        exit;
    }

    $erro = 'Usuário ou senha inválidos.';
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Entrar</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <main class="caixa">
    <h1>Entrar</h1>
    <p>Informe o usuário e a senha para abrir o cadastro.</p>
    <?php if ($erro !== ''): ?><p class="aviso"><?php echo h($erro); ?></p><?php endif; ?>
    <form action="login.php" method="post">
      <label for="usuario">Usuário</label>
      <input id="usuario" name="usuario" type="text" value="<?php echo h($usuario); ?>">

      <label for="senha">Senha</label>
      <input id="senha" name="senha" type="password">

      <div class="botoes">
        <button class="botao" type="submit">Entrar</button>
      </div>
    </form>
  </main>
</body>
</html>