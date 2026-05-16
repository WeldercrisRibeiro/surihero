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
  /** Autor do documento */
  author?: Author;
  /** Banner opcional exibido no topo da página */
  banner?: DocsBanner;
}

export interface ManifestCategory {
  id: string;
  label: string;       // nome exibido na sidebar
  pages: ManifestPage[];
}

import { AUTHORS, type Author } from './authors';

export const DOCS_MANIFEST: ManifestCategory[] = [
  {
    id: 'introducao',
    label: 'Introdução',
    pages: [
      {
        id: 'bem-vindo',
        title: 'Bem-vindo ao Suri Tools',
        file: '/docs/1-introducao/bem-vindo.md',
        updatedAt: '2026-05-16',
        author: AUTHORS.welder,
        banner: {
          type: 'gradient',
          from: '#0a1172',
          to: '#3a0ca3',
          title: 'Suri Tools',
          subtitle: 'Plataforma interna de ferramentas do time',
        },
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
        file: '/docs/2-modulos/suri-api.md',
        updatedAt: '2026-05-15',
      },
      {
        id: 'suri-calcs',
        title: 'Suri Calcs',
        file: '/docs/2-modulos/suri-calcs.md',
        updatedAt: '2026-05-15',
      },
      {
        id: 'kanban',
        title: 'Kanban',
        file: '/docs/2-modulos/kanban.md',
        updatedAt: '2026-05-15',
      },
      {
        id: 'workflow',
        title: 'Flows',
        file: '/docs/2-modulos/workflow.md',
        updatedAt: '2026-05-15',
      },
    ],
  },
];
