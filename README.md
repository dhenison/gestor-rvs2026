# 🏫 RVS Escolar — Sistema de Gestão SEDUC/PA

Sistema web de gestão escolar desenvolvido para a rede estadual do Pará.

## 📁 Estrutura do Projeto

```
rvs_escolar/
├── index.html        ← Ponto de entrada (abra este arquivo no navegador)
├── css/
│   └── style.css     ← Todos os estilos da interface
├── js/
│   └── app.js        ← Toda a lógica e dados da aplicação
└── assets/           ← Imagens e recursos futuros
```

## 🚀 Como usar

1. Baixe ou clone o repositório
2. Abra o arquivo `index.html` diretamente no navegador
3. Use as credenciais abaixo para entrar

## 🔐 Acesso

| Campo  | Valor                             |
|--------|-----------------------------------|
| E-mail | `admin@escola.seduc.pa.gov.br`    |
| Senha  | `123456`                          |

> Qualquer e-mail terminado em `@escola.seduc.pa.gov.br` é aceito.

## 📋 Módulos

| Módulo           | Descrição                                              |
|------------------|--------------------------------------------------------|
| Dashboard        | Métricas em tempo real, alertas e resumo de turmas     |
| Agenda           | Calendário pedagógico com agendamentos                 |
| Turmas           | Gerenciamento e progresso de frequência por turma      |
| Alunos           | Cadastro completo e ficha individual com timeline      |
| Frequência       | Chamada com fluxo Pendente → Consolidado → Finalizado  |
| Transporte       | Controle de rotas escolares (Vinda/Ida)                |
| Ocorrências      | Evasão, indisciplina, bullying e agressões             |
| Livros Didáticos | Controle de entrega por disciplina e turma             |
| Chat RVS         | Mensagens internas por perfil (Coord/Sec/Prof)         |
| Permissões       | Controle de acesso RBAC por perfil                     |
| Perfil           | Dados pessoais, formação e redes sociais               |

## 🛠️ Tecnologias

- **HTML5** — Estrutura e marcação semântica
- **CSS3** — Estilização com variáveis, grid e flexbox
- **JavaScript (ES6+)** — Lógica, renderização dinâmica e interatividade
- **Google Fonts** — Tipografia (Plus Jakarta Sans)

> Sem frameworks ou dependências externas. Funciona offline após carregamento da fonte.

## 🔮 Próximas Etapas (roadmap)

- [ ] Integração com API WhatsApp para notificações
- [ ] Geração de relatórios em PDF
- [ ] Backend com banco de dados relacional
- [ ] Autenticação real com JWT
- [ ] PWA para uso em dispositivos móveis

---
Desenvolvido para SEDUC/PA — Sistema RVS Escolar
