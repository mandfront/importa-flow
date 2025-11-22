# ImportaFlow

**Calculadora inteligente para entender o lucro real de pacotes importados da China para o Brasil.**

ImportaFlow é uma ferramenta desenvolvida para importadores brasileiros que precisam calcular com precisão o custo final de seus produtos, incluindo fretes, impostos, taxas e margem de lucro — tudo em reais.

---

## 📸 Screenshots

### Tela Inicial
<img width="1913" height="860" alt="Captura de Tela 2025-11-22 às 17 03 30" src="https://github.com/user-attachments/assets/0174ca79-da1f-4089-97fe-d9960711b368" />


### Calculadora de Pacotes
<img width="1914" height="864" alt="Captura de Tela 2025-11-22 às 17 02 27" src="https://github.com/user-attachments/assets/7c4e2f5d-5420-4cf3-9177-bd477ca70bc7" />


---

## ✨ Principais Features

### 💰 Cálculo Completo em Reais
- Soma automática de produtos (em CNY), frete internacional, frete interno, taxa de serviço, seguro e outros custos
- Conversão para BRL com cotação configurável (CNY → BRL e USD → BRL para base de impostos)
- Cálculo de impostos: Imposto de Importação + ICMS
- Escolha da base de cálculo: apenas valor declarado ou declarado + frete

### 📦 Rateio Avançado por Produto
Sistema inteligente de distribuição de custos com três modos:
- **Por Valor** (`by_value`): distribui custos proporcionalmente ao valor de cada produto
- **Por Peso** (`by_weight`): distribui baseado no peso de cada item
- **Por Quantidade** (`by_quantity`): distribui igualmente entre as unidades

Cada produto exibe:
- Custo unitário real (R$)
- Preço sugerido com margem configurável
- Lucro por unidade e lucro total

### 📋 Importação de Resumo CSSBuy / ACBuy
- Cole o resumo completo do seu agente (CSSBuy, ACBuy, etc.)
- Parser inteligente que extrai automaticamente:
  - Itens com descrição, loja, preço unitário, quantidade e peso
  - Frete internacional, taxa de serviço, seguro
- Modal de pré-visualização para revisar e editar os dados antes de aplicar
- Economia de tempo: não precisa digitar item por item

### 📊 Resultados Detalhados
- Custo total do pacote em R$
- Total de impostos (separado: Imposto de Importação + ICMS)
- Custo por kg do pacote
- Tabela completa com todos os itens:
  - Descrição e loja
  - Quantidade
  - Custo unitário
  - Preço sugerido
  - Lucro total

### 🎨 Interface Moderna
- Design responsivo para desktop e mobile
- Tema escuro otimizado (claro em desenvolvimento)
- Componentes do shadcn/ui para UX consistente
- Ícones do lucide-react
- Textos centralizados em arquivos JSON de locale (fácil manutenção)

### 📚 Histórico *(em desenvolvimento)*
- Navegação preparada no header
- **Roadmap**: salvar simulações, comparar pacotes, exportar relatórios

---

## 🛠️ Tecnologias Utilizadas

- **[Next.js 15](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca de interface
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI reutilizáveis
- **[lucide-react](https://lucide.dev/)** - Ícones modernos
- **[Vercel Analytics](https://vercel.com/analytics)** - Análise de uso

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Node.js** 18+ 
- **pnpm** (recomendado), yarn ou npm

### Passo a passo

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/importa-flow.git

# Entre na pasta do projeto
cd importa-flow

# Instale as dependências
pnpm install
# ou: npm install
# ou: yarn install

# Rode o servidor de desenvolvimento
pnpm dev
# ou: npm run dev
# ou: yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para ver o app rodando.

### Build de Produção

```bash
# Criar build otimizado
pnpm build

# Rodar build em produção
pnpm start
```

---

## 📁 Estrutura de Pastas

```
importa-flow/
├── app/
│   ├── layout.tsx              # Layout raiz com providers
│   ├── page.tsx                # Página inicial (Home)
│   ├── globals.css             # Estilos globais
│   └── pages/
│       └── calculator/
│           └── page.tsx        # Calculadora principal
├── components/
│   ├── header.tsx              # Header do app
│   ├── form-field.tsx          # Componente de campo de formulário
│   ├── theme-provider.tsx      # Provider de tema
│   ├── theme-toggle.tsx        # Toggle de tema claro/escuro
│   └── ui/                     # Componentes shadcn/ui
│       ├── button.tsx
│       ├── input.tsx
│       ├── table.tsx
│       └── ...
├── hooks/
│   └── use-toast.ts            # Hook de notificações
├── lib/
│   └── utils.ts                # Utilitários (cn, etc.)
├── locales/
│   └── pt-BR/
│       ├── home.json           # Textos da home
│       └── calculator.json     # Textos da calculadora
├── public/
│   └── importa-flow-icon.png   # Logo do app
├── components.json             # Configuração shadcn/ui
├── tailwind.config.ts          # Configuração Tailwind
└── tsconfig.json               # Configuração TypeScript
```

---

## 🔮 Roadmap / Próximos Passos

### Melhorias Planejadas

- [ ] **Histórico de simulações**
  - Salvar simulações no localStorage ou banco de dados
  - Listar e comparar pacotes anteriores
  - Exportar histórico

- [ ] **Componentes modulares**
  - Separar a calculadora em componentes menores e reutilizáveis
  - Criar componentes específicos: `PackageForm`, `ItemsList`, `CostsSummary`, `ResultsTable`
  - Melhorar manutenibilidade e testabilidade do código

- [ ] **Exportação de relatórios**
  - Exportar simulações em CSV
  - Gerar PDF com resumo detalhado

- [ ] **Suporte a múltiplas moedas**
  - Produtos em EUR, USD, além de CNY
  - Conversões automáticas

- [ ] **ICMS personalizado por estado**
  - Seletor de estado do Brasil
  - Aplicar alíquota de ICMS específica por UF

- [ ] **Modo claro / escuro completo**
  - Ativar toggle de tema
  - Otimizar paleta de cores para ambos os modos

- [ ] **Templates de produtos**
  - Salvar produtos frequentes
  - Criar simulações mais rápido

- [ ] **Calculadora de viabilidade**
  - Comparar preço de venda no Brasil vs. custo importado
  - Análise de competitividade

---

## ⚠️ Disclaimer

**ImportaFlow é uma ferramenta de estimativa.**

- Os cálculos são baseados nas informações fornecidas e nas alíquotas configuradas
- Impostos, taxas e regulamentações aduaneiras podem variar
- **Não substitui orientação de contador, despachante aduaneiro ou profissional da área fiscal**
- Sempre consulte profissionais qualificados para decisões financeiras e fiscais

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Desenvolvido por

**ImportaFlow** - Criado por Amanda Caraça, com o objetivo de facilitar a vida de importadores brasileiros 🇧🇷

---

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

---

## 📮 Contato / Suporte

Encontrou algum bug ou tem sugestões? Abra uma [issue](https://github.com/seu-usuario/importa-flow/issues) no GitHub!

---

**Made with ❤️ for Brazilian importers**
