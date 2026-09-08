# GitHub nesta pasta

Repositório original: https://github.com/wesleycaiadev/spasmooth-landing

O histórico foi recuperado nesta pasta sem substituir o conteúdo local. As alterações de segurança ficam na branch `security/hardening-2026-09`, baseada na `main` original.

Para acompanhar alterações pelo terminal integrado:

```bash
git status
git diff
```

Para enviar novas alterações na branch atual, revise os arquivos antes de adicioná-los:

```bash
git add caminho/do/arquivo
git diff --cached
git commit -m "Descreva a alteração"
git push
```

Se o Git solicitar autenticação, entre na sua conta GitHub pelo editor ou configure o GitHub CLI com `gh auth login` e `gh auth setup-git`. A conexão GitHub do assistente é independente da autenticação do Git no seu computador. Não coloque tokens na URL do repositório.

Abra um pull request para integrar a branch à main. Confira as verificações e o preview da Vercel antes da integração. O deployment de segurança já publicado foi feito diretamente pela Vercel; o envio ao GitHub registra o código e o histórico.

Não execute `git reset --hard`, `git clean` ou force push para sincronizar esta pasta. Não adicione `.env`, `.vercel`, `node_modules`, `.next` ou o estado temporário do Supabase. O arquivo `.env.example` contém apenas o modelo de configuração.
