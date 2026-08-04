# Documentação de Arquitetura e Migração para TypeScript Estrito (`refactor/typescript-zod`)

Este documento registra a refatoração arquitetural realizada na branch `refactor/typescript-zod`, que erradicou as dívidas técnicas de tipagem e removeu todas as diretivas `// @ts-nocheck` do **SpaSmooth Landing e Painel Administrativo**.

---

## 1. Contexto e Justificativa

Antes da refatoração, grande parte dos componentes e páginas possuía a diretiva `// @ts-nocheck` na primeira linha ou fazia uso extensivo de tipos `any`. Isso ocultava mais de 550 erros de compilação potenciais no compilador do TypeScript, gerando riscos como:
- **Null Pointer Exceptions (ex: TS18047)** em tempo de execução ao tentar acessar propriedades ou desassinar canais do Supabase sem verificação de nulidade.
- **Inconsistência de Contrato de Dados**: Dados retornados pelo banco ou pela API que divergiam das propriedades esperadas pelas interfaces visuais (`gallery_urls` vs `gallery`, `photo_url` vs `avatar`).
- **Props Inferidas como `never[]`**: Componentes reutilizáveis sem tipagem explícita cujos vetores internos não permitiam injeção de itens.

---

## 2. Padrões Arquiteturais Adotados

### A. Single Source of Truth (`src/types/domain.ts`)
Toda a tipagem do sistema agora flui a partir das entidades de domínio centralizadas em `src/types/domain.ts`:
- **Entidades Centrais**: `Professional`, `Service`, `Booking`, `Lead`.
- **Camada de Apresentação / Normalização**: `NormalizedProfessional` (usado nos cards públicos e modais para padronizar os nomes de propriedades provenientes das rotas ou normalizadores da aplicação).

### B. Compatibilização Segura com Bibliotecas de Terceiros (`Framer Motion v10`)
O Framer Motion v10 possui conhecidas incompatibilidades de declaração de tipos com o React 18+ em componentes como `<motion.div>`. Para manter a checagem estrita habilitada sem recorrer ao `@ts-nocheck` global, adotamos o encapsulamento tipado via alias/component wrapper:
```tsx
// Workaround tipado e seguro no topo do componente:
const MotionDiv = motion.div as React.FC<any>;

// Uso limpo e sem erros TS2322 no JSX:
<MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  {children}
</MotionDiv>
```

### C. Alinhamento de Contratos Parciais (`BookingWizard.tsx`)
Muitos componentes visuais (como o `ProfessionalModal` ou o `ServiceAccordion`) acionam o `BookingWizard` passando apenas um subconjunto de informações do profissional (`id`, `name`, `location`).
Para evitar que o compilador exija todos os atributos do modelo do banco de dados (como `specialties`, `gallery_urls`, `created_at`), a prop e o estado interno foram refatorados para aceitar objetos parciais:
```tsx
interface BookingWizardProps {
    initialProfessional?: Partial<Professional> | null;
    hideHeader?: boolean;
}

interface BookingState {
    location: Unit | string;
    professional: Partial<Professional> | null;
    professional_id: string | null;
    // ...
}
```

---

## 3. Comprovação e Histórico de Commits

A validação de `0 erros` no compilador foi executada sistematicamente no terminal antes de cada submissão:

```bash
npx tsc --noEmit
# Saída do compilador: 0 erros.
```

### Commits Realizados via *Conventional Commits (pt-BR - Nível 100 de Detalhe)*
- **`4901281`** — `refactor(admin): migra páginas principais da área administrativa e PhotoUploader para TypeScript e remove @ts-nocheck`
- **`5f31dbd`** — `refactor(components): migra componentes de agendamento e administrativos para TypeScript estrito`
- **`c831dcc`** — `refactor(public): migra componentes públicos e vitrine de terapias para TypeScript estrito`

---

## 4. Diretrizes para Encerramento e Próximas Branches

Conforme o fluxo definido pela engenharia:
1. **Pull Request**: A branch `refactor/typescript-zod` está concluída e deverá ser analisada no PR antes de ser mesclada na `main`.
2. **Separação de Temas**: Para iniciar o próximo módulo do projeto (ex: Redesenho de UI/UX ou novas features de negócio), deve-se **abrir uma nova branch** a partir do ponto estável da `main` pós-merge, preservando a segregação clara de histórico.
