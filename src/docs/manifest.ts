/**
 * docs-manifest.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Define a árvore de categorias e documentos do módulo de Docs.
 *
 * COMO ADICIONAR UMA NOVA CATEGORIA (pasta):
 *   1. Crie a pasta em: public/docs/<nome-da-pasta>/
 *   2. Adicione um objeto novo neste array seguindo o modelo abaixo.
 *
 * COMO ADICIONAR UM NOVO DOCUMENTO (página):
 *   1. Crie o arquivo .md em: public/docs/<categoria>/<slug>.md
 *   2. Adicione um objeto dentro do `pages[]` da categoria correspondente.
 *
 * CAMPOS:
 *   id        → identificador único (sem espaços)
 *   title     → título exibido na sidebar e no cabeçalho do documento
 *   file      → caminho relativo à raiz pública: /docs/<pasta>/<arquivo>.md
 *   updatedAt → data de última atualização (opcional) — formato "YYYY-MM-DD"
 */

export interface DocsBanner {
  /** 'gradient' — renderiza um banner com cores e texto inline */
  type: 'gradient';
  from: string;   // cor inicial (CSS color)
  to: string;     // cor final
  title?: string;
  subtitle?: string;
}
// Adicione type: 'image' + src se quiser suporte a banner com imagem.

export interface ManifestPage {
  id: string;
  title: string;
  file: string;
  updatedAt?: string;
  /** Banner opcional exibido no topo da página */
  banner?: DocsBanner;
}

export interface ManifestCategory {
  id: string;
  label: string;       // nome exibido na sidebar
  pages: ManifestPage[];
}

export const DOCS_MANIFEST: ManifestCategory[] = [
  {
    id: 'introducao',
    label: 'Introdução',
    pages: [
      {
        id: 'bem-vindo',
        title: 'Bem-vindo ao Suri Tools',
        file: '/docs/introducao/bem-vindo.md',
        updatedAt: '2026-05-15',
        banner: {
          type: 'gradient',
          from: '#0a1172',
          to: '#3a0ca3',
          title: 'Suri Tools',
          subtitle: 'Plataforma interna de ferramentas do time',
        },
      },
      {
        id: 'primeiros-passos',
        title: 'Primeiros Passos',
        file: '/docs/introducao/primeiros-passos.md',
        updatedAt: '2026-05-15',
      },
    ],
  },
  {
    id: 'modulos',
    label: 'Módulos',
    pages: [
      {
        id: 'suri-api',
        title: 'Suri API',
        file: '/docs/modulos/suri-api.md',
        updatedAt: '2026-05-15',
      },
      {
        id: 'suri-calcs',
        title: 'Suri Calcs',
        file: '/docs/modulos/suri-calcs.md',
        updatedAt: '2026-05-15',
      },
      {
        id: 'kanban',
        title: 'Kanban',
        file: '/docs/modulos/kanban.md',
        updatedAt: '2026-05-15',
      },
      {
        id: 'workflow',
        title: 'WorkFlow',
        file: '/docs/modulos/workflow.md',
        updatedAt: '2026-05-15',
      },
    ],
  },
  {
    id: 'dev',
    label: 'Desenvolvimento',
    pages: [
      {
        id: 'guia-manutencao',
        title: 'Guia de Manutenção',
        file: '/docs/dev/guia-manutencao.md',
        updatedAt: '2026-05-15',
      },
    ],
  },
];
