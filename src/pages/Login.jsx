const res = await fetch(
    `http://localhost:3001/usuarios?email=${email}&senha=${senha}`
  );
  
  const usuario = await res.json();
  
  if (usuario.length > 0) {
    alert("Login realizado!");
  }
  else {
    alert("Usuário ou senha inválidos");
  }