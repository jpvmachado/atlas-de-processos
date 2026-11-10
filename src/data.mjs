export const categories = Object.freeze([
  { id: 'atendimento', title: 'Atendimento', icon: 'chat', text: 'Abertura, acompanhamento e encerramento de chamados.' },
  { id: 'acessos', title: 'Acessos', icon: 'key', text: 'Credenciais e permissões do ambiente de demonstração.' },
  { id: 'processos', title: 'Processos', icon: 'book', text: 'Responsabilidade, revisão e documentação.' }
]);

// Todos os nomes, procedimentos e prazos abaixo foram criados para a demonstração.
export const articles = [
  {
    id: 'abrir-chamado', categoryId: 'atendimento', title: 'Abrir um chamado', icon: 'chat',
    summary: 'Registre uma solicitação com contexto suficiente para a triagem.',
    keywords: ['abrir chamado', 'criar ticket', 'registrar solicitação', 'protocolo'],
    sections: [
      { title: 'Como abrir o chamado', text: 'Abra a área Chamados Demo e selecione Nova solicitação. Informe a categoria, descreva o problema e guarde o protocolo fictício.' },
      { title: 'Requisitos para a triagem', text: 'Inclua o assunto, o resultado esperado e a etapa em que ocorreu o problema. Use uma captura sintética se precisar mostrar um erro.' },
      { title: 'Prazo da primeira análise', text: 'Na simulação, a primeira análise do chamado ocorre em até 8 horas úteis. Esse prazo começa após o registro da solicitação.' }
    ]
  },
  {
    id: 'acompanhar-chamado', categoryId: 'atendimento', title: 'Acompanhar um chamado', icon: 'clock',
    summary: 'Consulte a situação e entenda em qual etapa está uma solicitação.',
    keywords: ['acompanhar chamado', 'status do ticket', 'protocolo', 'andamento'],
    sections: [
      { title: 'Onde consultar o andamento', text: 'Em Chamados Demo, abra Minhas solicitações e procure pelo protocolo de exemplo. A linha do tempo exibe a última atualização.' },
      { title: 'Como interpretar os status', text: 'Recebido significa que o registro está na fila. Em análise indica que a solicitação foi assumida. Concluído indica que a tratativa foi encerrada.' }
    ]
  },
  {
    id: 'encerrar-chamado', categoryId: 'atendimento', title: 'Encerrar um chamado', icon: 'check',
    summary: 'Documente o resultado de uma tratativa e finalize o registro.',
    keywords: ['encerrar chamado', 'fechar chamado', 'concluir ticket', 'resultado'],
    sections: [
      { title: 'Como encerrar a tratativa', text: 'Registre a solução de exemplo e confira se a solicitação foi respondida. Selecione Encerrar chamado e confirme o resultado.' },
      { title: 'Critério de encerramento', text: 'O registro precisa conter a ação executada e o resultado observado. Se houver uma etapa pendente, mantenha o chamado em análise.' }
    ]
  },
  {
    id: 'redefinir-senha', categoryId: 'acessos', title: 'Redefinir a senha de acesso', icon: 'key',
    summary: 'Recupere o acesso pelo fluxo fictício de redefinição de senha.',
    keywords: ['redefinir senha', 'recuperar senha', 'esqueci a senha', 'resetar senha', 'credenciais'],
    sections: [
      { title: 'Como redefinir a senha', text: 'Na tela de acesso do ambiente fictício, selecione Esqueci minha senha. Informe o e-mail de teste e confirme a solicitação na tela.' },
      { title: 'Prazo de validade do link', text: 'O link fictício de redefinição da senha vale por 18 minutos após a solicitação. Quando o prazo expirar, gere outro link de teste.' },
      { title: 'Cuidados com credenciais', text: 'Nunca use senhas reais em uma demonstração. O exemplo descreve o fluxo e não envia mensagens.' }
    ]
  },
  {
    id: 'solicitar-acesso', categoryId: 'acessos', title: 'Solicitar acesso a um módulo', icon: 'shield',
    summary: 'Peça a permissão mínima necessária para usar um módulo de teste.',
    keywords: ['solicitar acesso', 'pedir acesso', 'liberar permissão', 'perfil', 'módulo'],
    sections: [
      { title: 'Requisitos da solicitação de acesso', text: 'Informe o módulo, o perfil de demonstração e a finalidade da permissão. Use apenas um identificador fictício para a pessoa solicitante.' },
      { title: 'Como pedir acesso', text: 'Abra o formulário Acessos Demo, escolha o módulo e envie a solicitação para revisão simulada.' },
      { title: 'Prazo de revisão', text: 'A revisão da solicitação de acesso leva até 12 horas úteis no ambiente fictício.' }
    ]
  },
  {
    id: 'transferir-responsavel', categoryId: 'processos', title: 'Transferir a responsabilidade', icon: 'swap',
    summary: 'Reatribua uma solicitação sem perder o histórico da tratativa.',
    keywords: ['transferir responsável', 'trocar de dono', 'mudar responsável', 'reatribuir solicitação'],
    sections: [
      { title: 'Como transferir a responsabilidade', text: 'Abra a solicitação fictícia, selecione Transferir e escolha um responsável de demonstração. Registre o motivo antes de confirmar.' },
      { title: 'O que conferir na transferência', text: 'O novo responsável deve ter acesso ao módulo. O histórico permanece vinculado ao protocolo original.' }
    ]
  },
  {
    id: 'revisar-procedimento', categoryId: 'processos', title: 'Revisar um procedimento', icon: 'book',
    summary: 'Valide uma atualização antes de publicá-la no catálogo.',
    keywords: ['revisar procedimento', 'atualizar artigo', 'validar conteúdo', 'revisão de processo'],
    sections: [
      { title: 'Fluxo de revisão do procedimento', text: 'Duplique o conteúdo para um rascunho de demonstração. Revise etapas e exemplos, depois encaminhe o rascunho para uma segunda leitura.' },
      { title: 'Requisitos para publicação', text: 'Informe o motivo da mudança e a versão de exemplo. Publique apenas após a revisão do rascunho.' }
    ]
  },
  {
    id: 'registrar-evidencia', categoryId: 'processos', title: 'Registrar uma evidência', icon: 'file',
    summary: 'Adicione referências de teste que permitam reproduzir uma situação.',
    keywords: ['registrar evidência', 'anexar evidência', 'captura sintética', 'documentar teste'],
    sections: [
      { title: 'Como documentar o teste', text: 'Descreva a etapa executada, o resultado observado e o resultado esperado. Inclua uma referência fictícia para relacionar a evidência à solicitação.' },
      { title: 'Requisitos da evidência', text: 'Use um arquivo sintético com legenda e texto alternativo. Não inclua dados pessoais, credenciais ou conteúdo operacional real.' }
    ]
  }
];
