/* Núcleo adaptado do buscador local: normalização, aliases, ranking e seleção extrativa. */
function pontuarConteudoAtlas(
  artigo,
  categorias,
  consulta,
  perguntaAtual,
  termosConsulta,
  termosPergunta,
  inteligenciaConsulta
) {
  artigo = artigo || {};
  inteligenciaConsulta = inteligenciaConsulta || {};

  const evidencias = [];

  function registrarEvidencia(rotulo) {
    rotulo = String(rotulo || '').trim();

    if (
      rotulo &&
      evidencias.indexOf(rotulo) === -1
    ) {
      evidencias.push(rotulo);
    }
  }

  const tituloOriginal = String(
    artigo.title || ''
  ).trim();

  const titulo = normalizarTextoAtlas(
    tituloOriginal
  );

  const categoriaId = String(
    artigo.categoryId || ''
  ).trim();

  const categoriaTituloOriginal = String(
    categorias[categoriaId] || ''
  ).trim();

  const categoriaTitulo = normalizarTextoAtlas(
    categoriaTituloOriginal
  );

  const palavrasChaveOriginais = Array.isArray(
    artigo.keywords
  )
    ? artigo.keywords.join(' ')
    : String(artigo.keywords || '');

  const palavrasChave = normalizarTextoAtlas(
    palavrasChaveOriginais
  );

  const conteudoOriginal = converterHtmlParaTextoAtlas(
    artigo.content
  );

  const conteudo = normalizarTextoAtlas(
    conteudoOriginal
  );

  let pontuacao = 0;

  if (titulo === perguntaAtual) {
    pontuacao += 150;
    registrarEvidencia('TÍTULO_EXATO');
  } else if (titulo === consulta) {
    pontuacao += 140;
    registrarEvidencia('TÍTULO_EXATO_EXPANDIDO');
  }

  if (
    perguntaAtual.length >= 4 &&
    titulo.indexOf(perguntaAtual) !== -1
  ) {
    pontuacao += 85;
    registrarEvidencia('PERGUNTA_NO_TÍTULO');
  }

  if (
    consulta.length >= 4 &&
    titulo.indexOf(consulta) !== -1
  ) {
    pontuacao += 70;
    registrarEvidencia('CONSULTA_NO_TÍTULO');
  }

  if (
    titulo.length >= 4 &&
    consulta.indexOf(titulo) !== -1
  ) {
    pontuacao += 60;
    registrarEvidencia('TÍTULO_CONTIDO_NA_CONSULTA');
  }

  if (
    perguntaAtual.length >= 4 &&
    palavrasChave.indexOf(perguntaAtual) !== -1
  ) {
    pontuacao += 65;
    registrarEvidencia('PERGUNTA_NAS_PALAVRAS_CHAVE');
  }

  if (
    consulta.length >= 4 &&
    palavrasChave.indexOf(consulta) !== -1
  ) {
    pontuacao += 55;
    registrarEvidencia('CONSULTA_NAS_PALAVRAS_CHAVE');
  }

  if (
    perguntaAtual.length >= 4 &&
    conteudo.indexOf(perguntaAtual) !== -1
  ) {
    pontuacao += 38;
    registrarEvidencia('PERGUNTA_NO_CONTEÚDO');
  }

  if (
    consulta.length >= 4 &&
    conteudo.indexOf(consulta) !== -1
  ) {
    pontuacao += 28;
    registrarEvidencia('CONSULTA_NO_CONTEÚDO');
  }

  const frasesExpandidas = Array.isArray(
    inteligenciaConsulta.frasesExpandidas
  )
    ? inteligenciaConsulta.frasesExpandidas
    : [];

  frasesExpandidas.forEach(function(frase) {
    frase = normalizarTextoAtlas(frase);

    if (!frase || frase.length < 4) {
      return;
    }

    if (titulo.indexOf(frase) !== -1) {
      pontuacao += 34;
      registrarEvidencia('SINÔNIMO_NO_TÍTULO');
    }

    if (palavrasChave.indexOf(frase) !== -1) {
      pontuacao += 24;
      registrarEvidencia('SINÔNIMO_NAS_PALAVRAS_CHAVE');
    }

    if (conteudo.indexOf(frase) !== -1) {
      pontuacao += 12;
      registrarEvidencia('SINÔNIMO_NO_CONTEÚDO');
    }
  });

  const termosUnicos = unirTermosAtlas(
    termosConsulta,
    termosPergunta
  ).slice(
    0,
    RETRIEVAL.MAX_TERMOS_ESSENCIAIS
  );

  let termosEncontrados = 0;

  termosUnicos.forEach(function(termo) {
    const variacoes = obterVariacoesTermoAtlas(termo);

    let encontrou = false;
    let encontrouTitulo = false;
    let encontrouPalavraChave = false;
    let encontrouCategoria = false;
    let maiorQuantidadeConteudo = 0;

    variacoes.forEach(function(variacao) {
      if (titulo.indexOf(variacao) !== -1) {
        encontrouTitulo = true;
      }

      if (palavrasChave.indexOf(variacao) !== -1) {
        encontrouPalavraChave = true;
      }

      if (categoriaTitulo.indexOf(variacao) !== -1) {
        encontrouCategoria = true;
      }

      maiorQuantidadeConteudo = Math.max(
        maiorQuantidadeConteudo,
        contarOcorrenciasAtlas(
          conteudo,
          variacao
        )
      );
    });

    if (encontrouTitulo) {
      pontuacao += 20;
      encontrou = true;
      registrarEvidencia('TERMO_NO_TÍTULO');
    }

    if (encontrouPalavraChave) {
      pontuacao += 14;
      encontrou = true;
      registrarEvidencia('TERMO_NAS_PALAVRAS_CHAVE');
    }

    if (encontrouCategoria) {
      pontuacao += 7;
      encontrou = true;
      registrarEvidencia('TERMO_NA_CATEGORIA');
    }

    if (maiorQuantidadeConteudo > 0) {
      pontuacao +=
        Math.min(
          maiorQuantidadeConteudo,
          4
        ) * 3;

      encontrou = true;
    }

    if (encontrou) {
      termosEncontrados++;
    }
  });

  const bigramas = criarBigramasAtlas(
    termosUnicos
  );

  bigramas.forEach(function(bigrama) {
    if (titulo.indexOf(bigrama) !== -1) {
      pontuacao += 22;
      registrarEvidencia('EXPRESSÃO_NO_TÍTULO');
    }

    if (palavrasChave.indexOf(bigrama) !== -1) {
      pontuacao += 16;
      registrarEvidencia('EXPRESSÃO_NAS_PALAVRAS_CHAVE');
    }

    if (conteudo.indexOf(bigrama) !== -1) {
      pontuacao += 9;
    }
  });

  const cobertura = termosUnicos.length > 0
    ? termosEncontrados / termosUnicos.length
    : 0;

  if (
    termosUnicos.length >= 3 &&
    cobertura < 0.25
  ) {
    pontuacao -= 22;
  }

  if (
    conteudoOriginal.length > 12000 &&
    evidencias.indexOf('TERMO_NO_TÍTULO') === -1 &&
    evidencias.indexOf('TERMO_NAS_PALAVRAS_CHAVE') === -1 &&
    evidencias.indexOf('SINÔNIMO_NO_TÍTULO') === -1
  ) {
    pontuacao -= 12;
  }

  const selecaoTrecho = criarTrechoInteligenteAtlas(
    artigo.content,
    conteudoOriginal,
    perguntaAtual,
    termosUnicos,
    inteligenciaConsulta
  );

  if (selecaoTrecho.pontuacao > 0) {
    pontuacao += Math.min(
      45,
      Math.round(selecaoTrecho.pontuacao * 0.8)
    );
    registrarEvidencia('SEÇÃO_RELEVANTE_LOCALIZADA');
  }

  if (pontuacao <= 0) {
    return null;
  }

  return {
    id: String(
      artigo.id || ''
    ).trim(),

    titulo: tituloOriginal,
    categoriaId: categoriaId,
    categoriaTitulo: categoriaTituloOriginal,
    pontuacao: pontuacao,
    cobertura: cobertura,
    trecho: selecaoTrecho.trecho,
    resumoBreve: selecaoTrecho.resumoBreve,
    secaoPrincipal: selecaoTrecho.secaoPrincipal,
    secoesRelacionadas: selecaoTrecho.secoesRelacionadas,
    pontuacaoTrecho: selecaoTrecho.pontuacao,
    termosEncontrados: termosEncontrados,
    totalTermos: termosUnicos.length,
    evidencias: evidencias.slice(0, 8),
    intencaoCorrespondente: String(
      inteligenciaConsulta.intencao &&
      inteligenciaConsulta.intencao.id ||
      'ORIENTACAO_GERAL'
    )
  };
}

function unirTermosAtlas(listaA, listaB) {
  const mapa = Object.create(null);

  return []
    .concat(listaA || [], listaB || [])
    .filter(function(termo) {
      termo = String(termo || '').trim();

      if (!termo || mapa[termo]) {
        return false;
      }

      mapa[termo] = true;
      return true;
    });
}

function contarOcorrenciasAtlas(texto, termo) {
  texto = String(texto || '');
  termo = String(termo || '');

  if (!texto || !termo) {
    return 0;
  }

  let quantidade = 0;
  let inicio = 0;

  while (true) {
    const indice = texto.indexOf(
      termo,
      inicio
    );

    if (indice === -1) {
      break;
    }

    quantidade++;
    inicio = indice + termo.length;
  }

  return quantidade;
}

function criarBigramasAtlas(termos) {
  const lista = Array.isArray(termos)
    ? termos
    : [];

  const bigramas = [];

  for (let i = 0; i < lista.length - 1; i++) {
    bigramas.push(
      lista[i] + ' ' + lista[i + 1]
    );
  }

  return bigramas;
}

function analisarConsultaAtlas(pergunta, consultaBusca) {
  const perguntaBase = normalizarTextoAtlas(
    pergunta
  );

  const consultaBase = normalizarTextoAtlas(
    consultaBusca || pergunta
  );

  const correcao = corrigirErrosDigitacaoAtlas(
    consultaBase
  );

  const expansao = expandirConsultaAtlas(
    correcao.texto
  );

  const intencao = detectarIntencaoAtlas(
    correcao.texto || perguntaBase,
    expansao.textoExpandido
  );

  const entidades = extrairEntidadesAtlas(
    expansao.textoExpandido
  );

  const termosOriginais = extrairTermosAtlas(
    correcao.texto
  );

  let termosEssenciais = unirTermosAtlas(
    termosOriginais,
    expansao.termosCanonicos
  );

  entidades.forEach(function(entidade) {
    termosEssenciais = unirTermosAtlas(
      termosEssenciais,
      extrairTermosAtlas(
        entidade.termosBusca
      )
    );
  });

  termosEssenciais = termosEssenciais.slice(
    0,
    RETRIEVAL.MAX_TERMOS_ESSENCIAIS
  );

  let termosBusca = unirTermosAtlas(
    termosEssenciais,
    extrairTermosAtlas(
      intencao.termosBusca
    )
  );

  termosBusca = termosBusca.slice(
    0,
    RETRIEVAL.MAX_TERMOS_BUSCA
  );

  const partesConsulta = [
    correcao.texto,
    expansao.termosCanonicos.join(' '),
    intencao.termosBusca,
    entidades.map(function(entidade) {
      return entidade.termosBusca;
    }).join(' ')
  ]
    .map(function(item) {
      return normalizarTextoAtlas(item);
    })
    .filter(Boolean);

  const consultaExpandida = limitarTextoAtlas(
    unirTextosUnicosAtlas(
      partesConsulta
    ).join(' '),
    1400
  );

  return {
    versao: RETRIEVAL.VERSAO,
    consultaOriginalNormalizada: perguntaBase,
    consultaInterpretada: correcao.texto || perguntaBase,
    consultaExpandida: consultaExpandida,
    intencao: intencao,
    entidades: entidades,
    termosOriginais: termosOriginais,
    termosEssenciais: termosEssenciais,
    termosBusca: termosBusca,
    frasesExpandidas: expansao.frasesExpandidas,
    aliasesDetectados: expansao.aliasesDetectados,
    correcoesAplicadas: correcao.correcoes
  };
}

function corrigirErrosDigitacaoAtlas(texto) {
  const normalizado = normalizarTextoAtlas(
    texto
  );

  if (!normalizado) {
    return {
      texto: '',
      correcoes: []
    };
  }

  const vocabulario = RETRIEVAL
    .VOCABULARIO
    .map(function(item) {
      return normalizarTextoAtlas(item);
    });

  const mapaVocabulario = Object.create(null);

  vocabulario.forEach(function(item) {
    mapaVocabulario[item] = true;
  });

  const correcoes = [];

  const tokens = normalizado
    .split(' ')
    .map(function(token) {
      if (
        !token ||
        token.length < 4 ||
        /\d/.test(token) ||
        mapaVocabulario[token] ||
        correcoes.length >=
          RETRIEVAL.MAX_CORRECOES_DIGITACAO
      ) {
        return token;
      }

      let melhor = '';
      let melhorDistancia = 999;
      let segundaDistancia = 999;

      vocabulario.forEach(function(candidato) {
        if (
          !candidato ||
          candidato.charAt(0) !== token.charAt(0) ||
          Math.abs(candidato.length - token.length) > 2
        ) {
          return;
        }

        const distancia = distanciaEdicaoAtlas(
          token,
          candidato
        );

        if (distancia < melhorDistancia) {
          segundaDistancia = melhorDistancia;
          melhorDistancia = distancia;
          melhor = candidato;
        } else if (distancia < segundaDistancia) {
          segundaDistancia = distancia;
        }
      });

      const limite = token.length <= 5
        ? 1
        : 2;

      if (
        melhor &&
        melhorDistancia <= limite &&
        melhorDistancia < segundaDistancia &&
        melhor !== token
      ) {
        correcoes.push({
          de: token,
          para: melhor
        });

        return melhor;
      }

      return token;
    });

  return {
    texto: tokens.join(' ').trim(),
    correcoes: correcoes
  };
}

function distanciaEdicaoAtlas(textoA, textoB) {
  textoA = String(textoA || '');
  textoB = String(textoB || '');

  if (textoA === textoB) {
    return 0;
  }

  if (!textoA) {
    return textoB.length;
  }

  if (!textoB) {
    return textoA.length;
  }

  const anterior = [];
  const atual = [];

  for (let j = 0; j <= textoB.length; j++) {
    anterior[j] = j;
  }

  for (let i = 1; i <= textoA.length; i++) {
    atual[0] = i;

    for (let j = 1; j <= textoB.length; j++) {
      const custo = textoA.charAt(i - 1) ===
        textoB.charAt(j - 1)
          ? 0
          : 1;

      atual[j] = Math.min(
        atual[j - 1] + 1,
        anterior[j] + 1,
        anterior[j - 1] + custo
      );
    }

    for (let j = 0; j <= textoB.length; j++) {
      anterior[j] = atual[j];
    }
  }

  return anterior[textoB.length];
}

function expandirConsultaAtlas(texto) {
  const base = normalizarTextoAtlas(
    texto
  );

  const termosCanonicos = [];
  const frasesExpandidas = [];
  const aliasesDetectados = [];

  base.split(' ').forEach(function(token) {
    const expansao = Object.hasOwn(RETRIEVAL.ABREVIACOES, token) ? RETRIEVAL.ABREVIACOES[token] : "";

    if (expansao) {
      termosCanonicos.push(expansao);
      frasesExpandidas.push(expansao);
      aliasesDetectados.push(
        'ABREVIACAO_' + token.toUpperCase()
      );
    }
  });

  RETRIEVAL.ALIASES.forEach(
    function(grupo) {
      const encontrou = grupo.variants.some(
        function(variante) {
          const normalizada = normalizarTextoAtlas(
            variante
          );

          return normalizada && contemTermo(base, normalizada);
        }
      );

      if (encontrou) {
        termosCanonicos.push(grupo.canonical);
        frasesExpandidas.push(grupo.canonical);
        aliasesDetectados.push(grupo.id);
      }
    }
  );

  const canonicosUnicos = unirTextosUnicosAtlas(
    termosCanonicos
  );

  return {
    textoBase: base,
    textoExpandido: [
      base,
      canonicosUnicos.join(' ')
    ].filter(Boolean).join(' ').trim(),
    termosCanonicos: extrairTermosAtlas(
      canonicosUnicos.join(' ')
    ),
    frasesExpandidas: unirTextosUnicosAtlas(
      frasesExpandidas
    ),
    aliasesDetectados: unirTextosUnicosAtlas(
      aliasesDetectados
    )
  };
}

function detectarIntencaoAtlas(
  perguntaNormalizada,
  consultaExpandida
) {
  const texto = normalizarTextoAtlas(
    perguntaNormalizada + ' ' + consultaExpandida
  );

  const definicoes = [
    {
      id: 'PRAZO',
      titulo: 'Prazo',
      padrao: /\b(prazo|quanto tempo|quantos dias|quando ocorre|antecedencia|validade|demora)\b/,
      termosBusca: 'prazo antecedencia dias horas validade data retorno'
    },
    {
      id: 'DOCUMENTOS',
      titulo: 'Documentos e requisitos',
      padrao: /\b(documento|documentos|o que precisa|quais dados|comprovante|formulario|requisitos)\b/,
      termosBusca: 'documentos requisitos comprovante formulario dados necessarios'
    },
    {
      id: 'CANAL',
      titulo: 'Canal de atendimento',
      padrao: /\b(onde solicitar|como solicitar|qual canal|telefone|whatsapp|email|e mail|contato)\b/,
      termosBusca: 'canal contato telefone whatsapp email aplicativo portal onde solicitar'
    },
    {
      id: 'VALOR_TAXA',
      titulo: 'Valor ou taxa',
      padrao: /\b(valor|preco|custo|quanto custa|taxa|percentual|porcentagem)\b/,
      termosBusca: 'valor preco custo taxa percentual pagamento'
    },
    {
      id: 'CAPACIDADE',
      titulo: 'Capacidade',
      padrao: /\b(capacidade|quantas pessoas|quantos hospedes|ocupacao|pessoas cabem)\b/,
      termosBusca: 'capacidade ocupacao hospedes pessoas apartamento unidade'
    },
    {
      id: 'STATUS_PREVISAO',
      titulo: 'Status ou previsão',
      padrao: /\b(status|previsao|quando inaugura|quando fica pronto|entrega|inauguracao|inicio da operacao)\b/,
      termosBusca: 'status previsao entrega inauguracao inicio operacao cronograma'
    },
    {
      id: 'ELEGIBILIDADE',
      titulo: 'Condições e elegibilidade',
      padrao: /\b(pode|posso|permitido|elegivel|condicao|condicoes|requisito|adimplente)\b/,
      termosBusca: 'condicoes elegibilidade permitido adimplencia requisitos'
    },
    {
      id: 'PROCEDIMENTO',
      titulo: 'Como proceder',
      padrao: /\b(como faco|como fazer|como abro|como abrir|como acompanhar|como redefinir|como reseto|como solicitar|como emito|como emitir|emitir|procedimento|passo a passo|fluxo|o que devo fazer)\b/,
      termosBusca: 'procedimento fluxo etapas como solicitar orientacao operacional'
    },
    {
      id: 'RESUMO_PROCESSO',
      titulo: 'Resumo do processo',
      padrao: /\b(resumo|resumir|visao geral|me fale sobre|explique o processo|breve resumo)\b/,
      termosBusca: 'resumo finalidade apresentacao informacoes gerais ponto de atencao'
    },
    {
      id: 'CONCEITO',
      titulo: 'Conceito',
      padrao: /\b(o que e|o que significa|conceito|definicao|para que serve)\b/,
      termosBusca: 'o que e conceito definicao finalidade'
    },
    {
      id: 'REGRA',
      titulo: 'Regra operacional',
      padrao: /\b(regra|regras|pode ou nao|restricao|obrigacao|obrigatorio|proibido)\b/,
      termosBusca: 'regras restricoes obrigacoes ponto de atencao condicoes'
    }
  ];

  for (
    let indice = 0;
    indice < definicoes.length;
    indice++
  ) {
    const item = definicoes[indice];

    if (item.padrao.test(texto)) {
      return {
        id: item.id,
        titulo: item.titulo,
        termosBusca: item.termosBusca
      };
    }
  }

  return {
    id: 'ORIENTACAO_GERAL',
    titulo: 'Orientação geral',
    termosBusca: 'orientacao processo regra ponto de atencao'
  };
}

function unirTextosUnicosAtlas(lista) {
  const mapa = Object.create(null);

  return (lista || [])
    .map(function(item) {
      return String(item || '').trim();
    })
    .filter(function(item) {
      const chave = normalizarTextoAtlas(item);

      if (!chave || mapa[chave]) {
        return false;
      }

      mapa[chave] = true;
      return true;
    });
}

function extrairSecoesHtmlAtlas(html, textoFallback) {
  let fonte = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');

  const secoes = [];
  const padraoTitulo = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;

  let ultimoIndice = 0;
  let tituloAtual = 'Apresentação';
  let nivelAtual = 0;
  let correspondencia;

  function adicionarSecao(conteudoBruto) {
    const texto = converterHtmlParaTextoAtlas(
      conteudoBruto
    );

    if (!texto || texto.length < 8) {
      return;
    }

    secoes.push({
      titulo: tituloAtual,
      nivel: nivelAtual,
      texto: texto,
      ordem: secoes.length
    });
  }

  while (
    (correspondencia = padraoTitulo.exec(fonte)) !== null
  ) {
    adicionarSecao(
      fonte.substring(
        ultimoIndice,
        correspondencia.index
      )
    );

    tituloAtual = converterHtmlParaTextoAtlas(
      correspondencia[2]
    ) || 'Seção';

    nivelAtual = Number(
      correspondencia[1] || 0
    );

    ultimoIndice = padraoTitulo.lastIndex;
  }

  adicionarSecao(
    fonte.substring(ultimoIndice)
  );

  if (!secoes.length) {
    const texto = String(
      textoFallback ||
      converterHtmlParaTextoAtlas(fonte)
    ).trim();

    if (texto) {
      secoes.push({
        titulo: 'Conteúdo do processo',
        nivel: 0,
        texto: texto,
        ordem: 0
      });
    }
  }

  return secoes;
}

function criarTrechoInteligenteAtlas(
  html,
  textoFallback,
  perguntaAtual,
  termos,
  inteligenciaConsulta
) {
  inteligenciaConsulta = inteligenciaConsulta || {};

  const secoes = extrairSecoesHtmlAtlas(
    html,
    textoFallback
  );

  if (!secoes.length) {
    return {
      trecho: '',
      resumoBreve: '',
      secaoPrincipal: '',
      secoesRelacionadas: [],
      pontuacao: 0
    };
  }

  const avaliadas = secoes.map(function(secao) {
    return {
      secao: secao,
      pontuacao: pontuarSecaoAtlas(
        secao,
        perguntaAtual,
        termos,
        inteligenciaConsulta
      )
    };
  });

  let melhores = avaliadas
    .filter(function(item) {
      return item.pontuacao > 0;
    })
    .sort(function(a, b) {
      if (b.pontuacao !== a.pontuacao) {
        return b.pontuacao - a.pontuacao;
      }

      return a.secao.ordem - b.secao.ordem;
    })
    .slice(
      0,
      RETRIEVAL.MAX_SECOES_RESPOSTA
    );

  if (!melhores.length) {
    const fallback = criarTrechoRelevanteAtlas(
      textoFallback,
      perguntaAtual,
      termos
    );

    return {
      trecho: fallback.trecho,
      resumoBreve: construirResumoBreveAtlas(
        fallback.trecho,
        perguntaAtual,
        termos,
        inteligenciaConsulta
      ),
      secaoPrincipal: '',
      secoesRelacionadas: [],
      pontuacao: fallback.pontuacao
    };
  }

  const principal = melhores[0];

  const blocos = melhores.map(function(item) {
    return [
      'Seção: ' + item.secao.titulo,
      limitarTextoAtlas(
        item.secao.texto,
        900
      )
    ].join('\n');
  });

  const trecho = limitarTextoAtlas(
    blocos.join('\n\n'),
    LIMITES.MAX_CARACTERES_TRECHO_RESPOSTA
  );

  const resumoBreve = construirResumoBreveAtlas(
    principal.secao.texto,
    perguntaAtual,
    termos,
    inteligenciaConsulta
  );

  return {
    trecho: trecho,
    resumoBreve: resumoBreve,
    secaoPrincipal: principal.secao.titulo,
    secoesRelacionadas: melhores.map(function(item) {
      return item.secao.titulo;
    }),
    pontuacao: principal.pontuacao
  };
}

function pontuarSecaoAtlas(
  secao,
  perguntaAtual,
  termos,
  inteligenciaConsulta
) {
  secao = secao || {};
  inteligenciaConsulta = inteligenciaConsulta || {};

  const titulo = normalizarTextoAtlas(
    secao.titulo
  );

  const texto = normalizarTextoAtlas(
    secao.texto
  );

  const pergunta = normalizarTextoAtlas(
    perguntaAtual
  );

  const intencao = inteligenciaConsulta.intencao || {};
  const termosIntencao = extrairTermosAtlas(
    intencao.termosBusca || ''
  );

  let pontuacao = 0;

  if (
    pergunta.length >= 4 &&
    titulo.indexOf(pergunta) !== -1
  ) {
    pontuacao += 45;
  }

  if (
    pergunta.length >= 4 &&
    texto.indexOf(pergunta) !== -1
  ) {
    pontuacao += 25;
  }

  (termos || []).forEach(function(termo) {
    const variacoes = obterVariacoesTermoAtlas(
      termo
    );

    variacoes.forEach(function(variacao) {
      if (titulo.indexOf(variacao) !== -1) {
        pontuacao += 10;
      }

      if (texto.indexOf(variacao) !== -1) {
        pontuacao += 3;
      }
    });
  });

  termosIntencao.forEach(function(termo) {
    if (titulo.indexOf(termo) !== -1) {
      pontuacao += 12;
    }

    if (texto.indexOf(termo) !== -1) {
      pontuacao += 4;
    }
  });

  const frasesExpandidas = Array.isArray(
    inteligenciaConsulta.frasesExpandidas
  )
    ? inteligenciaConsulta.frasesExpandidas
    : [];

  frasesExpandidas.forEach(function(frase) {
    frase = normalizarTextoAtlas(frase);

    if (titulo.indexOf(frase) !== -1) {
      pontuacao += 20;
    }

    if (texto.indexOf(frase) !== -1) {
      pontuacao += 8;
    }
  });

  if (
    /\b(ponto de atencao|atencao|orientacao operacional|fluxo|prazo|documentos|requisitos|condicoes)\b/.test(
      titulo + ' ' + texto
    )
  ) {
    pontuacao += 5;
  }

  if (
    intencao.id === 'PRAZO' &&
    /\b(dia|dias|hora|horas|mes|meses|ano|anos|antecedencia|validade|d\s*\d+)\b/.test(texto)
  ) {
    pontuacao += 18;
  }

  if (
    intencao.id === 'DOCUMENTOS' &&
    /\b(documento|documentos|comprovante|formulario|referencia|solicitacao)\b/.test(texto)
  ) {
    pontuacao += 18;
  }

  if (
    intencao.id === 'CANAL' &&
    /\b(email|e mail|telefone|whatsapp|0800|aplicativo|portal|contato)\b/.test(texto)
  ) {
    pontuacao += 18;
  }

  if (
    intencao.id === 'VALOR_TAXA' &&
    /\b(valor|taxa|preco|custo|percentual|porcentagem|r\$)\b/.test(texto)
  ) {
    pontuacao += 18;
  }

  return pontuacao;
}

function construirResumoBreveAtlas(
  texto,
  perguntaAtual,
  termos,
  inteligenciaConsulta
) {
  texto = String(texto || '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();

  if (!texto) {
    return '';
  }

  inteligenciaConsulta = inteligenciaConsulta || {};

  const intencao = inteligenciaConsulta.intencao || {
    id: 'ORIENTACAO_GERAL',
    termosBusca: ''
  };

  const termosIntencao = extrairTermosAtlas(
    intencao.termosBusca || ''
  );

  const unidades = [];

  texto.split(/\n+/).forEach(function(linha) {
    linha = String(linha || '').trim();

    if (!linha) {
      return;
    }

    const partes = linha.match(
      /[^.!?;]+[.!?;]?/g
    ) || [linha];

    partes.forEach(function(parte) {
      parte = parte.trim();

      if (
        parte.length >= 12 &&
        parte.length <= 520
      ) {
        unidades.push(parte);
      }
    });
  });

  const avaliadas = unidades.map(function(unidade, indice) {
    const normalizada = normalizarTextoAtlas(
      unidade
    );

    let pontuacao = Math.max(
      0,
      4 - indice * 0.15
    );

    (termos || []).forEach(function(termo) {
      const encontrou = obterVariacoesTermoAtlas(
        termo
      ).some(function(variacao) {
        return normalizada.indexOf(variacao) !== -1;
      });

      if (encontrou) {
        pontuacao += 4;
      }
    });

    termosIntencao.forEach(function(termo) {
      if (normalizada.indexOf(termo) !== -1) {
        pontuacao += 5;
      }
    });

    if (
      /\b(ponto de atencao|atencao|nao deve|deve|obrigatorio|necessario|prazo|canal|documento)\b/.test(
        normalizada
      )
    ) {
      pontuacao += 6;
    }

    if (
      intencao.id === 'PROCEDIMENTO' &&
      /\b(acessa|seleciona|realiza|solicita|formaliza|confirma|envia|aguarda|acompanha|deve)\b/.test(
        normalizada
      )
    ) {
      pontuacao += 7;
    }

    return {
      indice: indice,
      texto: unidade,
      pontuacao: pontuacao
    };
  });

  const ordenadasPorRelevancia = avaliadas
    .sort(function(a, b) {
      if (b.pontuacao !== a.pontuacao) {
        return b.pontuacao - a.pontuacao;
      }

      return a.indice - b.indice;
    });

  const melhorPontuacao = ordenadasPorRelevancia.length
    ? Number(ordenadasPorRelevancia[0].pontuacao || 0)
    : 0;

  const fatorCorte = intencao.id === 'PROCEDIMENTO'
    ? 0.35
    : (
        intencao.id === 'RESUMO_PROCESSO' ||
        intencao.id === 'CONCEITO'
          ? 0.45
          : 0.55
      );

  const limiteFrases = intencao.id === 'PROCEDIMENTO'
    ? RETRIEVAL.MAX_FRASES_RESUMO
    : Math.min(
        4,
        RETRIEVAL.MAX_FRASES_RESUMO
      );

  let selecionadas = ordenadasPorRelevancia
    .filter(function(item, indice) {
      return (
        indice === 0 ||
        Number(item.pontuacao || 0) >=
          melhorPontuacao * fatorCorte
      );
    })
    .slice(
      0,
      limiteFrases
    )
    .sort(function(a, b) {
      return a.indice - b.indice;
    });

  if (!selecionadas.length && avaliadas.length) {
    selecionadas = avaliadas.slice(0, 3);
  }

  const mapa = Object.create(null);

  const linhas = selecionadas
    .filter(function(item) {
      const chave = normalizarTextoAtlas(
        item.texto
      );

      if (!chave || mapa[chave]) {
        return false;
      }

      mapa[chave] = true;
      return true;
    })
    .map(function(item) {
      const prefixo = intencao.id === 'PROCEDIMENTO'
        ? '• '
        : '';

      return prefixo + item.texto;
    });

  return limitarTextoAtlas(
    linhas.join('\n'),
    RETRIEVAL.MAX_CARACTERES_RESUMO
  );
}

function normalizarTextoAtlas(texto) {
  return String(
    texto || ''
  )
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extrairTermosAtlas(consulta) {
  const stopwords = {
    a: true,
    ao: true,
    aos: true,
    as: true,
    com: true,
    como: true,
    da: true,
    das: true,
    de: true,
    do: true,
    dos: true,
    e: true,
    em: true,
    eu: true,
    me: true,
    na: true,
    nas: true,
    no: true,
    nos: true,
    o: true,
    os: true,
    para: true,
    por: true,
    qual: true,
    quais: true,
    que: true,
    um: true,
    uma: true,
    onde: true,
    preciso: true,
    quero: true,
    tem: true,
    fazer: true,
    faco: true,
    funciona: true,
    fala: true,
    sobre: true,
    seria: true,
    pode: true,
    posso: true,
    devo: true,
    gostaria: true,
    favor: true,
    pergunta: true,
    complementar: true
  };

  const mapa = Object.create(null);

  return String(
    consulta || ''
  )
    .split(' ')
    .filter(function(termo) {
      if (
        termo.length < 2 ||
        stopwords[termo] ||
        mapa[termo]
      ) {
        return false;
      }

      mapa[termo] = true;
      return true;
    });
}

function converterHtmlParaTextoAtlas(html) {
  return String(
    html || ''
  )
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/\[\[(?:MIDIA|ANEXO):[^\]]+\]\]/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function criarTrechoRelevanteAtlas(texto, perguntaAtual, termos) {
  texto = String(
    texto || ''
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();

  if (!texto) {
    return {
      trecho: '',
      pontuacao: 0
    };
  }

  const blocos = separarBlocosAtlas(
    texto
  );

  const perguntaNormalizada = normalizarTextoAtlas(
    perguntaAtual
  );

  const avaliados = blocos.map(function(bloco, indice) {
    const normalizado = normalizarTextoAtlas(
      bloco
    );

    let pontuacao = 0;

    if (
      perguntaNormalizada.length >= 4 &&
      normalizado.indexOf(perguntaNormalizada) !== -1
    ) {
      pontuacao += 35;
    }

    (termos || []).forEach(function(termo) {
      const encontrouVariacao = obterVariacoesTermoAtlas(
        termo
      ).some(function(variacao) {
        return normalizado.indexOf(variacao) !== -1;
      });

      if (encontrouVariacao) {
        pontuacao += 5;
      }
    });

    if (
      /\b(ponto de atencao|atencao|orientacao operacional|regra|prazo|condicao|etapa|fluxo)\b/.test(
        normalizado
      )
    ) {
      pontuacao += 3;
    }

    return {
      indice: indice,
      texto: bloco,
      pontuacao: pontuacao
    };
  });

  const melhores = avaliados
    .filter(function(item) {
      return item.pontuacao > 0;
    })
    .sort(function(a, b) {
      return b.pontuacao - a.pontuacao;
    })
    .slice(
      0,
      LIMITES.MAX_BLOCOS_RESPOSTA
    );

  if (melhores.length === 0) {
    return {
      trecho: limitarTextoAtlas(
        texto,
        LIMITES.MAX_CARACTERES_TRECHO_RESPOSTA
      ),
      pontuacao: 0
    };
  }

  const indicesSelecionados = {};

  melhores.forEach(function(item) {
    indicesSelecionados[item.indice] = true;

    if (
      item.indice > 0 &&
      blocos[item.indice - 1].length <= 220
    ) {
      indicesSelecionados[item.indice - 1] = true;
    }
  });

  const selecionados = blocos
    .filter(function(bloco, indice) {
      return Boolean(indicesSelecionados[indice]);
    })
    .join('\n')
    .trim();

  return {
    trecho: limitarTextoAtlas(
      selecionados,
      LIMITES.MAX_CARACTERES_TRECHO_RESPOSTA
    ),

    pontuacao: melhores[0].pontuacao
  };
}

function separarBlocosAtlas(texto) {
  const linhas = String(texto || '')
    .split(/\n+/)
    .map(function(item) {
      return item.trim();
    })
    .filter(Boolean);

  const blocos = [];

  linhas.forEach(function(linha) {
    const partes = linha.match(
      /[^.!?;:]+[.!?;:]?/g
    ) || [linha];

    partes.forEach(function(parte) {
      parte = parte.trim();

      if (parte) {
        blocos.push(parte);
      }
    });
  });

  return blocos.length > 0
    ? blocos
    : [String(texto || '').trim()];
}

function limitarTextoAtlas(texto, limite) {
  texto = String(
    texto || ''
  ).trim();

  limite = Number(
    limite || 0
  );

  if (
    limite <= 0 ||
    texto.length <= limite
  ) {
    return texto;
  }

  return (
    texto.substring(
      0,
      limite
    ).trim() +
    '...'
  );
}

const LIMITES = { MAX_BLOCOS_RESPOSTA: 4, MAX_CARACTERES_TRECHO_RESPOSTA: 1800 };
const groups = [
  ['abrir-chamado', 'abrir chamado', ['abrir chamado', 'abro um chamado', 'novo chamado', 'criar ticket', 'registrar solicitacao']],
  ['acompanhar-chamado', 'acompanhar chamado', ['acompanhar chamado', 'status do chamado', 'status do ticket', 'andamento do chamado']],
  ['encerrar-chamado', 'encerrar chamado', ['encerrar chamado', 'fechar chamado', 'concluir ticket']],
  ['redefinir-senha', 'redefinir senha', ['redefinir senha', 'redefinir a senha', 'recuperar senha', 'esqueci minha senha', 'esqueci a senha', 'resetar senha', 'reseto a senha']],
  ['solicitar-acesso', 'solicitar acesso', ['solicitar acesso', 'pedir acesso', 'liberar permissao', 'acesso ao modulo']],
  ['transferir-responsavel', 'transferir responsavel', ['transferir responsavel', 'trocar de dono', 'mudar responsavel', 'reatribuir solicitacao']],
  ['revisar-procedimento', 'revisar procedimento', ['revisar procedimento', 'revisar um procedimento', 'atualizar artigo', 'validar conteudo']],
  ['registrar-evidencia', 'registrar evidencia', ['registrar evidencia', 'anexar evidencia', 'documentar teste']]
];
const RETRIEVAL = {
  VERSAO: 'demo-1.0.0',
  MAX_CORRECOES_DIGITACAO: 4, MAX_TERMOS_ESSENCIAIS: 24, MAX_TERMOS_BUSCA: 48,
  MAX_SECOES_RESPOSTA: 3, MAX_FRASES_RESUMO: 5, MAX_CARACTERES_RESUMO: 1250,
  ABREVIACOES: { ti: 'tecnologia acessos', sla: 'prazo atendimento' },
  VOCABULARIO: ['abrir', 'acesso', 'acompanhar', 'anexar', 'arquivo', 'artigo', 'atendimento', 'chamado',
    'concluir', 'conteudo', 'credencial', 'documento', 'encerrar', 'evidencia', 'historico',
    'permissao', 'prazo', 'procedimento', 'protocolo', 'rascunho', 'redefinir', 'registrar',
    'requisitos', 'responsavel', 'revisar', 'revisao', 'senha', 'solicitacao', 'status', 'transferir'],
  ALIASES: groups.map(([id, canonical, variants]) => ({ id, canonical, variants }))
};
const VARIACOES = Object.freeze({
  ticket: ['ticket', 'chamado'], chamado: ['chamado', 'ticket'], responsavel: ['responsavel', 'responsabilidade'],
  redefinir: ['redefinir', 'resetar', 'recuperar'], procedimento: ['procedimento', 'processo'],
  revisar: ['revisar', 'revisao'], protocolo: ['protocolo', 'protocolos'],
  acesso: ['acesso', 'permissao'], permissao: ['permissao', 'acesso']
});
function obterVariacoesTermoAtlas(termo) {
  return Object.hasOwn(VARIACOES, termo) ? VARIACOES[termo] : [termo];
}
function contemTermo(texto, termo) {
  return Boolean(termo) && (' ' + texto + ' ').includes(' ' + termo + ' ');
}
function extrairEntidadesAtlas(texto) {
  return groups.filter(([, canon]) => contemTermo(texto, canon))
    .map(([id, canon]) => ({ id, termosBusca: canon }));
}
const generic = new Set('abre abrir abro acompanho acontece ajuda artigo cadastro canal deve dia dias diz e esse essa esta fluxo hora horas informacao leva link minuto minutos nisso posso preciso processo procedimento prazo prazos quanto quantos quando quero saber sobre tempo tipo uso validade vai veja voce'.split(' '));
const esc = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const campos = article => normalizarTextoAtlas([article.title, article.summary, ...article.keywords, ...article.sections.map(s => s.title + ' ' + s.text)].join(' '));
const specific = terms => terms.filter(t => t.length > 2 && !generic.has(t));

export function createEngine(articles, categories) {
  const titles = Object.fromEntries(categories.map(category => [category.id, category.title]));
  const index = articles.map(article => ({
    article, words: campos(article),
    original: { ...article, content: article.sections.map(s => '<h2>' + esc(s.title) + '</h2><p>' + esc(s.text) + '</p>').join('') }
  }));
  function rank(query, subset = index) {
    const intel = analisarConsultaAtlas(query, query);
    const core = specific(intel.termosOriginais);
    const aliasIds = intel.aliasesDetectados.filter(id => !id.startsWith('ABREVIACAO_'));
    const candidates = subset.map(entry => {
      const matches = core.filter(t => obterVariacoesTermoAtlas(t).some(v => contemTermo(entry.words, v))).length;
      const alias = aliasIds.includes(entry.article.id);
      if (!alias && (!matches || matches < Math.ceil(core.length * 0.55))) return null;
      const score = pontuarConteudoAtlas(entry.original, titles, intel.consultaExpandida,
        intel.consultaInterpretada, intel.termosEssenciais, intel.termosOriginais, intel);
      return score ? { ...score, pontuacao: score.pontuacao + (alias ? 100 : 0) } : null;
    }).filter(Boolean).sort((a, b) => b.pontuacao - a.pontuacao || a.id.localeCompare(b.id));
    return { intel, candidates, aliasIds, core };
  }
  function search(query, category = 'todos') {
    const subset = index.filter(row => category === 'todos' || row.article.categoryId === category);
    if (!String(query || '').trim()) return subset.map(row => ({ id: row.article.id }));
    return rank(String(query).slice(0, 600), subset).candidates;
  }
  function ask(input, previousId = '') {
    const question = String(input || '').trim();
    const normalized = normalizarTextoAtlas(question);
    if (!normalized || question.length > 600) {
      return { type: 'clarify', text: 'Faça uma pergunta de até 600 caracteres sobre um processo do catálogo.' };
    }
    if (/\b(ignore|ignorar|revele|revelar|execute|executar)\b.*\b(regra|regras|instrucoes|prompt|codigo|credenciais|segredo)\b/.test(normalized)) {
      return { type: 'blocked', text: 'O assistente consulta apenas os processos disponíveis na demonstração.' };
    }
    const continuation = /^(?:e )?(?:qual (?:e )?o prazo|quanto tempo(?: demora)?|quantos dias(?: leva)?|quais (?:sao )?os requisitos|qual (?:e )?o canal)$/.test(normalized);
    const context = continuation ? index.find(row => row.article.id === previousId) : null;
    const query = context ? question + ' ' + context.article.title : question;
    const { intel, candidates, aliasIds, core } = rank(query, context ? [context] : index);
    if (aliasIds.length > 1) {
      return { type: 'clarify', text: 'Encontrei mais de um processo. Faça uma pergunta sobre um deles por vez.' };
    }
    if (!core.length && !context && !aliasIds.length) {
      return { type: 'clarify', text: 'De qual processo você quer saber? Informe o assunto, como abertura de chamado ou redefinição de senha.' };
    }
    const best = candidates[0];
    const fallback = { type: 'no-source', text: 'Não encontrei informação suficiente na base fictícia para responder a essa pergunta.' };
    if (!best || best.pontuacao < 24) return fallback;
    if (!context && !aliasIds.length && candidates[1] && best.pontuacao - candidates[1].pontuacao < 9) {
      return { type: 'clarify', text: 'Mais de um processo parece relevante. Inclua o nome da etapa ou da solicitação.' };
    }
    const article = index.find(row => row.article.id === best.id).article;
    const section = article.sections.find(s => s.title === best.secaoPrincipal);
    if (!section) return fallback;
    const evidence = {
      PRAZO: /\b\d+\s+(?:minutos?|horas?|dias?|semanas?)\b/,
      VALOR_TAXA: /\b(?:valor|taxa|preco|custo)\b.{0,30}\d/,
      DOCUMENTOS: /\b(?:documentos?|requisitos?|informe|inclua|arquivo)\b/,
      CANAL: /\b(?:abra|tela|area|formulario)\b/
    }[intel.intencao.id];
    if (evidence && !evidence.test(normalizarTextoAtlas(section.text))) return fallback;
    // Exibe apenas frases que constam literalmente da seção citada.
    const excerpt = best.resumoBreve.split('\n').map(line => line.replace(/^•\s*/, '').trim())
      .filter(line => line && section.text.includes(line)).join(' ');
    return {
      type: 'answer', text: excerpt && (!evidence || evidence.test(normalizarTextoAtlas(excerpt))) ? excerpt : section.text,
      source: { id: article.id, title: article.title, section: section.title },
      intent: intel.intencao.titulo, corrections: intel.correcoesAplicadas,
      evidence: best.evidencias, contextual: Boolean(context)
    };
  }
  return Object.freeze({ search, ask });
}
