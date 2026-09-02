# ScanLoc

Atue como um Engenheiro de Software Fullstack e UX Designer especialista em SaaS B2B. Quero criar a primeira versão (MVP) de um sistema de gestão completo voltado para micro e pequenas locadoras de equipamentos da construção civil.

O foco central da plataforma é a ALTÍSSIMA USABILIDADE e VELOCIDADE no pátio (Mobile First) para resolver os gargalos de devolução de equipamentos, controle de avarias e geração rápida de contratos sem papel.

---

### 1. ARQUITETURA DO BANCO DE DADOS (Supabase / Postgres Schema)

Crie as tabelas, tipos enumerados e relacionamentos necessários:

1. `locadoras` (tenant/multitenancy): id, nome_fantasia, cnpj, logo_url, telefone, endereco.

2. `equipamentos` (ativos): id, patrimonio_code (único, ex: PAT-0102), qr_code, serial_number, nome, categoria, valor_diaria, valor_reposicao, status (DISPONIVEL, LOCADO, MANUTENCAO, PERDIDO).

3. `clientes`: id, nome_razao_social, documento (CPF/CNPJ), whatsapp, email, endereco_obra.

4. `contratos`: id, numero_contrato, cliente_id, data_inicio, data_fim_prevista, data_fim_real, status (RASCUNHO, ATIVO, EM_DEVOLUCAO, CONCLUIDO), assinado (boolean), assinatura_digital_url.

5. `itens_contrato`: id, contrato_id, equipamento_id, valor_unitario, periodo_tipo (DIARIO, SEMANAL, QUINZENAL, MENSAL).

6. `vistorias_devolucao`: id, equipamento_id, contrato_id, fotos_urls (array), com_avaria (boolean), descricao_avaria, taxa_reparo, data_vistoria.

7. `faturamentos`: id, contrato_id, valor_total_locacao, valor_avarias, valor_final, status_pagamento (PENDENTE, PAGO), codigo_pix_simulado.

---

### 2. INTERFACE E NAVEGAÇÃO (UX/UI com Tailwind CSS + Lucide Icons)

Crie um layout moderno, responsivo e intuitivo com sidebar para Desktop e Bottom Navigation para Mobile. Permita alternar facilmente entre as visões do sistema:

#### A. TELA 1: "PÁTIO / SCAN & DEVOLVE" (Mobile First - Prioridade Operacional)

- **Leitura Híbrida de QR Code / Código de Barras:**

  - Campo de busca no topo com botão de ícone de Câmera que abre o Scanner via Câmera Real do dispositivo (integrando a biblioteca `html5-qrcode`).

  - Botão de atalho rápido: "Simular Leitura PAT-0102" para permitir testes sem depender da câmera no desktop.

  - Campo de input manual para busca fallback por Código de Patrimônio, Nº de Série ou apelido.

- **Busca Inversa Automática (Item ➔ Contrato):** Ao ler ou digitar o patrimônio (ex: "PAT-0102"), consulte os dados e exiba o Card do Equipamento:

  - Foto, Nome do Equipamento e Patrimônio.

  - Nome do Cliente e Número do Contrato Ativo vinculado.

  - Data de início, previsão de devolução e alerta visual em caso de diárias atrasadas.

- **Botões de Ação Direta no Pátio:**

  - Botão Grande Verde: "Devolver em Perfeito Estado" (dá baixa imediata com 1 clique).

  - Botão Grande Amarelo/Vermelho: "Registrar Avaria / Danos".

- **Fluxo de Avaria:** Se clicar em "Registrar Avaria", abrir modal para upload/simulação de foto do dano, campo descritivo e valor estimado de ressarcimento/manutenção.

- **Ação Final:** Ao confirmar a baixa, alterar o status do equipamento para DISPONIVEL (ou MANUTENCAO se houver avaria), atualizar o contrato e exibir um comprovante visual de devolução com botão para "Enviar Recibo via WhatsApp".

#### B. TELA 2: "EMISSÃO DE CONTRATO RÁPIDO"

- Fluxo de criação em 3 etapas simples:

  1. Seleção ou Cadastro Rápido do Cliente (campos: Nome/Razão Social, CPF/CNPJ, WhatsApp e Endereço da Obra).

  2. Seleção dos Equipamentos (por busca rápida ou bipagem via câmera) e definição do regime de cobrança (Diário, Semanal, Mensal).

  3. Visualização Prévia do Contrato (Termos legais, Cláusulas de responsabilidade por mau uso, tabela de equipamentos com valores de reposição em caso de perda/roubo).

- **Assinatura Digital:** Tela de Canvas para o cliente assinar com o dedo/mouse ou botão para "Enviar Link de Assinatura via WhatsApp".

#### C. TELA 3: "DASHBOARD E GESTÃO DE ATIVOS"

- Cards de Métricas e Indicadores no topo: Total de Equipamentos, Em Obra (Locados), Em Manutenção e Faturamento Previsto do Mês.

- Tabela da Frota de Ativos com filtros por status e busca rápida.

- **Duas Opções para Entrada de Ativos:**

  1. Botão "+ Novo Equipamento (Manual)": Modal/Formulário para cadastrar 1 item individualmente (Nome, Categoria, Patrimônio/QR Code, Nº de Série, Valor da Diária, Valor de Reposição e Foto).

  2. Botão "Importar Planilha (CSV/Excel)": Modal com área de drag-and-drop para simular o upload da base antiga de patrimônios com mapeamento de colunas.

- Botão "Imprimir Folha de Etiquetas QR Code": Gera uma grade (grid) formatada com os QR Codes e códigos de patrimônio dos equipamentos para visualização e impressão.

#### D. TELA 4: "FINANCEIRO E MEDIÇÕES"

- Lista de contratos encerrados/devolvidos prontos para faturamento.

- Visualização do resumo de valores: Diárias de Locação + Taxas de Avarias/Limpeza.

- Simulação do Módulo Fiscal: Botão "Emitir Fatura / Nota Fiscal" que gera um preview do documento fiscal e simula um Código PIX Copia e Cola para cobrança.

---

### 3. DESIGN SYSTEM E UX

- Use Tailwind CSS com visual moderno (Tema Escuro/Alto Contraste opcional para uso em pátios sob luz do sol).

- Paleta de Cores: Tons industriais (Amarelo/Laranja de construção, Cinza Grafite Escuro e detalhes em Verde para confirmações).

- Elementos com áreas de toque amplas para telas de smartphones.

Gere a aplicação completamente funcional com DADOS MOCKADOS para que eu possa simular todo o ciclo imediatamente: cadastrar um ativo, emitir um contrato, realizar a devolução por busca inversa/scanner no pátio e visualizar o faturamento final.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6694aa37-8fc2-4ce6-bcd9-87358ee76e48).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
